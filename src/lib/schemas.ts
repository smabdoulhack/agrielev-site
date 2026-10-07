import { z } from 'astro/zod';
import { STATUTS } from './statut.ts';
import { FAMILLES } from './familles.ts';
import { CATEGORIES } from './blog.ts';
import { trouverSujet } from './sujets.ts';

export const RESPONSABLES = ['Thierry Kouembi', 'Abdoul Hack', 'Nadine Biaou', 'Nourou-Dine', 'Communication'] as const;

export type FonctionImage = () => z.ZodType;

const etat = z.enum(['brouillon', 'publie']).default('brouillon');
const suivi = {
  responsable: z.enum(RESPONSABLES),
  miseAJour: z.coerce.date(),
  etat,
};
const statut = z.enum(STATUTS).default('preparation');

const action = z
  .object({ libelle: z.string(), sujet: z.string().optional(), url: z.string().optional() })
  .refine((a) => (a.sujet ? !a.url && !!trouverSujet(a.sujet) : !!a.url), {
    message: 'Une action a soit un sujet de formulaire connu (src/lib/sujets.ts), soit une URL',
  });

export const schemaOffre = (image: FonctionImage) =>
  z.object({
    titre: z.string(),
    ordre: z.number().int(),
    accroche: z.string(),
    statut,
    familles: z.array(z.enum(FAMILLES)).min(1),
    description: z.string(),
    actions: z.array(action).min(1),
    photo: image(),
    icone: z.string(),
    ...suivi,
  });

export const schemaModule = z.object({
  id: z.string(),
  nom: z.string(),
  famille: z.enum(FAMILLES),
  ordre: z.number().int(),
  pictogramme: z.string(),
  statut,
  description: z.string(),
});

export const schemaExpert = (image: FonctionImage) =>
  z
    .object({
      nom: z.string(),
      role: z.enum(['associe', 'consultant', 'expert']),
      specialite: z.string(),
      photo: image().optional(),
      autorisationCiter: z.boolean().default(false),
      ...suivi,
    })
    .refine((e) => e.etat !== 'publie' || e.autorisationCiter, {
      message: 'Un expert publié doit avoir autorisationCiter: true (autorisation écrite conservée)',
      path: ['autorisationCiter'],
    });

export const schemaEtudeDeCas = (image: FonctionImage) =>
  z
    .object({
      titre: z.string(),
      date: z.coerce.date(),
      lieu: z.string(),
      periode: z.string(),
      population: z.string(),
      indicateur: z.string(),
      resultat: z.string(),
      source: z.string(),
      photo: image().optional(),
      photoCredit: z.string().optional(),
      autorisationConservee: z.boolean().default(false),
      ...suivi,
    })
    .refine((e) => e.etat !== 'publie' || e.autorisationConservee, {
      message: 'Une étude de cas publiée doit avoir autorisationConservee: true',
      path: ['autorisationConservee'],
    });

export const schemaFormation = z.object({
  titre: z.string(),
  filiere: z.string(),
  ordre: z.number().int(),
  statut,
  formats: z.array(z.enum(['video', 'audio', 'texte'])).default([]),
  langues: z.array(z.string()).default([]),
  lien: z.string().optional(),
  ...suivi,
});

export const schemaDocument = z.object({
  titre: z.string(),
  description: z.string(),
  fichier: z.string().startsWith('/documents/'),
  date: z.coerce.date(),
  ...suivi,
});

const codesCategories = CATEGORIES.map((c) => c.code) as [string, ...string[]];

// Un article ne bloque jamais la publication : pas de validation obligatoire,
// le titre sert de texte alternatif quand la couverture n'a pas de description.
export const schemaArticle = (image: FonctionImage) =>
  z
    .object({
      titre: z.string(),
      resume: z.string(),
      date: z.coerce.date(),
      auteur: z.string(),
      categorie: z.enum(codesCategories),
      etiquettes: z.array(z.string()).default([]),
      couverture: image().optional(),
      couvertureAlt: z.string().optional(),
      couvertureCredit: z.string().optional(),
      sources: z.array(z.string()).default([]),
      sujetTechnique: z.boolean().default(false),
      valideParExpert: z.string().optional(),
      etat,
    });
