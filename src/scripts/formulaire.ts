import { lireContexte } from '../lib/formulaire.ts';
import { objetEmail } from '../lib/sujets.ts';

const MESSAGE_COORDONNEES = 'Indiquez un e-mail ou un numéro de téléphone pour que nous puissions vous répondre.';

function champ<T extends HTMLElement>(form: HTMLFormElement, nom: string): T | null {
  return form.querySelector<T>(`[name="${nom}"]`);
}

function preparerContact(form: HTMLFormElement): void {
  const sujet = champ<HTMLSelectElement>(form, 'sujet');
  const profil = champ<HTMLSelectElement>(form, 'profil');
  const depuis = champ<HTMLInputElement>(form, 'depuis');
  const objet = champ<HTMLInputElement>(form, 'subject');
  const email = champ<HTMLInputElement>(form, 'email');
  const telephone = champ<HTMLInputElement>(form, 'telephone');

  const contexte = lireContexte(location.search, document.referrer, location.origin);
  if (sujet && contexte.sujet) sujet.value = contexte.sujet;
  if (profil && contexte.profil) profil.value = contexte.profil;
  if (depuis && contexte.depuis) depuis.value = contexte.depuis;

  const bouton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  // Objet de l'e-mail Netlify et propriété « sujet » de l'événement Umami (spec 6.6).
  const majObjet = () => {
    if (!sujet) return;
    if (objet) objet.value = objetEmail(sujet.value);
    if (bouton) bouton.dataset.umamiEventSujet = sujet.value || 'autre';
  };
  majObjet();
  sujet?.addEventListener('change', majObjet);

  const effacer = () => email?.setCustomValidity('');
  email?.addEventListener('input', effacer);
  telephone?.addEventListener('input', effacer);
  form.addEventListener('submit', (evenement) => {
    if (email && telephone && !email.value.trim() && !telephone.value.trim()) {
      evenement.preventDefault();
      evenement.stopImmediatePropagation();
      email.setCustomValidity(MESSAGE_COORDONNEES);
      email.reportValidity();
    }
  }, { capture: true });
}

function empecherDoubleEnvoi(form: HTMLFormElement): void {
  const bouton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!bouton) return;
  const libelle = bouton.textContent ?? '';
  form.addEventListener('submit', (evenement) => {
    if (evenement.defaultPrevented) return;
    if (form.dataset.envoi === 'en-cours') { evenement.preventDefault(); return; }
    form.dataset.envoi = 'en-cours';
    bouton.disabled = true;
    bouton.setAttribute('aria-busy', 'true');
    bouton.textContent = 'Envoi en cours…';
  });
  // Retour arrière depuis la page de confirmation : rendre le bouton à nouveau utilisable.
  window.addEventListener('pageshow', () => {
    delete form.dataset.envoi;
    bouton.disabled = false;
    bouton.removeAttribute('aria-busy');
    bouton.textContent = libelle;
  });
}

export function initialiserFormulaires(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-formulaire]').forEach((form) => {
    if (form.dataset.formulaire === 'contact') preparerContact(form);
    empecherDoubleEnvoi(form);
  });
}
