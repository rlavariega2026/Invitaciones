const originalNames = [
  'pngwing.com.png',
  ...Array.from({ length: 6 }, (_, index) => `pngwing.com (${index + 1}).png`),
  ...Array.from({ length: 12 }, (_, index) => `pngwing.com (${index + 9}).png`),
];

export const MOTIF_LIBRARY = originalNames.map((name, index) => ({
  id: `zip-motif-${index + 1}`,
  name: `Motivo ${index + 1}`,
  src: `${import.meta.env.BASE_URL}motivos/${encodeURIComponent(name)}`,
}));
