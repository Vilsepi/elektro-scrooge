# Repository Guidelines

## Project Structure & Module Organization
- `src/index.ts` orchestrates price retrieval, chart rendering, and Telegram delivery. Keep orchestration logic here lean and push calculations into helpers.
- `src/datasource/` contains the Nord Pool/Vattenfall client and price types; mock or stub this layer in tests when possible.
- `src/telegram/` renders caption/image content and handles Telegram API calls. Fonts (Roboto) live at the repo root and are copied to `dist/`.
- `__tests__/unit` and `__tests__/integration` hold Jest suites; add new specs alongside related code. `dist/` is build output; avoid editing it manually.
- Infra-as-code lives in `Pulumi.yaml` and `Pulumi.*.yaml`; secrets templates are in `secrets.example.yml`.

## Build, Test, and Development Commands
- Install deps: `npm install`.
- Compile for Lambda/local run: `npm run build` (TypeScript -> `dist/`, copies font/package manifests, installs prod-only deps in `dist/`).
- Run built artifact locally (dry run logs instead of sending Telegram): `npm run start`.
- Lint: `npm run lint` (ESLint with TypeScript/Jest configs).
- Tests: `npm test` for all suites; run after builds/lints for PRs.
- Pulumi helpers: `npm run pulumi:preview`, `npm run pulumi:up`, `npm run pulumi:destroy` (require configured stack and AWS creds).

## Coding Style & Naming Conventions
- TypeScript, strict mode (`tsconfig.json`) with ES2019/CommonJS output; prefer explicit types and avoid `any`.
- Two-space indentation, camelCase for variables/functions, PascalCase for classes/types.
- Keep side effects isolated; pure functions (e.g., pricing math) are easier to test.
- Follow ESLint defaults; fix warnings instead of disabling rules. Keep imports minimal and ordered logically (std libs → third-party → local).

## Testing Guidelines
- Jest is the test runner; name files `*.test.ts` or place under `__tests__/`.
- Unit tests should cover pricing math and rendering helpers; integration tests may hit the live remote API, so mark or skip them when running offline/CI without network.
- Use `nock` to mock HTTP if you need deterministic results. Add fixtures under `__tests__` when helpful.

## Commit & Pull Request Guidelines
- Git history favors short, imperative summaries (`Remove…`, `Fix…`, `Cleanup…`). Match that tone and keep scope focused.
- Before opening a PR, run `npm run lint` and `npm test`; include results in the description.
- Describe the change, link issues, and call out infra or secret changes. Add screenshots of Telegram output/graphs when altering message formatting or visuals.
- Never commit real secrets; use `secrets.yml` (gitignored) or Pulumi `config set --secret` for sensitive values (`TELEGRAM_BOT_AUTH_TOKEN`, `TELEGRAM_CHAT_ID`).
