export function estVisible(etat: string, production: boolean): boolean {
  return !production || etat === 'publie';
}

export function filtrerVisibles<T extends { data: { etat: string } }>(entrees: T[], production: boolean): T[] {
  return entrees.filter((e) => estVisible(e.data.etat, production));
}
