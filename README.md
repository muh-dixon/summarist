# Summarist

A full-stack book summary platform inspired by the Frontend Simplified virtual internship project.

This app recreates the Summarist experience with:
- a public landing page
- Firebase authentication
- a personalized "For you" dashboard
- dynamic book and player pages
- saved library and finished books
- subscription plans with Stripe checkout
- settings and account management

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Redux Toolkit
- Firebase Authentication
- Firestore
- Stripe Checkout
- React Icons

## Features

### Core app
- Home page built from the provided Summarist design
- Global auth modal
- Register, login, logout, guest login
- Forgot password
- Search with 300ms debounce
- Sidebar navigation
- Skeleton loading states

### Reading flow
- `/for-you` dashboard with selected, recommended, and suggested books
- Premium book pill states
- Dynamic `/book/[id]` route
- Save to library
- Dynamic `/player/[id]` route
- Audio player with:
  - play / pause
  - skip controls
  - seek bar
  - playback speed controls
  - volume controls
  - adjustable summary text size

### Account and subscriptions
- `/settings` account page
- `/choose-plan` pricing page
- Monthly and yearly plans
- 7-day free trial on yearly subscriptions
- Stripe Checkout integration
- Subscription persistence tied to the user account

### Library
- `/library` page
- Saved books
- In-progress books
- Finished books
- Refresh-safe local cache fallback for library state

## Project Structure

```text
src/
  app/
    api/
    book/[id]/
    choose-plan/
    for-you/
    library/
    player/[id]/
    settings/
  components/
    home/
    layout/
    shared/
    sidebar/
  firebase/
  hooks/
  lib/
  redux/
  types/
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Add the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

STRIPE_PRICE_PREMIUM_MONTHLY=
STRIPE_PRICE_PREMIUM_YEARLY=
STRIPE_PRICE_PREMIUM_PLUS_MONTHLY=
STRIPE_PRICE_PREMIUM_PLUS_YEARLY=
```

Optional if you later enable webhook + admin sync:

```env
STRIPE_WEBHOOK_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### 3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`

## Firebase Setup

1. Create a Firebase project
2. Enable `Authentication -> Email/Password`
3. Add a web app and copy the Firebase config into `.env.local`
4. Create the guest account:
   - email: `guest@gmail.com`
   - password: `guest123`
5. Create Firestore if you want persistence for library and subscription state

## Stripe Setup

1. Create Stripe products for:
   - Premium
   - Premium Plus
2. Create recurring monthly and yearly prices for each product
3. Copy the `price_...` ids into `.env.local`
4. Add your Stripe publishable and secret keys
5. Restart the dev server

The app creates Stripe Checkout sessions through the server route in [checkout route](/src/app/api/stripe/checkout/route.ts).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

### GitHub

```bash
git add .
git commit -m "Complete Summarist internship project"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Vercel

1. Import the GitHub repository into Vercel
2. Add the same environment variables from `.env.local`
3. Deploy

## Notes

- `.env.local` is ignored and should never be committed
- Google login was left optional and is not implemented
- Stripe webhook support can be added later for full production-grade billing sync

## Credits

- Project inspired by the Frontend Simplified virtual internship
- Home page design/assets based on the provided Summarist reference
