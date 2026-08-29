# OpenWiki — Cahier des charges & Backlog complet

Clone de WikiJS — NestJS / TypeORM / MySQL / React / TypeScript / Tailwind / shadcn / Minio / Discord / n8n

---

## 1. Présentation du projet

**OpenWiki** est une plateforme de wiki collaboratif auto-hébergée. Les utilisateurs créent des pages organisées en arborescence, chaque édition est versionnée, les médias sont stockés sur Minio, et le tout peut être notifié/automatisé via Discord et n8n.

### Objectifs fonctionnels

- Créer, éditer, organiser des pages en arborescence (dossiers/sous-pages)
- Versionner chaque modification (historique + rollback)
- Uploader et insérer des médias (images, fichiers) dans les pages
- Rechercher du contenu (full-text)
- Gérer des utilisateurs et des permissions (admin / éditeur / lecteur)
- Commenter les pages
- Notifier Discord lors d'évènements clés
- Déclencher des automatisations n8n (backup, exports, webhooks sortants)

---

## 2. Stack technique

| Couche          | Techno                                                               |
| --------------- | -------------------------------------------------------------------- |
| Backend         | NestJS (Node.js, TypeScript)                                         |
| ORM             | TypeORM                                                              |
| Base de données | MySQL 8                                                              |
| Stockage objets | Minio (S3-compatible)                                                |
| Frontend        | React + TypeScript + Vite                                            |
| UI              | TailwindCSS + shadcn/ui                                              |
| Auth            | JWT (access + refresh token)                                         |
| Intégrations    | Discord (webhooks + bot optionnel), n8n (webhooks entrants/sortants) |
| Recherche       | MySQL FULLTEXT (v1) → migration Meilisearch possible (v2)            |

---

## 3. Architecture globale

```
openwiki/
├── backend/           (NestJS)
│   ├── src/
│   │   ├── auth/
│   │   │   ├── services/
│   │   │   ├── persistances/   (entités TypeORM)
│   │   │   ├── dto/
│   │   │   │   ├── in/
│   │   │   │   └── out/
│   │   │   ├── mapper/
│   │   │   ├── filters/
│   │   │   ├── exceptions/
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── users/          (même structure : services/persistances/dto/mapper/filters)
│   │   ├── pages/          (idem)
│   │   ├── versions/       (idem)
│   │   ├── media/          (idem)
│   │   ├── search/         (idem)
│   │   ├── comments/       (idem)
│   │   ├── integrations/   (idem)
│   │   ├── webhooks/       (idem)
│   │   ├── admin/          (idem)
│   │   ├── health/
│   │   ├── common/ (guards, decorators, interceptors, filters globaux)
│   │   └── main.ts
├── frontend/          (React + Vite)
│   ├── src/
│   │   ├── pages/         (routes)
│   │   ├── components/
│   │   ├── features/      (auth, pages, editor, search, admin)
│   │   ├── lib/
│   │   └── main.tsx
└── docker-compose.yml (mysql, minio, backend, frontend)
```

Chaque module vit directement sous `src/` (pas de dossier `modules/` intermédiaire). À l'intérieur d'un module :

