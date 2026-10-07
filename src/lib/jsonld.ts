// JSON-LD inséré dans <script type="application/ld+json"> : « < » échappé pour qu'aucun
// contenu (titre d'article, résumé) ne puisse fermer la balise.
export function serialiserJsonLd(donnees: Record<string, unknown>): string {
  return JSON.stringify(donnees).replace(/</g, '\\u003c');
}
