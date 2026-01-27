# CLAUDE.md

## Rules

1. **CLAUDE.md is not a general codebase document.** It exists to tell Claude how to start edit sessions and to correct against pathological mistakes. Only add to this file when something is genuinely needed to guide future Claude sessions—not for general documentation.

2. **Do not commit random markdown files or test scripts to GitHub.** While these may be useful during a session, they don't belong on the remote repo. Delete or gitignore them before pushing.

## Site-Wide Color Schema

All UI components must adhere to the following color palette defined in `tailwind.config.ts`:

### Sunburst Colors (Red/Warm Theme)
Primary actions, highlights, and energetic elements:
- `sunburst-50` through `sunburst-900`: #FEF2F2 to #7F1D1D (10-step red palette)
- Primary button color: `sunburst-600` (#DC2626)

### Wine Colors (Brand Theme)
Brand identity and sophisticated elements:
- `wine-light`: #E8D5D5 (Member panel gradients)
- `wine`: #8B4049 (Default/primary wine color)
- `wine-dark`: #5C2931 (Host panel gradients)

Use these colors consistently across all features. Avoid introducing one-off colors that don't fit the schema.
