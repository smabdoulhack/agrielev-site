import { describe, expect, it } from 'vitest';
import { lireContexte } from '../../src/lib/formulaire.ts';

const ORIGINE = 'https://agrielev.com';

describe('lireContexte', () => {
  it('lit sujet, profil et page d’origine valides', () => {
    expect(lireContexte('?sujet=demo-cunismart&profil=cooperative&depuis=%2Fcunismart', '', ORIGINE))
      .toEqual({ sujet: 'demo-cunismart', profil: 'cooperative', depuis: '/cunismart' });
  });

  it('ignore un sujet ou un profil inconnu', () => {
    expect(lireContexte('?sujet=nimporte&profil=pirate', '', ORIGINE)).toEqual({});
  });

  it('refuse une page d’origine externe ou mal formée', () => {
    expect(lireContexte('?depuis=https%3A%2F%2Fmalveillant.example', '', ORIGINE)).toEqual({});
    expect(lireContexte('?depuis=%2F%2Fmalveillant.example', '', ORIGINE)).toEqual({});
  });

  it('se rabat sur le référent du même site', () => {
    expect(lireContexte('', 'https://agrielev.com/solutions', ORIGINE)).toEqual({ depuis: '/solutions' });
    expect(lireContexte('', 'https://autre.example/page', ORIGINE)).toEqual({});
  });
});
