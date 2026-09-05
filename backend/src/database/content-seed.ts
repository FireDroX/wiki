import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Page } from '../pages/entities/page.entity.js';
import { PageVersion } from '../pages/entities/page-version.entity.js';
import { User } from '../users/entities/user.entity.js';

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

Ce guide couvre l'installation, la configuration et le premier lancement d'OpenWiki en local, de bout en bout.

## Vue d'ensemble

OpenWiki est un monorepo pnpm avec deux packages : \`backend/\` (NestJS + TypeORM + MySQL) et \`frontend/\` (React + Vite). Les pages [Installation](/pages/documentation/guide-demarrage/installation) et [Configuration](/pages/documentation/guide-demarrage/configuration) détaillent chaque étape ; ce qui suit résume le parcours complet.

## Étapes

1. **Installation** — cloner le dépôt, installer les dépendances, démarrer MySQL et Minio via Docker. Voir [Installation](/pages/documentation/guide-demarrage/installation).
2. **Configuration** — copier et renseigner les trois fichiers \`.env\` (racine, \`backend/\`, \`frontend/\`). Voir [Configuration](/pages/documentation/guide-demarrage/configuration).
3. **Migrations** — appliquer le schéma de base de données :

\`\`\`bash
cd backend
pnpm run migration:run
\`\`\`

4. **Compte de test** (optionnel, développement uniquement) :

\`\`\`bash
pnpm run seed:dev
\`\`\`

5. **Démarrage** (deux terminaux, depuis la racine du dépôt) :

\`\`\`bash
pnpm run back:dev   # backend sur http://localhost:3000
pnpm run front:dev  # frontend sur http://localhost:5173
\`\`\`

6. Ouvrir [http://localhost:5173](http://localhost:5173) et se connecter avec le compte créé à l'étape 4, ou s'inscrire via la page d'inscription.

## Étapes suivantes

- Créez votre première page depuis le bouton "Nouvelle page" de la barre latérale.
- Consultez la page [Endpoints](/pages/documentation/endpoints) pour la référence complète de l'API.`,
        children: [
          {
            slug: 'installation',
            title: 'Installation',
            content: `# Installation

## Prérequis

- Node.js 20+
- pnpm (voir le champ \`packageManager\` de \`package.json\`)
- Docker (pour MySQL et Minio)

## Étapes

1. Cloner le dépôt :

\`\`\`bash
git clone <url-du-dépôt>
cd openwiki
\`\`\`

2. Installer les dépendances :

\`\`\`bash
pnpm install
\`\`\`

3. Démarrer les services (MySQL + Minio) :

\`\`\`bash
docker compose up -d
\`\`\`

4. Appliquer les migrations de base de données :

\`\`\`bash
cd backend
pnpm run migration:run
\`\`\`

Passez ensuite à la page [Configuration](/pages/documentation/guide-demarrage/configuration) pour renseigner les fichiers \`.env\`.

![Aperçu du tableau de bord](https://placehold.co/480x240?text=Dashboard)`,
          },
          {
            slug: 'configuration',
            title: 'Configuration',
            content: `# Configuration

La configuration se fait via trois fichiers \`.env\` distincts, chacun avec un \`.env.example\` à copier :

| Fichier | Rôle |
| --- | --- |
| \`.env\` (racine) | Identifiants MySQL/Minio pour \`docker-compose.yml\` |
| \`backend/.env\` | Port, URL du frontend (CORS), connexion DB, connexion Minio |
| \`frontend/.env\` | \`VITE_API_URL\`, URL de base de l'API backend (préfixe \`/api\` inclus) |

Une fois les trois fichiers renseignés, démarrez les serveurs de développement :

\`\`\`bash
pnpm run back:dev   # backend sur http://localhost:3000
pnpm run front:dev  # frontend sur http://localhost:5173
\`\`\``,
          },
        ],
      },
      {
        slug: 'endpoints',
        title: 'Endpoints',
        content: `# Endpoints

La documentation ci-dessous est générée automatiquement à partir des routes réellement exposées par le backend (schéma OpenAPI de \`/api/docs-json\`).

<api-reference></api-reference>`,
      },
      {
        slug: 'notes-de-version',
        title: 'Notes de version',
        content: `# Notes de version

## Version 0.15

<details>
<summary>0.15.3 — 2026-09-05</summary>

- Tools MCP de gestion des pages : \`wiki_create_page\`, \`wiki_update_page\`, \`wiki_get_page\`, \`wiki_list_pages\`, \`wiki_delete_page\`, \`wiki_publish_page\` (scopes \`pages:read\`/\`pages:write\`). Une clé avec un scope pages voit les pages privées/non publiées comme un éditeur, pas comme un visiteur anonyme.

</details>

<details>
<summary>0.15.2 — 2026-09-05</summary>

- Authentification MCP par clé API à scopes : entité \`McpApiKey\`, \`POST/GET/DELETE /admin/mcp/api-keys\` (admin uniquement). La clé en clair n'est affichée qu'à la création ; une clé révoquée (ou absente) est rejetée par le guard MCP avec une erreur JSON-RPC (\`code: -32001\`) plutôt qu'un \`401\` REST classique.

</details>

<details>
<summary>0.15.1 — 2026-09-05</summary>

- Socle du serveur MCP (\`@modelcontextprotocol/sdk\`) : \`POST/GET/DELETE /mcp\`, transport HTTP streamable avec gestion de session. Aucun tool enregistré à ce stade — un client MCP peut se connecter et lister les tools via \`tools/list\` (liste vide).

</details>

<details>
<summary>0.15.0 — 2026-09-05</summary>

- Entités \`Tag\`/\`PageTag\` + endpoints CRUD : \`POST/GET /tags\`, \`DELETE /tags/:id\` (cascade sur les associations), \`POST/DELETE /pages/:id/tags\`. Chaque tag a une couleur (hex) choisie à la création.

</details>

## Version 0.14

<details>
<summary>0.14.3 — 2026-09-05</summary>

- La langue de l'interface suit désormais le réglage global (\`GET /settings\`, sans authentification) au chargement de l'application, pour tous les visiteurs — aucune préférence par utilisateur, pas de \`localStorage\`.
- Depuis le panel admin, changer la langue (FE-064) retraduit désormais réellement l'UI de l'admin immédiatement ; les autres visiteurs l'appliquent à leur prochain chargement.

</details>

<details>
<summary>0.14.2 — 2026-09-05</summary>

- Intégration \`react-i18next\` : toute la chrome applicative (menus, formulaires, messages, dates relatives) passe désormais par \`useTranslation()\`/\`t()\`, avec des dictionnaires FR/EN complets — le contenu markdown des pages reste, lui, jamais traduit automatiquement.

</details>

<details>
<summary>0.14.1 — 2026-09-05</summary>

- \`GET /settings\` (public, sans authentification) : réglages système exposés à plat (ex. \`{ "locale": "fr" }\`), nécessaire pour les visiteurs non connectés.
- \`PATCH /admin/settings/:key\` (admin) : modifie un réglage, validation dépendant de la clé (\`locale\` limité à \`fr\`/\`en\` pour l'instant) → \`400\` sinon.

</details>

<details>
<summary>0.14.0 — 2026-09-05</summary>

- Entité \`SystemSetting\` (clé/valeur) + migration : socle des réglages système globaux, seedée avec \`locale=fr\`.

</details>

## Version 0.13

<details>
<summary>0.13.1 — 2026-09-05</summary>

- Sélecteur de langue FR/EN dans les paramètres d'administration (\`/admin/settings\`), appelle \`PATCH /admin/settings/locale\`. Réglage global, pas par utilisateur.
- ⚠️ Le socle i18n et l'endpoint \`/admin/settings/:key\` restent à livrer par EPIC-21 : ce sélecteur appellera un endpoint pas encore implémenté tant qu'EPIC-21 n'est pas posé.

</details>

<details>
<summary>0.13.0 — 2026-09-05</summary>

- Page d'administration des utilisateurs (\`/admin/users\`, réservée admin) : liste, changement de rôle inline et suppression (confirmée par boîte de dialogue) — un admin ne peut ni se rétrograder ni se supprimer lui-même (action désactivée sur sa propre ligne).
- Lien "Administration" du menu utilisateur relié à cette page.

</details>

## Version 0.12

<details>
<summary>0.12.4 — 2026-09-03</summary>

- Panneau "Droits d'édition" dans l'éditeur de page (réservé admin) : liste des éditeurs grantés explicitement sur la page, ajout via une recherche d'utilisateur, révocation confirmée par boîte de dialogue.

</details>

<details>
<summary>0.12.3 — 2026-09-03</summary>

- Révocation d'un droit d'édition (\`DELETE /pages/:id/permissions/:userId\`, admin) : \`204\` si un grant explicite existait sur cette page précise, \`404\` sinon — révoquer un droit hérité d'une page ancêtre (au lieu d'un grant explicite sur la page ciblée) échoue volontairement en \`404\`, sans effet sur l'héritage.

</details>

<details>
<summary>0.12.2 — 2026-09-03</summary>

- Création et consultation des droits d'édition explicites d'une page (\`POST\`/\`GET /pages/:id/permissions\`, admin) : un doublon \`(pageId, userId)\` renvoie \`409\`, la liste ne renvoie que les grants définis directement sur cette page (jamais les grants hérités). \`PATCH /pages/:id\` accepte désormais aussi un \`reader\` disposant d'un grant sur la page (la restriction éditeur/admin ne s'appliquait jusque-là qu'aux autres routes de mutation).

</details>

<details>
<summary>0.12.1 — 2026-09-03</summary>

- Résolution du droit d'édition effectif d'une page : un \`reader\` global avec un grant explicite sur une page hérite du droit d'édition sur toute sa sous-arborescence (le grant le plus proche dans l'arbre l'emporte), \`editor\`/\`admin\` globaux ne sont jamais bloqués. Appliqué avant modification, déplacement, suppression et publication d'une page.

</details>

<details>
<summary>0.12.0 — 2026-09-03</summary>

- Entité \`PagePermission\` + migration : modélise les grants d'édition par page (\`pageId\`, \`userId\`, \`grantedById\`), unique sur \`(pageId, userId)\`.

</details>

## Version 0.11

<details>
<summary>0.11.1 — 2026-09-03</summary>

- Page de résultats de recherche complète (\`/search?q=&page=\`) : pagination synchronisée avec l'URL (bookmarkable), terme recherché surligné dans le titre et l'extrait de chaque résultat.
- La recherche utilise désormais le mode booléen MySQL avec préfixe (\`terme*\`) plutôt que le mode langage naturel, pour que taper un début de mot (ex. "note") remonte aussi les mots qui le contiennent (ex. "Notes").

</details>

<details>
<summary>0.11.0 — 2026-09-03</summary>

- Barre de recherche globale (\`Ctrl+K\`/\`Cmd+K\` depuis n'importe quelle route, ou clic sur la barre dans la Topbar) : dialog de commande avec débounce de 300 ms, titre + extrait par résultat, navigation directe vers la page au clic.

</details>

## Version 0.10

<details>
<summary>0.10.1 — 2026-09-03</summary>

- Endpoint de recherche full-text (\`GET /search?q=&page=&limit=\`) : recherche \`MATCH...AGAINST\` sur le titre et le contenu de la version courante de chaque page, résultats triés par pertinence avec un extrait généré autour du terme trouvé. Authentification optionnelle : les lecteurs anonymes ou non-éditeurs ne voient que les pages publiques et publiées, les éditeurs/admins voient tout.

</details>

<details>
<summary>0.10.0 — 2026-09-03</summary>

- Index FULLTEXT MySQL sur \`page_versions\` (\`title\`, \`content\`) pour préparer la recherche full-text.

</details>

## Version 0.9

<details>
<summary>0.9.2 — 2026-09-02</summary>

- Action "Restaurer" sur chaque version de l'historique (\`POST /pages/:id/versions/:versionId/restore\`, éditeur+), confirmation via boîte de dialogue, puis rafraîchissement de la liste : la version restaurée apparaît en haut avec le résumé auto-généré côté backend.

</details>

<details>
<summary>0.9.1 — 2026-09-02</summary>

- Vue diff entre les deux versions sélectionnées dans l'historique : diff ligne à ligne (\`POST /pages/:id/versions/diff\`), lignes ajoutées/supprimées mises en couleur, lignes identiques non colorées, en-tête affichant la date de chaque version comparée.

</details>

<details>
<summary>0.9.0 — 2026-09-02</summary>

- Historique des versions d'une page (\`/history/*\`) : liste paginée (auteur, date relative, résumé), sélection de deux versions au maximum (cocher une 3e ligne décoche automatiquement la plus ancienne sélection), aperçu du contenu d'une version.
- Bouton "Historique" sur la vue d'une page, visible selon les mêmes droits de visibilité que la page elle-même.

</details>

## Version 0.8

<details>
<summary>0.8.4 — 2026-09-02</summary>

- Nouvelle direction artistique de l'éditeur de page (création et modification), alignée sur la maquette : vue plein écran sans navigation latérale, panneau de métadonnées permanent (titre, chemin, page parente, visibilité), barre d'outils markdown (gras, italique, code, lien, image, pièce jointe) et actions "Enregistrer le brouillon" / "Publier".
- En modification, le résumé de modification est désormais un champ permanent du panneau plutôt qu'une boîte de dialogue, et le déplacement de la page (page parente) s'applique immédiatement.

</details>

<details>
<summary>0.8.3 — 2026-09-02</summary>

- Boîte de dialogue de sauvegarde avec champ "résumé de modification" (optionnel), ouverte par le bouton Sauvegarder ou \`Ctrl+S\`/\`Cmd+S\` sur l'éditeur de page ; confirmation par toast une fois la sauvegarde effectuée.

</details>

<details>
<summary>0.8.2 — 2026-09-02</summary>

- Formulaire de métadonnées de page (titre, slug auto-généré et éditable, visibilité, sélection de la page parente via une recherche dans l'arborescence) et page "Nouvelle page" (\`/new\`), reliée au bouton de la barre latérale pour les éditeurs et admins.

</details>

<details>
<summary>0.8.1 — 2026-09-02</summary>

- Upload d'images depuis l'éditeur : bouton toolbar et glisser-déposer directement sur la zone d'édition, insertion automatique du markdown à la position du curseur.
- Notifications (toasts) pour les erreurs d'upload (fichier trop volumineux, type non supporté).

</details>

<details>
<summary>0.8.0 — 2026-09-02</summary>

- Éditeur markdown avec prévisualisation live (split view, bascule mobile édition/aperçu, debounce, raccourci \`Ctrl+S\`/\`Cmd+S\`, confirmation de sortie si modifications non sauvegardées).
- Page \`/edit/*\` (éditeur+) pour modifier une page existante, accessible via un bouton "Modifier" sur la vue d'une page.

</details>

## Version 0.7

<details>
<summary>0.7.4 — 2026-09-02</summary>

- \`DELETE /media/:id\` (éditeur+) : supprime un attachment (fichier Minio puis ligne en base, dans cet ordre).

</details>

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
    ],
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

async function resolveContentAuthorId(dataSource: DataSource): Promise<string> {
  const userRepository = dataSource.getRepository(User);
  const [oldest] = await userRepository.find({
    order: { createdAt: 'ASC' },
    take: 1,
  });
  if (!oldest) {
    throw new Error(
      'No user found in database — create an admin user before running the content seed.',
    );
  }
  return oldest.id;
}

async function seedPage(
  dataSource: DataSource,
  seed: PageSeed,
  parentId: string | null,
  authorId: string,
): Promise<Page> {
  const pageRepository = dataSource.getRepository(Page);
  const versionRepository = dataSource.getRepository(PageVersion);

  let page = await pageRepository.findOneBy({ slug: seed.slug });
  const content = seed.content ?? `# ${seed.title}`;

  if (!page) {
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
        content,
        authorId,
      }),
    );

    page.currentVersionId = version.id;
    await pageRepository.save(page);
    console.log(`Created page "${seed.slug}".`);
  } else {
    const currentVersion = page.currentVersionId
      ? await versionRepository.findOneBy({ id: page.currentVersionId })
      : null;
    const contentChanged =
      currentVersion?.content !== content || page.title !== seed.title;
    const moved = page.parentId !== parentId;

    if (contentChanged) {
      const version = await versionRepository.save(
        versionRepository.create({
          pageId: page.id,
          title: seed.title,
          content,
          authorId,
          changeSummary: 'Content seed update',
        }),
      );

      page.title = seed.title;
      page.currentVersionId = version.id;
    }

    if (moved) {
      page.parentId = parentId;
    }

    if (contentChanged || moved) {
      page = await pageRepository.save(page);
      if (contentChanged && moved) {
        console.log(`Updated and moved page "${seed.slug}".`);
      } else if (contentChanged) {
        console.log(`Updated page "${seed.slug}".`);
      } else {
        console.log(`Moved page "${seed.slug}".`);
      }
    } else {
      console.log(`Page "${seed.slug}" already up to date, skipping.`);
    }
  }

  for (const child of seed.children ?? []) {
    await seedPage(dataSource, child, page.id, authorId);
  }

  return page;
}

async function run(): Promise<void> {
  await dataSource.initialize();

  const authorId = await resolveContentAuthorId(dataSource);
  for (const root of PAGE_TREE_SEED) {
    await seedPage(dataSource, root, null, authorId);
  }

  await dataSource.destroy();
  console.log('Content seed complete.');
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
