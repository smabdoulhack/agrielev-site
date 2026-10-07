import { describe, expect, it } from 'vitest';
import { estVisible, filtrerVisibles } from '../../src/lib/contenu.ts';
import { formatDate, formatNombre } from '../../src/lib/format.ts';

describe('contenu', () => {
  it('cache les brouillons en production seulement', () => {
    expect(estVisible('publie', true)).toBe(true);
    expect(estVisible('brouillon', true)).toBe(false);
    expect(estVisible('brouillon', false)).toBe(true);
  });

  it('filtre une liste d’entrées', () => {
    const entrees = [{ id: 'a', data: { etat: 'publie' } }, { id: 'b', data: { etat: 'brouillon' } }];
    expect(filtrerVisibles(entrees, true).map((e) => e.id)).toEqual(['a']);
    expect(filtrerVisibles(entrees, false)).toHaveLength(2);
  });
});

describe('format', () => {
  it('écrit les dates à la française', () => {
    expect(formatDate(new Date(2026, 6, 11))).toBe('11 juillet 2026');
  });

  it('sépare les milliers par une espace et met une virgule décimale', () => {
    expect(formatNombre(908394)).toMatch(/^908\s394$/u);
    expect(formatNombre(7.5)).toBe('7,5');
  });
});
