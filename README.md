# ProPar Alpha

ProPar is an AI thinking partner that helps people think better before they send. Milestone 1 is a privacy-first Chrome extension UI that activates only on ChatGPT.

## Repository structure

```text
propar/
├── extension/               # Manifest V3 Chrome extension
│   ├── public/              # Files copied verbatim into the extension bundle
│   ├── src/
│   │   ├── app/             # Extension composition and lifecycle
│   │   ├── features/        # Product capabilities grouped by domain
│   │   ├── platform/        # ChatGPT-specific DOM integration
│   │   ├── shared/          # Reusable UI and infrastructure
│   │   ├── styles/          # Tailwind entrypoint and design tokens
│   │   ├── background.ts    # MV3 service worker entrypoint
│   │   └── content.tsx      # ChatGPT content script entrypoint
│   └── dev/                 # Local-only visual verification page
├── backend/                 # Reserved boundary for Milestone 2; no server yet
└── README.md
```

The feature-based layout prevents platform code, product behavior, and visual primitives from becoming coupled. `platform/chatgpt` is deliberately an adapter: adding another supported site later should require another adapter, not a rewrite of the analysis feature.

## Local development

Prerequisites:

- Node.js 22 LTS or newer
- pnpm 10 or newer
- Google Chrome

Install and validate:

```bash
pnpm install
pnpm check
```

Load the extension in Chrome:

1. Run `pnpm build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose `extension/dist`.
5. Open `https://chatgpt.com/` and type in the prompt composer.

After source changes, rebuild and select **Reload** on the extension card. For UI work, `pnpm dev` serves a local visual verification page at `/dev/preview.html`; this page is excluded from the production bundle.

## Privacy guarantees for Milestone 1

- No prompt text is persisted.
- No network request is made.
- No analytics, authentication, or remote code is included.
- The extension requests no Chrome permissions.
- Composer content is read only to determine whether it is empty.

Any future telemetry must be event-only by default. Prompt content must require explicit, informed opt-in and a separate data-retention policy.

## Architecture and growth

The content script creates one Shadow DOM root and delegates ChatGPT interaction to `ChatGptComposerAdapter`. The React feature receives only a composer anchor and a boolean indicating whether text exists; it never receives or stores the prompt itself. UI transitions are modeled as explicit `idle`, `analyzing`, and `complete` states.

Milestone 2 should add a backend as an independent workspace package with runtime validation, request IDs, rate limiting, secret management, and a provider-neutral AI gateway. The extension should send the minimum necessary prompt payload over HTTPS only after a clear user action, then discard it. Authentication, billing, analytics, and persistence should remain separate concerns.

Files that should remain small and compositional:

- `src/content.tsx`: bootstrap only.
- `src/app/ProParExtension.tsx`: application wiring only.
- `src/platform/chatgpt/ChatGptComposerAdapter.ts`: selectors and DOM observation only.
- `src/features/prompt-analysis/components/AnalysisCard.tsx`: presentation composition only.
- Future API services: transport only, with schemas and business logic elsewhere.

As features grow, add them under `features/<feature-name>` with their own components, hooks, data contracts, and tests. Shared code should move to `shared` only after genuine reuse exists; this avoids an unowned utility layer.

