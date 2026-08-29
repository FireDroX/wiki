# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

**Pre-implementation.** `backend/` and `frontend/` are empty directories; `.env`, `.env.example`, `.gitignore`, and `docker-compose.yml` are empty placeholders. The only real content is `README.md`, which serves as the full cahier des charges (spec) and backlog for **OpenWiki**, a self-hosted collaborative wiki (a WikiJS clone). Until scaffolding exists, there are no build/lint/test commands to run — check `README.md` and this file for the intended structure before creating new code, and update both as the project is bootstrapped.

## Stack (planned)

- **Backend**: NestJS (TypeScript), TypeORM, MySQL 8
- **Frontend**: React + TypeScript + Vite, TailwindCSS + shadcn/ui
- **Storage**: Minio (S3-compatible) for media/attachments
- **Auth**: JWT (access + refresh token)
- **Integrations**: Discord (webhooks/bot), n8n (inbound/outbound webhooks)
- **Search**: MySQL FULLTEXT for v1 (Meilisearch is a possible v2 migration)
- **Infra**: `docker-compose.yml` running mysql, minio, backend, frontend

## Backend module structure (per README, to be followed when scaffolding)

Every domain lives directly under `backend/src/<module>/` — there is no intermediate `modules/` folder. Planned modules: `auth`, `users`, `pages`, `versions`, `media`, `search`, `comments`, `integrations`, `webhooks`, `admin`, `health`, plus a cross-cutting `common/` for global guards/decorators/interceptors/filters.

Each module follows the same internal layout:
- `services/` — business logic; orchestrates `persistances/` and `mapper/`
- `persistances/` — TypeORM entities
- `dto/in/` and `dto/out/` — request DTOs (validated with class-validator) and response DTOs (the raw entity is never returned from a controller)
- `mapper/` — entity ↔ DTO conversion
- `filters/` — module-specific exception filters
- `exceptions/` — custom business exceptions
- `<module>.controller.ts` — HTTP layer only, operates exclusively on DTOs
- `<module>.module.ts`

## Frontend structure (planned)

`frontend/src/`: `pages/` (routes), `components/`, `features/` (auth, pages, editor, search, admin), `lib/`, `main.tsx`.

## Core domain model (see README.md §4 for full field lists)

- **Page** has a `currentVersionId` pointer; editing a page **never mutates an existing `PageVersion`** — it always inserts a new version and repoints `currentVersionId`. Version history is append-only. Rollback (`POST /pages/:id/versions/:versionId/restore`) creates a *new* version from old content rather than deleting anything.
- **Page** tree is self-referential via `parentId`; moving a page must reject cycles (a page becoming its own ancestor).
- **Attachment** rows point at Minio object keys (`pages/{pageId}/{uuid}-{filename}`); files are not public by default — access is via presigned URLs (`GET /media/:id/url`).
- **User.role** is `admin | editor | reader`; route protection is via `JwtAuthGuard` + `RolesGuard` + `@Roles(...)` decorator (401 unauthenticated, 403 wrong role).
- **IntegrationConfig** (`discord` | `n8n`) holds webhook URL/secret/options as JSON; Discord notifications are fire-and-forget (a failed webhook post must never block the triggering action).
- Visibility (`public | private`) and publish state (`isPublished`) gate reads across pages, search, media, and comments — "selon visibilité" in the endpoint table means the response set must be filtered by the requesting user's access.

## Full API surface and backlog

`README.md` contains the complete endpoint table (§7) and the ticket-by-ticket backlog (§6, tickets `BE-xxx`/`FE-xxx`/`OPS-xxx` grouped into EPIC-01 through EPIC-17) with acceptance criteria per ticket. Treat each ticket's AC as the spec for that piece of work — e.g. duplicate slug at the same tree level → 409, wrong password → 401, deleting a page with children requires `?cascade=true`, etc. The current branch (`EPIC-01`) corresponds to the first epic (Setup & Infra: Nest init, TypeORM/MySQL config, Minio config, docker-compose).
