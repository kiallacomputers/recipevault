# My Recipe Vault — Phase 1 starter

Nuxt 4 + Supabase starter for **private personal recipe management**. URL imports, friendships, shared cookbooks, public browsing, PDF exports and payments are deliberately **not included** yet.

## Setup

1. Install Node.js 22 or later and run `npm install`.
2. Create a **new** Supabase project.
3. In Supabase SQL Editor run `supabase/migrations/202611070001_phase1.sql` once.
4. Copy `.env.example` to `.env` and fill `SUPABASE_URL` and `SUPABASE_KEY` (publishable/anon key only; **never** service-role key).
5. In Supabase Authentication settings, configure your Site URL (e.g. `http://localhost:3000`) and redirect URLs for development/production.
6. Decide whether to require email confirmation (recommended for production). Configure Supabase Auth email delivery before a public launch.
7. Run `npm run dev`, register a user, and add a recipe.

## Current features

- Supabase email/password registration, login and logout.
- Automatically created profile row on signup.
- Owner-only recipe CRUD with structured ingredients and ordered steps.
- Categories, search, cover image upload and signed image URLs.
- Transactional database RPC for creating/editing a recipe with its children.
- Strict RLS: `private`, `friends` and `public` are stored, but **only the owner can read any recipe in Phase 1**.

## Important implementation notes

- Images are private in Supabase Storage. Signed URLs expire after 120 seconds. Refresh image URLs when needed for longer sessions.
- Replacing cover images currently leaves the previous object in Storage. Add image cleanup and orphan reconciliation before production.
- Registration currently uses Supabase's standard confirmation flow; test redirects with your Auth configuration.
- Search is basic title matching. Expand to ingredients and full-text search later.
- Editing a recipe replaces all ingredient/step rows atomically, so child row IDs change.
- Recipe deletion cascades database children, **not** Storage objects; add cleanup job before production.
- The first public release needs automated RLS permission tests, accessibility checks, error monitoring, rate limits, account deletion, backups and privacy/legal pages.
- For social sharing later, create a dedicated access-check function used consistently by recipe, ingredient, step and image access. Do not simply enable public SELECT on recipes without addressing dependent data.
- This project is a scaffold and has not been integration-tested against a live Supabase project in this environment.

## Next phase

Add friend requests and mutual friendships, access revocation, linked saved recipes, and then collaborative cookbooks with explicit collection-scoped grants. URL imports come **later**, with source attribution and permission/copyright considerations.