- `services/` — logique métier, orchestre `persistances/` et `mapper/`
- `persistances/` — entités TypeORM (couche persistance)
- `dto/in/` et `dto/out/` — DTO de requête (validés via class-validator) et de réponse (jamais l'entity brute exposée)
- `mapper/` — conversion entity ↔ DTO
- `filters/` — exception filters spécifiques au module
- `exceptions/` — exceptions métier custom
- `<module>.controller.ts` — HTTP uniquement, ne manipule que des DTO
- `<module>.module.ts`

---

## 4. Modèle de données (entités TypeORM)

### User

| Champ        | Type                        | Notes             |
| ------------ | --------------------------- | ----------------- |
| id           | uuid                        | PK                |
| email        | varchar                     | unique            |
| passwordHash | varchar                     |                   |
| displayName  | varchar                     |                   |
| avatarUrl    | varchar nullable            | pointe vers Minio |
| role         | enum(admin, editor, reader) |                   |
| createdAt    | datetime                    |                   |
| updatedAt    | datetime                    |                   |

### Page

| Champ            | Type                  | Notes                                  |
| ---------------- | --------------------- | -------------------------------------- |
| id               | uuid                  | PK                                     |
| slug             | varchar               | unique par branche                     |
| title            | varchar               | dénormalisé depuis la version courante |
| parentId         | uuid nullable         | FK → Page (arborescence)               |
| currentVersionId | uuid nullable         | FK → PageVersion                       |
| isPublished      | boolean               |                                        |
| visibility       | enum(public, private) |                                        |
| createdById      | uuid                  | FK → User                              |
| createdAt        | datetime              |                                        |
| updatedAt        | datetime              |                                        |

### PageVersion

| Champ         | Type             | Notes                       |
| ------------- | ---------------- | --------------------------- |
| id            | uuid             | PK                          |
| pageId        | uuid             | FK → Page                   |
| content       | text (markdown)  |                             |
| title         | varchar          |                             |
| authorId      | uuid             | FK → User                   |
| changeSummary | varchar nullable | message de commit façon git |
| createdAt     | datetime         | append-only, jamais modifié |

### Attachment

| Champ        | Type          | Notes              |
| ------------ | ------------- | ------------------ |
| id           | uuid          | PK                 |
| pageId       | uuid nullable | FK → Page          |
| minioKey     | varchar       | chemin objet Minio |
| filename     | varchar       |                    |
| mimeType     | varchar       |                    |
| size         | int           | bytes              |
| uploadedById | uuid          | FK → User          |
| createdAt    | datetime      |                    |

### Tag / PageTag

| Champ          | Type    | Notes        |
| -------------- | ------- | ------------ |
| Tag.id         | uuid    | PK           |
| Tag.name       | varchar | unique       |
| PageTag.pageId | uuid    | FK composite |
| PageTag.tagId  | uuid    | FK composite |

### Comment

| Champ     | Type     | Notes     |
| --------- | -------- | --------- |
| id        | uuid     | PK        |
| pageId    | uuid     | FK → Page |
| authorId  | uuid     | FK → User |
| content   | text     |           |
| createdAt | datetime |           |

### IntegrationConfig

| Champ    | Type               | Notes                        |
| -------- | ------------------ | ---------------------------- |
| id       | uuid               | PK                           |
| type     | enum(discord, n8n) |                              |
| config   | json               | webhook URL, secret, options |
| isActive | boolean            |                              |

---

## 5. Découpage en Epics

1. **EPIC-01** — Setup & Infra
2. **EPIC-02** — Authentification & Utilisateurs
3. **EPIC-03** — Gestion des Pages (CRUD + arborescence)
4. **EPIC-04** — Versioning
5. **EPIC-05** — Médias / Minio
6. **EPIC-06** — Recherche
7. **EPIC-07** — Commentaires
8. **EPIC-08** — Intégration Discord
9. **EPIC-09** — Intégration n8n
10. **EPIC-10** — Frontend : Setup & Layout
11. **EPIC-11** — Frontend : Authentification
12. **EPIC-12** — Frontend : Navigation & Arborescence
13. **EPIC-13** — Frontend : Éditeur de pages
14. **EPIC-14** — Frontend : Historique / Diff
15. **EPIC-15** — Frontend : Recherche
16. **EPIC-16** — Frontend : Administration
17. **EPIC-17** — Tests & CI/CD

---

## 6. Tickets détaillés

### EPIC-01 — Setup & Infra

**BE-001 — Initialiser le projet NestJS**

- Description : `nest new backend`, config TypeScript strict, ESLint + Prettier, structure modulaire.
- AC : projet démarre avec `npm run start:dev`, healthcheck `GET /health` répond 200.
- Estimation : 2h

**BE-002 — Config MySQL + TypeORM**

- Description : connexion via variables d'env, `TypeOrmModule.forRootAsync`, migrations activées (pas de `synchronize: true` en prod).
- AC : migration initiale exécutable, connexion testée au démarrage.
- Estimation : 3h

**BE-003 — Config Minio (SDK S3)**

- Description : intégrer `@aws-sdk/client-s3` ou `minio` npm package, bucket auto-créé au démarrage si absent.
- AC : upload/download de test fonctionnel en local via docker-compose.
- Estimation : 3h

**BE-004 — Docker Compose global**

- Description : services `mysql`, `minio`, `backend`, `frontend`, réseau partagé, volumes persistants.
- AC : `docker-compose up` démarre toute la stack fonctionnelle.
- Estimation : 4h

---

### EPIC-02 — Authentification & Utilisateurs

**BE-010 — Entité User + migration**

- Estimation : 1h

**BE-011 — Endpoint inscription**

- `POST /auth/register`
- Body : `{ email, password, displayName }`
- Réponse : `201 { id, email, displayName }`
- Logique : hash bcrypt, rôle par défaut `reader`.
- AC : email dupliqué → `409 Conflict`.

**BE-012 — Endpoint connexion**

- `POST /auth/login`
- Body : `{ email, password }`
- Réponse : `200 { accessToken, refreshToken }`
- AC : mauvais mot de passe → `401`.

**BE-013 — Endpoint refresh token**

- `POST /auth/refresh`
- Body : `{ refreshToken }`
- Réponse : `200 { accessToken }`

**BE-014 — Guard JWT + décorateur rôles**

- Description : `JwtAuthGuard`, `RolesGuard`, décorateur `@Roles('admin')`.
- AC : route protégée renvoie `401` sans token, `403` si rôle insuffisant.

**BE-015 — Endpoint profil courant**

- `GET /users/me` → `200 { id, email, displayName, role, avatarUrl }`

**BE-016 — Endpoint mise à jour profil**

- `PATCH /users/me`
- Body : `{ displayName?, avatarUrl? }`

**BE-017 — CRUD admin utilisateurs**

- `GET /admin/users` (liste paginée, réservé admin)
- `PATCH /admin/users/:id/role` — Body : `{ role }`
- `DELETE /admin/users/:id`

---

### EPIC-03 — Gestion des Pages

**BE-020 — Entité Page + migration**

**BE-021 — Créer une page**

- `POST /pages`
- Body : `{ slug, title, content, parentId?, visibility }`
- Logique : crée `Page` + première `PageVersion`, met à jour `currentVersionId`.
- AC : slug dupliqué au même niveau d'arborescence → `409`.

**BE-022 — Lister l'arborescence**

- `GET /pages/tree`
- Réponse : arbre JSON `{ id, slug, title, children: [...] }`
- AC : ne renvoie pas les pages privées si l'utilisateur n'a pas les droits.

**BE-023 — Obtenir une page par slug**

- `GET /pages/:slug`
- Réponse : contenu de la version courante + métadonnées.
- AC : `404` si inexistante, `403` si privée et non autorisé.

**BE-024 — Éditer une page**

- `PATCH /pages/:id`
- Body : `{ title?, content?, changeSummary? }`
- Logique : **ne modifie jamais PageVersion existante** → crée une nouvelle version, met à jour le pointeur.
- AC : historique conserve toutes les versions précédentes intactes.

**BE-025 — Déplacer une page (changer de parent)**

- `PATCH /pages/:id/move`
- Body : `{ newParentId }`
- AC : empêche les boucles (page devenant son propre ancêtre).

**BE-026 — Supprimer une page**

- `DELETE /pages/:id`
- AC : soft delete recommandé (`deletedAt`), refuse si sous-pages existantes sans `?cascade=true`.

**BE-027 — Publier / dépublier**

- `PATCH /pages/:id/publish` — Body : `{ isPublished }`

---

### EPIC-04 — Versioning

**BE-030 — Entité PageVersion + migration**

**BE-031 — Lister les versions d'une page**

- `GET /pages/:id/versions`
- Réponse : liste paginée `{ id, authorId, changeSummary, createdAt }`

**BE-032 — Obtenir une version spécifique**

- `GET /pages/:id/versions/:versionId`

**BE-033 — Diff entre deux versions**

- `GET /pages/:id/versions/diff?from=:v1&to=:v2`
- Réponse : `{ additions: [...], deletions: [...] }` (calcul via lib `diff` côté backend ou renvoi brut pour diff côté front)

**BE-034 — Rollback vers une version**

- `POST /pages/:id/versions/:versionId/restore`
- Logique : crée une **nouvelle** version avec le contenu de l'ancienne (jamais de suppression d'historique).

