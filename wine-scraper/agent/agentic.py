"""Agentic wine selection using LLM to interpret themes."""
import json
import subprocess
import sys
from typing import Dict, Any, List

sys.path.append('.')
from data.db import WineDatabase


def select_wines_agentic(theme_name: str, theme_description: str, wine_count: int) -> List[Dict]:
    """
    Use Claude to intelligently select wines based on theme description.
    Claude uses search_wines tool to explore database.
    """

    db = WineDatabase()
    db.connect()

    # Define the tool
    tool = {
        "name": "search_wines",
        "description": "Search wine database with filters",
        "input_schema": {
            "type": "object",
            "properties": {
                "country": {"type": "string"},
                "region": {"type": "string"},
                "grapes": {"type": "string"},
                "wine_type": {"type": "string"},
                "min_rating": {"type": "number"},
                "max_price": {"type": "number"},
                "limit": {"type": "integer", "default": 50}
            }
        }
    }

    # System prompt
    system = """You are a wine expert curator. Use the search_wines tool to explore the database and select wines.
Make multiple searches with different filters to find the best matches for the theme.
Return your final selection as a JSON array of exactly the requested number of wines."""

    # User prompt
    user_prompt = f"""Curate exactly {wine_count} wines for this theme:

**{theme_name}**
{theme_description}

Use search_wines tool to explore. Be creative - interpret the theme intelligently, not just keywords.
Final response must be JSON: {{"wines": [...], "reasoning": "why these wines fit"}}"""

    # Call Claude via API
    try:
        import anthropic
        client = anthropic.Anthropic()

        wines_selected = []
        messages = [{"role": "user", "content": user_prompt}]

        # Tool use loop
        for iteration in range(5):  # Max 5 iterations
            response = client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=4096,
                system=system,
                tools=[tool],
                messages=messages
            )

            # Collect all tool use blocks
            tool_results = []
            has_text_response = False

            for block in response.content:
                if block.type == "tool_use":
                    # Execute search
                    args = block.input
                    results = db.search_wines(
                        country=args.get('country'),
                        region=args.get('region'),
                        grapes=args.get('grapes'),
                        wine_type=args.get('wine_type'),
                        min_rating=args.get('min_rating'),
                        max_price=args.get('max_price'),
                        limit=args.get('limit', 50)
                    )

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(results[:20])  # Limit context
                    })

                elif block.type == "text":
                    # Try to parse final JSON response
                    try:
                        result = json.loads(block.text)
                        wines_selected = result.get('wines', [])
                        has_text_response = True
                        break
                    except:
                        pass

            if has_text_response and wines_selected:
                break

            # Add assistant response and all tool results
            if tool_results:
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})

        db.close()
        return wines_selected[:wine_count]

    except ImportError:
        print("anthropic library not installed. Install with: pip install anthropic")
        db.close()
        return []
    except Exception as e:
        print(f"Error in agentic selection: {e}")
        db.close()
        return []
