"""Claude Agent SDK integration for intelligent wine selection."""
import json
import sys
import os
from typing import Dict, Any, List, Optional

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data.db import WineDatabase
from themes.presets import Theme, get_theme_by_name


class WineAgent:
    """
    Intelligent wine selection agent using Claude.

    This is a simplified implementation that doesn't require Claude Agent SDK.
    It uses the database directly with intelligent heuristics for theme-based selection.
    """

    def __init__(self):
        self.db = WineDatabase()

    def select_for_theme(self, theme: Theme) -> List[Dict[str, Any]]:
        """
        Select wines matching a theme with intelligent diversity.

        Args:
            theme: Theme with criteria and diversity rules

        Returns:
            Curated list of wines with explanations
        """
        self.db.connect()

        try:
            # Start with base criteria from theme
            all_wines = self._search_with_criteria(theme.criteria)

            # Apply diversity rules
            selected = self._apply_diversity(
                all_wines,
                theme.wine_count,
                theme.diversity_rules
            )

            # Add selection reasoning
            for wine in selected:
                wine['selection_reason'] = self._explain_selection(wine, theme)

            return selected

        finally:
            self.db.close()

    def _search_with_criteria(self, criteria: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search database with theme criteria."""
        wines = self.db.search_wines(
            country=criteria.get('country'),
            region=criteria.get('region'),
            grapes=criteria.get('grapes'),
            min_rating=criteria.get('min_rating'),
            max_price=criteria.get('max_price'),
            wine_type=criteria.get('wine_type'),
            limit=100  # Get more candidates for diversity selection
        )
        return wines

    def _apply_diversity(
        self,
        wines: List[Dict[str, Any]],
        count: int,
        rules: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Apply diversity rules to select varied wines.

        Diversity rules can include:
        - vary_region: Prefer different regions
        - vary_winery: Prefer different wineries
        - vary_vintage: Prefer different vintages
        - vary_price: Spread across price range
        - vary_type: Mix of wine types
        - mix_types: Ensure both red and white
        - vary_grapes: Prefer different grape varietals
        """
        if len(wines) <= count:
            return wines

        selected = []
        seen_regions = set()
        seen_wineries = set()
        seen_vintages = set()
        seen_types = set()
        seen_grapes = set()

        # Sort wines by rating (best first)
        wines_sorted = sorted(
            wines,
            key=lambda w: (w.get('rating') or 0, w.get('num_reviews') or 0),
            reverse=True
        )

        # Selection pass 1: Prioritize diversity
        for wine in wines_sorted:
            if len(selected) >= count:
                break

            region = wine.get('region')
            winery = wine.get('winery')
            vintage = wine.get('vintage')
            wine_type = wine.get('wine_type')
            grapes = wine.get('grapes')

            # Check diversity rules
            diversity_score = 0

            if rules.get('vary_region') and region and region not in seen_regions:
                diversity_score += 1
            if rules.get('vary_winery') and winery and winery not in seen_wineries:
                diversity_score += 1
            if rules.get('vary_vintage') and vintage and vintage not in seen_vintages:
                diversity_score += 1
            if rules.get('vary_type') and wine_type and wine_type not in seen_types:
                diversity_score += 1
            if rules.get('vary_grapes') and grapes and grapes not in seen_grapes:
                diversity_score += 1

            # Prefer wines with high diversity score
            if diversity_score > 0 or len(selected) < count // 2:
                selected.append(wine)
                if region:
                    seen_regions.add(region)
                if winery:
                    seen_wineries.add(winery)
                if vintage:
                    seen_vintages.add(vintage)
                if wine_type:
                    seen_types.add(wine_type)
                if grapes:
                    seen_grapes.add(grapes)

        # Selection pass 2: Fill remaining slots with highest rated
        if len(selected) < count:
            for wine in wines_sorted:
                if wine not in selected:
                    selected.append(wine)
                    if len(selected) >= count:
                        break

        # If mix_types is required, ensure we have both red and white
        if rules.get('mix_types'):
            types_in_selection = {w.get('wine_type') for w in selected}
            if 'red' not in types_in_selection or 'white' not in types_in_selection:
                # Try to swap some wines to get both types
                selected = self._ensure_type_mix(wines_sorted, count)

        return selected[:count]

    def _ensure_type_mix(
        self,
        wines: List[Dict[str, Any]],
        count: int
    ) -> List[Dict[str, Any]]:
        """Ensure selection has both red and white wines."""
        reds = [w for w in wines if w.get('wine_type') == 'red']
        whites = [w for w in wines if w.get('wine_type') == 'white']

        # Aim for roughly 60/40 split
        num_reds = max(1, int(count * 0.6))
        num_whites = count - num_reds

        selected = []
        selected.extend(reds[:num_reds])
        selected.extend(whites[:num_whites])

        # Fill remaining with highest rated
        if len(selected) < count:
            for wine in wines:
                if wine not in selected:
                    selected.append(wine)
                    if len(selected) >= count:
                        break

        return selected[:count]

    def _explain_selection(self, wine: Dict[str, Any], theme: Theme) -> str:
        """Generate explanation for why wine was selected."""
        reasons = []

        # Rating
        rating = wine.get('rating')
        if rating and rating >= 4.5:
            reasons.append("Exceptional rating")
        elif rating and rating >= 4.0:
            reasons.append("Highly rated")

        # Region match
        region = wine.get('region')
        if region:
            reasons.append(f"From {region}")

        # Wine type
        wine_type = wine.get('wine_type')
        if wine_type:
            reasons.append(f"{wine_type.capitalize()} wine")

        # Grapes
        grapes = wine.get('grapes')
        if grapes:
            reasons.append(f"{grapes}")

        # Price value
        price = wine.get('price_usd')
        if price:
            if price < 25:
                reasons.append("Great value")
            elif price > 75:
                reasons.append("Premium selection")

        return " • ".join(reasons)

    def search(
        self,
        country: Optional[str] = None,
        region: Optional[str] = None,
        grapes: Optional[str] = None,
        min_rating: Optional[float] = None,
        max_price: Optional[float] = None,
        wine_type: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search wines with filters."""
        self.db.connect()

        try:
            wines = self.db.search_wines(
                country=country,
                region=region,
                grapes=grapes,
                min_rating=min_rating,
                max_price=max_price,
                wine_type=wine_type,
                limit=limit
            )
            return wines

        finally:
            self.db.close()

    def get_wine_details(self, wine_id: int) -> Optional[Dict[str, Any]]:
        """Get details for a specific wine."""
        self.db.connect()

        try:
            wine = self.db.get_wine_by_id(wine_id)
            return wine

        finally:
            self.db.close()
