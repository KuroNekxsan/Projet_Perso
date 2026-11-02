# Property Manager - Dashboard de Gestion Immobilière

Bienvenue dans le projet **Property Manager**, un tableau de bord interactif haut de gamme conçu pour les dirigeants et gestionnaires de parcs immobiliers. Ce tableau de bord permet de visualiser en temps réel la santé financière, commerciale et opérationnelle de votre parc de bâtiments.

---

## 🌟 Fonctionnalités Clés

- **Tableau de bord multi-onglets** : 
  - **Vue Globale** : Indicateurs de performance généraux (KPIs) et graphiques de synthèse.
  - **Vue Financière** : Suivi des revenus de loyers, taux de collecte, dépenses opérationnelles (OPEX), marge nette et dépôts de garantie.
  - **Vue Commerciale** : Taux d'occupation, typologie du parc (studios, T2, T3, T4), délais de location et échéances des baux.
  - **Vue Opérationnelle** : Gestion de la maintenance, suivi des incidents critiques et temps de résolution.
  - **Bâtiments** : Liste interactive des bâtiments du parc avec leur adresse, leur type de construction et le nombre d'appartements disponibles.
- **Support Multilingue complet (i18next)** : Disponible en **Français**, **Anglais**, **Russe**, **Japonais** et **Arabe** avec mise à jour instantanée sans rechargement de page.
- **Thème Dynamique** : Mode Sombre (par défaut) et Mode Clair élégants avec persistance automatique du choix de l'utilisateur (`localStorage`).
- **Graphiques Interactifs** : Visualisations dynamiques et réactives basées sur la bibliothèque **Chart.js**.
- **Design Premium et Adaptatif (Responsive)** : Interface utilisateur soignée avec animations fluides, polices modernes (Inter & Outfit) et menu hamburger pour les mobiles et tablettes.

---

## 🛠️ Architecture & Technologies

Le projet a été pensé pour être **extrêmement léger et rapide à lancer**, en évitant toute dépendance tierce complexe à installer.

- **Frontend** : 
  - HTML5 sémantique.
  - CSS3 moderne (Variables CSS, transitions, Flexbox et CSS Grid).
  - JavaScript Vanilla (ES6+) pour la gestion de l'interface et des graphiques.
- **Backend (Optionnel mais recommandé)** : 
  - Node.js utilisant uniquement des modules natifs (`http`, `fs`, `path`). Aucune dépendance externe (pas besoin d'Express ni de npm install !).
- **Base de données** : 
  - Base de données SQLite (`immobilier.db`) lue à l'aide de l'API native et performante de Node.js : `node:sqlite` (`DatabaseSync`).
- **Librairies tierces (chargées via CDN)** :
  - **Chart.js** : Pour le tracé des courbes, diagrammes circulaires et barres.
  - **i18next** : Pour l'internationalisation dynamique.
  - **Lucide Icons** : Pour l'iconographie moderne et épurée.

---

## 🚀 Comment Lancer le Projet

Deux méthodes de lancement sont possibles selon vos besoins :

### Méthode 1 : Mode Serveur Complet (Recommandé - Données Réelles SQLite)
Cette méthode connecte l'interface à la base de données SQLite `immobilier.db` pour un rendu dynamique et réel des indicateurs.

1. **Prérequis** : Avoir installé **Node.js** en version **22.5.0 ou supérieure** (nécessaire pour le support natif de `node:sqlite`).
2. Ouvrez un terminal dans le dossier du projet (`Situation Pro`).
3. Lancez le serveur avec la commande suivante :
   ```bash
   node server.js
   ```
4. Ouvrez votre navigateur et accédez à : **[http://localhost:3000](http://localhost:3000)**

### Méthode 2 : Mode Statique (Fallback sans serveur)
Si vous n'avez pas Node.js installé ou si vous voulez simplement tester le design rapidement :

1. Double-cliquez sur le fichier `index.html` pour l'ouvrir directement dans votre navigateur.
2. **Comment ça marche ?** L'application détecte que le serveur est injoignable et bascule automatiquement sur les données fictives définies dans `data.js`. L'interface reste 100% interactive (changement d'onglets, thèmes, langues et graphiques fonctionnels).

---

## 📁 Structure du Projet

```text
Situation Pro/
├── index.html          # Structure HTML principale de la page (mise en page, CDN)
├── styles.css          # Feuille de style CSS (thèmes clair/sombre, design adaptatif, animations)
├── app.js              # Logique frontend (navigation, Chart.js, i18next, appels API)
├── data.js             # Données statiques de secours (mock) et ressources de traduction
├── server.js           # Serveur web Node.js natif et requêtes SQLite
├── README.md           # Ce guide d'accueil et d'explication
└── files 2/
    └── immobilier.db   # Base de données SQLite contenant les tables du parc immobilier
```

---

## 🔒 Sécurité du serveur

- Le serveur écoute uniquement sur `127.0.0.1` (non accessible depuis le réseau).
- Seuls les fichiers du site (`index.html`, `styles.css`, `app.js`, `data.js`) sont servis : `server.js` et la base de données ne sont pas téléchargeables.

---

## 👥 Auteur / Équipe
**Jack Byszewski** – [À COMPLÉTER : ta part du projet, ex. « développement du serveur Node.js et des requêtes SQLite »]
[À COMPLÉTER ou supprimer : noms des autres membres du groupe et leur rôle]