---

### EPIC-05 — Médias / Minio

**BE-040 — Entité Attachment + migration**

**BE-041 — Upload de fichier**

- `POST /media/upload` (multipart/form-data)
- Body : fichier + `pageId?`
- Logique : stream vers Minio, clé = `pages/{pageId}/{uuid}-{filename}`, enregistrement en DB.
- Réponse : `201 { id, url, filename, mimeType, size }`
- AC : limite de taille configurable (ex. 20 Mo), types MIME whitelistés pour les images.

**BE-042 — Lister les médias d'une page**

- `GET /media?pageId=:id`

**BE-043 — Obtenir une URL présignée**

- `GET /media/:id/url`
- Réponse : `{ url, expiresIn }` (URL Minio temporaire, pas de fichier public par défaut)

**BE-044 — Supprimer un média**

- `DELETE /media/:id`
- Logique : suppression Minio + DB.

---

### EPIC-06 — Recherche

**BE-050 — Index FULLTEXT MySQL sur PageVersion (title, content)**

**BE-051 — Endpoint recherche**

- `GET /search?q=:query&page=1&limit=20`
- Réponse : `{ results: [{ pageId, slug, title, excerpt, score }], total }`
- AC : ne renvoie que les pages publiées et visibles par l'utilisateur.

---

