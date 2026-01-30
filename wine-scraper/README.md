# Wine Agent - Intelligent Wine Selection

Replace hallucinating scrapers with real data: 13M wines from Kaggle Vivino dataset, curated by intelligent theme-based selection.

## Features

- **13M Wine Database**: Real Vivino data from Kaggle
- **Theme-Based Selection**: Pre-defined themes like "By the Seine", "Willamette Valley 101", "Eccentric Spanish Whites"
- **Intelligent Curation**: Automatic diversity (regions, varietals, vintages, price points)
- **Web UI**: Browse themes, search wines, export selections
- **CLI**: Command-line interface for all operations
- **No Scraping**: One-time download, no fake data

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Kaggle API

Download your API token from https://www.kaggle.com/account

Save to `~/.kaggle/kaggle.json`:

```json
{
  "username": "your-username",
  "key": "your-api-key"
}
```

### 3. Download Dataset

```bash
python wine_agent.py setup
```

This downloads the Vivino dataset (~1-2GB) and loads it into SQLite with FTS indexes.

### 4. Select Wines for a Theme

```bash
python wine_agent.py select "By the Seine - French Wine Bar"
```

### 5. Launch Web UI

```bash
python wine_agent.py web --port 5000
```

Visit http://localhost:5000

## CLI Usage

### List Available Themes

```bash
python wine_agent.py themes
```

### Search Wines

```bash
# Search French Burgundy wines under $50
python wine_agent.py search --country France --region Burgundy --max-price 50

# Search high-rated Pinot Noir
python wine_agent.py search --grapes "Pinot Noir" --min-rating 4.2

# Export results to JSON
python wine_agent.py search --country Spain --output spanish_wines.json
```

### Get Wine Details

```bash
python wine_agent.py details --id 12345
```

### Select Wines for a Theme

```bash
# Use pre-defined theme
python wine_agent.py select "Willamette Valley 101"

# Override wine count
python wine_agent.py select "Burgundy Grand Crus Under $100" --count 8

# Export selection
python wine_agent.py select "Italian Treasures" --output italian_selection.json
```

## Pre-defined Themes

1. **By the Seine - French Wine Bar** - 12 French wines, varied regions
2. **Willamette Valley 101** - 8 Oregon Pinot Noir wines
3. **Eccentric Spanish Whites** - 10 unusual Spanish white varietals
4. **Burgundy Grand Crus Under $100** - 6 Premier/Grand Cru wines
5. **New World Classics** - 12 wines from California, Australia, New Zealand
6. **Italian Treasures** - 10 wines from Piedmont, Tuscany, Veneto, Sicily
7. **Budget Gems Under $20** - 15 high-quality affordable wines
8. **Natural & Organic** - 10 minimal intervention wines
9. **Sparkling Celebration** - 8 sparkling wines worldwide
10. **Rosé All Day** - 10 elegant rosé wines

## Web UI

The web interface provides:

- **Theme Browser**: Browse and select from pre-defined themes
- **Wine Selection**: View curated wines for each theme
- **Search**: Advanced search with filters
- **Export**: Download selections as JSON

## Architecture

```
wine-scraper/
├── wine_agent.py           # Main CLI entry point
├── agent/
│   ├── core.py             # Wine agent with intelligent selection
│   └── tools.py            # MCP tools for Claude Agent SDK
├── data/
│   ├── loader.py           # Kaggle dataset downloader
│   ├── db.py               # SQLite with FTS5
│   └── wines.db            # 13M wines database
├── themes/
│   └── presets.py          # Pre-defined theme templates
├── web/
│   ├── app.py              # Flask application
│   ├── templates/          # HTML templates
│   └── static/             # CSS/JS
└── requirements.txt
```

## Data Model

SQLite with FTS5 for full-text search:

- **wines** table: 13M wines with ratings, prices, regions, varietals
- **wines_fts** virtual table: Full-text search on name, winery, region, grapes
- **Indexes**: country, region, rating, price, wine_type

## Development

### Database Schema

```sql
CREATE TABLE wines (
    id INTEGER PRIMARY KEY,
    wine_id TEXT UNIQUE,
    name TEXT NOT NULL,
    winery TEXT,
    region TEXT,
    country TEXT,
    vintage INTEGER,
    rating REAL,
    num_reviews INTEGER,
    price_usd REAL,
    wine_type TEXT,
    grapes TEXT
);

CREATE VIRTUAL TABLE wines_fts USING fts5(
    name, winery, region, grapes
);
```

### Adding Custom Themes

Edit `themes/presets.py`:

```python
Theme(
    name="My Custom Theme",
    description="Description here",
    criteria={
        "country": "Italy",
        "min_rating": 4.0,
        "max_price": 40.0
    },
    wine_count=10,
    diversity_rules={
        "vary_region": True,
        "mix_types": True
    }
)
```

## Constraints

- No local dev server (per CLAUDE.md) - use for production only
- Standalone Python app, not integrated with Next.js wine-club app
- First-time setup requires Kaggle account + API token
- Database size: ~2-3GB for 13M wines

## License

MIT
