# ATELIER — Catalogue Produits

Site catalogue React éditorial avec recherche, filtres, fiches produits, panier et export PDF de devis. Design brutaliste-éditorial qui sort des codes habituels.

## ✨ Fonctionnalités

- 🔍 **Recherche** par nom, marque ou code-barre
- 🏷️ **Filtres** par catégorie (5 catégories, 5 marques, 54 produits)
- 📄 **Fiches produits** détaillées avec modal
- 🛒 **Panier / devis** avec gestion des quantités
- 📑 **Export PDF** du devis (côté client, sans backend)
- 📱 **Responsive** mobile / tablette / desktop
- ⚡ **100% statique** — déployable sur GitHub Pages

## 🎨 Direction artistique

- Typographie : **Fraunces** (display serif variable) + **Inter Tight** + **JetBrains Mono**
- Palette : terracotta (#C8553D) / crème (#F4EFE6) / encre (#0E0E0C) — loin du purple/blanc générique
- Grain texture, animations chorégraphiées, marquee, grille éditoriale asymétrique

## 🚀 Déploiement sur GitHub Pages

### 1. Créer un repo GitHub

```bash
cd atelier-catalogue
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON-USER/TON-REPO.git
git push -u origin main
```

### 2. Activer GitHub Pages

Sur GitHub → ton repo → **Settings → Pages** :
- **Source** : sélectionner **"GitHub Actions"**

C'est tout. Le workflow `.github/workflows/deploy.yml` se déclenchera automatiquement à chaque push sur `main`.

### 3. (Important) Vérifier le base path

Le `vite.config.js` utilise `base: '/atelier-catalogue/'` par défaut. Le workflow GitHub Actions le surcharge automatiquement avec le nom de ton repo (`VITE_BASE_PATH`).

**Si tu déploies sur `username.github.io` (repo principal)** : modifie `vite.config.js` :
```js
base: process.env.VITE_BASE_PATH || '/',
```

**Si tu utilises un domaine custom** : pareil, mets `'/'`.

## 💻 Développement local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans /dist
npm run preview  # tester le build localement
```

## 📁 Structure du projet

```
atelier-catalogue/
├── public/
│   └── products/             # 54 images PNG des produits (extraites des PDF)
├── src/
│   ├── data/
│   │   └── products.json     # Catalogue structuré
│   ├── App.jsx               # Composant principal
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind + styles custom
├── .github/workflows/
│   └── deploy.yml            # CI/CD GitHub Pages
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🛠️ Modifier le catalogue

Édite directement `src/data/products.json` :

```json
{
  "id": 55,
  "name": "NOUVEAU PRODUIT 1L",
  "barcode": "6223000000000",
  "brand": "Marque",
  "category": "Catégorie",
  "image": "products/6223000000000.png",
  "price": 9500
}
```

- `price` est en millièmes (ex: `8950` = 8.950 F). Optionnel — si absent, "Sur devis" s'affiche.
- `subtitle` est optionnel.
- L'image doit être placée dans `public/products/` avec le nom indiqué.

## 📊 Catalogue inclus

| Marque | Catégorie | Produits |
|---|---|---|
| Almarai | Boissons & Lait | 18 |
| Lavida | Sauces | 14 |
| Beyti | Jus de fruits | 12 |
| V7 | Boissons énergisantes | 6 |
| Premium Dried Fruits | Fruits secs | 4 |
| **Total** | | **54** |

## 📄 Stack technique

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Framer Motion** pour les animations
- **jsPDF** pour la génération PDF côté client
- **Lucide React** pour les icônes
- Fonts via **Google Fonts**

---

Made with care · 2026
