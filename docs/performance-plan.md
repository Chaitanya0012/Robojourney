# Performance Improvement Plan

This plan outlines practical steps to reduce load times and improve runtime responsiveness for the React + TypeScript + Supabase robotics web app. It targets seven key areas: Supabase queries, frontend bundle size, lazy loading, caching/SSR, AI tutor loading, simulator performance, and network request discipline.

## 1. Supabase Query & Auth Latency
- **Profile and index**: Use Supabase's Performance panel or `EXPLAIN ANALYZE` to find sequential scans; add indexes or composites that match filter/join patterns.
- **Avoid N+1 patterns**: Replace per-item follow-up queries with nested selects or Postgres functions. Example: `select("id, title, users(name)")` to fetch posts and authors in one call.
- **Select minimal fields**: Request only needed columns to shrink payloads.
- **Parallelize independent calls**: Use `Promise.all` for unrelated queries (e.g., profile + settings).
- **Auth on SSR when possible**: For SSR flows, prefer cookie-based auth to avoid extra client round-trips on load.

## 2. Bundle Size & Code Splitting
- **Run a bundle analysis** (e.g., `vite build --analyze` or Webpack analyzer) to identify heavy libraries such as the simulator/editor or icon packs.
- **Split heavy features**: Keep the landing/login bundle lean; isolate simulator, AI tutor, and quiz-builder code into async chunks.
- **Import only what you use**: Tree-shake icon sets and utility libraries; avoid blanket imports.
- **Ship production builds**: Ensure `NODE_ENV=production` and remove legacy polyfills not needed for modern browsers.

## 3. Lazy Loading & Dynamic Imports
- **Component-level lazy loading**: Use `React.lazy`/`Suspense` for the simulator, AI tutor, and quiz pages so they load on demand.
- **Route-based splitting**: Configure router-based dynamic imports for rarely visited pages.
- **Lazy media**: Use `loading="lazy"` for images and defer heavy assets until they are near viewport.

## 4. Caching & SSR
- **Client caching**: Add SWR or React Query for shared data (profile, course lists) to dedupe requests and reuse cached responses across routes.
- **Stale-while-revalidate UX**: Show cached data instantly, then revalidate in the background.
- **Server rendering where appropriate**: If migrating to Next.js/Remix, render initial HTML and Supabase data server-side to improve time-to-first-paint; use cookie-based Supabase helpers.
- **CDN/edge caching**: Cache static assets and public pages with long-lived headers or ISR.

## 5. AI Tutor Loading
- **On-demand load**: Lazy-load the AI tutor UI and any SDK/model only after the user opens chat.
- **Keep main thread free**: If loading local models or heavy parsing, use Web Workers and display a loading state instead of blocking render.
- **Stream responses**: Use API streaming to show incremental answers and avoid long blank waits.

## 6. Simulator Performance
- **Isolate render loops**: Move rapid updates to refs/canvas; throttle UI state updates to avoid 60fps React rerenders.
- **Use Web Workers for compute**: Run instruction/physics loops in a worker; post summarized state back to the UI.
- **Lazy-load simulator bundles**: Dynamic import interpreter/editor assets only on simulator routes.
- **Reduce fetch churn**: Prefer real-time subscriptions over tight polling; debounce autosaves of user code.

## 7. Network Request Discipline
- **Batch related calls**: Combine multi-endpoint startups into single RPC/Edge Function where possible.
- **Debounce user-driven queries**: Apply 300–600ms debounce to search/validation requests to avoid flooding Supabase.
- **Parallelize safely**: Start independent fetches together to cut wall-clock time while watching backend limits.
- **Monitor in DevTools**: Regularly inspect startup/network waterfalls to catch duplicates and regressions.

## Quick Wins Checklist
- [ ] Add a bundle analyzer and split simulator + AI chunks via `React.lazy`.
- [ ] Introduce React Query/SWR for shared data and enable stale-while-revalidate.
- [ ] Audit Supabase queries for N+1 and add missing indexes for slow filters.
- [ ] Debounce user-input-triggered requests (search, autosave) and batch startup calls.
- [ ] Move simulator/AI heavy work to Web Workers where feasible.

Implementing the above should materially improve first paint times, interaction responsiveness, and backend efficiency for the robotics learning experience.
