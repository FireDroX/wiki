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

| Méthode | Route | Description |
| --- | --- | --- |
| GET | /pages/tree | Arborescence des pages |
| GET | /pages/:slug | Détail d'une page |
| POST | /pages | Créer une page |`,
          },
        ],
      },
    ],
  },
  {
    slug: 'notes-de-version',
    title: 'Notes de version',
    content: `# Notes de version

## 0.5.0

- Navigation et arborescence des pages.`,
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
