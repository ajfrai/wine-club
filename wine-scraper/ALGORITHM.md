# Theme to Wine Mapping Algorithm

## Overview

The wine agent uses a **two-phase intelligent selection algorithm** to map themes to wines:

1. **Criteria-based Search** - Filter wines by theme requirements
2. **Diversity-aware Selection** - Choose varied wines using diversity rules

## Phase 1: Criteria-based Search

The theme defines search filters that query the database:

```python
# Example: "By the Seine - French Wine Bar"
criteria = {
    "country": "France",
    "min_rating": 4.0,
    "max_price": 60.0
}

# SQL query (simplified):
SELECT * FROM wines
WHERE country LIKE '%France%'
  AND rating >= 4.0
  AND price_usd <= 60.0
ORDER BY rating DESC, num_reviews DESC
LIMIT 100  # Get 100 candidates for diversity selection
```

This retrieves **100 candidate wines** that match the basic criteria.

## Phase 2: Diversity-aware Selection

From the 100 candidates, the agent selects the target count (e.g., 12 wines) using diversity rules:

### Diversity Rules

```python
diversity_rules = {
    "regions": ["Bordeaux", "Burgundy", "Loire", "Rhône", "Alsace"],
    "types": ["red", "white"],
    "mix_types": True,       # Ensure both red and white
    "vary_price": True       # Spread across price range
}
```

### Selection Algorithm (Two Passes)

**Pass 1: Prioritize Diversity**

For each wine (sorted by rating):
1. Calculate diversity score based on rules:
   - +1 if `vary_region` enabled and region not yet seen
   - +1 if `vary_winery` enabled and winery not yet seen
   - +1 if `vary_vintage` enabled and vintage not yet seen
   - +1 if `vary_type` enabled and wine type not yet seen
   - +1 if `vary_grapes` enabled and grapes not yet seen

2. Select wine if:
   - Diversity score > 0 (adds new variety), OR
   - We haven't filled at least half the slots yet

3. Track seen values:
   - `seen_regions = {"Bordeaux", "Burgundy", ...}`
   - `seen_wineries = {"Château Margaux", "Domaine Leflaive", ...}`
   - `seen_vintages = {2018, 2019, 2020, ...}`
   - `seen_types = {"red", "white"}`
   - `seen_grapes = {"Pinot Noir", "Chardonnay", ...}`

**Pass 2: Fill Remaining Slots**

If we haven't reached the target count, fill remaining slots with highest-rated wines.

**Special Rule: mix_types**

If `mix_types: True`, ensure both red and white wines:
- Aim for 60/40 split (e.g., 7 reds, 5 whites for 12 wines)
- Swap wines if needed to achieve mix

## Example: "By the Seine - French Wine Bar"

### Input
- Target: 12 wines
- Criteria: France, rating ≥ 4.0, price ≤ $60
- Diversity: varied regions, both red/white

### Step-by-step Selection

```
Candidates retrieved: 100 French wines

Pass 1: Diversity-focused selection
1. Château Margaux (Bordeaux, red, 2018, 4.7★) → diversity_score=4 ✓ SELECT
   - New region: Bordeaux ✓
   - New winery: Château Margaux ✓
   - New vintage: 2018 ✓
   - New type: red ✓

2. Domaine Leflaive (Burgundy, white, 2019, 4.6★) → diversity_score=4 ✓ SELECT
   - New region: Burgundy ✓
   - New winery: Domaine Leflaive ✓
   - New vintage: 2019 ✓
   - New type: white ✓

3. Domaine Leflaive (Burgundy, white, 2018, 4.6★) → diversity_score=1 ✓ SELECT
   - Region: Burgundy (seen) ✗
   - Winery: Domaine Leflaive (seen) ✗
   - Vintage: 2018 (seen) ✗
   - Type: white (seen) ✗
   - Still selected because we haven't filled half the slots

... continues until 12 wines selected

Check mix_types:
- Reds: 7 wines ✓
- Whites: 5 wines ✓
- Mix achieved ✓

Final selection: 12 diverse French wines
```

## Phase 3: Add Selection Reasoning

For each selected wine, generate an explanation:

```python
def _explain_selection(wine, theme):
    reasons = []

    if wine.rating >= 4.5:
        reasons.append("Exceptional rating")
    elif wine.rating >= 4.0:
        reasons.append("Highly rated")

    if wine.region:
        reasons.append(f"From {wine.region}")

    if wine.wine_type:
        reasons.append(f"{wine.wine_type.capitalize()} wine")

    if wine.grapes:
        reasons.append(f"{wine.grapes}")

    if wine.price_usd < 25:
        reasons.append("Great value")
    elif wine.price_usd > 75:
        reasons.append("Premium selection")

    return " • ".join(reasons)
```

Example output:
```
"Highly rated • From Burgundy • White wine • Chardonnay"
```

## Benefits of This Approach

1. **Quality First** - Sorts by rating, so highest-rated wines considered first
2. **Intelligent Diversity** - Automatically varies regions, wineries, vintages
3. **Balanced Selection** - Ensures mix of wine types when needed
4. **Explainable** - Each wine has a reason for selection
5. **Flexible** - Easy to add new diversity rules

## Comparison to Simple Approaches

### Naive Approach (Random)
```python
# Just pick random wines from criteria
random.sample(french_wines_under_60, 12)
# Problem: Might get 12 Bordeaux reds, no diversity
```

### Our Approach (Intelligent)
```python
# Two-phase: criteria search + diversity selection
select_for_theme(theme)
# Result: 12 wines spanning 5 regions, both red/white, varied vintages
```

## Future Enhancements

Potential improvements:
- **Price distribution**: Ensure even spread across price range
- **Vintage distribution**: Prefer recent vintages but include some aged
- **Producer size**: Mix of large/small producers
- **Natural/organic**: Prefer organic when available
- **User preferences**: Learn from past selections
