# Adding New Wine Datasets

The wine agent uses a **unified database** that combines multiple datasets. This allows you to continuously expand the wine collection.

## Current Datasets

| Dataset | Source | Wines | Countries | Notes |
|---------|--------|-------|-----------|-------|
| Wine Reviews | `zynicide/wine-reviews` | 129,858 | 45 | Professional reviews, global coverage |
| Vivino Spanish | `joshuakalobbowles/vivino-wine-data` | 1,527 | 1 | Spanish wines with ratings |
| **Total** | | **131,385** | **45** | |

## How to Add a New Dataset

### Option 1: Add to UnifiedWineLoader (Recommended)

1. **Create a new loader class** in `data/multi_loader.py`:

```python
class NewDatasetLoader:
    """Loader for your new wine dataset."""

    DATASET_NAME = "kaggle-user/dataset-name"
    SOURCE_NAME = "my_dataset"  # Unique identifier

    def __init__(self, db: WineDatabase):
        self.db = db
        self.raw_dir = Path("data/raw/my_dataset")

    def load(self) -> int:
        """Load the dataset."""
        # Download if needed
        if not self.raw_dir.exists():
            self._download()

        # Parse CSV/JSON
        wines = self._parse_data()

        # Insert with source tracking
        self.db.connect()
        inserted = self.db.insert_wines(wines, source=self.SOURCE_NAME)
        self.db.close()

        return inserted

    def _download(self):
        """Download from Kaggle."""
        import subprocess
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "kaggle", "datasets", "download",
            "-d", self.DATASET_NAME,
            "-p", str(self.raw_dir),
            "--unzip"
        ], check=True)

    def _parse_data(self) -> List[Dict[str, Any]]:
        """Parse dataset into wine dictionaries."""
        wines = []

        # Read your CSV/JSON/etc
        # Map to wine schema

        wine = {
            'wine_id': ...,           # Unique ID within this dataset
            'name': ...,              # Wine name/title
            'winery': ...,            # Producer
            'region': ...,            # Region/appellation
            'country': ...,           # Country
            'vintage': ...,           # Year (int or None)
            'rating': ...,            # 1-5 scale (float or None)
            'num_reviews': ...,       # Number of reviews (int)
            'price_usd': ...,         # Price in USD (float or None)
            'wine_type': ...,         # 'red', 'white', 'rosé', 'sparkling', or None
            'grapes': ...,            # Grape varietals (string or None)
            'source': self.SOURCE_NAME
        }

        wines.append(wine)
        return wines
```

2. **Register the loader** in `UnifiedWineLoader.__init__()`:

```python
self.loaders = {
    'vivino': VividoDatasetLoader(self.db),
    'wine_reviews': WineReviewsDatasetLoader(self.db),
    'my_dataset': NewDatasetLoader(self.db),  # Add this line
}
```

3. **Run setup**:

```bash
python wine_agent.py setup --all
```

The new dataset will be automatically loaded and unified!

### Option 2: Manual One-time Load

For quick experiments or non-Kaggle sources:

```python
from data.db import WineDatabase

# Your custom parsing logic
wines = []
with open('my_wines.csv') as f:
    # Parse your data
    for row in reader:
        wines.append({
            'wine_id': row['id'],
            'name': row['wine_name'],
            'winery': row['producer'],
            # ... other fields
            'source': 'my_custom_source'
        })

# Insert into unified database
db = WineDatabase()
db.connect()
inserted = db.insert_wines(wines, source='my_custom_source')
print(f"Added {inserted} wines")
db.close()
```

## Dataset Schema

