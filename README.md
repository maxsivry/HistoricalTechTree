This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Timeline View Persistence

The timeline UI persists user view preferences in `localStorage` under the `htt.*` namespace:

- `htt.collapsedEras`: array of era IDs the user collapsed.
- `htt.selectedFilters`: array of selected tag filters.
- `htt.viewport`: object with `{ zoom: number, position: { x: number, y: number } }` storing zoom level and pan offset.

These are loaded on mount and saved whenever they change (viewport updates are debounced ~250ms). Clearing browser storage will reset the view to defaults.

## Teacher Login TTL (15-minute inactivity)

- Auth is handled by Supabase; we do not store tokens in our own storage.
- We store only an expiry timestamp at `htt.teacher.expiresAt`.
- On sign-in, a 15-minute inactivity TTL is set; any user activity (mouse, key, scroll, touch) refreshes the TTL.
- If there’s no activity for 15 minutes, we automatically sign out with Supabase.
- On page load, if the TTL has expired, we sign out immediately.
- UI “teacher mode” reflects actual Supabase auth plus the TTL; the local timestamp is never used to bypass auth.

This keeps preferences in `localStorage` while avoiding exposing sensitive credentials to the browser beyond Supabase’s standard session storage.
