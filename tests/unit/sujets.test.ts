import { describe, expect, it } from 'vitest';
import { SUJETS, lienContact, objetEmail, trouverSujet } from '../../src/lib/sujets.ts';

describe('sujets', () => {
  it('chaque sujet a un code unique', () => {
    const codes = SUJETS.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('route les sujets vers le bon pôle (spec 6.2)', () => {
    expect(trouverSujet('demo-cunismart')?.pole).toBe('commercial');
    expect(trouverSujet('pilote-cooperative')?.pole).toBe('commercial');
    expect(trouverSujet('besoin-transformation')?.pole).toBe('commercial');
    expect(trouverSujet('probleme-technique')?.pole).toBe('technique');
    expect(trouverSujet('proposer-experimentation')?.pole).toBe('technique');
    expect(trouverSujet('presse')?.pole).toBe('institutionnel');
    expect(trouverSujet('autre')?.pole).toBe('institutionnel');
  });

  it('ignore un sujet inconnu, vide ou absent', () => {
    expect(trouverSujet('nimporte')).toBeUndefined();
    expect(trouverSujet('')).toBeUndefined();
    expect(trouverSujet(null)).toBeUndefined();
    expect(trouverSujet(undefined)).toBeUndefined();
  });

  it('construit un lien de contact prérempli', () => {
    expect(lienContact('pilote-cooperative', '/cooperatives')).toBe('/contact?sujet=pilote-cooperative&depuis=%2Fcooperatives');
    expect(lienContact('demo-cunismart')).toBe('/contact?sujet=demo-cunismart');
    expect(lienContact('partenariat', undefined, 'partenaire')).toBe('/contact?sujet=partenariat&profil=partenaire');
  });

  it('refuse de construire un lien vers un sujet inconnu', () => {
    expect(() => lienContact('nimporte')).toThrow(/Sujet inconnu/);
  });

  it("met le sujet et le pôle dans l'objet de l'e-mail", () => {
    expect(objetEmail('demo-cunismart')).toBe('[Site AgriElev] Démonstration CuniSmart · Commercial');
    expect(objetEmail('nimporte')).toBe('[Site AgriElev] Autre demande · Institutionnel');
    expect(objetEmail(null)).toBe('[Site AgriElev] Autre demande · Institutionnel');
  });
});
