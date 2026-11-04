// Accès à la base : Firebase si config.js est rempli, sinon mode test local
// (mode local = plusieurs onglets du même navigateur, pour essayer sans Firebase).
import { firebaseConfig } from "./config.js";

const FIREBASE_VERSION = "10.12.2";

function configRemplie(c) {
  return c && c.apiKey && !c.apiKey.startsWith("A_REMPLIR") && c.databaseURL && !c.databaseURL.includes("A_REMPLIR");
}

export async function initDb() {
  if (configRemplie(firebaseConfig)) return initFirebase();
  return initLocal();
}

async function initFirebase() {
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
  const { initializeApp } = await import(`${base}/firebase-app.js`);
  const fdb = await import(`${base}/firebase-database.js`);
  const app = initializeApp(firebaseConfig);
  const db = fdb.getDatabase(app);
  return {
    mode: "firebase",
    ecouter(chemin, cb) {
      return fdb.onValue(fdb.ref(db, chemin), (snap) => cb(snap.val()));
    },
    async lire(chemin) {
      return (await fdb.get(fdb.ref(db, chemin))).val();
    },
    definir(chemin, valeur) {
      return fdb.set(fdb.ref(db, chemin), valeur);
    },
    mettreAJour(chemin, maj) {
      return fdb.update(fdb.ref(db, chemin), maj);
    },
    async transaction(chemin, fn) {
      const r = await fdb.runTransaction(fdb.ref(db, chemin), fn);
      return { ok: r.committed, valeur: r.snapshot.val() };
    },
  };
}

function initLocal() {
  const CLE = "bob-db";
  const canal = "BroadcastChannel" in window ? new BroadcastChannel(CLE) : null;
  const ecouteurs = new Set();

  const charger = () => {
    try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch { return {}; }
  };
  const segments = (c) => c.split("/").filter(Boolean);
  const lireA = (arbre, chemin) => {
    let n = arbre;
    for (const s of segments(chemin)) { if (n == null) return null; n = n[s]; }
    return n === undefined ? null : n;
  };
  const ecrireA = (arbre, chemin, valeur) => {
    const segs = segments(chemin);
    let n = arbre;
    for (let i = 0; i < segs.length - 1; i++) {
      if (typeof n[segs[i]] !== "object" || n[segs[i]] === null) n[segs[i]] = {};
      n = n[segs[i]];
    }
    const der = segs[segs.length - 1];
    if (valeur === null || valeur === undefined) delete n[der];
    else n[der] = JSON.parse(JSON.stringify(valeur));
  };
  const notifier = () => {
    for (const e of ecouteurs) e();
  };
  const sauver = (arbre) => {
    localStorage.setItem(CLE, JSON.stringify(arbre));
    notifier();
    if (canal) canal.postMessage("maj");
  };
  if (canal) canal.onmessage = notifier;
  window.addEventListener("storage", (e) => { if (e.key === CLE) notifier(); });

  return {
    mode: "local",
    ecouter(chemin, cb) {
      const e = () => cb(lireA(charger(), chemin));
      ecouteurs.add(e);
      setTimeout(e, 0);
      return () => ecouteurs.delete(e);
    },
    async lire(chemin) { return lireA(charger(), chemin); },
    async definir(chemin, valeur) {
      const a = charger(); ecrireA(a, chemin, valeur); sauver(a);
    },
    async mettreAJour(chemin, maj) {
      const a = charger();
      for (const [k, v] of Object.entries(maj)) ecrireA(a, `${chemin}/${k}`, v);
      sauver(a);
    },
    async transaction(chemin, fn) {
      const a = charger();
      const res = fn(lireA(a, chemin));
      if (res === undefined) return { ok: false, valeur: lireA(a, chemin) };
      ecrireA(a, chemin, res); sauver(a);
      return { ok: true, valeur: res };
    },
  };
}
