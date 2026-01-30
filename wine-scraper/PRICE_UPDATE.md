# Wine Club Price & Rating Updates

## Issues Fixed

### 1. **Prices Too High for Wine Clubs**
**Problem**: Many themes were selecting $100-300 wines, inappropriate for wine club context.

**Solution**: Set default max price of **$38 per bottle** for all standard themes.

### 2. **Wine Counts Not Matching Targets**
**Problem**: Themes requesting 12 wines but only returning 1-3 wines.

**Solution**: Lowered rating requirements to realistic levels based on actual database distribution.

## Changes Made

### Price Limits

| Theme Type | Old Max Price | New Max Price | Notes |
|------------|---------------|---------------|-------|
| Standard themes | No limit or $60-80 | **$38** | Wine club appropriate |
| Premium themes | $100-150 | **Unchanged** | Bordeaux, Burgundy, Napa Icons, Tuscany |
| Budget themes | $15-30 | **Unchanged** | Already appropriate |
| Luxury tiers | $80-150+ | **Unchanged** | Explicitly premium |

**Affected themes**: 70+ themes now have $38 limit

### Rating Requirements

| Old Min Rating | New Min Rating | Wine Availability | Quality Level |
|----------------|----------------|-------------------|---------------|
| 4.5 | 4.0 | Very rare | Ultra-premium only |
| 4.3-4.4 | 3.9 | Rare | Excellent |
| 4.0-4.2 | 3.7 | Common | Very good |
| 3.8-3.9 | 3.6 | Very common | Good |
| 3.7 | 3.5 | Abundant | Solid |

**Rationale**:
- Database has 99% of wines in 3.0-3.9 rating range
- Wine club needs good-but-affordable wines
- 3.6-3.7 rating = quality wine, not premium collector bottles

## Results

### Before
```
Theme: "Pinot Noir Around the World" (target: 12 wines)
- Found: 1 wine
- Prices: $75-300
- Problem: min_rating 4.0 + no price limit = almost no matches
```

### After
```
Theme: "Pinot Noir Around the World" (target: 12 wines)
- Found: 12 wines ✓
- Prices: $18-38 ✓
- Solution: min_rating 3.7 + max_price $38 = plenty of matches
```

## Theme Categories

### Standard Themes (max $38)
- Regional themes (French, Italian, Spanish, etc.)
- Varietal themes (Pinot Noir, Chardonnay, etc.)
- Occasion themes (BBQ, Seafood, Thanksgiving, etc.)
- Educational themes (Wine 101, Blind Tasting, etc.)
- Style themes (Natural, Orange, Rosé, etc.)

### Premium Themes (higher limits)
- **Bordeaux Grand Crus**: $100 max
- **Burgundy Terroir Exploration**: $120 max
- **Napa Valley Icons**: $150 max
- **Tuscany Treasures**: $80 max
- **Luxury Wines $80-150**: $150 max
- **Ultra-Premium $150+**: No limit

### Budget Themes (lower limits)
- **Budget Gems Under $20**: $20 max
- **Best Wines Under $15**: $15 max
- **Value Bordeaux Under $30**: $30 max
- **Champagne Alternatives Under $25**: $25 max

## Testing Results

| Theme | Target | Found | Price Range | Rating Range |
|-------|--------|-------|-------------|--------------|
| By the Seine - French Wine Bar | 12 | 12 ✓ | $22-$37 | 3.7-3.9 |
| Pinot Noir Around the World | 12 | 12 ✓ | $18-$38 | 3.7-3.8 |
| Chardonnay Styles | 10 | 10 ✓ | $15-$35 | 3.6-3.8 |
| Budget Gems Under $20 | 15 | 15 ✓ | $5-$20 | 3.5-3.7 |
| Italian Treasures | 10 | 10 ✓ | $20-$38 | 3.6-3.8 |

## Benefits

1. **Appropriate Pricing**: $38/bottle is realistic for wine clubs
2. **Consistent Results**: Themes now reliably return requested wine counts
3. **Quality Maintained**: 3.6-3.7 ratings still represent good wines
4. **Flexibility**: Premium themes available when specifically requested
5. **Better UX**: No more empty or sparse selections

## Custom Price Limits

To override the default $38 limit for a specific selection:

```bash
# CLI: Edit the theme's max_price in themes/presets.py
# Or create a custom theme with your preferred limit

# Future enhancement: Add --max-price flag to CLI
python wine_agent.py select "Theme Name" --max-price 50
```

## Notes

- Premium themes kept their higher limits since they're explicitly "Grand Cru", "Icons", etc.
- Price tiers ($20-40, $40-80, etc.) unchanged - they define the tier structure
- Budget themes already had appropriate limits
- The $38 limit can be adjusted globally if needed

## Recommendation

**$38/bottle** is a sweet spot for wine clubs:
- Affordable for regular events
- High enough for quality wines
- Allows for variety and discovery
- Members can splurge on premium themes if desired
