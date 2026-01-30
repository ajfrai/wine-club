#!/usr/bin/env python3
"""Wine Agent CLI - Intelligent wine selection using Kaggle Vivino dataset."""
import argparse
import json
import sys
from pathlib import Path

from data.loader import KaggleDatasetLoader
from agent.core import WineAgent
from themes.presets import get_theme_by_name, get_all_themes, search_themes


def cmd_setup(args):
    """Setup: download and load Kaggle dataset."""
    loader = KaggleDatasetLoader(args.db)
    success = loader.setup()
    sys.exit(0 if success else 1)


def cmd_select(args):
    """Select wines for a theme."""
    # Get theme
    theme = get_theme_by_name(args.theme)

    if not theme:
        print(f"Theme not found: {args.theme}")
        print("\nAvailable themes:")
        for t in get_all_themes():
            print(f"  - {t.name}")
        sys.exit(1)

    # Override wine count if specified
    if args.count:
        theme.wine_count = args.count

    print(f"Selecting wines for theme: {theme.name}")
    print(f"Description: {theme.description}")
    print(f"Target: {theme.wine_count} wines\n")

    # Select wines
    agent = WineAgent()
    wines = agent.select_for_theme(theme)

    if not wines:
        print("No wines found matching theme criteria")
        sys.exit(1)

    # Display results
    print(f"Selected {len(wines)} wines:\n")
    for i, wine in enumerate(wines, 1):
        print(f"{i}. {wine['name']}")
        print(f"   Winery: {wine.get('winery', 'N/A')}")
        print(f"   Region: {wine.get('region', 'N/A')}, {wine.get('country', 'N/A')}")
        if wine.get('vintage'):
            print(f"   Vintage: {wine['vintage']}")
        print(f"   Type: {wine.get('wine_type', 'N/A')}")
        if wine.get('grapes'):
            print(f"   Grapes: {wine['grapes']}")
        print(f"   Rating: {wine.get('rating', 'N/A')}/5 ({wine.get('num_reviews', 0)} reviews)")
        print(f"   Price: ${wine.get('price_usd', 'N/A')}")
        if wine.get('selection_reason'):
            print(f"   Why: {wine['selection_reason']}")
        print()

    # Export if requested
    if args.output:
        output_path = Path(args.output)
        with open(output_path, 'w') as f:
            json.dump({
                'theme': {
                    'name': theme.name,
                    'description': theme.description
                },
                'wines': wines
            }, f, indent=2)
        print(f"Selection saved to {output_path}")


def cmd_search(args):
    """Search wines with filters."""
    agent = WineAgent()
    wines = agent.search(
        country=args.country,
        region=args.region,
        grapes=args.grapes,
        min_rating=args.min_rating,
        max_price=args.max_price,
        wine_type=args.wine_type,
        limit=args.limit
    )

    if not wines:
        print("No wines found matching criteria")
        sys.exit(1)

    print(f"Found {len(wines)} wines:\n")
    for i, wine in enumerate(wines, 1):
        print(f"{i}. {wine['name']} ({wine.get('vintage', 'NV')})")
        print(f"   {wine.get('winery', 'N/A')} - {wine.get('region', 'N/A')}, {wine.get('country', 'N/A')}")
        print(f"   Rating: {wine.get('rating', 'N/A')}/5 | Price: ${wine.get('price_usd', 'N/A')}")
        print()

    # Export if requested
    if args.output:
        output_path = Path(args.output)
        with open(output_path, 'w') as f:
            json.dump(wines, f, indent=2)
        print(f"Results saved to {output_path}")


def cmd_details(args):
    """Get details for a specific wine."""
    agent = WineAgent()
    wine = agent.get_wine_details(args.id)

    if not wine:
        print(f"Wine with ID {args.id} not found")
        sys.exit(1)

    print(f"Wine Details (ID: {wine['id']})\n")
    print(f"Name: {wine['name']}")
    if wine.get('vintage'):
        print(f"Vintage: {wine['vintage']}")
    print(f"Winery: {wine.get('winery', 'N/A')}")
    print(f"Region: {wine.get('region', 'N/A')}")
    print(f"Country: {wine.get('country', 'N/A')}")
    print(f"Type: {wine.get('wine_type', 'N/A')}")
    if wine.get('grapes'):
        print(f"Grapes: {wine['grapes']}")
    print(f"Rating: {wine.get('rating', 'N/A')}/5")
    print(f"Reviews: {wine.get('num_reviews', 0)}")
    print(f"Price: ${wine.get('price_usd', 'N/A')}")


def cmd_themes(args):
    """List all available themes."""
    if args.search:
        themes = search_themes(args.search)
        if not themes:
            print(f"No themes found matching: {args.search}")
            sys.exit(1)
    else:
        themes = get_all_themes()

    print(f"Available Themes ({len(themes)}):\n")
    for theme in themes:
        print(f"• {theme.name}")
        print(f"  {theme.description}")
        print(f"  Target: {theme.wine_count} wines")
        print()


def cmd_web(args):
    """Launch web UI."""
    from web.app import create_app

    app = create_app(args.db)
    print(f"Starting wine selector web UI on http://localhost:{args.port}")
    print("Press Ctrl+C to stop")
    app.run(host='0.0.0.0', port=args.port, debug=args.debug)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Wine Agent - Intelligent wine selection using Kaggle Vivino dataset',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        '--db',
        default='data/wines.db',
        help='Database path (default: data/wines.db)'
    )

    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # Setup command
    setup_parser = subparsers.add_parser(
        'setup',
        help='Download Kaggle dataset and setup database'
    )
    setup_parser.set_defaults(func=cmd_setup)

    # Select command
    select_parser = subparsers.add_parser(
        'select',
        help='Select wines for a theme'
    )
    select_parser.add_argument('theme', help='Theme name')
    select_parser.add_argument('--count', type=int, help='Override wine count')
    select_parser.add_argument('--output', '-o', help='Save selection to JSON file')
    select_parser.set_defaults(func=cmd_select)

    # Search command
    search_parser = subparsers.add_parser(
        'search',
        help='Search wines with filters'
    )
    search_parser.add_argument('--country', help='Filter by country')
    search_parser.add_argument('--region', help='Filter by region')
    search_parser.add_argument('--grapes', help='Filter by grape varietals')
    search_parser.add_argument('--min-rating', type=float, help='Minimum rating (0-5)')
    search_parser.add_argument('--max-price', type=float, help='Maximum price USD')
    search_parser.add_argument('--wine-type', choices=['red', 'white', 'rosé', 'sparkling'], help='Wine type')
    search_parser.add_argument('--limit', type=int, default=20, help='Max results (default: 20)')
    search_parser.add_argument('--output', '-o', help='Save results to JSON file')
    search_parser.set_defaults(func=cmd_search)

    # Details command
    details_parser = subparsers.add_parser(
        'details',
        help='Get details for a specific wine'
    )
    details_parser.add_argument('--id', type=int, required=True, help='Wine ID')
    details_parser.set_defaults(func=cmd_details)

    # Themes command
    themes_parser = subparsers.add_parser(
        'themes',
        help='List available themes'
    )
    themes_parser.add_argument('--search', help='Search themes by keyword')
    themes_parser.set_defaults(func=cmd_themes)

    # Web command
    web_parser = subparsers.add_parser(
        'web',
        help='Launch web UI'
    )
    web_parser.add_argument('--port', type=int, default=5000, help='Port (default: 5000)')
    web_parser.add_argument('--debug', action='store_true', help='Debug mode')
    web_parser.set_defaults(func=cmd_web)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == '__main__':
    main()
