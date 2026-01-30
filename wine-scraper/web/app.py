"""Flask web application for wine selection."""
from flask import Flask, render_template, request, jsonify
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.core import WineAgent
from themes.presets import get_all_themes, get_theme_by_name, Theme
from data.db import WineDatabase


def create_app(db_path: str = "data/wines.db"):
    """Create and configure Flask app."""
    app = Flask(__name__)
    app.config['db_path'] = db_path

    agent = WineAgent()

    @app.route('/')
    def index():
        """Home page with theme browser."""
        themes = get_all_themes()
        db = WineDatabase(app.config['db_path'])
        db.connect()
        stats = db.get_statistics()
        db.close()

        return render_template('index.html', themes=themes, stats=stats)

    @app.route('/theme/<theme_name>')
    def theme_selection(theme_name):
        """Wine selection for a specific theme."""
        theme = get_theme_by_name(theme_name)

        if not theme:
            return "Theme not found", 404

        wines = agent.select_for_theme(theme)

        return render_template('selection.html', theme=theme, wines=wines)

    @app.route('/api/search')
    def api_search():
        """API endpoint for wine search."""
        country = request.args.get('country')
        region = request.args.get('region')
        grapes = request.args.get('grapes')
        min_rating = request.args.get('min_rating', type=float)
        max_price = request.args.get('max_price', type=float)
        wine_type = request.args.get('wine_type')
        limit = request.args.get('limit', type=int, default=20)

        wines = agent.search(
            country=country,
            region=region,
            grapes=grapes,
            min_rating=min_rating,
            max_price=max_price,
            wine_type=wine_type,
            limit=limit
        )

        return jsonify({
            'success': True,
            'count': len(wines),
            'wines': wines
        })

    @app.route('/api/wine/<int:wine_id>')
    def api_wine_details(wine_id):
        """API endpoint for wine details."""
        wine = agent.get_wine_details(wine_id)

        if not wine:
            return jsonify({
                'success': False,
                'error': 'Wine not found'
            }), 404

        return jsonify({
            'success': True,
            'wine': wine
        })

    @app.route('/api/stats')
    def api_stats():
        """API endpoint for database statistics."""
        db = WineDatabase(app.config['db_path'])
        db.connect()
        stats = db.get_statistics()
        db.close()

        return jsonify({
            'success': True,
            'stats': stats
        })

    return app
