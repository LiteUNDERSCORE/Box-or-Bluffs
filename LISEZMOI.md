# Box of Bluffs – mise en ligne

Deux sites dans un seul dépôt :
- **Organisateur** : `…/organisateur/` → crée la partie, choisit les cartes, lance les manches.
- **Joueur** : `…/joueur/` → chaque joueur l'ouvre sur son téléphone avec le code.
- **Stream** : `…/stream/?code=XXXX&pov=j1` → vue pour OBS.

## Règles
- Une boîte par manche, tenue à tour de rôle par chaque joueur (le porteur).
- Une fois sur deux, elle contient une carte tirée au hasard. Sinon, elle est vide.
- Le porteur voit le contenu, improvise à l'oral, et appuie en secret sur « Je dis vrai » ou « Je bluffe ».
- L'autre répond **Vrai** ou **Faux**. S'il a raison, il marque 1 point. Sinon, c'est le porteur.
- Si la boîte contenait une carte, elle va dans la collection du gagnant de la manche.

## Vue stream
Dans la page organisateur, la section « Vue stream » donne 3 liens à mettre dans OBS (Source navigateur, 1920 × 1080) :
POV joueur 1, POV joueur 2, ou Tout voir.

## Étape 1 – Firebase (5 min)
1. Va sur https://console.firebase.google.com → **Créer un projet** (Google Analytics inutile).
2. Menu **Build → Realtime Database → Créer une base**, emplacement **Belgique (europe-west1)**, mode **verrouillé**.
3. Onglet **Règles** : remplace tout par le contenu de `regles-firebase.json`, puis **Publier**.

## Étape 2 – Brancher le jeu
1. Dans Firebase : roue crantée → **Paramètres du projet** → en bas, **Ajouter une appli Web** (icône `</>`).
2. Copie les valeurs affichées (`apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId`) dans `commun/config.js`.
   Si `databaseURL` n'apparaît pas, prends l'adresse en haut de la page Realtime Database (`https://…firebasedatabase.app`).

## Étape 3 – GitHub Pages
1. Crée un dépôt public sur GitHub (ex. `box-of-bluffs`) et envoie tous les fichiers du dossier (**Add file → Upload files**).
2. **Settings → Pages** → Source : *Deploy from a branch*, branche `main`, dossier `/ (root)` → **Save**.
3. Après 1 à 2 minutes, le jeu est sur `https://TON-PSEUDO.github.io/box-of-bluffs/`.

## Tester sans Firebase
Tant que `config.js` n'est pas rempli, le jeu marche en **mode test local** : ouvre l'organisateur et deux onglets joueur dans le même navigateur.
(Ça ne marche pas en double-cliquant le fichier, il faut passer par GitHub Pages ou un petit serveur local.)

## À savoir
- Changer les cartes : directement dans la zone de texte de l'organisateur avant de créer la partie (une par ligne).
- Un joueur qui recharge sa page revient dans la partie.
- Un petit malin qui fouille le code de la page pourrait voir la bonne boîte. Pour un jeu entre potes ça va, mais ce n'est pas anti-triche.