### EPIC-07 — Commentaires

**BE-060 — Entité Comment + migration**

**BE-061 — Lister commentaires d'une page**

- `GET /pages/:id/comments`

**BE-062 — Ajouter un commentaire**

- `POST /pages/:id/comments`
- Body : `{ content }`

**BE-063 — Supprimer un commentaire**

- `DELETE /comments/:id`
- AC : autorisé pour l'auteur ou un admin.

---

### EPIC-08 — Intégration Discord

**BE-070 — Entité IntegrationConfig + migration**

**BE-071 — CRUD config Discord (admin)**

- `GET /admin/integrations/discord`
- `PUT /admin/integrations/discord` — Body : `{ webhookUrl, events: ['page.published', 'page.commented'] }`

**BE-072 — Service de notification Discord**

- Description : écoute les events internes (EventEmitter NestJS) et poste sur le webhook configuré.
- Events couverts : `page.created`, `page.published`, `page.commented`, `user.registered`.
- AC : échec d'envoi Discord ne bloque jamais l'action principale (fire-and-forget avec log d'erreur).

**BE-073 (optionnel) — Bot Discord avec commande `/wiki-search`**

- Description : bot séparé (discord.js) qui appelle `GET /search` et renvoie un embed avec les 3 meilleurs résultats.

---

### EPIC-09 — Intégration n8n

**BE-080 — Webhook entrant depuis n8n**

- `POST /webhooks/n8n/:integrationId`
- Description : endpoint générique sécurisé par secret, permet à n8n de déclencher des actions (ex : créer une page depuis un flux automatisé).

**BE-081 — Webhook sortant vers n8n**

- Description : au même titre que Discord, certains events internes peuvent POST vers une URL n8n configurée (déclenchement de workflow).
- AC : configurable indépendamment par event dans `IntegrationConfig`.

**BE-082 — Endpoint export complet (pour backup n8n)**

- `GET /admin/export` (réservé admin)
- Réponse : archive ZIP (pages en markdown + métadonnées) générée à la volée, pensée pour être appelée périodiquement par un workflow n8n qui la pousse ensuite vers Minio ou ailleurs.

---

### EPIC-10 — Frontend : Setup & Layout

**FE-001 — Init projet Vite + React + TS**

- AC : `npm run dev` fonctionnel, alias `@/` configuré.

**FE-002 — Config Tailwind + shadcn/ui**

- AC : `npx shadcn init` fait, thème (couleurs, radius) appliqué.

**FE-003 — Layout global**

- Description : sidebar (arborescence) + topbar (recherche, avatar, menu) + zone de contenu.
- Composants shadcn : `Sheet` (sidebar mobile), `DropdownMenu`, `Avatar`.

**FE-004 — Client API (axios/fetch wrapper)**

- Description : instance centralisée, interception 401 → refresh token automatique.

---

### EPIC-11 — Frontend : Authentification

**FE-010 — Page login**

- Formulaire shadcn (`Form`, `Input`, `Button`), validation via `zod`.

**FE-011 — Page inscription**

**FE-012 — Gestion du contexte Auth (React Context / Zustand)**

- Stocke `user`, `accessToken`, actions `login/logout/refresh`.

**FE-013 — Routes protégées**

- Description : wrapper `<ProtectedRoute roles={['admin']}>`, redirection vers `/login` si non authentifié.

---

### EPIC-12 — Frontend : Navigation & Arborescence

**FE-020 — Composant sidebar arborescente**

- Description : `Collapsible`/`Accordion` shadcn récursif, indicateur page active.

**FE-021 — Fil d'ariane (breadcrumb)**

**FE-022 — Page de visualisation d'une page (lecture)**

- Description : rendu markdown → HTML avec coloration syntaxique (`shiki`), affichage des attachments.

---

### EPIC-13 — Frontend : Éditeur de pages

**FE-030 — Éditeur markdown avec preview live**

- Description : split view textarea + preview, ou intégration Tiptap/MDXEditor selon le niveau de richesse souhaité.

**FE-031 — Upload d'images depuis l'éditeur**

- Description : drag & drop ou bouton, appelle `POST /media/upload`, insère automatiquement le markdown `![alt](url)`.

**FE-032 — Formulaire de métadonnées de page**

- Description : titre, slug, visibilité, parent (sélecteur d'arborescence), tags.

**FE-033 — Champ "résumé de modification" à la sauvegarde**

- Lié à `changeSummary` de PageVersion.

---

### EPIC-14 — Frontend : Historique / Diff

**FE-040 — Liste des versions d'une page**

- Composant `Table` shadcn : auteur, date, résumé.

**FE-041 — Vue diff entre deux versions**

- Lib `react-diff-viewer` ou équivalent, appel `GET /pages/:id/versions/diff`.

**FE-042 — Action "restaurer cette version"**

- Confirmation via `AlertDialog` shadcn.

---

### EPIC-15 — Frontend : Recherche

**FE-050 — Barre de recherche globale (topbar)**

- `Command` (cmdk) shadcn, debounce 300ms, résultats live.

**FE-051 — Page de résultats de recherche complète**

- Pagination, extraits surlignés.

---

### EPIC-16 — Frontend : Administration

**FE-060 — Page gestion des utilisateurs**

- `Table` + `Select` pour changer le rôle, `AlertDialog` pour suppression.

**FE-061 — Page configuration Discord**

- Formulaire webhook URL + checkboxes des events à notifier.

**FE-062 — Page configuration n8n**

- Formulaire webhook URL + secret + bouton "tester la connexion".

**FE-063 — Page export/backup**

- Bouton déclenchant `GET /admin/export`, téléchargement direct du ZIP.

---

### EPIC-17 — Tests & CI/CD

**OPS-001 — Tests unitaires backend (services critiques)**

- Cibles prioritaires : logique de versioning (BE-024), permissions (guards), upload Minio.

**OPS-002 — Tests e2e backend (Supertest)**

- Parcours : register → login → create page → edit → rollback.

**OPS-003 — Tests frontend (Vitest + Testing Library)**

- Cibles : formulaires (login, création de page), rendu de l'arborescence.

**OPS-004 — Pipeline CI (GitHub Actions ou équivalent)**

- Lint + tests sur chaque PR, build docker sur merge `main`.

**OPS-005 — Migrations automatiques au déploiement**

- Description : `typeorm migration:run` exécuté au démarrage du conteneur backend.

---

## 7. Récapitulatif complet des endpoints API

### Auth

| Méthode | Route          | Auth | Description         |
| ------- | -------------- | ---- | ------------------- |
| POST    | /auth/register | non  | Inscription         |
| POST    | /auth/login    | non  | Connexion           |
| POST    | /auth/refresh  | non  | Rafraîchir le token |

### Users

| Méthode | Route                 | Auth  | Description              |
| ------- | --------------------- | ----- | ------------------------ |
| GET     | /users/me             | oui   | Profil courant           |
| PATCH   | /users/me             | oui   | Modifier son profil      |
| GET     | /admin/users          | admin | Liste des utilisateurs   |
| PATCH   | /admin/users/:id/role | admin | Changer un rôle          |
| DELETE  | /admin/users/:id      | admin | Supprimer un utilisateur |

### Pages

| Méthode | Route              | Auth             | Description               |
| ------- | ------------------ | ---------------- | ------------------------- |
| POST    | /pages             | éditeur+         | Créer une page            |
| GET     | /pages/tree        | selon visibilité | Arborescence complète     |
| GET     | /pages/:slug       | selon visibilité | Lire une page             |
| PATCH   | /pages/:id         | éditeur+         | Éditer (nouvelle version) |
| PATCH   | /pages/:id/move    | éditeur+         | Déplacer dans l'arbre     |
| DELETE  | /pages/:id         | éditeur+         | Supprimer                 |
| PATCH   | /pages/:id/publish | éditeur+         | Publier/dépublier         |

### Versions

| Méthode | Route                                  | Auth             | Description           |
| ------- | -------------------------------------- | ---------------- | --------------------- |
| GET     | /pages/:id/versions                    | selon visibilité | Historique            |
| GET     | /pages/:id/versions/:versionId         | selon visibilité | Une version           |
| GET     | /pages/:id/versions/diff               | selon visibilité | Diff entre 2 versions |
| POST    | /pages/:id/versions/:versionId/restore | éditeur+         | Rollback              |

### Médias

| Méthode | Route          | Auth             | Description       |
| ------- | -------------- | ---------------- | ----------------- |
| POST    | /media/upload  | éditeur+         | Upload vers Minio |
| GET     | /media?pageId= | selon visibilité | Médias d'une page |
| GET     | /media/:id/url | selon visibilité | URL présignée     |
| DELETE  | /media/:id     | éditeur+         | Supprimer         |

### Recherche

| Méthode | Route      | Auth             | Description         |
| ------- | ---------- | ---------------- | ------------------- |
| GET     | /search?q= | selon visibilité | Recherche full-text |

### Commentaires

| Méthode | Route               | Auth             | Description |
| ------- | ------------------- | ---------------- | ----------- |
| GET     | /pages/:id/comments | selon visibilité | Liste       |
| POST    | /pages/:id/comments | oui              | Ajouter     |
| DELETE  | /comments/:id       | auteur/admin     | Supprimer   |

### Intégrations

| Méthode | Route                        | Auth   | Description             |
| ------- | ---------------------------- | ------ | ----------------------- |
| GET     | /admin/integrations/discord  | admin  | Config Discord          |
| PUT     | /admin/integrations/discord  | admin  | Modifier config Discord |
| POST    | /webhooks/n8n/:integrationId | secret | Entrée depuis n8n       |
| GET     | /admin/export                | admin  | Export/backup ZIP       |

---

## 8. Suggestion d'ordre de développement

1. EPIC-01 (Setup & Infra)
2. EPIC-02 (Auth) + EPIC-10/11 (Frontend setup + auth) en parallèle
3. EPIC-03 (Pages) + EPIC-12 (Navigation)
4. EPIC-05 (Médias) + EPIC-13 (Éditeur)
5. EPIC-04 (Versioning) + EPIC-14 (Historique/Diff)
6. EPIC-06 (Recherche) + EPIC-15 (Frontend recherche)
7. EPIC-07 (Commentaires)
8. EPIC-08 / EPIC-09 (Discord / n8n) + EPIC-16 (Admin)
9. EPIC-17 (Tests & CI/CD) — en continu dès le début, formalisé à la fin
