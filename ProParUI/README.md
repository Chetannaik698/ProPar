# ProPaar — Marketing Site

Think Before You Send. A production-ready Next.js 15 marketing site for ProPaar.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS (custom design tokens in `tailwind.config.ts`)
- Framer Motion for all motion/animation
- Lucide React for icons

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/                  Routes, layout, global styles, metadata, sitemap/robots
components/
  Navbar.tsx           Sticky nav with mobile menu
  Footer.tsx           Premium footer
  sections/            One component per homepage section
animations/            Shared Framer Motion variants
hooks/                 useReducedMotionSafe — respects prefers-reduced-motion
lib/                   cn() className helper
types/                 Shared TypeScript types
public/                Static assets (favicon, add an og-image.png before deploying)
```

## Notes

- All motion respects `prefers-reduced-motion` (see `hooks/useReducedMotionSafe.ts` and the
  global CSS reduced-motion override in `app/globals.css`).
- Replace the placeholder logos in `TrustedBy.tsx` and testimonials in `Testimonials.tsx`
  with real customer data before launch.
- Add a real `public/og-image.png` (1200×630) for social sharing before deploying.
- Update `siteUrl` in `app/layout.tsx` and the sitemap/robots routes to your real domain.
- The waitlist form in `Pricing.tsx` is UI-only — wire `handleSubmit` to your email provider
  or API route.

## Build for production

```bash
npm run build
npm run start
```
