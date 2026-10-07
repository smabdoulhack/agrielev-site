// Règles de rédaction de la charte (section 7). Syntaxe TypeScript « effaçable » uniquement :
// ce fichier est aussi exécuté directement par Node (scripts/verifier-contenu.ts).
export interface Probleme {
  fichier: string;
  ligne: number;
  message: string;
}

const REGLES: { motif: RegExp; message: string }[] = [
  { motif: /\u2014/, message: 'Tiret long interdit : reformuler (virgule, parenthèses, deux-points)' },
  { motif: /\bAgrielev\b/, message: 'Graphie interdite : écrire AgriElev' },
  { motif: /\bAgri\s+Elev\b/i, message: 'Graphie interdite : écrire AgriElev' },
  { motif: /\bAGRIELEV\b/, message: 'Graphie interdite : écrire AgriElev' },
  { motif: /\bCunismart\b/, message: 'Graphie interdite : écrire CuniSmart' },
  { motif: /\bCUNISMART\b/, message: 'Graphie interdite : écrire CuniSmart' },
];

export function verifierTexte(texte: string, fichier: string): Probleme[] {
  const problemes: Probleme[] = [];
  texte.split('\n').forEach((contenu, index) => {
    for (const regle of REGLES) {
      if (regle.motif.test(contenu)) problemes.push({ fichier, ligne: index + 1, message: regle.message });
    }
  });
  return problemes;
}

// Articles du blog (rédigés dans /admin par des non-développeurs) : ils ne bloquent jamais
// la publication. Le tiret long est remplacé par une virgule, les graphies sont signalées.
export function verifierArticle(
  texte: string,
  fichier: string,
): { texte: string; corrections: number; avertissements: Probleme[] } {
  let corrections = 0;
  const corrige = texte
    .split('\n')
    .map((ligne) =>
      ligne
        .replace(/^\s*—\s*/, () => (corrections++, ''))
        .replace(/\s*—\s*/g, () => (corrections++, ', ')),
    )
    .join('\n');
  const avertissements = verifierTexte(corrige, fichier);
  return { texte: corrige, corrections, avertissements };
}
