# Performance Optimization Playbook

This guide captures targeted steps to reduce load times and improve responsiveness for the React + TypeScript + Supabase robotics app. It emphasizes quick wins first, then deeper platform changes.

## 1) Quick wins for the next deployment
- **Supabase query hygiene**
  - Limit column selection on all reads; avoid `select('*')` in production paths.
  - Collapse N+1 patterns into a single relational `select` or an RPC when joining multiple tables.
  - Add indexes on frequently filtered columns (e.g., `user_id`, `course_id`, `updated_at`) using Supabase Performance insights or `EXPLAIN ANALYZE`.
- **Reduce the initial JS payload**
  - Lazy-load the simulator, AI Tutor, and quiz builder routes/components via `React.lazy` + `Suspense`.
  - Dynamically import heavy editors (e.g., Monaco) and AI SDKs only when their UI opens.
  - Import icons/utilities individually instead of entire packages.
- **Cache and parallelize**
  - Introduce React Query/SWR for shared data (user profile, course list, quiz metadata) with a multi-minute `staleTime` to dedupe requests.
  - Fire independent Supabase queries in `Promise.all` rather than serial awaits during screen loads.
- **Debounce user-driven calls**
  - Apply a 300–600 ms debounce to search bars, auto-save, and AI prompts; throttle sliders/drag events to ~5–10 updates per second.
- **Asset delivery**
  - Ensure gzip/Brotli is enabled; use `loading="lazy"` for images and pre-sized placeholders for hero media.

## 2) Route-level and bundle shaping
- **Route-based code splitting**: Split `/simulator`, `/quiz`, and AI chat into separate chunks; prefetch on idle for likely next routes.
- **Chunk isolation for editors**: Load only required Monaco languages/themes; consider a lighter editor for read-only views.
- **Error/loading fallbacks**: Provide skeletons or spinners inside `Suspense` boundaries to keep navigation snappy.

## 3) Simulator-specific improvements
- **Rendering loop**: Keep fast-ticking simulation state outside React where possible (canvas or refs), and batch UI updates (1–2 Hz) for HUD panels.
- **Offload heavy work**: Move instruction execution/analysis to a Web Worker; exchange batched messages instead of per-tick state.
- **Persistence**: Debounce saves of code/config to Supabase and clean up subscriptions/intervals on unmount.

## 4) AI Tutor efficiency
- **On-demand loading**: Lazy-load the chat UI and AI SDK; show a lightweight placeholder until the chunk arrives.
- **Streaming UX**: Stream responses when supported and avoid blocking renders while awaiting AI responses.
- **Server-side heavy lifting**: If using local models, load them in a worker or shift inference to a Supabase Edge Function/API to avoid main-thread stalls.

## 5) Data strategy & SSR
- **Client caching**: Cache stable lists (courses/quizzes) and reuse across pages; revalidate in background rather than on every navigation.
- **Server rendering**: For public/landing content, add SSR/ISR to deliver HTML first paint quickly; use Supabase cookie auth helpers if migrating to SSR.
- **Edge aggregation**: Where multiple queries are required to render a page, provide a single Edge Function that returns aggregated data.

## 6) Monitoring and guardrails
- Add bundle analysis to CI to track chunk sizes per route.
- Log Supabase query timings and set alerts for slow (>200 ms) requests in critical paths.
- Track client metrics (TTFB, LCP, INP) to validate improvements after each release.

## Implementation order (suggested)
1. Debounce chat/search/auto-save calls and parallelize independent fetches.
2. Add lazy loading + route code splitting for simulator, AI Tutor, and quiz pages.
3. Introduce React Query/SWR caching for shared reads; tighten Supabase `select` scopes.
4. Index and refactor any remaining slow or N+1 Supabase queries.
5. Move simulator hot loop to a worker and reduce React render frequency.
6. Evaluate SSR/ISR for landing and dashboard surfaces.
