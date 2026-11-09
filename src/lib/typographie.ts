// Typographie française appliquée aux pages HTML produites (texte seulement, jamais au code,
// au CSS ni aux balises) : espace insécable avant « : ; ! ? » et à l'intérieur des guillemets,
// pour qu'un signe double ne se retrouve jamais seul en début de ligne, et apostrophe courbe.

const INSECABLE = ' ';
// Segments laissés intacts : commentaires, scripts (dont le JSON-LD), styles, champs de saisie, code, balises.
const PROTEGES = /(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<textarea\b[\s\S]*?<\/textarea>|<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<[^>]+>)/i;

export function corrigerTexte(texte: string): string {
  return texte
    // Assertions sans consommation : « coopérative » : reçoit bien ses deux espaces insécables.
    .replace(/(?<=[^\s ]) (?=[:;!?»])/g, INSECABLE)
    .replace(/« /g, `«${INSECABLE}`)
    // Apostrophe typographique entre deux lettres (l'équipe devient l’équipe), y compris encodée.
    .replace(/(?<=\p{L})(?:'|&#39;|&apos;)(?=\p{L})/gu, '’');
}

// Dans les titres (Plus Jakarta Sans 800), la virgule est trop écartée du mot : on la resserre.
function resserrerVirgules(texte: string): string {
  return texte.replace(/(?<=\p{L}),/gu, '<span class="ponct">,</span>');
}

export function espacesInsecables(html: string): string {
  let dansTitre = false;
  return html
    .split(PROTEGES)
    .map((morceau) => {
      if (morceau.startsWith('<')) {
        if (/^<h[1-4][\s>]/i.test(morceau)) dansTitre = true;
        else if (/^<\/h[1-4]>/i.test(morceau)) dansTitre = false;
        return morceau;
      }
      const corrige = corrigerTexte(morceau);
      return dansTitre ? resserrerVirgules(corrige) : corrige;
    })
    .join('');
}
