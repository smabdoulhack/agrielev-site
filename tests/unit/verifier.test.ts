import { describe, expect, it } from 'vitest';
import { verifierArticle, verifierTexte } from '../../src/lib/verifier.ts';

describe('verifierTexte', () => {
  it('accepte un texte conforme, y compris les adresses en minuscules', () => {
    expect(verifierTexte('AgriElev et CuniSmart by AgriElev. Voir www.agrielev.com et hello@cunismart.com.', 'a.md')).toEqual([]);
  });

  it('signale le tiret long avec la ligne', () => {
    const problemes = verifierTexte('ligne un\nAgriElev \u2014 suite', 'b.md');
    expect(problemes).toEqual([{ fichier: 'b.md', ligne: 2, message: 'Tiret long interdit : reformuler (virgule, parenthèses, deux-points)' }]);
  });

  it('signale les graphies interdites', () => {
    const texte = 'Agrielev\nAgri Elev\nAGRIELEV\nCunismart\nCUNISMART';
    expect(verifierTexte(texte, 'c.md').map((p) => p.ligne)).toEqual([1, 2, 3, 4, 5]);
  });

  it('accepte le tiret demi-cadratin et le trait d’union', () => {
    expect(verifierTexte('2025\u20132026, Abomey-Calavi', 'd.md')).toEqual([]);
  });
});

describe('verifierArticle', () => {
  it('remplace le tiret long par une virgule, sans bloquer', () => {
    const r = verifierArticle('Le lapin — animal robuste — se vend bien.', 'a.md');
    expect(r.texte).toBe('Le lapin, animal robuste, se vend bien.');
    expect(r.corrections).toBe(2);
  });

  it('supprime un tiret long en début de ligne', () => {
    expect(verifierArticle('— Bonjour', 'a.md').texte).toBe('Bonjour');
  });

  it('signale les graphies sans les corriger ni bloquer', () => {
    const r = verifierArticle('ligne\nAgrielev forme', 'a.md');
    expect(r.texte).toBe('ligne\nAgrielev forme');
    expect(r.avertissements).toEqual([{ fichier: 'a.md', ligne: 2, message: 'Graphie interdite : écrire AgriElev' }]);
  });

  it('laisse intact un texte conforme', () => {
    expect(verifierArticle('AgriElev, CuniSmart.', 'a.md')).toEqual({ texte: 'AgriElev, CuniSmart.', corrections: 0, avertissements: [] });
  });
});
