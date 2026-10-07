import { describe, expect, it, vi } from 'vitest';
import { preparerChiffre } from '../../src/lib/chiffre.ts';

describe('preparerChiffre', () => {
  it('formate une donnée complète', () => {
    const c = preparerChiffre({ valeur: 908394, unite: 't', annee: 2024, source: 'FAOSTAT' });
    expect(c?.valeur).toMatch(/^908\s394$/u);
    expect(c?.unite).toBe('t');
    expect(c?.mention).toBe('2024, source : FAOSTAT');
  });

  it('garde une valeur texte telle quelle', () => {
    expect(preparerChiffre({ valeur: '7,5', unite: 't/ha', annee: 2025, source: 'INSAE' })?.valeur).toBe('7,5');
  });

  it('refuse une donnée incomplète et prévient', () => {
    const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(preparerChiffre({ valeur: 12, unite: 'éleveurs', annee: 2026 })).toBeNull();
    expect(avertir).toHaveBeenCalledWith(expect.stringContaining('source'));
    avertir.mockRestore();
  });
});
