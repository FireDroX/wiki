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
  children?: PageSeed[];
}

const PAGE_TREE_SEED: PageSeed[] = [
  {
    slug: 'documentation',
    title: 'Documentation',
    children: [
      {
        slug: 'guide-demarrage',
        title: 'Guide de démarrage',
        children: [
          { slug: 'installation', title: 'Installation' },
          { slug: 'configuration', title: 'Configuration' },
        ],
      },
      {
        slug: 'reference-api',
        title: 'Référence API',
        children: [
          { slug: 'authentification', title: 'Authentification' },
          { slug: 'endpoints', title: 'Endpoints' },
        ],
      },
    ],
  },
  { slug: 'notes-de-version', title: 'Notes de version' },
  { slug: 'faq', title: 'FAQ' },
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
        content: `# ${seed.title}`,
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
