import { describe, expect, it } from 'vitest';
import { corrigerTexte, espacesInsecables } from '../../src/lib/typographie.ts';

const NB = ' ';

describe('typographie française', () => {
  it('insère une espace insécable avant les signes doubles et dans les guillemets', () => {
    expect(corrigerTexte('Pour noter, non : jamais ? Oui ! « CuniSmart »')).toBe(`Pour noter, non${NB}: jamais${NB}? Oui${NB}! «${NB}CuniSmart${NB}»`);
  });

  it('ne touche ni aux balises, ni aux scripts, ni aux styles', () => {
    const html = '<p class="a :b">Bonjour : oui</p><script>const x = a ? b : c;</script><style>.a :hover{}</style>';
    expect(espacesInsecables(html)).toBe(`<p class="a :b">Bonjour${NB}: oui</p><script>const x = a ? b : c;</script><style>.a :hover{}</style>`);
  });

  it('laisse intact le JSON-LD', () => {
    const html = '<script type="application/ld+json">{"name" : "AgriElev"}</script>';
    expect(espacesInsecables(html)).toBe(html);
  });

  it('traite un guillemet fermant suivi d’un deux-points', () => {
    expect(corrigerTexte('« Ma coopérative » : l’activité')).toBe(`«${NB}Ma coopérative${NB}»${NB}: l’activité`);
  });

  it('remplace l’apostrophe droite entre deux lettres, y compris encodée', () => {
    expect(corrigerTexte("l'équipe d&#39;AgriElev")).toBe('l’équipe d’AgriElev');
    expect(espacesInsecables(`<p title="l'a">l'a</p>`)).toBe(`<p title="l'a">l’a</p>`);
  });

  it('resserre la virgule dans les titres seulement', () => {
    expect(espacesInsecables('<h2 class="a">Merci, votre demande</h2><p>Merci, oui</p>'))
      .toBe('<h2 class="a">Merci<span class="ponct">,</span> votre demande</h2><p>Merci, oui</p>');
  });

  it('ne double pas une espace déjà insécable', () => {
    expect(corrigerTexte(`Contact${NB}: ici`)).toBe(`Contact${NB}: ici`);
  });
});
