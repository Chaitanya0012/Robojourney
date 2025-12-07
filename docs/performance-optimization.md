# Performance Optimization Playbook

This plan targets faster first paint and smoother interactions across the robotics learning app (React + TypeScript + Supabase). It prioritizes Supabase query latency, bundle size reduction, code-splitting/lazy loading, caching and SSR, AI tutor loading, simulator responsiveness, and request hygiene.

## 1) Supabase performance
- **Index and profile**: Use Supabase performance tools/`EXPLAIN ANALYZE` to add indexes for frequent filters/joins; avoid sequential scans on startup-critical tables.
- **Flatten N+1 calls**: Replace client loops that fetch related entities with single relational selects (e.g., `select("id,title,users(name)")`) or RPCs. Prefer `Promise.all` for independent calls.
- **Trim payloads**: Select only needed columns; avoid `*` for dashboard lists and quiz/simulator lookups.
- **Load sequencing**: Render the shell immediately and fetch heavy data (quiz history, transcripts, simulator telemetry) after first paint. Parallelize non-dependent queries.
- **Auth flow**: Cache sessions client-side; for SSR routes use cookie-based helpers to avoid an extra auth round-trip on load. Consider plan/instance sizing if analytics show CPU/IO pressure.

## 2) Bundle size and loading strategy
- **Measure**: Run bundle analysis to identify heavy chunks (e.g., Monaco editor, three.js scenes, AI SDKs, icon packs). Tree-shake and import only used icons/modules.
- **Code-split aggressively**: Dynamic-import simulator, AI tutor, quiz builder, and any 3D/visualization modules so the landing/dashboard bundle stays lean.
- **Route-based splitting**: Ensure router-level chunks for `/simulator`, `/quiz`, `/ai-tutor` so users only download what they navigate to. Enable prefetching on idle for likely next routes.
- **Prune legacy weight**: Drop unused polyfills/locale packs and confirm production builds (minification, NODE_ENV=production, gzip/Brotli) are used.

## 3) Lazy loading patterns
- Wrap heavy components in `React.lazy` + `Suspense` with fallbacks; load Monaco/editor languages, code templates, and AI widgets on demand.
- Dynamically import rarely used helpers (e.g., charting for analytics, Markdown renderers) inside event handlers rather than top-level imports.
- Use `loading="lazy"` for tutorial media and lesson imagery to keep the critical path clear.

## 4) Caching, SSR, and data reuse
- **Client cache**: Standardize on React Query (already a dependency) for Supabase fetches with generous `staleTime` for read-heavy data (courses, quizzes, profiles) and request deduplication.
- **Prefill UI state**: Hydrate pages from cache/localStorage where safe (e.g., last quiz attempt, recent transcripts) and revalidate in the background (stale-while-revalidate).
- **Server rendering**: For public or auth-cookie-backed routes, render via SSR/ISR so users see content before JS hydrates. Cache static/edge-friendly pages via CDN where possible.

## 5) AI tutor module
- **On-demand load**: Lazy-load the chat UI and any AI SDK/model only when the user opens the tutor. Keep the initial bundle free of AI assets.
- **Stream and async**: Stream responses to improve perceived speed; never block renders on AI calls—trigger requests in handlers/effects.
- **Worker/offload**: If local models or heavy tokenization are required, move them to Web Workers or server-side functions to avoid main-thread stalls.
- **Rate control**: Debounce context pushes (code snapshots, telemetry) and throttle expensive analysis to prevent request floods.

## 6) Simulator responsiveness
- **Isolate updates**: Keep high-frequency simulation loops out of React state; use refs/canvas/three.js renders and only sync coarse state (status, latest readings) to React at a reduced cadence.
- **Workers for CPU-bound work**: Run emulation/physics in a Worker and postMessage minimal deltas to the UI thread.
- **Lazy resources**: Defer loading emulator cores, 3D assets, and hardware models until the simulator route mounts.
- **Network hygiene**: Replace rapid-fire saves/polls with debounced saves and Supabase real-time channels where applicable; clean up subscriptions on unmount.

## 7) Network request hygiene
- **Batch/aggregate**: Combine related fetches (quiz + progress + recommendations) into single endpoints or Supabase RPCs.
- **Debounce user-driven calls**: Apply 300–600ms debounce to search, AI prompts, live validation, and autosave to avoid flooding the API.
- **Throttle streaming/telemetry**: Cap updates for sliders/drag interactions or simulator telemetry to a few times per second.
- **Observe**: Use browser DevTools to spot duplicate/serial calls on load; fix with shared hooks/context and caching.

## 8) Measurement and rollout
- Track key metrics (Time to Interactive, Largest Contentful Paint, API latency, simulation FPS). Re-run bundle analyzer after each dependency or feature change.
- Roll out optimizations behind feature flags where risk is higher (e.g., workerized simulator) and monitor error rates/UX before full release.
