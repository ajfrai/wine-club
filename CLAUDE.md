# CLAUDE.md

## Rules

1. **CLAUDE.md is not a general codebase document.** It exists to tell Claude how to start edit sessions and to correct against pathological mistakes. Only add to this file when something is genuinely needed to guide future Claude sessions—not for general documentation.

2. **Do not commit random markdown files or test scripts to GitHub.** While these may be useful during a session, they don't belong on the remote repo. Delete or gitignore them before pushing.

3. **This project runs on a low-powered machine.** Do not run local development servers (`npm run dev`, `next dev`) or local Supabase instances (`supabase start`) for testing. However, local builds (`npm run build`) are encouraged to catch errors before pushing. For testing, rely on Vercel preview deployments (automatically created on git push) and use the Supabase CLI to interact with the cloud Supabase instance.
