import { PROFILS, trouverSujet } from './sujets.ts';

export interface ContexteFormulaire {
  sujet?: string;
  profil?: string;
  depuis?: string;
}

function cheminInterne(valeur: string | null): string | undefined {
  if (!valeur || !valeur.startsWith('/') || valeur.startsWith('//')) return undefined;
  return valeur.slice(0, 200);
}

export function lireContexte(recherche: string, referent: string, origine: string): ContexteFormulaire {
  const params = new URLSearchParams(recherche);
  const contexte: ContexteFormulaire = {};
  const sujet = trouverSujet(params.get('sujet'));
  if (sujet) contexte.sujet = sujet.code;
  const profil = params.get('profil');
  if (profil && PROFILS.some((p) => p.code === profil)) contexte.profil = profil;
  let depuis = cheminInterne(params.get('depuis'));
  if (!depuis && referent.startsWith(`${origine}/`)) depuis = cheminInterne(new URL(referent).pathname);
  if (depuis) contexte.depuis = depuis;
  return contexte;
}
