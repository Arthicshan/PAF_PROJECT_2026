# Smart Campus Frontend

React + Vite + Tailwind CSS v4 frontend for the Smart Campus Operations Hub.

## Tech Stack

- React 18
- Vite 6
- Tailwind CSS v4
- React Router v6
- Axios 1.14.0 (pinned — see security note below)
- Recharts
- react-qr-code
- react-hot-toast
- Lucide React

## Security Note — Axios

Axios versions **1.14.1** and **0.30.4** were compromised in a supply chain attack on March 31, 2026.
This project pins **axios@1.14.0** which is the last clean version.
Do NOT upgrade axios until a verified clean version is released.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env with your backend URL

# 3. Start development server
npm run dev
```

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:8080
```

## Project Structure

```
src/
├── api/          # Axios API calls per module
├── context/      # Auth + Theme providers
├── components/   # Reusable UI components
│   ├── layout/   # Sidebar, Navbar, ProtectedRoute
│   ├── resources/ # Module A components
│   ├── ai/       # Chatbot widget
│   └── common/   # Shared components
├── pages/        # Page components
│   ├── auth/     # Login + OAuth callback
│   └── resources/ # Module A pages
└── utils/        # Helper functions
```

## Routes

| Path | Access | Description |
|---|---|---|
| /login | Public | Google OAuth login |
| /oauth2/callback | Public | JWT token handler |
| /resources | All users | Resource catalogue |
| /resources/:id | All users | Resource detail |
| /resources/new | ADMIN only | Create resource |
| /resources/:id/edit | ADMIN only | Edit resource |
| /dashboard | All users | Dashboard |
