# fantasy-draft-frontend

React + TypeScript + MUI v9 frontend for the Fantasy Draft app. Built with Vite, deployed as a static bundle to S3/CloudFront.

## Setup

```sh
pnpm install
cp .env.example .env.local   # fill in your Google client ID + API values from Terraform outputs
pnpm dev
```

## Build

```sh
pnpm build   # outputs to dist/, upload to the frontend S3 bucket
```

## Structure

- `src/auth` — Google Sign-In auth context (client-side ID-token flow, no server round-trip)
- `src/pages` — Login, DraftPicker, DraftRoom
- `src/ws` — WebSocket client + typed message contracts (mirrors `../lambda`)
- `src/theme` — MUI v9 theme
