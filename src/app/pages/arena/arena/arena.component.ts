import { Component, computed, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import PokemonService from '@/src/app/services/pokemon.service';

import { Pokemon } from '@/src/app/models/pokemon.model';
import { Moves } from '@/src/app/models/moves.model';
import { PokemonMapper } from '@/src/app/mapper/pokemon.mapper';
import { Move } from '@/src/app/interfaces/moves.interface';
import CombatService from '@/src/app/services/combat.service';
import { environment } from '@/src/environments/environment';

// Definición de variables y constantes
const isPlayer: boolean = true;
const disableButtons: boolean = true;

const damageAnimationTime: number = 2000;
const finalConditionDelay: number = 1500;
const overlayFadeTime: number = 1000;
const combatAnimationTime: number = 1000;
const initialDelay: number = 200;
const normalEffectiveness: number = 1;

const fullHp = 100;
const baseHpStat = 100;

enum HpLevelColor {
  RED = 25,
  GREEN = 50,
}

enum AnimationType {
  ATTACK = 'attack',
  DEFENSE = 'defense',
  FAINT = 'faint',
  NOTHING = 'nothing',
}

@Component({
  selector: 'app-arena',
  imports: [],
  templateUrl: './arena.component.html',
  styleUrl: './arena.component.css',
})
export class ArenaComponent {
  constructor(
    public router: Router,
    public pokemonService: PokemonService,
    public combatService: CombatService
  ) {}

  animation: typeof AnimationType = AnimationType;
  hpLevelColor: typeof HpLevelColor = HpLevelColor;

  // Declaración de señales
  rivalPokemon = signal<Pokemon | null>(null);
  playerPokemon = signal<Pokemon | null>(null);
  playerAnimation = signal<AnimationType>(AnimationType.NOTHING);
  rivalAnimation = signal<AnimationType>(AnimationType.NOTHING);

  movesHtml = signal<string[]>([]);

  loadFlag = signal<boolean>(true); // Flag para saber cuando se ha terminado de cargar los pokemon
  showModal = signal<boolean>(false);

  rivalHpLevel = computed<number>(() => {
    if (this.rivalPokemon()?.hpLevel != undefined) {
      const hpLevel: number = this.rivalPokemon()?.hpLevel!;
      return hpLevel;
    } else {
      return fullHp;
    }
  });

  playerHpLevel = computed<number>(() => {
    if (this.playerPokemon()?.hpLevel != undefined) {
      const hpLevel: number = this.playerPokemon()?.hpLevel!;
      return hpLevel;
    } else {
      return fullHp;
    }
  });

  async ngOnInit() {
    await this.loadPokemon();
    await delay(initialDelay);
    this.loadFlag.set(false);
  }

  /**
   * Función encargada de la descarga y carga de datos para los Pokemon
   */
  async loadPokemon() {
    try {
      const [ramdonPokemonRival, ramdonPokemonPlayer] = getRamdonPokemonNums();

      // Cargar ambos Pokemon al mismo tiempo
      const { rival, player } = await firstValueFrom(
        forkJoin({
          rival: this.pokemonService.getPokemonData(ramdonPokemonRival),
          player: this.pokemonService.getPokemonData(ramdonPokemonPlayer),
        })
      );

      if (
        !this.pokemonService.checkValidMoves(
          rival.moves.length,
          player.moves.length
        )
      ) {
        this.loadPokemon();
      } else {
        const rivalPokemon = await PokemonMapper.mapDataToPokemon(
          rival,
          !isPlayer,
          this.pokemonService
        );
        const playerPokemon = await PokemonMapper.mapDataToPokemon(
          player,
          isPlayer,
          this.pokemonService
        );

        this.setMovesNamesHtml(playerPokemon.moves);

        // Actualizar estado
        this.rivalPokemon.set(rivalPokemon);
        this.playerPokemon.set(playerPokemon);

        this.pokemonService.changeTextMenu(
          `What will ${this.playerPokemon()?.name} do?`,
          disableButtons
        );
      }
    } catch (error) {
      console.error('Error:', error);
      this.loadFlag.set(true);
    }
  }

  setMovesNamesHtml(moves: Moves) {
    this.movesHtml.set([
      this.pokemonService.firstUppercase(moves.move1.name),
      this.pokemonService.firstUppercase(moves.move2.name),
      this.pokemonService.firstUppercase(moves.move3.name),
      this.pokemonService.firstUppercase(moves.move4.name),
    ]);
  }

  //-------------------------------Combate---------------------------------

  async battleTurns(
    playerPokemon: Pokemon,
    rivalPokemon: Pokemon,
    signalPlayerPokemon: WritableSignal<Pokemon | null>,
    signalRivalPokemon: WritableSignal<Pokemon | null>,
    playerMove: Move
  ) {
    // Declaración de variables
    let firstPokemon: Pokemon;
    let signalFirstPokemon: WritableSignal<Pokemon | null>;
    let lastPokemon: Pokemon;
    let signalLastPokemon: WritableSignal<Pokemon | null>;
    let firstMove: Move;
    let lastMove: Move;
    let damage: number;
    let finalCondition: boolean;

    //rivalPokemon.stats.currentHp = 1; // Para probar final del combate

    this.pokemonService.setMovesHidden();

    // Comparamos las velocidades entre los Pokemon y hacemos la selección de turnos
    if (playerPokemon.stats.spd > rivalPokemon.stats.spd) {
      firstPokemon = playerPokemon;
      signalFirstPokemon = signalPlayerPokemon;
      lastPokemon = rivalPokemon;
      signalLastPokemon = signalRivalPokemon;
      firstMove = playerMove;
      lastMove = this.combatService.getRamdonMove(rivalPokemon);
    } else {
      firstPokemon = rivalPokemon;
      signalFirstPokemon = signalRivalPokemon;
      lastPokemon = playerPokemon;
      signalLastPokemon = signalPlayerPokemon;
      firstMove = this.combatService.getRamdonMove(rivalPokemon);
      lastMove = playerMove;
    }

    // Golpea el Pokemon más rápido
    this.pokemonService.changeTextMenu(
      `${firstPokemon.name} used ${this.pokemonService.firstUppercase(
        firstMove.name
      )}!`,
      !disableButtons
    );

    this.attackAnimation(firstPokemon, playerPokemon);
    await delay(combatAnimationTime);
    this.defenseAnimation(lastPokemon, playerPokemon);

    damage = this.combatService.calculateDamage(
      firstPokemon,
      lastPokemon,
      firstMove
    );

    finalCondition = this.changeOfHp(lastPokemon, signalLastPokemon, damage);
    this.pokemonService.effectivenessCheck();

    if (finalCondition) {
      await delay(damageAnimationTime);
      this.battleFinal(signalLastPokemon);
      this.faintAnimation(lastPokemon, playerPokemon);
      await delay(finalConditionDelay);
      this.showModal.set(true);

      return;
    }

    await delay(damageAnimationTime);

    // Golpea el Pokemon más lento
    this.pokemonService.changeTextMenu(
      `${lastPokemon.name} used ${this.pokemonService.firstUppercase(
        lastMove.name
      )}!`,
      !disableButtons
    );

    this.attackAnimation(lastPokemon, playerPokemon);
    await delay(combatAnimationTime);
    this.defenseAnimation(firstPokemon, playerPokemon);

    damage = this.combatService.calculateDamage(
      lastPokemon,
      firstPokemon,
      lastMove
    );

    finalCondition = this.changeOfHp(firstPokemon, signalFirstPokemon, damage);
    this.pokemonService.effectivenessCheck();

    if (finalCondition) {
      await delay(damageAnimationTime);
      this.battleFinal(signalFirstPokemon);
      this.faintAnimation(firstPokemon, playerPokemon);
      await delay(finalConditionDelay);
      this.showModal.set(true);

      return;
    }

    await delay(damageAnimationTime);

    //Volvemos al estado de selección de movimientos
    this.resetAnimations();
    this.pokemonService.changeTextMenu(`What will ${playerPokemon.name} do?`, disableButtons);
    this.pokemonService.setMovesVisible();
  }

  // Función para cambiar el componente de la barra de HP y su HP actual
  changeOfHp(
    pokemon: Pokemon,
    signalPokemon: WritableSignal<Pokemon | null>,
    damage: number
  ): boolean {
    const currentHp = pokemon.stats.currentHp;
    const maxHp = pokemon.stats.hp;
    let newHpLevel: number;
    let newCurrentHp: number = currentHp - damage;

    console.log('Recibe daño Pokemon: ' + pokemon.name);

    if (newCurrentHp <= 0) {
      newHpLevel = 0;
      newCurrentHp = 0;
      this.combatService.updateHp(signalPokemon, newHpLevel, newCurrentHp);
      return true;
    } else {
      newHpLevel = (newCurrentHp / maxHp) * baseHpStat;
      this.combatService.updateHp(signalPokemon, newHpLevel, newCurrentHp);
      return false;
    }
  }

  useMoves(numberMove: number) {
    let playerMove: Move | undefined;
    const playerPokemon = this.playerPokemon();
    const rivalPokemon = this.rivalPokemon();
    if (playerPokemon && rivalPokemon) {
      switch (numberMove) {
        case 1:
          playerMove = this.playerPokemon()?.moves.move1;
          break;

        case 2:
          playerMove = this.playerPokemon()?.moves.move2;
          break;

        case 3:
          playerMove = this.playerPokemon()?.moves.move3;
          break;

        case 4:
          playerMove = this.playerPokemon()?.moves.move4;
          break;
      }

      if (playerMove) {
        this.battleTurns(
          playerPokemon,
          rivalPokemon,
          this.playerPokemon,
          this.rivalPokemon,
          playerMove
        );
      } else {
        console.error('Fail in reading the Pokemon and moves.');
      }
    }
  }
  // Función para la secuencia final del combate
  battleFinal(pokemon: WritableSignal<Pokemon | null>) {
    this.pokemonService.setMovesHidden();

    if (pokemon === this.playerPokemon) {
      this.pokemonService.changeTextMenu('You lose!', !disableButtons);
    } else {
      this.pokemonService.changeTextMenu('You win!', !disableButtons);
    }
  }

  /**
   * Resetea y orquesta la nueva carga del juego al pulsar "Retry"
   */
  async retrySequence() {
    this.loadFlag.set(true);

    await delay(overlayFadeTime);
    await this.loadPokemon();
    await delay(overlayFadeTime);

    this.resetAnimations();
    this.pokemonService.setMovesVisible();
    this.showModal.set(false);
    this.loadFlag.set(false);
  }

  /**
   * Animacion para el pokemon que ataca
   * @param attackingPokemon
   * @param playerPokemon
   */
  attackAnimation(attackingPokemon: Pokemon, playerPokemon: Pokemon) {
    if (attackingPokemon === playerPokemon) {
      this.playerAnimation.set(AnimationType.ATTACK);
    } else {
      this.rivalAnimation.set(AnimationType.ATTACK);
    }
  }

  /**
   * Animacion para el pokemon que se defiende
   * @param defendingPokemon
   * @param playerPokemon
   */
  defenseAnimation(defendingPokemon: Pokemon, playerPokemon: Pokemon) {
    if (defendingPokemon === playerPokemon) {
      this.playerAnimation.set(AnimationType.DEFENSE);
    } else {
      this.rivalAnimation.set(AnimationType.DEFENSE);
    }
  }

  /**
   * Animacion para el pokemon que se debilita
   * @param faintingPokemon
   * @param playerPokemon
   */
  faintAnimation(faintingPokemon: Pokemon, playerPokemon: Pokemon) {
    if (faintingPokemon === playerPokemon) {
      this.playerAnimation.set(AnimationType.FAINT);
    } else {
      this.rivalAnimation.set(AnimationType.FAINT);
    }
  }

  /**
   * Función encargada de resetear las animaciones
   */
  resetAnimations() {
    this.playerAnimation.set(AnimationType.NOTHING);
    this.rivalAnimation.set(AnimationType.NOTHING);
  }


}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRamdonPokemonNums() {
  let ramdonNumRival = ramdonPokemonNumber();
  let ramdonNumPlayer = ramdonPokemonNumber();

  if (ramdonNumRival === ramdonNumPlayer) {
    if (ramdonNumPlayer < environment.numPokemonMax) {
      ramdonNumPlayer += 1;
    } else {
      ramdonNumPlayer -= 1;
    }
  }

  return [ramdonNumRival, ramdonNumPlayer];
}

/**
 * Devuelve un número aleatorio dentro de los límites de la Pokedex
 * @returns Número aleatorio
 */
function ramdonPokemonNumber(): number {
  return Math.floor(Math.random() * environment.numPokemonMax + 1);
}
