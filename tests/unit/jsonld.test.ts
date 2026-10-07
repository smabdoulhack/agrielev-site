import { describe, expect, it } from 'vitest';
import { serialiserJsonLd } from '../../src/lib/jsonld.ts';

describe('serialiserJsonLd', () => {
  it('empêche un titre de fermer la balise script', () => {
    const sortie = serialiserJsonLd({ headline: 'Titre </script><script>alert(1)</script>' });
    expect(sortie).not.toContain('</script>');
    expect(JSON.parse(sortie).headline).toBe('Titre </script><script>alert(1)</script>');
  });
});
