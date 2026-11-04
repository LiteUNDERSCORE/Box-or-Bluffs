import { echapper } from "./jeu.js";

// Grosse boîte : fermée, ou ouverte (pleine avec la carte / vide)
export function boiteHtml(partie, ouverte) {
  if (!ouverte) return `<div class="grosse-boite"><span class="point-int">?</span></div>`;
  return partie.pleine
    ? `<div class="grosse-boite ouverte pleine"><div class="contenu">${echapper(partie.cartes[partie.carte])}</div></div>`
    : `<div class="grosse-boite ouverte vide"><div class="contenu">VIDE</div></div>`;
}
