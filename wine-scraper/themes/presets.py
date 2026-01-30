"""Pre-defined wine theme templates."""
from dataclasses import dataclass, field
from typing import Dict, Any, List


@dataclass
class Theme:
    """Wine theme definition."""
    name: str
    description: str
    criteria: Dict[str, Any]
    wine_count: int
    diversity_rules: Dict[str, Any] = field(default_factory=dict)


# Pre-defined themes
THEMES = [
    Theme(
        name="By the Seine - French Wine Bar",
        description="Classic French wines from varied regions, perfect for a bistro-style tasting. Mix of red and white wines from Bordeaux, Burgundy, Loire, Rhône, and Alsace.",
        criteria={
            "country": "France",
            "min_rating": 4.0,
            "max_price": 60.0,
        },
        wine_count=12,
        diversity_rules={
            "regions": ["Bordeaux", "Burgundy", "Loire", "Rhône", "Alsace"],
            "types": ["red", "white"],
            "mix_types": True,
            "vary_price": True
        }
    ),

    Theme(
        name="Willamette Valley 101",
        description="Educational tasting of Oregon Pinot Noir from Willamette Valley. Showcasing different vineyards, vintages, and price points from this renowned region.",
        criteria={
            "region": "Willamette Valley",
            "grapes": "Pinot Noir",
            "min_rating": 4.2,
        },
        wine_count=8,
        diversity_rules={
            "vary_winery": True,
            "vary_vintage": True,
            "vary_price": True
        }
    ),

    Theme(
        name="Eccentric Spanish Whites",
        description="Unusual Spanish white varietals with a focus on natural wines. Featuring Albariño, Verdejo, Godello, and Txakoli from Rias Baixas, Rueda, and Basque Country.",
        criteria={
            "country": "Spain",
            "wine_type": "white",
            "min_rating": 3.8,
        },
        wine_count=10,
        diversity_rules={
            "grapes": ["Albariño", "Verdejo", "Godello", "Txakoli"],
            "regions": ["Rias Baixas", "Rueda", "Basque Country"],
            "vary_region": True,
            "vary_grapes": True
        }
    ),

    Theme(
        name="Burgundy Grand Crus Under $100",
        description="Premier and Grand Cru Burgundy wines for an educational vertical tasting. Both red (Pinot Noir) and white (Chardonnay) from top vineyards.",
        criteria={
            "region": "Burgundy",
            "min_rating": 4.5,
            "max_price": 100.0,
        },
        wine_count=6,
        diversity_rules={
            "types": ["red", "white"],
            "mix_types": True,
            "vary_winery": True,
            "price_range": [60, 100]
        }
    ),

    Theme(
        name="New World Classics",
        description="Iconic wines from California, Australia, and New Zealand. Showcasing Napa Cabernet, Barossa Shiraz, and Marlborough Sauvignon Blanc.",
        criteria={
            "min_rating": 4.3,
            "max_price": 80.0,
        },
        wine_count=12,
        diversity_rules={
            "countries": ["United States", "Australia", "New Zealand"],
            "regions": ["Napa Valley", "Barossa Valley", "Marlborough"],
            "grapes": ["Cabernet Sauvignon", "Shiraz", "Sauvignon Blanc"],
            "vary_country": True,
            "vary_region": True
        }
    ),

    Theme(
        name="Italian Treasures",
        description="Journey through Italy's diverse wine regions. From Piedmont Barolo to Tuscan Brunello, Venetian Amarone to Sicilian Nero d'Avola.",
        criteria={
            "country": "Italy",
            "min_rating": 4.2,
            "max_price": 70.0,
        },
        wine_count=10,
        diversity_rules={
            "regions": ["Piedmont", "Tuscany", "Veneto", "Sicily"],
            "grapes": ["Nebbiolo", "Sangiovese", "Corvina", "Nero d'Avola"],
            "vary_region": True,
            "vary_grapes": True
        }
    ),

    Theme(
        name="Budget Gems Under $20",
        description="High-quality, affordable wines perfect for casual gatherings. Proving great wine doesn't have to break the bank.",
        criteria={
            "max_price": 20.0,
            "min_rating": 4.0,
        },
        wine_count=15,
        diversity_rules={
            "vary_country": True,
            "vary_type": True,
            "mix_types": True
        }
    ),

    Theme(
        name="Natural & Organic",
        description="Natural, organic, and biodynamic wines from innovative producers. Minimal intervention winemaking with authentic terroir expression.",
        criteria={
            "min_rating": 3.9,
            "max_price": 50.0,
        },
        wine_count=10,
        diversity_rules={
            "vary_country": True,
            "vary_type": True,
            "mix_types": True,
            "keywords": ["organic", "biodynamic", "natural"]
        }
    ),

    Theme(
        name="Sparkling Celebration",
        description="Celebration-worthy sparkling wines from around the world. Champagne, Cava, Prosecco, and New World sparklers.",
        criteria={
            "wine_type": "sparkling",
            "min_rating": 4.0,
        },
        wine_count=8,
        diversity_rules={
            "countries": ["France", "Spain", "Italy", "United States"],
            "regions": ["Champagne", "Cava", "Prosecco"],
            "vary_country": True,
            "vary_price": True
        }
    ),

    Theme(
        name="Rosé All Day",
        description="Elegant rosé wines perfect for warm weather and outdoor dining. From Provence to Spain to Washington State.",
        criteria={
            "wine_type": "rosé",
            "min_rating": 3.8,
            "max_price": 40.0,
        },
        wine_count=10,
        diversity_rules={
            "countries": ["France", "Spain", "United States"],
            "regions": ["Provence", "Rioja", "Washington"],
            "vary_region": True,
            "vary_price": True
        }
    )
]


def get_theme_by_name(name: str) -> Theme | None:
    """Get a theme by exact name."""
    for theme in THEMES:
        if theme.name == name:
            return theme
    return None


def search_themes(query: str) -> List[Theme]:
    """Search themes by name or description."""
    query_lower = query.lower()
    results = []

    for theme in THEMES:
        if (query_lower in theme.name.lower() or
            query_lower in theme.description.lower()):
            results.append(theme)

    return results


def get_all_themes() -> List[Theme]:
    """Get all pre-defined themes."""
    return THEMES.copy()
