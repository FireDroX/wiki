import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Page } from '../pages/entities/page.entity.js';
import { PageVersion } from '../pages/entities/page-version.entity.js';
import { User } from '../users/entities/user.entity.js';

const SALT_ROUNDS = 10;
const DEV_ADMIN_EMAIL = 'dev@openwiki.local';
const DEV_ADMIN_PASSWORD = 'password123';

interface PageSeed {
  slug: string;
  title: string;
  content?: string;
  children?: PageSeed[];
}

const PAGE_TREE_SEED: PageSeed[] = [
  {
    slug: 'documentation',
    title: 'Documentation',
    content: `# Documentation

Bienvenue dans la documentation d'OpenWiki. Utilisez l'arborescence à gauche pour naviguer entre les sections.`,
    children: [
      {
        slug: 'guide-demarrage',
        title: 'Guide de démarrage',
        content: `# Guide de démarrage

Ce guide couvre l'installation et la configuration initiale d'OpenWiki.`,
        children: [
          {
            slug: 'installation',
            title: 'Installation',
            content: `# Installation

## Prérequis

- Node.js 20+
- Docker (pour MySQL et Minio)

## Étapes

1. Cloner le dépôt
2. Installer les dépendances :

\`\`\`bash
pnpm install
\`\`\`

3. Démarrer les services :

\`\`\`bash
docker compose up -d
\`\`\`

![Aperçu du tableau de bord](https://placehold.co/480x240?text=Dashboard)`,
          },
          {
            slug: 'configuration',
            title: 'Configuration',
            content: `# Configuration

La configuration se fait via trois fichiers \`.env\` distincts (racine, \`backend/\`, \`frontend/\`), chacun avec un \`.env.example\` à copier.`,
          },
        ],
      },
      {
        slug: 'reference-api',
        title: 'Référence API',
        content: `# Référence API

Cette section documente l'API REST exposée par le backend.`,
        children: [
          {
            slug: 'authentification',
            title: 'Authentification',
            content: `# Authentification

L'API utilise des tokens JWT (access + refresh).

\`\`\`js
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
\`\`\``,
          },
          {
            slug: 'endpoints',
            title: 'Endpoints',
            content: `# Endpoints

La documentation ci-dessous est générée automatiquement à partir des routes réellement exposées par le backend (schéma OpenAPI de \`/api/docs-json\`).

<api-reference></api-reference>`,
          },
        ],
      },
    ],
  },
  {
    slug: 'notes-de-version',
    title: 'Notes de version',
    content: `# Notes de version

## Version 0.7

<details>
<summary>0.7.3 — 2026-09-02</summary>

- \`GET /media/:id/url\` (selon visibilité) : génère une URL présignée pour un attachment existant.

</details>

<details>
<summary>0.7.2 — 2026-09-02</summary>

- \`GET /media?pageId=\` (selon visibilité) : liste les médias rattachés à une page, avec URL présignée pour chacun.

</details>

<details>
<summary>0.7.1 — 2026-09-02</summary>

- \`POST /media/upload\` (éditeur+, multipart/form-data) : upload d'un fichier vers Minio, clé \`pages/{pageId}/{uuid}-{filename}\`, enregistrement en \`Attachment\` et retour d'une URL présignée. Limite de 20 Mo et whitelist de types MIME (images + documents courants).

</details>

<details>
<summary>0.7.0 — 2026-09-02</summary>

- Entité \`Attachment\` + migration : modélise les fichiers stockés sur Minio (\`pageId\` nullable, \`minioKey\`, \`filename\`, \`mimeType\`, \`size\`, \`uploadedById\`), index sur \`pageId\` pour \`GET /media?pageId=\`.

</details>

## Version 0.6

<details>
<summary>0.6.6 — 2026-09-02</summary>

- Documentation interactive de l'API (\`GET /api/docs\`, \`GET /api/docs-json\`) générée depuis les décorateurs \`@nestjs/swagger\`.
- Page "Endpoints" reliée à cette documentation via un composant de référence intégré au rendu markdown.

</details>

<details>
<summary>0.6.5 — 2026-09-01</summary>

- \`POST /pages/:id/versions/:versionId/restore\` : rollback vers une ancienne version (crée une nouvelle version, l'historique reste intact).

</details>

<details>
<summary>0.6.4 — 2026-09-01</summary>

- \`POST /pages/:id/versions/diff\` : diff ligne à ligne entre deux versions (\`from\`/\`to\` en body plutôt qu'en query).

</details>

<details>
<summary>0.6.3 — 2026-09-01</summary>

- \`GET /pages/:id/versions/:versionId\` : détail d'une version précise, vérifie qu'elle appartient bien à la page.

</details>

<details>
<summary>0.6.2 — 2026-09-01</summary>

- \`GET /pages/:id/versions\` : historique paginé des versions d'une page, droits alignés sur sa visibilité.

</details>

<details>
<summary>0.6.1 — 2026-09-01</summary>

- Entité \`PageVersion\` + migration : index sur \`pageId\` pour accélérer l'historique des versions d'une page.

</details>

## Version 0.5

<details>
<summary>0.5.4 — 2026-09-01</summary>

- Icônes de dossier/page dans l'arborescence, alignées façon VS Code (chevron avant l'icône).
- En-tête pleine largeur avec logo OpenWiki.
- Barre de filtre et bouton "Nouvelle page" (aperçu) dans la barre latérale.

</details>

<details>
<summary>0.5.3 — 2026-09-01</summary>

- Page de visualisation d'une page : rendu markdown, coloration syntaxique des blocs de code, images.
- Résolution par chemin complet (arborescence), pas par simple slug.
- États de chargement, page introuvable (404) et accès refusé (403).

</details>

<details>
<summary>0.5.2 — 2026-09-01</summary>

- Fournisseur de contexte de l'arborescence des pages et composant fil d'ariane (breadcrumb).

</details>

<details>
<summary>0.5.1 — 2026-09-01</summary>

- Script de seed de développement et composants d'arborescence des pages côté frontend.

</details>

## Version 0.4

<details>
<summary>0.4.8 — 2026-09-01</summary>

- Module de gestion des pages : entité, migration, création, modification, déplacement, suppression (cascade), publication et arborescence.

</details>

## Version 0.3

<details>
<summary>0.3.5 — 2026-08-30</summary>

- Initialisation du frontend (React, Vite, TypeScript) et parcours d'authentification (connexion, inscription, cookies).

</details>

## Version 0.2

<details>
<summary>0.2.8 — 2026-08-30</summary>

- Authentification et gestion des utilisateurs : inscription, connexion JWT, rafraîchissement de token, profils, pagination.

</details>

## Version 0.1

<details>
<summary>0.1.4 — 2026-08-29</summary>

- Mise en place du monorepo pnpm (backend/frontend), Docker Compose (MySQL + Minio) et intégration du stockage d'objets.

</details>`,
  },
  {
    slug: 'faq',
    title: 'FAQ',
    content: `# FAQ

**Comment créer une page ?**

Utilisez le bouton "Nouvelle page" depuis la barre latérale.`,
  },
];

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [User, Page, PageVersion],
});

