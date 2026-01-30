"""Download and load Kaggle Vivino dataset into SQLite."""
import os
import subprocess
import zipfile
import csv
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from .db import WineDatabase


class KaggleDatasetLoader:
    """Download and process Kaggle Vivino wine dataset."""

    DATASET_NAME = "joshuakalobbowles/vivino-wine-data"
    RAW_DATA_DIR = Path("data/raw")

    def __init__(self, db_path: str = "data/wines.db"):
        self.db = WineDatabase(db_path)
        self.RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

    def check_kaggle_cli(self) -> bool:
        """Check if kaggle CLI is installed and configured."""
        try:
            result = subprocess.run(
                ["kaggle", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                print(f"Kaggle CLI found: {result.stdout.strip()}")
                return True
        except FileNotFoundError:
            print("Kaggle CLI not found. Install with: pip install kaggle")
            return False
        except subprocess.TimeoutExpired:
            print("Kaggle CLI check timed out")
            return False

        return False

    def check_kaggle_auth(self) -> bool:
        """Check if Kaggle API credentials are configured."""
        kaggle_json = Path.home() / ".kaggle" / "kaggle.json"
        if kaggle_json.exists():
            print(f"Kaggle credentials found at {kaggle_json}")
            return True
        else:
            print("Kaggle credentials not found.")
            print("Download your API token from https://www.kaggle.com/account")
            print(f"Save it to {kaggle_json}")
            return False

    def download_dataset(self) -> bool:
        """Download Vivino dataset from Kaggle."""
        if not self.check_kaggle_cli():
            return False

        if not self.check_kaggle_auth():
            return False

        print(f"Downloading dataset: {self.DATASET_NAME}")
        print("This may take several minutes (dataset is 1-2GB)...")

        try:
            result = subprocess.run(
                [
                    "kaggle", "datasets", "download",
                    "-d", self.DATASET_NAME,
                    "-p", str(self.RAW_DATA_DIR),
                    "--unzip"
                ],
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )

            if result.returncode == 0:
                print("Dataset downloaded successfully")
                print(result.stdout)
                return True
            else:
                print(f"Download failed: {result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            print("Download timed out after 10 minutes")
            return False
        except Exception as e:
            print(f"Download error: {e}")
            return False

    def parse_csv_file(self, csv_path: Path) -> List[Dict[str, Any]]:
        """Parse CSV file and normalize wine data."""
        wines = []

        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)

                for row in reader:
                    wine = self._normalize_wine_data(row)
                    if wine:
                        wines.append(wine)

        except Exception as e:
            print(f"Error parsing {csv_path}: {e}")

        return wines

    def _normalize_wine_data(self, row: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Normalize wine data from CSV row."""
        try:
            # Map CSV columns to our schema
            # Note: Actual column names depend on the Kaggle dataset structure
            # This is a best-effort mapping
            wine = {
                'wine_id': row.get('id') or row.get('wine_id'),
                'name': row.get('name') or row.get('wine_name'),
                'winery': row.get('winery') or row.get('winery_name'),
                'region': row.get('region') or row.get('wine_region'),
                'country': row.get('country'),
                'vintage': self._parse_int(row.get('vintage') or row.get('year')),
                'rating': self._parse_float(row.get('rating') or row.get('average_rating')),
                'num_reviews': self._parse_int(row.get('num_reviews') or row.get('ratings_count')),
                'price_usd': self._parse_price(row.get('price') or row.get('price_usd')),
                'wine_type': self._normalize_wine_type(row.get('type') or row.get('wine_type')),
                'grapes': row.get('grapes') or row.get('grape_variety') or row.get('varietals')
            }

            # Validate required fields
            if not wine['name']:
                return None

            return wine

        except Exception as e:
            print(f"Error normalizing row: {e}")
            return None

    def _parse_int(self, value: Any) -> Optional[int]:
        """Safely parse integer value."""
        if value is None or value == '':
            return None
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None

    def _parse_float(self, value: Any) -> Optional[float]:
        """Safely parse float value."""
        if value is None or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    def _parse_price(self, value: Any) -> Optional[float]:
        """Parse price, handling currency symbols."""
        if value is None or value == '':
            return None
        try:
            # Remove common currency symbols
            cleaned = str(value).replace('$', '').replace('€', '').replace(',', '').strip()
            return float(cleaned)
        except (ValueError, TypeError):
            return None

    def _normalize_wine_type(self, value: Optional[str]) -> Optional[str]:
        """Normalize wine type to standard values."""
        if not value:
            return None

        value_lower = value.lower().strip()

        if 'red' in value_lower:
            return 'red'
        elif 'white' in value_lower:
            return 'white'
        elif 'ros' in value_lower or 'rose' in value_lower:
            return 'rosé'
        elif 'sparkling' in value_lower or 'champagne' in value_lower:
            return 'sparkling'
        elif 'dessert' in value_lower or 'fortified' in value_lower:
            return 'dessert'
        else:
            return value_lower

    def load_into_database(self, batch_size: int = 1000) -> int:
        """Load wines from CSV files into SQLite database."""
        # Find CSV files in raw data directory
        csv_files = list(self.RAW_DATA_DIR.glob("*.csv"))

        if not csv_files:
            print(f"No CSV files found in {self.RAW_DATA_DIR}")
            return 0

        print(f"Found {len(csv_files)} CSV file(s)")

        # Initialize database schema
        self.db.connect()
        self.db.initialize_schema()

        total_inserted = 0
        batch = []

        for csv_file in csv_files:
            print(f"Processing {csv_file.name}...")

            wines = self.parse_csv_file(csv_file)
            print(f"  Parsed {len(wines)} wines")

            for wine in wines:
                batch.append(wine)

                if len(batch) >= batch_size:
                    inserted = self.db.insert_wines(batch)
                    total_inserted += inserted
                    print(f"  Inserted {total_inserted} wines...")
                    batch = []

        # Insert remaining wines
        if batch:
            inserted = self.db.insert_wines(batch)
            total_inserted += inserted

        print(f"Total wines inserted: {total_inserted}")

        # Show statistics
        stats = self.db.get_statistics()
        print("\nDatabase Statistics:")
        print(f"  Total wines: {stats['total_wines']}")
        print(f"  Countries: {stats['total_countries']}")
        print(f"  Regions: {stats['total_regions']}")
        print(f"  Average rating: {stats['avg_rating']}")
        print(f"  Price range: ${stats['price_range']['min']:.2f} - ${stats['price_range']['max']:.2f}")

        self.db.close()
        return total_inserted

    def setup(self) -> bool:
        """Complete setup: download and load dataset."""
        print("=== Wine Agent Setup ===\n")

        # Check if database already exists
        if Path(self.db.db_path).exists():
            self.db.connect()
            stats = self.db.get_statistics()
            self.db.close()

            if stats['total_wines'] > 0:
                print(f"Database already exists with {stats['total_wines']} wines")
                response = input("Re-download and reload dataset? (y/N): ")
                if response.lower() != 'y':
                    print("Setup cancelled")
                    return True

        # Download dataset
        if not self.download_dataset():
            print("Failed to download dataset")
            return False

        # Load into database
        print("\nLoading wines into database...")
        inserted = self.load_into_database()

        if inserted > 0:
            print(f"\n✓ Setup complete! {inserted} wines loaded")
            return True
        else:
            print("\n✗ Setup failed: no wines loaded")
            return False
