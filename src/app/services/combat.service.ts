import { Injectable, signal, WritableSignal } from '@angular/core';
import { PokemonInterface } from '../interfaces/pokemon.interface';
import { Pokemon } from '../models/pokemon.model';
import { Move } from '../interfaces/moves.interface';
import { PokemonType } from '../interfaces/pokemon-type.interface';

@Injectable({ providedIn: 'root' })
export default class CombatService {
  effectivenessBonuses: number = 0;
  loadFlag = signal<boolean>(false);

  getRamdonMove(pokemon: PokemonInterface) {
    const ramdonNumber = Math.floor(Math.random() * 4 + 1);

    switch (ramdonNumber) {
      case 1:
        return pokemon.moves.move1;
      case 2:
        return pokemon.moves.move2;
      case 3:
        return pokemon.moves.move3;
      case 4:
        return pokemon.moves.move4;
    }

    // Si por error se salta el selector
    return pokemon.moves.move1;
  }

  // Función para calcular el daño
  calculateDamage(
    attackerPokemon: PokemonInterface,
    defenderPokemon: PokemonInterface,
    move: Move
  ) {
    // Constantes y variables
    const moveType = move.damage_class.name; // Tipo del movimiento (Fisico o especial)
    let atackerStat;
    let defenderStat;

    // Si el movimiento no hace daño, hara 30 por ahora
    if (move.power === null) return 30;

    // Cambiamos las estadisticas dependiendo del tipo de ataque
    if (moveType === 'special') {
      atackerStat = attackerPokemon.stats.spatk;
      defenderStat = defenderPokemon.stats.spdef;
    } else {
      atackerStat = attackerPokemon.stats.atk;
      defenderStat = defenderPokemon.stats.def;
    }

    this.effectivenessBonuses = this.getAtackMultiplier(
      move.type.name,
      defenderPokemon
    ); // Cambia dependiendo de la efectividad entre tipos
    console.log('Attacker Pokemon: ' + attackerPokemon.name);

    console.log('Effectiveness: ' + this.effectivenessBonuses);

    // Calculo del daño
    if (this.effectivenessBonuses === 0) {
      return 0;
    }

    const attackRatio = atackerStat / defenderStat;
    const rawDamage =
      (1 * attackRatio * move.power! * this.effectivenessBonuses) / 2 + 1;

    console.log('Raw damage: ' + rawDamage);

    return Math.floor(rawDamage);
  }

  // Función para calcular la efectividad del ataque
  getAtackMultiplier(moveType: string, defPokemon: PokemonInterface) {
    let multiplier = 1;
    defPokemon.types.forEach((type) => {
      type.damage_relations.double_damage_from.forEach((resistance) => {
        if (resistance.name === moveType) {
          multiplier *= 2;
        }
      });

      type.damage_relations.half_damage_from.forEach((resistance) => {
        if (resistance.name === moveType) {
          multiplier /= 2;
        }
      });

      type.damage_relations.no_damage_from.forEach((resistance) => {
        if (resistance.name === moveType) {
          multiplier = 0;
        }
      });
    });
    return multiplier;
  }

  updateHp(
    signal: WritableSignal<Pokemon | null>,
    newHpLevel: number,
    newCurrentHp: number
  ) {
    signal.update((current) => {
      if (!current) return null;

      return {
        ...current,
        hpLevel: newHpLevel,
        stats: {
          ...current.stats,
          currentHp: newCurrentHp,
        },
      };
    });
  }

  getEffectiveness() {
    return this.effectivenessBonuses;
  }
}
