# Hextech Challenges – League Challenge Tracker

Application web qui suit la progression des **défis (Challenges) de League of Legends** d'un joueur : niveau, rang, défis terminés, progression par catégorie et par palier, et checklist de champions pour les défis ARAM.

Elle se connecte à l'**API officielle Riot Games** et fonctionne aussi en **mode démo** (données fictives, sans clé API).

## Fonctionnalités

- Profil du joueur : Riot ID, région, niveau, nombre et pourcentage de défis terminés, points de rang
- Défis classés par catégorie (Expertise, Ancienneté, Esprit d'équipe, Imagination, Collection)
- Filtres par palier, recherche par nom, progression jusqu'au prochain palier
- Page **ARAM** : checklist des champions pour les défis de collection, avec progression en direct
- Paramètres (clé API, Riot ID, région) enregistrés dans le navigateur (`localStorage`)
- Mode démo automatique quand aucune clé API n'est renseignée

## Technologies

- HTML5, CSS3, JavaScript (ES6+) sans framework
- Node.js sans dépendance (`http`, `https`, `fs`) pour servir l'application et contourner la restriction CORS de l'API Riot
- API Riot Games (Account-V1, Summoner-V4, Challenges-V1) et Data Dragon (liste des champions)

## Lancer le projet

Prérequis : [Node.js](https://nodejs.org/) 18 ou supérieur.

```bash
node cors-proxy.js
```

Puis ouvrir <http://localhost:8080/> (page ARAM : <http://localhost:8080/aram.html>).

Pour utiliser les vraies données :

1. Créer une clé sur <https://developer.riotgames.com/>
2. Cliquer sur l'icône de paramètres dans l'application et renseigner la clé, le Riot ID et la région
3. Les clés de développement expirent au bout de 24 h : il faut les renouveler

> Ne jamais publier sa clé API sur GitHub : `config.js` doit garder `API_KEY: ""`.

## Sécurité du serveur local

- Le serveur écoute uniquement sur `127.0.0.1`
- Seuls les fichiers du site sont servis (liste blanche)
- Le proxy ne transmet que les requêtes vers `*.api.riotgames.com` en HTTPS (refus 403 pour toute autre adresse)

## Structure

```text
League_Challenge_Tracker/
├── index.html      # Tableau de bord principal
├── aram.html       # Page des défis ARAM
├── app.js          # Logique : appels API, rendu, filtres, checklist
├── data-mock.js    # Données de démonstration
├── config.js       # Configuration par défaut (clé API, Riot ID, région)
├── styles.css      # Styles
└── cors-proxy.js   # Serveur local + proxy CORS vers l'API Riot
```

## Auteur

Jack Byszewski
