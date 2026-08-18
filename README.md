# fantasy-draft-frontend

React + TypeScript + MUI v9 frontend for the Fantasy Draft app. Built with Vite, deployed as a static bundle to S3/CloudFront.

## Setup

```sh
pnpm install
cp .env.example .env.local   # fill in Cognito + API values from Terraform outputs
pnpm dev
```

## Build

```sh
pnpm build   # outputs to dist/, upload to the frontend S3 bucket
```

## Structure

- `src/auth` — Cognito auth context (email/password + Google federated login)
- `src/pages` — Login, CreateDraft, JoinDraft, DraftRoom
- `src/ws` — WebSocket client + typed message contracts (mirrors `fantasy-draft-lambdas`)
- `src/theme` — MUI v9 theme
