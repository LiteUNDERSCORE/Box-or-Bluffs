# Box of Bluffs – mise en ligne

Deux sites dans un seul dépôt :
- **Organisateur** : `…/organisateur/` → crée la partie, choisit les cartes, lance les manches.
- **Joueur** : `…/joueur/` → chaque joueur l'ouvre sur son téléphone avec le code.

## Règles
- À chaque manche, une carte est tirée au hasard et cachée au hasard dans une des boîtes.
- Le **bluffeur** voit la carte et la boîte. Il annonce une boîte, vraie ou bluff.
- Le **chercheur** choisit une boîte. S'il tombe sur la bonne, il gagne la carte. Sinon, le bluffeur la garde.
- Les rôles s'inversent à chaque manche. Une carte ne sort qu'une fois.
- Points : la 1re carte de la liste (Champion pilote) vaut le plus, la dernière vaut 1.

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
- Changer les cartes : directement dans la zone de texte de l'organisateur avant de créer la partie (une par ligne, de la meilleure à la pire).
- Un joueur qui recharge sa page revient dans la partie.
- Un petit malin qui fouille le code de la page pourrait voir la bonne boîte. Pour un jeu entre potes ça va, mais ce n'est pas anti-triche.