All datasets must map to this schema:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `wine_id` | TEXT | Yes | Unique ID within the dataset |
| `name` | TEXT | **Yes** | Wine name or title |
| `winery` | TEXT | No | Producer/winery name |
| `region` | TEXT | No | Region or appellation |
| `country` | TEXT | No | Country of origin |
| `vintage` | INTEGER | No | Year (e.g., 2015) |
| `rating` | REAL | No | Rating on 1-5 scale |
| `num_reviews` | INTEGER | No | Number of reviews |
| `price_usd` | REAL | No | Price in USD |
| `wine_type` | TEXT | No | 'red', 'white', 'rosé', 'sparkling' |
| `grapes` | TEXT | No | Grape varietals (comma-separated) |
| `source` | TEXT | **Yes** | Dataset identifier |

**Notes:**
- Only `name` and `source` are truly required
- Missing fields default to `None`
- `wine_id` + `source` must be unique (prevents duplicates)

## Finding More Datasets

### Kaggle Wine Datasets (Recommended)

```bash
kaggle datasets list -s "wine" --max-size 1000000000
```

Top candidates:
- `zynicide/wine-reviews` (130k wines, 45 countries) ✓ Already loaded
- `fedesoriano/spanish-wine-quality-dataset` (47k Spanish wines)
- `mysarahmadbhat/wine-tasting` (17MB, wine tasting notes)
- `budnyak/wine-rating-and-price` (wine ratings & prices)

### Other Sources

- **UCI Machine Learning**: Wine quality datasets
- **OpenData portals**: Government wine production data
- **Vivino API**: (Unofficial) scraping community
- **Wine-Searcher**: Commercial wine price database
- **Wine.com / Total Wine**: Retailer catalogs

## Rating Scale Conversions

Different datasets use different rating scales. Convert to 1-5:

| Source Scale | Conversion | Example |
|--------------|------------|---------|
| 80-100 points | `(points - 80) / 4` | 90 points → 2.5 rating |
| 1-10 scale | `rating / 2` | 8/10 → 4.0 rating |
| 1-5 stars | `rating` | 4.2 stars → 4.2 rating |
| Letter grades | Custom mapping | A+ → 5.0, A → 4.5, etc. |

## Example: Add Spanish Wine Quality Dataset

```bash
# 1. Check the dataset
kaggle datasets files fedesoriano/spanish-wine-quality-dataset

# 2. Create loader in multi_loader.py
class SpanishQualityLoader:
    DATASET_NAME = "fedesoriano/spanish-wine-quality-dataset"
    SOURCE_NAME = "spanish_quality"

    # ... implement load(), _download(), _parse_data()

# 3. Register in UnifiedWineLoader
self.loaders['spanish_quality'] = SpanishQualityLoader(self.db)

# 4. Run setup
python wine_agent.py setup --all
```

## Verifying Unified Database

```bash
# Check overall stats
python -c "
from data.db import WineDatabase
db = WineDatabase()
db.connect()
stats = db.get_statistics()
print(f'Total: {stats[\"total_wines\"]:,} wines')
print(f'Countries: {stats[\"total_countries\"]}')
db.close()
"

# Check by source
python -c "
from data.db import WineDatabase
db = WineDatabase()
db.connect()
cursor = db.conn.cursor()
cursor.execute('SELECT source, COUNT(*) FROM wines GROUP BY source')
for row in cursor.fetchall():
    print(f'{row[0]}: {row[1]:,} wines')
db.close()
"
```

## Benefits of Unified Approach

1. **No Data Loss**: All datasets coexist in one database
2. **Source Tracking**: Know where each wine came from
3. **Easy Expansion**: Add new datasets without replacing old ones
4. **Automatic Deduplication**: `UNIQUE(wine_id, source)` prevents duplicates
5. **Queryable**: Filter by source if needed
6. **Scalable**: Handles millions of wines efficiently

## Future Enhancements

Potential improvements:
- **Wine matching**: Identify same wine across datasets
- **Confidence scores**: Rate data quality per source
- **Update mechanism**: Refresh datasets periodically
- **Web scraping**: Add real-time retailer data
- **API integration**: Wine.com, Vivino, Wine-Searcher
