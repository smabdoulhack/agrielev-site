import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { schemaArticle, schemaEtudeDeCas, schemaExpert, schemaOffre } from '../../src/lib/schemas.ts';

const image = () => z.string();
const commun = { responsable: 'Abdoul Hack', miseAJour: '2026-10-06' };

describe('schémas de contenu', () => {
  it('refuse un expert publié sans autorisation de le citer', () => {
    const expert = { ...commun, nom: 'Test', role: 'expert', specialite: 'Santé animale', autorisationCiter: false, etat: 'publie' };
    const resultat = schemaExpert(image).safeParse(expert);
    expect(resultat.success).toBe(false);
    expect(JSON.stringify(resultat.error)).toContain('autorisation');
    expect(schemaExpert(image).safeParse({ ...expert, etat: 'brouillon' }).success).toBe(true);
    expect(schemaExpert(image).safeParse({ ...expert, autorisationCiter: true }).success).toBe(true);
  });

  it('refuse une étude de cas publiée sans autorisation conservée', () => {
    const etude = {
      ...commun, titre: 'Cas', date: '2026-10-01', lieu: 'Bénin', periode: '2026', population: '16 éleveurs',
      indicateur: 'x', resultat: 'y', source: 'z', autorisationConservee: false, etat: 'publie',
    };
    expect(schemaEtudeDeCas(image).safeParse(etude).success).toBe(false);
    expect(schemaEtudeDeCas(image).safeParse({ ...etude, autorisationConservee: true }).success).toBe(true);
  });

  it('publie un article technique sans validation par un expert', () => {
    const article = {
      titre: 'Vacciner ses lapins', resume: 'Résumé', date: '2026-10-01', auteur: 'Équipe AgriElev',
      categorie: 'conseils-techniques', sujetTechnique: true, etat: 'publie',
    };
    expect(schemaArticle(image).safeParse(article).success).toBe(true);
  });

  it('accepte une couverture sans texte alternatif (le titre sert de description)', () => {
    const article = {
      titre: 'T', resume: 'R', date: '2026-10-01', auteur: 'A', categorie: 'terrain', etat: 'publie',
      couverture: 'x.jpg',
    };
    expect(schemaArticle(image).safeParse(article).success).toBe(true);
  });

  it('exige un sujet connu ou une URL dans chaque action d’offre', () => {
    const offre = {
      ...commun, titre: 'O', ordre: 1, accroche: 'A', statut: 'preparation', familles: ['animales'],
      description: 'D', photo: 'x.jpg', icone: 'cow', etat: 'publie',
      actions: [{ libelle: 'Écrire', sujet: 'nimporte' }],
    };
    expect(schemaOffre(image).safeParse(offre).success).toBe(false);
    expect(schemaOffre(image).safeParse({ ...offre, actions: [{ libelle: 'Écrire', sujet: 'demo-cunismart' }] }).success).toBe(true);
    expect(schemaOffre(image).safeParse({ ...offre, actions: [{ libelle: 'Voir', url: '/cunismart' }] }).success).toBe(true);
    expect(schemaOffre(image).safeParse({ ...offre, actions: [{ libelle: 'Rien' }] }).success).toBe(false);
  });
});
