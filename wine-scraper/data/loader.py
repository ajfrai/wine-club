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

    DATASET_NAME = "zynicide/wine-reviews"
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
            # Wine Reviews columns: country, description, designation, points, price,
            #                       province, region_1, region_2, variety, winery, title

            # Generate wine_id from index or title
            wine_id = row.get('') or row.get('Unnamed: 0')  # CSV index column

            wine = {
                'wine_id': wine_id,
                'name': row.get('title'),
                'winery': row.get('winery'),
                'region': row.get('region_1') or row.get('province'),
                'country': row.get('country'),
                'vintage': self._extract_vintage(row.get('title')),
                'rating': self._convert_points_to_rating(row.get('points')),
                'num_reviews': 1,  # Each row is one review
                'price_usd': self._parse_price(row.get('price')),
                'wine_type': self._normalize_wine_type(row.get('variety')),
                'grapes': row.get('variety')
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

        if 'red' in value_lower or 'tinto' in value_lower:
            return 'red'
        elif 'white' in value_lower or 'blanco' in value_lower:
            return 'white'
        elif 'ros' in value_lower or 'rose' in value_lower or 'rosado' in value_lower:
            return 'rosé'
        elif 'sparkling' in value_lower or 'champagne' in value_lower or 'cava' in value_lower:
            return 'sparkling'
        elif 'dessert' in value_lower or 'fortified' in value_lower:
            return 'dessert'
        else:
            return None  # Unknown type

    def _extract_grapes(self, wine_name: Optional[str]) -> Optional[str]:
        """Extract grape varietals from wine name."""
        if not wine_name:
            return None

        # Common grape varieties
        grapes = [
            'Garnacha', 'Tempranillo', 'Cabernet Sauvignon', 'Merlot', 'Pinot Noir',
            'Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Syrah', 'Shiraz',
            'Malbec', 'Grenache', 'Sangiovese', 'Nebbiolo', 'Barbera',
            'Bobal', 'Monastrell', 'Verdejo', 'Albariño', 'Godello'
        ]

        wine_name_lower = wine_name.lower()
        found_grapes = []

        for grape in grapes:
            if grape.lower() in wine_name_lower:
                found_grapes.append(grape)

        return ', '.join(found_grapes) if found_grapes else None

    def _extract_vintage(self, title: Optional[str]) -> Optional[int]:
        """Extract vintage year from wine title."""
        if not title:
            return None

        import re
        # Look for 4-digit year (1900-2099)
        match = re.search(r'\b(19\d{2}|20\d{2})\b', title)
        if match:
            return int(match.group(1))
        return None

    def _convert_points_to_rating(self, points: Any) -> Optional[float]:
        """Convert wine points (80-100) to rating (1-5)."""
        if points is None or points == '':
            return None

        try:
            points_val = float(points)
            # Convert 80-100 scale to 1-5 scale
            # 80-84 → 1.0, 85-89 → 2.0, 90-94 → 3.0, 95-99 → 4.0, 100 → 5.0
            # More granular: (points - 80) / 4 = rating
            if points_val < 80:
                return 1.0
            elif points_val > 100:
                return 5.0
            else:
                return round((points_val - 80) / 4, 1)
        except (ValueError, TypeError):
            return None

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
