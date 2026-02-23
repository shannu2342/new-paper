# Telugu-First Bilingual Newspaper Platform

Production-ready scaffold for an English-first newspaper website with Telugu support.

## Structure
- `backend/` Node + Express + MongoDB (Mongoose)
- `frontend/` React + React Router + dnd-kit

## Language Rules (Enforced)
- Default language = English (`en`)
- Language switch only inside **Other / ఇతరాలు** page
- Admin enters Telugu + English manually for all content
- Bilingual schema used in every content model

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
# set ADMIN_USER and ADMIN_PASS in .env
npm install
npm run seed
npm run seed:admin
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Frontend E2E (Playwright)
```bash
cd frontend
npm run test:e2e
```

## Admin Setup
1. Seed the admin user (run once):
   - `npm run seed:admin`
   - Requires env: `ADMIN_USER`, `ADMIN_PASS`
2. Use `/admin` in the frontend.

## MongoDB Collections
- `users`
- `articles`
- `categories`
- `ap_regions`
- `districts`
- `epapers`
- `menu_settings`
- `language_settings`
- `site_settings`

## Notes
- Files uploaded via `/api/uploads/image` or `/api/uploads/pdf` are stored in `backend/uploads`.
- The header has exactly 8 fixed items (Telugu-first) and can be reordered in Admin.
- Date-based filters are applied to all sections.
