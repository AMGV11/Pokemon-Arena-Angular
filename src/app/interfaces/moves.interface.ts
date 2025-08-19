export interface MovesInterface {
     move1: Move;
     move2: Move;
     move3: Move;
     move4: Move;
}

export interface Move {
  accuracy:             null;
  contest_combos:       null;
  contest_effect:       Url;
  contest_type:         NameAndUrl;
  damage_class:         NameAndUrl;
  effect_chance:        null;
  effect_changes:       any[];
  effect_entries:       EffectEntry[];
  flavor_text_entries:  FlavorTextEntry[];
  generation:           NameAndUrl;
  id:                   number;
  learned_by_pokemon:   NameAndUrl[];
  machines:             any[];
  meta:                 Meta;
  name:                 string;
  names:                Name[];
  past_values:          any[];
  power:                number | null;
  pp:                   number;
  priority:             number;
  stat_changes:         any[];
  super_contest_effect: Url;
  target:               NameAndUrl;
  type:                 NameAndUrl;
}

export interface Url {
  url: string;
}

export interface NameAndUrl {
  name: string;
  url:  string;
}

export interface EffectEntry {
  effect:       string;
  language:     NameAndUrl;
  short_effect: string;
}

export interface FlavorTextEntry {
  flavor_text:   string;
  language:      NameAndUrl;
  version_group: NameAndUrl;
}

export interface Meta {
  ailment:        NameAndUrl;
  ailment_chance: number;
  category:       NameAndUrl;
  crit_rate:      number;
  drain:          number;
  flinch_chance:  number;
  healing:        number;
  max_hits:       number | null;
  max_turns:      number | null;
  min_hits:       number | null;
  min_turns:      number | null;
  stat_chance:    number | null;
}

export interface Name {
  language: NameAndUrl;
  name:     string;
}
