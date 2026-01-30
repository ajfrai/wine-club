"""Unified loader for multiple wine datasets."""
from pathlib import Path
from typing import Dict, Any, List, Optional
from .db import WineDatabase
from .loader import KaggleDatasetLoader
import csv


class UnifiedWineLoader:
    """Load and unify multiple wine datasets."""

    def __init__(self, db_path: str = "data/wines.db"):
        self.db = WineDatabase(db_path)
        self.loaders = {
            'vivino': VividoDatasetLoader(self.db),
            'wine_reviews': WineReviewsDatasetLoader(self.db),
        }

    def load_all_datasets(self):
        """Load all available datasets."""
        print("=== Loading All Wine Datasets ===\n")

        total_wines = 0
        for name, loader in self.loaders.items():
            print(f"\n--- Loading {name} dataset ---")
            wines_added = loader.load()
            total_wines += wines_added
            print(f"✓ Added {wines_added} wines from {name}")

        print(f"\n=== Total: {total_wines} wines loaded ===")
        return total_wines


class VividoDatasetLoader:
    """Loader for Vivino Spanish wine dataset."""

    DATASET_NAME = "joshuakalobbowles/vivino-wine-data"
    SOURCE_NAME = "vivino_spanish"

    def __init__(self, db: WineDatabase):
        self.db = db
        self.raw_dir = Path("data/raw/vivino")

    def load(self) -> int:
        """Load Vivino dataset."""
        # Check if already downloaded
        csv_files = list(self.raw_dir.glob("*.csv"))
        if not csv_files:
            print(f"Downloading {self.DATASET_NAME}...")
            self._download()
            csv_files = list(self.raw_dir.glob("*.csv"))

        if not csv_files:
            print("No CSV files found for Vivino dataset")
            return 0

        # Parse and load
        wines = []
        for csv_file in csv_files:
            wines.extend(self._parse_csv(csv_file))

        # Insert into database
        self.db.connect()
        inserted = self.db.insert_wines(wines, source=self.SOURCE_NAME)
        self.db.close()

        return inserted

    def _download(self):
        """Download Vivino dataset from Kaggle."""
        import subprocess
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "kaggle", "datasets", "download",
            "-d", self.DATASET_NAME,
            "-p", str(self.raw_dir),
            "--unzip"
        ], check=True)

    def _parse_csv(self, csv_path: Path) -> List[Dict[str, Any]]:
        """Parse Vivino CSV."""
        wines = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                wine = {
                    'wine_id': row.get('Wine ID'),
                    'name': row.get('Wine'),
                    'winery': row.get('Winery'),
                    'region': row.get('Region'),
                    'country': row.get('Country'),
                    'vintage': self._parse_int(row.get('Year')),
                    'rating': self._parse_float(row.get('Rating')),
                    'num_reviews': self._parse_int(row.get('num_review')),
                    'price_usd': self._parse_float(row.get('price')),
                    'wine_type': None,  # Not provided
                    'grapes': None,  # Not provided
                    'source': self.SOURCE_NAME
                }
                if wine['name']:
                    wines.append(wine)
        return wines

    def _parse_int(self, value) -> Optional[int]:
        try:
            return int(float(value)) if value else None
        except (ValueError, TypeError):
            return None

    def _parse_float(self, value) -> Optional[float]:
        try:
            return float(value) if value else None
        except (ValueError, TypeError):
            return None


class WineReviewsDatasetLoader:
    """Loader for Wine Reviews dataset (130k wines)."""

    DATASET_NAME = "zynicide/wine-reviews"
    SOURCE_NAME = "wine_reviews"

    def __init__(self, db: WineDatabase):
        self.db = db
        self.raw_dir = Path("data/raw/wine_reviews")

    def load(self) -> int:
        """Load Wine Reviews dataset."""
        # Check if already downloaded
        csv_files = list(self.raw_dir.glob("*130k*.csv"))
        if not csv_files:
            print(f"Downloading {self.DATASET_NAME}...")
            self._download()
            csv_files = list(self.raw_dir.glob("*130k*.csv"))

        if not csv_files:
            print("No CSV files found for Wine Reviews dataset")
            return 0

        # Use the 130k v2 file (most complete)
        csv_file = csv_files[0]
        print(f"Parsing {csv_file.name}...")

        wines = self._parse_csv(csv_file)

        # Insert into database in batches
        self.db.connect()
        inserted = 0
        batch_size = 1000

        for i in range(0, len(wines), batch_size):
            batch = wines[i:i + batch_size]
            inserted += self.db.insert_wines(batch, source=self.SOURCE_NAME)
            if (i // batch_size) % 10 == 0:
                print(f"  Inserted {inserted} wines...")

        self.db.close()
        return inserted

    def _download(self):
        """Download Wine Reviews dataset from Kaggle."""
        import subprocess
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "kaggle", "datasets", "download",
            "-d", self.DATASET_NAME,
            "-p", str(self.raw_dir),
            "--unzip"
        ], check=True)

    def _parse_csv(self, csv_path: Path) -> List[Dict[str, Any]]:
        """Parse Wine Reviews CSV."""
        wines = []
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                wine = {
                    'wine_id': str(i),  # Use row index as ID
                    'name': row.get('title'),
                    'winery': row.get('winery'),
                    'region': row.get('region_1') or row.get('province'),
                    'country': row.get('country'),
                    'vintage': self._extract_vintage(row.get('title')),
                    'rating': self._convert_points(row.get('points')),
                    'num_reviews': 1,
                    'price_usd': self._parse_float(row.get('price')),
                    'wine_type': self._infer_type(row.get('variety')),
                    'grapes': row.get('variety'),
                    'source': self.SOURCE_NAME
                }
                if wine['name']:
                    wines.append(wine)
        return wines

    def _extract_vintage(self, title: Optional[str]) -> Optional[int]:
        """Extract vintage from title."""
        if not title:
            return None
        import re
        match = re.search(r'\b(19\d{2}|20\d{2})\b', title)
        return int(match.group(1)) if match else None

    def _convert_points(self, points) -> Optional[float]:
        """Convert 80-100 points to 1-5 rating."""
        try:
            p = float(points)
            if p < 80:
                return 1.0
            elif p > 100:
                return 5.0
            else:
                return round((p - 80) / 4, 1)
        except (ValueError, TypeError):
            return None

    def _infer_type(self, variety: Optional[str]) -> Optional[str]:
        """Infer wine type from variety."""
        if not variety:
            return None

        v = variety.lower()
        if any(x in v for x in ['red', 'cabernet', 'merlot', 'pinot noir', 'syrah', 'malbec', 'zinfandel']):
            return 'red'
        elif any(x in v for x in ['white', 'chardonnay', 'sauvignon blanc', 'riesling', 'pinot grigio']):
            return 'white'
        elif any(x in v for x in ['rosé', 'rose', 'rosado']):
            return 'rosé'
        elif any(x in v for x in ['champagne', 'sparkling', 'prosecco', 'cava']):
            return 'sparkling'
        else:
            return None

    def _parse_float(self, value) -> Optional[float]:
        try:
            return float(value) if value else None
        except (ValueError, TypeError):
            return None
