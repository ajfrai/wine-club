# CLAUDE.md

## Rules

1. **CLAUDE.md is not a general codebase document.** It exists to tell Claude how to start edit sessions and to correct against pathological mistakes. Only add to this file when something is genuinely needed to guide future Claude sessions—not for general documentation.

2. **Organize plans and test scripts in dedicated directories:**
   - **Plans**: Save implementation plans to `docs/plans/` with descriptive names (e.g., `wine-purchase-agent.md`)
   - **Test scripts**: Save test scripts to `scripts/tests/`
   - These directories ARE committed to GitHub for documentation and testing purposes
   - Do NOT create setup guides or documentation with API keys/secrets - those stay in `.env` files only
   - Do NOT create random markdown files or test scripts in the project root

3. **Before committing, check for stray files:**
   ```bash
   git status | grep -E '\.md$|test-.*\.js$'
   ```
   If you find any in the root, move them to the appropriate directory or delete them.
