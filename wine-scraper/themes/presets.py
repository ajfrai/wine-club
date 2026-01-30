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


# 100 Pre-defined Wine Themes
THEMES = [
    # === CLASSIC REGIONAL THEMES (1-20) ===

    Theme(
        name="By the Seine - French Wine Bar",
        description="Everyday French bistro wines you'd find on the Rive Gauche. Affordable, drinkable wines for casual dining - Côtes du Rhône, Beaujolais, simple Bordeaux, Loire whites. Nothing fancy, just good wine.",
        criteria={"country": "France", "min_rating": 3.5, "max_price": 25.0},
        wine_count=12,
        diversity_rules={"mix_types": True, "vary_region": True, "vary_winery": True, "vary_price": True}
    ),

    Theme(
        name="Bordeaux Grand Crus",
        description="Left Bank and Right Bank Bordeaux wines showcasing Cabernet Sauvignon and Merlot dominance. Premium selection for special occasions.",
        criteria={"region": "Bordeaux", "min_rating": 3.6, "max_price": 100.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_vintage": True}
    ),

    Theme(
        name="Burgundy Terroir Exploration",
        description="Premier and Grand Cru Burgundy wines showcasing terroir differences in Pinot Noir and Chardonnay. Premium selection for collectors.",
        criteria={"region": "Burgundy", "min_rating": 3.5, "max_price": 120.0},
        wine_count=10,
        diversity_rules={"mix_types": True, "vary_winery": True, "vary_region": True}
    ),

    Theme(
        name="Champagne Celebration",
        description="Grower Champagnes and Grande Marques for special occasions.",
        criteria={"region": "Champagne", "wine_type": "sparkling", "min_rating": 3.0, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_price": True}
    ),

    Theme(
        name="Rhône Valley Journey",
        description="Northern and Southern Rhône wines featuring Syrah, Grenache, and Viognier.",
        criteria={"region": "Rhône", "min_rating": 3.0, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "mix_types": True}
    ),

    Theme(
        name="Loire Valley Freshness",
        description="Crisp whites and elegant reds from the Loire Valley.",
        criteria={"region": "Loire", "min_rating": 3.0, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"mix_types": True, "vary_grapes": True}
    ),

    Theme(
        name="Napa Valley Icons",
        description="World-class Cabernet Sauvignon from Napa's finest vineyards. Premium selection for special occasions.",
        criteria={"region": "Napa", "min_rating": 3.6, "max_price": 150.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_vintage": True}
    ),

    Theme(
        name="Sonoma County Diversity",
        description="Diverse wines from Sonoma's varied microclimates and regions.",
        criteria={"region": "Sonoma", "min_rating": 3.0, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_region": True, "mix_types": True, "vary_grapes": True}
    ),

    Theme(
        name="Willamette Valley 101",
        description="Educational tasting of Oregon Pinot Noir from Willamette Valley.",
        criteria={"region": "Willamette", "grapes": "Pinot Noir", "min_rating": 2.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_vintage": True, "vary_price": True}
    ),

    Theme(
        name="Tuscany Treasures",
        description="Sangiovese-based wines from Chianti, Brunello, and Super Tuscans. Premium selection.",
        criteria={"region": "Tuscany", "min_rating": 3.5, "max_price": 80.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "vary_winery": True}
    ),

    Theme(
        name="Piedmont Powerhouses",
        description="Barolo and Barbaresco showcasing Nebbiolo at its finest. Premium selection.",
        criteria={"region": "Piedmont", "min_rating": 3.0, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_vintage": True}
    ),

    Theme(
        name="Rioja Reservas & Gran Reservas",
        description="Aged Tempranillo from Spain's most famous wine region.",
        criteria={"region": "Rioja", "min_rating": 3.0, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_winery": True, "vary_vintage": True}
    ),

    Theme(
        name="Priorat Intensity",
        description="Powerful, concentrated wines from Priorat's steep slate slopes.",
        criteria={"region": "Priorat", "min_rating": 3.0, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_winery": True}
    ),

    Theme(
        name="German Riesling Showcase",
        description="Dry to sweet Rieslings from Mosel, Rheingau, and Pfalz.",
        criteria={"country": "Germany", "grapes": "Riesling", "min_rating": 2.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "vary_price": True}
    ),

    Theme(
        name="Austrian Wine Discovery",
        description="Grüner Veltliner and other unique Austrian wines.",
        criteria={"country": "Austria", "min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_grapes": True, "vary_region": True}
    ),

    Theme(
        name="Douro Valley Reds",
        description="Portuguese reds from the Douro Valley, beyond Port.",
        criteria={"region": "Douro", "wine_type": "red", "min_rating": 3.0, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True}
    ),

    Theme(
        name="Barossa Shiraz Exploration",
        description="Bold, powerful Shiraz from Australia's Barossa Valley.",
        criteria={"region": "Barossa", "grapes": "Shiraz", "min_rating": 2.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_vintage": True}
    ),

    Theme(
        name="Marlborough Sauvignon Blanc",
        description="Crisp, vibrant Sauvignon Blanc from New Zealand.",
        criteria={"region": "Marlborough", "grapes": "Sauvignon Blanc", "min_rating": 2.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True}
    ),

    Theme(
        name="Chilean Andes Wines",
        description="High-altitude wines from Chile's diverse valleys.",
        criteria={"country": "Chile", "min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "mix_types": True}
    ),

    Theme(
        name="Mendoza Malbec Masters",
        description="Argentina's signature Malbec from high-altitude vineyards.",
        criteria={"region": "Mendoza", "grapes": "Malbec", "min_rating": 2.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_winery": True, "vary_price": True}
    ),

    # === VARIETAL-FOCUSED THEMES (21-40) ===

    Theme(
        name="Pinot Noir Around the World",
        description="Compare Pinot Noir from Burgundy, Oregon, California, and New Zealand.",
        criteria={"grapes": "Pinot Noir", "min_rating": 3.5, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Cabernet Sauvignon Showdown",
        description="Cabernet from Napa, Bordeaux, and beyond.",
        criteria={"grapes": "Cabernet Sauvignon", "min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_price": True}
    ),

    Theme(
        name="Chardonnay Styles",
        description="Oaked vs unoaked, cool climate vs warm climate Chardonnay.",
        criteria={"grapes": "Chardonnay", "min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Syrah/Shiraz Exploration",
        description="Northern Rhône elegance vs Australian power.",
        criteria={"grapes": "Syrah", "min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Riesling Spectrum",
        description="Dry to sweet Riesling from Germany, Alsace, and beyond.",
        criteria={"grapes": "Riesling", "min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Sauvignon Blanc Showcase",
        description="Loire, Marlborough, and California Sauvignon Blanc.",
        criteria={"grapes": "Sauvignon Blanc", "min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Merlot Mastery",
        description="Merlot from Right Bank Bordeaux to California.",
        criteria={"grapes": "Merlot", "min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Grenache/Garnacha Journey",
        description="Grenache from Rhône, Spain, and California.",
        criteria={"grapes": "Grenache", "min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Tempranillo Terroir",
        description="Tempranillo across Spain's diverse regions.",
        criteria={"grapes": "Tempranillo", "min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "vary_winery": True}
    ),

    Theme(
        name="Sangiovese Showcase",
        description="Italy's noble grape in Chianti, Brunello, and beyond.",
        criteria={"grapes": "Sangiovese", "min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_region": True, "vary_winery": True}
    ),

    Theme(
        name="Nebbiolo Nobility",
        description="Barolo, Barbaresco, and other Nebbiolo expressions.",
        criteria={"grapes": "Nebbiolo", "min_rating": 3.5, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_region": True, "vary_winery": True}
    ),

    Theme(
        name="Malbec Masters",
        description="Argentina's signature grape at various price points.",
        criteria={"grapes": "Malbec", "min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_price": True, "vary_winery": True}
    ),

    Theme(
        name="Zinfandel/Primitivo Power",
        description="California Zinfandel and Italian Primitivo comparison.",
        criteria={"grapes": "Zinfandel", "min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Viognier Variations",
        description="Aromatic Viognier from Condrieu and beyond.",
        criteria={"grapes": "Viognier", "min_rating": 3.6, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Albariño & Alvarinho",
        description="Coastal whites from Spain and Portugal.",
        criteria={"grapes": "Albariño", "min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Grüner Veltliner Discovery",
        description="Austria's signature white grape in various styles.",
        criteria={"grapes": "Grüner Veltliner", "min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_region": True, "vary_price": True}
    ),

    Theme(
        name="Chenin Blanc Chameleon",
        description="Dry, sweet, and sparkling Chenin from Loire and South Africa.",
        criteria={"grapes": "Chenin Blanc", "min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Pinot Gris/Grigio Spectrum",
        description="Alsace richness vs Italian crispness.",
        criteria={"grapes": "Pinot Gris", "min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Gewürztraminer Aromatics",
        description="Intensely aromatic whites from Alsace and beyond.",
        criteria={"grapes": "Gewürztraminer", "min_rating": 3.6, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Petit Verdot Spotlight",
        description="Bordeaux's blending grape as a varietal star.",
        criteria={"grapes": "Petit Verdot", "min_rating": 3.5, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    # === STYLE & PRODUCTION METHOD THEMES (41-50) ===

    Theme(
        name="Natural & Organic Wines",
        description="Minimal intervention, organic, and biodynamic wines.",
        criteria={"min_rating": 3.6, "max_price": 50.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Orange Wine Revolution",
        description="Skin-contact white wines with tannic structure.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Sparkling Wine World Tour",
        description="Champagne, Cava, Prosecco, and New World sparklers.",
        criteria={"wine_type": "sparkling", "min_rating": 3.6, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Rosé All Day",
        description="Elegant rosé wines perfect for warm weather.",
        criteria={"wine_type": "rosé", "min_rating": 3.6, "max_price": 40.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Old Vine Treasures",
        description="Wines from ancient vines (50+ years old).",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Single Vineyard Expressions",
        description="Site-specific wines showcasing terroir.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_winery": True}
    ),

    Theme(
        name="Amphora & Clay-Aged Wines",
        description="Ancient winemaking vessels meet modern techniques.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Pet-Nat Party",
        description="Pétillant-naturel sparkling wines, rustic and fun.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Skin-Fermented Whites",
        description="White wines with extended skin contact for complexity.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Concrete Egg Fermentation",
        description="Wines fermented in concrete eggs for unique texture.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    # === PRICE-BASED THEMES (51-60) ===

    Theme(
        name="Budget Gems Under $20",
        description="High-quality, affordable wines perfect for casual gatherings.",
        criteria={"max_price": 20.0, "min_rating": 3.5},
        wine_count=15,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Sweet Spot $20-40",
        description="Best value wines in the mid-price range.",
        criteria={"min_rating": 3.5},
        wine_count=12,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Premium Selections $40-80",
        description="Special occasion wines with complexity and age-worthiness.",
        criteria={"min_rating": 3.5},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Luxury Wines $80-150",
        description="Investment-grade wines from prestigious producers.",
        criteria={"min_rating": 3.6},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Ultra-Premium $150+",
        description="Iconic wines for collectors and special celebrations.",
        criteria={"min_rating": 3.5},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Best Wines Under $15",
        description="Exceptional everyday drinking wines on a budget.",
        criteria={"max_price": 15.0, "min_rating": 3.6},
        wine_count=12,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="$25 Dinner Party Wines",
        description="Crowd-pleasing wines perfect for hosting.",
        criteria={"min_rating": 3.5},
        wine_count=10,
        diversity_rules={"mix_types": True, "vary_country": True}
    ),

    Theme(
        name="Value Bordeaux Under $30",
        description="Affordable Bordeaux from lesser-known appellations.",
        criteria={"region": "Bordeaux", "max_price": 30.0, "min_rating": 3.6},
        wine_count=8,
        diversity_rules={"vary_winery": True}
    ),

    Theme(
        name="Champagne Alternatives Under $25",
        description="Quality sparkling wines that won't break the bank.",
        criteria={"wine_type": "sparkling", "max_price": 25.0, "min_rating": 3.6},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Splurge-Worthy Bottles",
        description="Worth-every-penny wines from $50-100.",
        criteria={"min_rating": 3.0, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    # === OCCASION & FOOD PAIRING THEMES (61-75) ===

    Theme(
        name="Summer BBQ Reds",
        description="Fruit-forward reds perfect for grilled meats.",
        criteria={"wine_type": "red", "min_rating": 3.6, "max_price": 35.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Seafood & Shellfish Whites",
        description="Crisp, mineral whites for ocean flavors.",
        criteria={"wine_type": "white", "min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Steakhouse Selection",
        description="Bold reds to pair with prime cuts.",
        criteria={"wine_type": "red", "min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Cheese Board Companions",
        description="Versatile wines for cheese pairings.",
        criteria={"min_rating": 3.5, "max_price": 50.0},
        wine_count=12,
        diversity_rules={"mix_types": True, "vary_country": True}
    ),

    Theme(
        name="Thanksgiving Feast",
        description="Versatile wines for turkey and all the fixings.",
        criteria={"min_rating": 3.6, "max_price": 45.0},
        wine_count=10,
        diversity_rules={"mix_types": True, "vary_grapes": True}
    ),

    Theme(
        name="Holiday Celebration",
        description="Festive wines for end-of-year gatherings.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"mix_types": True, "vary_country": True}
    ),

    Theme(
        name="Brunch Bubbles",
        description="Sparkling wines perfect for daytime celebrations.",
        criteria={"wine_type": "sparkling", "min_rating": 3.6, "max_price": 40.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Date Night Wines",
        description="Romantic, elegant wines for two.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"mix_types": True}
    ),

    Theme(
        name="Pizza & Pasta Night",
        description="Italian wines perfect for casual Italian food.",
        criteria={"country": "Italy", "min_rating": 3.6, "max_price": 30.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "mix_types": True}
    ),

    Theme(
        name="Asian Cuisine Pairings",
        description="Aromatic whites and light reds for Asian flavors.",
        criteria={"min_rating": 3.6, "max_price": 40.0},
        wine_count=10,
        diversity_rules={"vary_grapes": True, "mix_types": True}
    ),

    Theme(
        name="Tapas & Small Plates",
        description="Spanish wines for grazing and sharing.",
        criteria={"country": "Spain", "min_rating": 3.6, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_region": True, "mix_types": True}
    ),

    Theme(
        name="BBQ & Smoked Meats",
        description="Wines with enough structure for bold, smoky flavors.",
        criteria={"wine_type": "red", "min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Vegetarian Feast",
        description="Wines that complement vegetable-forward dishes.",
        criteria={"min_rating": 3.6, "max_price": 40.0},
        wine_count=10,
        diversity_rules={"mix_types": True, "vary_grapes": True}
    ),

    Theme(
        name="Dessert Wine Delights",
        description="Sweet wines for after-dinner indulgence.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Aperitif Hour",
        description="Light, refreshing wines to start the evening.",
        criteria={"min_rating": 3.6, "max_price": 35.0},
        wine_count=10,
        diversity_rules={"mix_types": True, "vary_country": True}
    ),

    # === EDUCATIONAL & COMPARATIVE THEMES (76-90) ===

    Theme(
        name="Old World vs New World",
        description="Compare European elegance with New World fruit.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Vintage Vertical Tasting",
        description="Same wine, different vintages to showcase age.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=6,
        diversity_rules={"vary_vintage": True}
    ),

    Theme(
        name="Terroir Deep Dive",
        description="Same grape, different terroirs worldwide.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Climate Comparison",
        description="Cool climate vs warm climate expressions.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Bordeaux Blend Styles",
        description="Bordeaux blends from around the world.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Rhône Blend Exploration",
        description="GSM and other Rhône-style blends globally.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Indigenous Grapes Discovery",
        description="Rare, native varietals from lesser-known regions.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Women Winemakers",
        description="Wines crafted by female winemakers.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Emerging Wine Regions",
        description="Exciting wines from up-and-coming areas.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "vary_region": True}
    ),

    Theme(
        name="Blind Tasting Challenge",
        description="Diverse wines for a fun guessing game.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "mix_types": True, "vary_grapes": True}
    ),

    Theme(
        name="Benchmark Wines",
        description="Classic examples that define their categories.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Age-Worthy Cellar Candidates",
        description="Wines built to improve over 10+ years.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Wine 101 Basics",
        description="Essential wines to understand fundamental styles.",
        criteria={"min_rating": 3.6, "max_price": 35.0},
        wine_count=12,
        diversity_rules={"vary_grapes": True, "mix_types": True}
    ),

    Theme(
        name="Advanced Sommelier Training",
        description="Complex, challenging wines for serious study.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=15,
        diversity_rules={"vary_country": True, "vary_grapes": True, "mix_types": True}
    ),

    Theme(
        name="Sustainable Viticulture",
        description="Organic, biodynamic, and sustainably farmed wines.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    # === UNIQUE & SPECIALTY THEMES (91-100) ===

    Theme(
        name="Eccentric Spanish Whites",
        description="Unusual Spanish white varietals with natural wine focus.",
        criteria={"country": "Spain", "wine_type": "white", "min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_region": True, "vary_grapes": True}
    ),

    Theme(
        name="Volcanic Wines",
        description="Wines from volcanic soils worldwide.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="High-Altitude Vineyards",
        description="Wines from mountain vineyards above 3,000 feet.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Coastal Influence",
        description="Maritime climate wines with salinity and freshness.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Desert Wines",
        description="Wines from arid, desert climates.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Island Wines",
        description="Wines from island appellations worldwide.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="Ancient Varietals Revived",
        description="Historic grapes brought back from near extinction.",
        criteria={"min_rating": 3.6, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True, "vary_grapes": True}
    ),

    Theme(
        name="Low-Intervention Natural Wines",
        description="Minimal sulfites, no fining, wild yeast fermentation.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=10,
        diversity_rules={"vary_country": True, "mix_types": True}
    ),

    Theme(
        name="Pét-Nat & Ancestral Method",
        description="Traditional bottle fermentation sparkling wines.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=8,
        diversity_rules={"vary_country": True}
    ),

    Theme(
        name="The Ultimate Wine Geek Collection",
        description="Obscure, rare, and conversation-starting wines.",
        criteria={"min_rating": 3.5, "max_price": 38.0},
        wine_count=12,
        diversity_rules={"vary_country": True, "vary_grapes": True, "mix_types": True}
    ),
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


def get_themes_by_category() -> Dict[str, List[Theme]]:
    """Get themes organized by category."""
    return {
        "Regional Focus (1-20)": THEMES[0:20],
        "Varietal Focus (21-40)": THEMES[20:40],
        "Style & Production (41-50)": THEMES[40:50],
        "Price-Based (51-60)": THEMES[50:60],
        "Occasion & Food Pairing (61-75)": THEMES[60:75],
        "Educational & Comparative (76-90)": THEMES[75:90],
        "Unique & Specialty (91-100)": THEMES[90:100],
    }
