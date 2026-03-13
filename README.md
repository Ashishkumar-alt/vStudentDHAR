
Hyperlocal student marketplace (single city): rooms/PG + used items. PWA-first, WhatsApp contact only.

## Tech
- Next.js (App Router) + Tailwind
- Firebase: Auth (Email/Password), Firestore
- Cloudinary: Images (recommended)

## Setup
1) Create a Firebase project.
2) Enable **Authentication -> Sign-in method -> Email/Password**.
3) Create **Firestore** in the project.
4) Create a Cloudinary account (Images only).
5) Copy `.env.example` -> `.env.local` and fill:
   - `NEXT_PUBLIC_FIREBASE_*`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
6) (Optional) Set city config in `.env.local`:
   - `NEXT_PUBLIC_CITY_ID`
   - `NEXT_PUBLIC_CITY_LABEL`
7) (Optional) Require moderation before public visibility:
   - `NEXT_PUBLIC_REQUIRE_APPROVAL=1`

## Admin access
Admin is controlled by Firestore collection `admins`:
- Create a document in `admins/{uid}` for the admin user (via Firebase Console).
- The Admin UI is at `/admin`.

## Running locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Logo / branding
- Put your logo image at `public/logo.png` (the header will use it automatically).
- If `public/logo.png` is missing, the app falls back to `public/logo.svg`.

## Firebase rules (recommended)
This repo includes `firestore.rules` and `storage.rules` plus `firebase.json`.
If you use Firebase CLI, deploy them with:
```bash
firebase deploy --only firestore:rules,storage:rules
```

## Cloudinary (signed uploads)
Uploads use a server-side signature via `src/app/api/cloudinary/sign/route.ts`, so your Cloudinary secret never goes to the browser.

## Notes
"# Force redeploy" 
