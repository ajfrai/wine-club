# 100 Wine Themes - Complete Guide

## Overview

The wine agent now includes **100 pre-defined themes** covering every wine occasion, style, and preference.

## Theme Categories

### 1. Regional Focus (1-20)
Explore specific wine regions worldwide:
- French regions (Bordeaux, Burgundy, Champagne, Rhône, Loire)
- US regions (Napa, Sonoma, Willamette)
- Italian regions (Tuscany, Piedmont)
- Spanish regions (Rioja, Priorat)
- Other regions (Germany, Austria, Portugal, Australia, New Zealand, Chile, Argentina)

### 2. Varietal Focus (21-40)
Deep dives into specific grape varieties:
- Major reds: Pinot Noir, Cabernet Sauvignon, Merlot, Syrah/Shiraz
- Major whites: Chardonnay, Sauvignon Blanc, Riesling
- Spanish/Italian: Tempranillo, Sangiovese, Nebbiolo
- South American: Malbec
- Unique varietals: Viognier, Albariño, Grüner Veltliner, Chenin Blanc, Gewürztraminer, etc.

### 3. Style & Production (41-50)
Wines defined by production methods:
- Natural & organic wines
- Orange wines (skin-contact whites)
- Sparkling wines (Champagne, Cava, Prosecco, Pét-Nat)
- Rosé wines
- Old vine wines
- Single vineyard wines
- Amphora/clay-aged wines
- Concrete egg fermentation

### 4. Price-Based (51-60)
Themes organized by budget:
- Under $15 - Everyday drinking
- $15-20 - Budget gems
- $20-40 - Sweet spot value
- $40-80 - Premium selections
- $80-150 - Luxury wines
- $150+ - Ultra-premium / collectors

### 5. Occasion & Food Pairing (61-75)
Perfect wines for specific situations:
- **Meals**: Steakhouse, Seafood, Pizza & Pasta, Asian Cuisine, BBQ
- **Events**: Summer BBQ, Thanksgiving, Holiday, Brunch, Date Night
- **Pairings**: Cheese Board, Tapas, Vegetarian, Dessert
- **Timing**: Aperitif Hour

### 6. Educational & Comparative (76-90)
Learn about wine through comparison:
- Old World vs New World
- Vintage verticals (same wine, different years)
- Terroir deep dives (same grape, different places)
- Climate comparison (cool vs warm)
- Blend styles (Bordeaux, Rhône)
- Indigenous grapes
- Women winemakers
- Emerging regions
- Blind tasting challenges
- Benchmark wines
- Age-worthy selections
- Wine 101 basics
- Advanced sommelier training
- Sustainable viticulture

### 7. Unique & Specialty (91-100)
Unusual and conversation-starting themes:
- Eccentric Spanish whites
- Volcanic wines
- High-altitude vineyards
- Coastal influence wines
- Desert wines
- Island wines
- Ancient varietals revived
- Low-intervention natural wines
- Pét-Nat & ancestral method
- Ultimate wine geek collection

## How to Use Themes

### CLI

```bash
# List all themes
python wine_agent.py themes

# Search for specific themes
python wine_agent.py themes --search "Pinot"
python wine_agent.py themes --search "budget"
python wine_agent.py themes --search "Italian"

# Select wines for a theme
python wine_agent.py select "Pinot Noir Around the World"

# Override wine count
python wine_agent.py select "Champagne Celebration" --count 12

# Export selection
python wine_agent.py select "Budget Gems Under $20" --output party_wines.json
```

### Web UI

```bash
python wine_agent.py web --port 5000
```

Browse all 100 themes, click to see curated selections, and export as JSON.

## Theme Structure

Each theme includes:

```python
Theme(
    name="Pinot Noir Around the World",
    description="Compare Pinot Noir from Burgundy, Oregon, California, and New Zealand.",
    criteria={
        "grapes": "Pinot Noir",
        "min_rating": 4.0
    },
    wine_count=12,
    diversity_rules={
        "vary_country": True,
        "vary_region": True
    }
)
```