async function seedDevAdmin(dataSource: DataSource): Promise<User> {
  const userRepository = dataSource.getRepository(User);
  const existing = await userRepository.findOneBy({ email: DEV_ADMIN_EMAIL });
  if (existing) {
    console.log(`User ${DEV_ADMIN_EMAIL} already exists, skipping.`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(DEV_ADMIN_PASSWORD, SALT_ROUNDS);
  const admin = await userRepository.save(
    userRepository.create({
      email: DEV_ADMIN_EMAIL,
      passwordHash,
      displayName: 'Dev Admin',
      role: 'admin',
    }),
  );
  console.log(
    `Created user ${DEV_ADMIN_EMAIL} (password: ${DEV_ADMIN_PASSWORD}).`,
  );
  return admin;
}

async function seedPage(
  dataSource: DataSource,
  seed: PageSeed,
  parentId: string | null,
  authorId: string,
): Promise<void> {
  const pageRepository = dataSource.getRepository(Page);
  const versionRepository = dataSource.getRepository(PageVersion);

  let page = await pageRepository.findOneBy({ slug: seed.slug });
  if (page) {
    console.log(`Page "${seed.slug}" already exists, skipping.`);
  } else {
    page = await pageRepository.save(
      pageRepository.create({
        slug: seed.slug,
        title: seed.title,
        parentId,
        isPublished: true,
        visibility: 'public',
        createdById: authorId,
      }),
    );

    const version = await versionRepository.save(
      versionRepository.create({
        pageId: page.id,
        title: seed.title,
        content: seed.content ?? `# ${seed.title}`,
        authorId,
      }),
    );

    page.currentVersionId = version.id;
    await pageRepository.save(page);
    console.log(`Created page "${seed.slug}".`);
  }

  for (const child of seed.children ?? []) {
    await seedPage(dataSource, child, page.id, authorId);
  }
}

async function run(): Promise<void> {
  await dataSource.initialize();

  const admin = await seedDevAdmin(dataSource);
  for (const root of PAGE_TREE_SEED) {
    await seedPage(dataSource, root, null, admin.id);
  }

  await dataSource.destroy();
  console.log('Dev seed complete.');
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
