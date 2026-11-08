# TheMohitFact Hub

Next.js 15 + Supabase. Real auth, login-gated downloads, saved resources, PDF preview, account settings, admin dashboard with file upload, contact form.

## Setup
1. Create a project at supabase.com. In the SQL Editor run `supabase/schema.sql`, then run `supabase/migration-v2.sql` (once).
   Already on v1? Skip schema.sql and run only `migration-v2.sql`.
2. Authentication > Providers: keep Email on. Turn on Google and add your Google OAuth client ID and secret.
3. Authentication > URL Configuration: set Site URL to your site, and add `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback` to Redirect URLs.
4. Copy `.env.example` to `.env.local` and fill in the three keys (Project Settings > API).
5. `npm install` then `npm run dev`.
6. Sign up on the site, then make yourself admin by running this in the SQL Editor (use your email):
   `update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');`
   An Admin tab now appears in your dashboard.

## Using the admin dashboard (/dashboard/admin)
- Resources: upload files (PDF, EPUB, DOCX, PPTX, ZIP...), set category, tags, author, cover, who can download, and whether PDFs can be previewed. Edit or delete anything.
- Messages: contact form submissions, with reply by email, mark read, delete.
- Site content: edit the About Me text and your YouTube, Instagram, X and email links.
- Supabase limits upload size per file (50 MB on the free plan; raise it in Storage settings on paid plans).

## Deploy
Push to GitHub, import in Vercel, add the same three env vars.