### Criteria Fields

- `country`: Filter by country (e.g., "France", "Italy")
- `region`: Filter by region (e.g., "Burgundy", "Napa")
- `grapes`: Filter by grape varietals (e.g., "Pinot Noir")
- `min_rating`: Minimum rating (1-5 scale)
- `max_price`: Maximum price in USD
- `wine_type`: Filter by type ("red", "white", "rosé", "sparkling")

### Diversity Rules

- `vary_region`: Prefer different regions
- `vary_winery`: Prefer different producers
- `vary_vintage`: Prefer different years
- `vary_country`: Prefer different countries
- `vary_grapes`: Prefer different grape varietals
- `vary_price`: Spread across price range
- `mix_types`: Ensure both red and white wines

## Examples

### Regional Theme: "Burgundy Terroir Exploration"
- **Criteria**: Region = Burgundy, Rating ≥ 4.2, Price ≤ $120
- **Result**: 10 wines from different Burgundy appellations
- **Diversity**: Mix of red (Pinot Noir) and white (Chardonnay), different producers

### Varietal Theme: "Pinot Noir Around the World"
- **Criteria**: Grapes = Pinot Noir, Rating ≥ 4.0
- **Result**: 12 wines from France, Oregon, California, New Zealand
- **Diversity**: Different countries and regions

### Price Theme: "Budget Gems Under $20"
- **Criteria**: Price ≤ $20, Rating ≥ 4.0
- **Result**: 15 high-quality affordable wines
- **Diversity**: Mix of countries and wine types

### Occasion Theme: "Thanksgiving Feast"
- **Criteria**: Rating ≥ 3.9, Price ≤ $45
- **Result**: 10 versatile wines for turkey and sides
- **Diversity**: Mix of grapes and types

## Current Database

With 131,385 wines from 45 countries, virtually all themes will find excellent matches:

- **Wine Reviews**: 129,858 wines (global coverage)
- **Vivino Spanish**: 1,527 wines (Spain focused)

Top countries represented:
- US: 54,457 wines
- France: 22,072 wines
- Italy: 19,524 wines
- Spain: 6,641 wines
- Portugal: 5,685 wines
- Chile: 4,470 wines
- Argentina: 3,794 wines
- Austria: 3,343 wines
- Australia: 2,327 wines
- Germany: 2,164 wines

## Creating Custom Themes

See `ADDING_DATASETS.md` for adding more wine sources.

To create custom themes, edit `themes/presets.py`:

```python
Theme(
    name="My Custom Theme",
    description="Description of the theme and what makes it special.",
    criteria={
        "country": "Italy",
        "wine_type": "red",
        "min_rating": 4.0,
        "max_price": 50.0
    },
    wine_count=10,
    diversity_rules={
        "vary_region": True,
        "vary_winery": True
    }
)
```

## Benefits

1. **Comprehensive**: 100 themes cover every wine need
2. **Intelligent**: Automatic diversity within each theme
3. **Flexible**: Override wine counts, search by keyword
4. **Educational**: Learn through comparison and exploration
5. **Practical**: Occasion-based and price-based themes
6. **Expandable**: Easy to add more themes
7. **Unified Database**: 131K+ wines from multiple sources

## Popular Theme Combinations

### For a Wine Club Event
1. "Blind Tasting Challenge" - Fun and educational
2. "Budget Gems Under $20" - Cost-effective
3. "Old World vs New World" - Comparative learning

### For a Dinner Party
1. "Cheese Board Companions" - Versatile pairings
2. "$25 Dinner Party Wines" - Perfect price point
3. "Italian Treasures" - Food-friendly

### For Learning
1. "Wine 101 Basics" - Foundation
2. "Terroir Deep Dive" - Intermediate
3. "Advanced Sommelier Training" - Expert level

### For Special Occasions
1. "Champagne Celebration" - Luxury bubbles
2. "Date Night Wines" - Romantic selections
3. "Holiday Celebration" - Festive wines
