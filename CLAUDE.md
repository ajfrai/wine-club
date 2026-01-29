# CLAUDE.md

## Rules

1. **CLAUDE.md is not a general codebase document.** It exists to tell Claude how to start edit sessions and to correct against pathological mistakes. Only add to this file when something is genuinely needed to guide future Claude sessions—not for general documentation.

2. **Do not commit random markdown files or test scripts to GitHub.** While these may be useful during a session, they don't belong on the remote repo. Delete or gitignore them before pushing.

3. **This project runs on a low-powered machine.** Do not run local development servers (`npm run dev`, `next dev`) or local Supabase instances (`supabase start`) for testing. However, local builds (`npm run build`) are encouraged to catch errors before pushing. For testing, rely on Vercel preview deployments (automatically created on git push) and use the Supabase CLI to interact with the cloud Supabase instance.

4. **Supabase CLI patterns:**
   - To execute SQL on the cloud database, create a temporary migration file and use `supabase db push --include-all`. There's no `db execute` or `db remote sql` command that works as expected.
   - Use `supabase migration list` to check local/remote sync status.
   - Use `supabase migration repair <version> --status applied` to mark migrations as applied without running them (useful when schema already matches).
   - Use `supabase inspect db table-stats` to check data, not `db dump --data-only`.
   - When seeding data: check actual schema first (`supabase db dump --schema public`), insert into `auth.users` before `public.users` (foreign key), use dummy passwords not `gen_salt()`, and delete seed migrations after applying (don't commit).
