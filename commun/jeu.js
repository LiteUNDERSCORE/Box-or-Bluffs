// Règles du jeu (logique pure, sans base de données)

// Classement du meilleur au pire : la 1re carte rapporte le plus de points.
export const CARTES_PAR_DEFAUT = [
  "Champion pilote",
  "Leader championnat pilote",
  "Écurie la plus victorieuse de la ligue",
  "Victoire en Division A en Saison 2/3",
  "Gabzer victoires",
  "Nonoflo victoire",
  "Pole position",
  "Aymane podium",
  "Skyzoo score à chaque manche",
  "Baquet chez Audi ou McLaren",
  "Se faire undercut de 5 secondes",
  "Départ dernier",
  "Pénalité de 10 secondes",
  "Audi double box au GP d'Espagne (Barcelone)",
  "Qualif en pneus WET sous le sec",
  "Pneus slicks sous la pluie",
  "Jojo Crevaison",
  "Crash au premier tour",
  "Crash Framboise",
];

export const AUTRE = { j1: "j2", j2: "j1" };

export function points(partie, indexCarte) {
  return partie.cartes.length - indexCarte;
}

export function genererCode(rand = Math.random) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(rand() * alphabet.length)];
  return code;
}

export function nouvellePartie({ cartes, nbManches, nbBoites }) {
  return {
    cree: Date.now(),
    cartes,
    nbManches: Math.min(nbManches, cartes.length),
    nbBoites,
    etat: "attente",
    manche: 0,
    bluffeur: null,
    carte: null,
    boite: null,
    annonce: null,
    choix: null,
    resultat: null,
    tirees: [],
    joueurs: { j1: null, j2: null },
  };
}

export function collection(partie, id) {
  const j = partie.joueurs && partie.joueurs[id];
  return (j && j.collection) ? Object.values(j.collection) : [];
}

export function score(partie, id) {
  return collection(partie, id).reduce((s, c) => s + points(partie, c), 0);
}

export function joueursPrets(partie) {
  return !!(partie.joueurs && partie.joueurs.j1 && partie.joueurs.j2);
}

export function chercheur(partie) {
  return partie.bluffeur ? AUTRE[partie.bluffeur] : null;
}

export function peutLancer(partie) {
  return joueursPrets(partie) && (partie.etat === "attente" || partie.etat === "revelation");
}

// Renvoie les mises à jour (chemins relatifs à la partie)
export function lancerManche(partie, rand = Math.random) {
  if (!peutLancer(partie)) throw new Error("Impossible de lancer la manche maintenant");
  const tirees = partie.tirees ? Object.values(partie.tirees) : [];
  const pioche = partie.cartes.map((_, i) => i).filter((i) => !tirees.includes(i));
  if (partie.manche >= partie.nbManches || pioche.length === 0) return { etat: "fin" };
  const carte = pioche[Math.floor(rand() * pioche.length)];
  const boite = 1 + Math.floor(rand() * partie.nbBoites);
  const manche = partie.manche + 1;
  return {
    etat: "annonce",
    manche,
    bluffeur: manche % 2 === 1 ? "j1" : "j2",
    carte,
    boite,
    annonce: null,
    choix: null,
    resultat: null,
    tirees: [...tirees, carte],
  };
}

export function annoncer(partie, boite) {
  if (partie.etat !== "annonce") throw new Error("Pas le moment d'annoncer");
  return { etat: "choix", annonce: boite };
}

export function choisir(partie, boite) {
  if (partie.etat !== "choix") throw new Error("Pas le moment de choisir");
  const cherche = chercheur(partie);
  const trouve = boite === partie.boite;
  const gagnant = trouve ? cherche : partie.bluffeur;
  const maj = {
    etat: "revelation",
    choix: boite,
    resultat: { trouve, gagnant, carte: partie.carte, points: points(partie, partie.carte) },
  };
  maj[`joueurs/${gagnant}/collection`] = [...collection(partie, gagnant), partie.carte];
  return maj;
}

export function terminer() {
  return { etat: "fin" };
}

export function vainqueur(partie) {
  const a = score(partie, "j1"), b = score(partie, "j2");
  if (a === b) return null;
  return a > b ? "j1" : "j2";
}
