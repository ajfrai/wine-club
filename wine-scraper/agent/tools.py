"""MCP tools for wine selection using Claude Agent SDK."""
from typing import Optional, Dict, Any, List
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.db import WineDatabase


# Global database instance
db = WineDatabase()


def search_wines_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Search wines in the 13M wine database.

    Args:
        country: Optional filter by country
        region: Optional filter by region
        grapes: Optional varietal search
        min_rating: Optional minimum rating (0-5)
        max_price: Optional max price USD
        wine_type: Optional red/white/rosé/sparkling
        limit: Max results (default 20)

    Returns:
        List of wines with all fields
    """
    try:
        db.connect()

        wines = db.search_wines(
            country=args.get('country'),
            region=args.get('region'),
            grapes=args.get('grapes'),
            min_rating=args.get('min_rating'),
            max_price=args.get('max_price'),
            wine_type=args.get('wine_type'),
            limit=args.get('limit', 20)
        )

        db.close()

        return {
            'success': True,
            'count': len(wines),
            'wines': wines
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_wine_details_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get full details for a specific wine.

    Args:
        wine_id: Wine ID in database

    Returns:
        Wine details with all fields
    """
    try:
        wine_id = args.get('wine_id')
        if not wine_id:
            return {
                'success': False,
                'error': 'wine_id is required'
            }

        db.connect()
        wine = db.get_wine_by_id(int(wine_id))
        db.close()

        if wine:
            return {
                'success': True,
                'wine': wine
            }
        else:
            return {
                'success': False,
                'error': f'Wine with ID {wine_id} not found'
            }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def verify_availability_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check if wine is likely available in US.

    Heuristic based on price, region, popularity.

    Args:
        wine_id: Wine ID in database

    Returns:
        Availability estimate: "confirmed" | "likely" | "unlikely" | "unknown"
    """
    try:
        wine_id = args.get('wine_id')
        if not wine_id:
            return {
                'success': False,
                'error': 'wine_id is required'
            }

        db.connect()
        wine = db.get_wine_by_id(int(wine_id))
        db.close()

        if not wine:
            return {
                'success': False,
                'error': f'Wine with ID {wine_id} not found'
            }

        # Heuristic availability scoring
        availability = "unknown"
        confidence = 0.0
        reasons = []

        # Check price range (reasonable prices more likely available)
        price = wine.get('price_usd')
        if price:
            if 10 <= price <= 100:
                confidence += 0.3
                reasons.append("Price in common retail range")
            elif price > 200:
                confidence -= 0.2
                reasons.append("High price may limit availability")

        # Check popularity (high reviews = more available)
        num_reviews = wine.get('num_reviews')
        if num_reviews:
            if num_reviews > 1000:
                confidence += 0.3
                reasons.append("High number of reviews")
            elif num_reviews > 100:
                confidence += 0.1
                reasons.append("Moderate number of reviews")

        # Check rating (higher ratings from popular wines more available)
        rating = wine.get('rating')
        if rating and rating > 4.5 and num_reviews and num_reviews > 500:
            confidence += 0.2
            reasons.append("Highly rated popular wine")

        # Determine availability tier
        if confidence >= 0.5:
            availability = "likely"
        elif confidence >= 0.3:
            availability = "possible"
        elif confidence < 0:
            availability = "unlikely"
        else:
            availability = "unknown"

        return {
            'success': True,
            'wine_id': wine_id,
            'wine_name': wine.get('name'),
            'availability': availability,
            'confidence': round(confidence, 2),
            'reasons': reasons
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_database_stats_tool(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get database statistics.

    Returns:
        Stats about total wines, countries, regions, ratings, prices
    """
    try:
        db.connect()
        stats = db.get_statistics()
        db.close()

        return {
            'success': True,
            'stats': stats
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


# Tool definitions for Claude Agent SDK
TOOLS = [
    {
        'name': 'search_wines',
        'description': 'Search wines in the 13M wine database with optional filters',
        'parameters': {
            'type': 'object',
            'properties': {
                'country': {
                    'type': 'string',
                    'description': 'Filter by country (e.g., France, Italy, United States)'
                },
                'region': {
                    'type': 'string',
                    'description': 'Filter by region (e.g., Burgundy, Napa Valley)'
                },
                'grapes': {
                    'type': 'string',
                    'description': 'Filter by grape varietals (e.g., Pinot Noir, Chardonnay)'
                },
                'min_rating': {
                    'type': 'number',
                    'description': 'Minimum rating (0-5 scale)'
                },
                'max_price': {
                    'type': 'number',
                    'description': 'Maximum price in USD'
                },
                'wine_type': {
                    'type': 'string',
                    'description': 'Wine type: red, white, rosé, sparkling'
                },
                'limit': {
                    'type': 'integer',
                    'description': 'Maximum number of results (default 20)',
                    'default': 20
                }
            }
        },
        'handler': search_wines_tool
    },
    {
        'name': 'get_wine_details',
        'description': 'Get full details for a specific wine by ID',
        'parameters': {
            'type': 'object',
            'properties': {
                'wine_id': {
                    'type': 'integer',
                    'description': 'Wine ID in database'
                }
            },
            'required': ['wine_id']
        },
        'handler': get_wine_details_tool
    },
    {
        'name': 'verify_availability',
        'description': 'Check if wine is likely available in US (heuristic)',
        'parameters': {
            'type': 'object',
            'properties': {
                'wine_id': {
                    'type': 'integer',
                    'description': 'Wine ID in database'
                }
            },
            'required': ['wine_id']
        },
        'handler': verify_availability_tool
    },
    {
        'name': 'get_database_stats',
        'description': 'Get database statistics (total wines, countries, regions, etc.)',
        'parameters': {
            'type': 'object',
            'properties': {}
        },
        'handler': get_database_stats_tool
    }
]
