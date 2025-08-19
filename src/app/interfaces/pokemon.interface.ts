import { Move, MovesInterface} from './moves.interface';
import { MoveData, Stat } from './pokemon-data.interface';
import { PokemonType } from './pokemon-type.interface';

export interface PokemonInterface {
  name: string;
  types: PokemonType[];
  stats: StatsInterface;
  listMoves: MoveData[];
  moves: MovesInterface;
  hpLevel: number;
  img: string;
}

export interface StatsInterface{
  hp: number;
  currentHp: number;
  atk: number;
  def: number;
  spatk: number;
  spdef: number;
  spd: number;
}
