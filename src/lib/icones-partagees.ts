// Allège les pages produites : une icône Phosphor répétée dans une page n'y est décrite
// qu'une fois (dans un SVG masqué en début de <body>), chaque occurrence la réutilise
// avec <use>. Les attributs de chaque occurrence (taille, classe, accessibilité) sont gardés.

const ICONE = /(<svg\b[^>]*\bclass="icone[^"]*"[^>]*>)([\s\S]*?)(<\/svg>)/g;

export function partagerIcones(html: string): string {
  const occurrences = new Map<string, number>();
  for (const [, , interieur] of html.matchAll(ICONE)) occurrences.set(interieur, (occurrences.get(interieur) ?? 0) + 1);

  const identifiants = new Map<string, string>();
  for (const [interieur, nombre] of occurrences) {
    if (nombre > 1) identifiants.set(interieur, `ic${identifiants.size}`);
  }
  if (identifiants.size === 0) return html;

  const corps = html.replace(ICONE, (tout, ouverture: string, interieur: string, fermeture: string) => {
    const id = identifiants.get(interieur);
    return id ? `${ouverture}<use href="#${id}"></use>${fermeture}` : tout;
  });
  const definitions = [...identifiants].map(([interieur, id]) => `<g id="${id}">${interieur}</g>`).join('');
  const reserve = `<svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${definitions}</defs></svg>`;
  return corps.replace(/<body\b[^>]*>/, (balise) => balise + reserve);
}
