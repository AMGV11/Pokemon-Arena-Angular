import { firstValueFrom, forkJoin } from 'rxjs';
import PokemonService from '../services/pokemon.service';

import { PokemonData } from '../interfaces/pokemon-data.interface';
import { PokemonInterface } from '../interfaces/pokemon.interface';

import { Stats } from '../models/stats.model';
import { Moves } from '../models/moves.model';

export class PokemonMapper {
  static async mapDataToPokemon(
    data: PokemonData,
    player: boolean,
    pokemonService: PokemonService
  ): Promise<PokemonInterface> {
    const pokemonStats = new Stats(data.stats);
    let pokemonImg;

    // Cargamos los tipos de los Pokemon al mismo tiempo
    const { pokemonTypes, pokemonMoveArray } = await firstValueFrom(
      forkJoin({
        pokemonTypes: pokemonService.getTypes(data.types),
        pokemonMoveArray: pokemonService.getMoves(data.moves),
      })
    );

    // Asignamos un tipo de Sprite dependiendo de si es el jugador o el rival
    if (player) {
      pokemonImg =
        data.sprites.versions['generation-v']['black-white'].animated
          .back_default;
    } else {
      pokemonImg =
        data.sprites.versions['generation-v']['black-white'].animated
          .front_default;
    }

    return {
      name: pokemonService.firstUppercase(data.name),
      stats: pokemonStats,
      types: pokemonTypes,
      moves: new Moves(pokemonMoveArray),
      listMoves: data.moves,
      hpLevel: 100,
      img: pokemonImg,
    };
  }
}
