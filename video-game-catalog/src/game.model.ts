
export interface Game {
  id: number | null;
  title: string;
  genre: 'RPG' | 'Acción' | 'Aventura' | 'Estrategia' | 'Deportes' | '';
  platform: 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo Switch' | '';
  score: number | null;
  releaseYear: number | null;
}
