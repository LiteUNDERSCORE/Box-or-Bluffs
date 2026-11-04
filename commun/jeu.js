// Règles du jeu (logique pure, sans base de données)
//
// Une boîte par manche, tenue à tour de rôle par chaque joueur (le « porteur »).
// Une fois sur deux elle contient une carte, sinon elle est vide.
// Le porteur voit le contenu, improvise à l'oral et indique en secret s'il dit vrai ou s'il bluffe.
// L'autre (le « devineur ») répond « vrai » ou « faux ». Bonne réponse : +1 au devineur, sinon +1 au porteur.
// Si la boîte contenait une carte, elle va dans la collection du gagnant de la manche.

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

export function genererCode(rand = Math.random) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(rand() * alphabet.length)];
  return code;
}

export function nouvellePartie({ cartes, nbManches }) {
  return {
    cree: Date.now(),
    cartes,
    nbManches,
    etat: "attente",
    manche: 0,
    porteur: null,
    pleine: null,
    carte: null,
    verite: null,
    reponse: null,
    resultat: null,
    tirees: [],
    joueurs: { j1: null, j2: null },
  };
}

const liste = (v) => (v ? Object.values(v) : []);

export function collection(partie, id) {
  const j = partie.joueurs && partie.joueurs[id];
  return j ? liste(j.collection) : [];
}

export function score(partie, id) {
  const j = partie.joueurs && partie.joueurs[id];
  return (j && j.points) || 0;
}

export function joueursPrets(partie) {
  return !!(partie.joueurs && partie.joueurs.j1 && partie.joueurs.j2);
}

export function devineur(partie) {
  return partie.porteur ? AUTRE[partie.porteur] : null;
}

export function peutLancer(partie) {
  return joueursPrets(partie) && (partie.etat === "attente" || partie.etat === "revelation");
}

// Renvoie les mises à jour (chemins relatifs à la partie)
export function lancerManche(partie, rand = Math.random) {
  if (!peutLancer(partie)) throw new Error("Impossible de lancer la manche maintenant");
  if (partie.manche >= partie.nbManches) return { etat: "fin" };
  const tirees = liste(partie.tirees);
  const pioche = partie.cartes.map((_, i) => i).filter((i) => !tirees.includes(i));
  const pleine = pioche.length > 0 && rand() < 0.5;
  const carte = pleine ? pioche[Math.floor(rand() * pioche.length)] : null;
  const manche = partie.manche + 1;
  return {
    etat: "annonce",
    manche,
    porteur: manche % 2 === 1 ? "j1" : "j2",
    pleine,
    carte,
    verite: null,
    reponse: null,
    resultat: null,
    tirees: pleine ? [...tirees, carte] : tirees,
  };
}

// Le porteur indique en secret s'il dit la vérité (true) ou s'il bluffe (false)
export function declarer(partie, verite) {
  if (partie.etat !== "annonce") throw new Error("Pas le moment de déclarer");
  return { etat: "choix", verite: !!verite };
}

// reponse du devineur : "vrai" ou "faux"
export function deviner(partie, reponse) {
  if (partie.etat !== "choix") throw new Error("Pas le moment de répondre");
  if (reponse !== "vrai" && reponse !== "faux") throw new Error("Réponse invalide");
  const juste = (reponse === "vrai") === !!partie.verite;
  const gagnant = juste ? devineur(partie) : partie.porteur;
  const maj = {
    etat: "revelation",
    reponse,
    resultat: { juste, gagnant, carte: partie.pleine ? partie.carte : null },
  };
  maj[`joueurs/${gagnant}/points`] = score(partie, gagnant) + 1;
  if (partie.pleine) maj[`joueurs/${gagnant}/collection`] = [...collection(partie, gagnant), partie.carte];
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

export function echapper(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
