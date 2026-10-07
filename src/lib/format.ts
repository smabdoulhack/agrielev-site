const dates = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const nombres = new Intl.NumberFormat('fr-FR');

export function formatDate(d: Date): string {
  return dates.format(d);
}

export function formatNombre(n: number): string {
  return nombres.format(n);
}
