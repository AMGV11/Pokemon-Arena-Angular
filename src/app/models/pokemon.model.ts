import { MovesInterface } from "../interfaces/moves.interface";
import { MoveData } from "../interfaces/pokemon-data.interface";
import { PokemonType } from "../interfaces/pokemon-type.interface";
import { PokemonInterface, StatsInterface } from "../interfaces/pokemon.interface";

export class Pokemon implements PokemonInterface {
  constructor(
    public name: string,
    public types: PokemonType[],
    public stats: StatsInterface,
    public listMoves: MoveData[],
    public moves: MovesInterface,
    public hpLevel: number,
    public img: string
  ) {}


}
