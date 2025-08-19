export interface PokemonType {
  damage_relations:      DamageRelations;
  game_indices:          GameIndex[];
  generation:            UrlInfo;
  id:                    number;
  move_damage_class:     UrlInfo;
  moves:                 UrlInfo[];
  name:                  string;
  names:                 Name[];
  past_damage_relations: any[];
  pokemon:               PokemonInfo[];
  sprites:               Sprites;
}

export interface DamageRelations {
  double_damage_from: UrlInfo[];
  double_damage_to:   any[];
  half_damage_from:   any[];
  half_damage_to:     UrlInfo[];
  no_damage_from:     UrlInfo[];
  no_damage_to:       UrlInfo[];
}

export interface UrlInfo {
  name: string;
  url:  string;
}

export interface GameIndex {
  game_index: number;
  generation: UrlInfo;
}

export interface Name {
  language: UrlInfo;
  name:     string;
}

export interface PokemonInfo {
  pokemon: UrlInfo;
  slot:    number;
}

export interface Sprites {
  "generation-iii":  GenerationIii;
  "generation-iv":   GenerationIv;
  "generation-ix":   GenerationIx;
  "generation-v":    GenerationV;
  "generation-vi":   { [key: string]: Colosseum };
  "generation-vii":  GenerationVii;
  "generation-viii": GenerationViii;
}

export interface GenerationIii {
  colosseum:           Colosseum;
  emerald:             Colosseum;
  "firered-leafgreen": Colosseum;
  "ruby-saphire":      Colosseum;
  xd:                  Colosseum;
}

export interface Colosseum {
  name_icon: string;
}

export interface GenerationIv {
  "diamond-pearl":        Colosseum;
  "heartgold-soulsilver": Colosseum;
  platinum:               Colosseum;
}

export interface GenerationIx {
  "scarlet-violet": Colosseum;
}

export interface GenerationV {
  "black-2-white-2": Colosseum;
  "black-white":     Colosseum;
}

export interface GenerationVii {
  "lets-go-pikachu-lets-go-eevee": Colosseum;
  "sun-moon":                      Colosseum;
  "ultra-sun-ultra-moon":          Colosseum;
}

export interface GenerationViii {
  "brilliant-diamond-and-shining-pearl": Colosseum;
  "legends-arceus":                      Colosseum;
  "sword-shield":                        Colosseum;
}
