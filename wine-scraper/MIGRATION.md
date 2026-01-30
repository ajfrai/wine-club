# Migration Guide: Wine Scraper → Wine Agent

## Overview

The old `wine_scraper.py` generated fake wines using Ollama. The new `wine_agent.py` uses real data from Kaggle's Vivino dataset (13M wines).

## What Changed

### Old System (wine_scraper.py)
- Generated synthetic wines with Ollama gemma:1b
- Hallucinated wine names, wineries, regions
- Limited to ~100-1000 fake wines
- No quality control or verification
- Stored in `wines.json`

### New System (wine_agent.py)
- Uses Kaggle Vivino dataset (13M real wines)
- Real ratings, prices, reviews from Vivino
- SQLite database with FTS5 search
- Theme-based intelligent curation
- Web UI for browsing and selection

## Files Replaced

### Deleted
- `wine_scraper.py` (old fake wine generator)
- `wines.json` (fake wine data)

### New
- `wine_agent.py` - Main CLI entry point
- `agent/` - Wine agent logic
- `data/` - Database and Kaggle loader
- `themes/` - Pre-defined theme templates
- `web/` - Flask web UI
- `requirements.txt` - Dependencies
- `.gitignore` - Ignore database and raw data

## Migration Steps

### 1. Clean Up Old Files

The old files should be deleted (already done):
```bash
rm wine_scraper.py wines.json
```

### 2. Install New Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Kaggle API

Download API token from https://www.kaggle.com/account

Save to `~/.kaggle/kaggle.json`:
```json
{
  "username": "your-username",
  "key": "your-api-key"
}
```

### 4. Download Dataset

```bash
python wine_agent.py setup
```

This downloads ~1-2GB and loads into SQLite (~2-3GB final database).

### 5. Test CLI

```bash
# List themes
python wine_agent.py themes

# Select wines for a theme
python wine_agent.py select "By the Seine - French Wine Bar"

# Search wines
python wine_agent.py search --country France --max-price 50
```

### 6. Launch Web UI

```bash
python wine_agent.py web --port 5000
```

Visit http://localhost:5000

## Key Differences

### Data Quality
- **Old**: Fake wines, inconsistent data
- **New**: Real Vivino wines with verified ratings and reviews

### Selection Method
- **Old**: Random generation with attribute combinations
- **New**: Theme-based intelligent curation with diversity rules

### User Interface
- **Old**: Simple Flask UI showing generated wines
- **New**: Full theme browser, search, and export functionality

### Performance
- **Old**: 2-5 seconds per wine, 5-10 minutes for 100 wines
- **New**: Instant selection from 13M pre-loaded wines

### Storage
- **Old**: JSON file (~50KB for 100 wines)
- **New**: SQLite database (~2-3GB for 13M wines)

## Troubleshooting

### "No module named 'kaggle'"
```bash
pip install kaggle
```

### "Kaggle credentials not found"
Download your API token from https://www.kaggle.com/account and save to `~/.kaggle/kaggle.json`

### "Database not found"
Run setup first:
```bash
python wine_agent.py setup
```

### "No wines found"
The database might be empty. Re-run setup or check the Kaggle dataset downloaded correctly.

## Benefits of New System

1. **Real Data**: Actual wines with verified information
2. **Scale**: 13M wines vs. hundreds of fake ones
3. **Intelligent Selection**: Theme-based curation with diversity
4. **Better Search**: FTS5 full-text search across all fields
5. **Professional UI**: Clean web interface with export
6. **No Hallucination**: No more fake wineries or impossible combinations
7. **Offline**: One-time download, then fully offline

## Rollback (if needed)

The old `wine_scraper.py` is preserved in git history. To restore:
```bash
git checkout HEAD~1 wine_scraper.py wines.json
```

But we recommend giving the new system a try first!
