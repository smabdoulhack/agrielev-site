import { describe, expect, it } from 'vitest';
import { partagerIcones } from '../../src/lib/icones-partagees.ts';

const icone = (taille: number, chemin = 'M0 0L1 1') =>
  `<svg width="${taille}" height="${taille}" class="icone" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="${chemin}"/></svg>`;

describe('partagerIcones', () => {
  it('décrit une fois une icône répétée et la réutilise avec <use>', () => {
    const html = `<html><body class="x"><p>${icone(18)}a</p><p>${icone(24)}b</p></body></html>`;
    const resultat = partagerIcones(html);
    expect(resultat.match(/M0 0L1 1/g)).toHaveLength(1);
    expect(resultat.match(/<use href="#ic0"><\/use>/g)).toHaveLength(2);
    expect(resultat).toContain('<body class="x"><svg aria-hidden="true"');
    expect(resultat).toContain('width="24" height="24" class="icone"');
  });

  it('laisse en place une icône présente une seule fois', () => {
    const html = `<html><body>${icone(18)}${icone(18, 'M2 2')}${icone(18, 'M2 2')}</body></html>`;
    const resultat = partagerIcones(html);
    expect(resultat).toContain('<path d="M0 0L1 1"/></svg>');
    expect(resultat.match(/M2 2/g)).toHaveLength(1);
  });

  it('ne touche pas une page sans icône répétée', () => {
    const html = '<html><body><svg class="sillons"><path d="M1"/></svg></body></html>';
    expect(partagerIcones(html)).toBe(html);
  });
});
