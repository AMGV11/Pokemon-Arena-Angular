import { PokemonType } from './../interfaces/pokemon-type.interface';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  PokemonData,
  PokemonTypeUrl,
} from '../interfaces/pokemon-data.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/src/environments/environment';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';
import { Move } from '../interfaces/moves.interface';
import CombatService from './combat.service';

// Declaración de constantes
const minMoves: number = 4;
const textWritingSpeed: number = 20;
const disableButtons: boolean = true;
const normalEffectiveness: number = 1;


@Injectable({ providedIn: 'root' })
export default class PokemonService {
  private http = inject(HttpClient);
  private combatService = inject(CombatService);

  // Declaración de las señales
  visibleMoves = signal<boolean>(true);
  movePointerEvents = signal<string>('none');
  textMenu = signal<string>('');

  // Declaración de métodos
  getPokemonData(id: number) {
    return this.http.get<PokemonData>(`${environment.pokemonApiUrl}${id}`);
  }

  async getTypes(data: PokemonTypeUrl[]) {
    let types;

    // Comprobamos que tiene 1 o más tipos
    if (data.length > 1) {
      const dataType0: PokemonType = await firstValueFrom(
        this.http.get<PokemonType>(data[0].type.url)
      );
      const dataType1: PokemonType = await firstValueFrom(
        this.http.get<PokemonType>(data[1].type.url)
      );
      types = [dataType0, dataType1];
      return types;
    }

    const dataType0: PokemonType = await firstValueFrom(
      this.http.get<PokemonType>(data[0].type.url)
    );
    types = [dataType0];
    return types;
  }

  async getMoves(trainerMoves: any): Promise<Move[]> {
    const numMaxMove = trainerMoves.length - 1;

    // Elegimos aleatoriamente los movimientos y nos aseguramos de que no coincidan
    let numMove1 = Math.floor(Math.random() * numMaxMove);
    let numMove2 = Math.floor(Math.random() * numMaxMove);

    if (numMove1 === numMove2) {
      numMove2 = this.changeNumber(numMove2, numMaxMove);
    }

    let numMove3 = Math.floor(Math.random() * numMaxMove);
    while (numMove3 === numMove2 || numMove3 === numMove1) {
      numMove3 = this.changeNumber(numMove3, numMaxMove);
    }

    let numMove4 = Math.floor(Math.random() * numMaxMove);
    while (
      numMove4 === numMove2 ||
      numMove4 === numMove1 ||
      numMove4 === numMove3
    ) {
      numMove4 = this.changeNumber(numMove4, numMaxMove);
    }

    const { move1, move2, move3, move4 } = await firstValueFrom(
      forkJoin({
        move1: this.http.get<Move>(trainerMoves[numMove1].move.url),
        move2: this.http.get<Move>(trainerMoves[numMove2].move.url),
        move3: this.http.get<Move>(trainerMoves[numMove3].move.url),
        move4: this.http.get<Move>(trainerMoves[numMove4].move.url),
      })
    );

    // Procesar los resultados
    const moves: Move[] = [move1, move2, move3, move4];

    return moves;
  }

  // ------------------------------ Auxiliar -----------------------------------
  firstUppercase(text: string | undefined) {
    if (text === undefined) {
      return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  checkValidMoves(totalMovesRival: number, totalMovesPlayer: number): boolean {
    if (totalMovesRival - 1 < minMoves || totalMovesPlayer - 1 < minMoves) {
      return false;
    } else {
      return true;
    }
  }

  changeNumber(num: number, max: number) {
    if (num < max) {
      return num + 1;
    } else {
      return num - 1;
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  checkDiferentNum(
    ramdonNumRival: WritableSignal<number>,
    ramdonNumTrainer: WritableSignal<number>
  ) {
    if (ramdonNumRival() === ramdonNumTrainer()) {
      if (ramdonNumTrainer() < environment.numPokemonMax) {
        ramdonNumTrainer.update((current) => current + 1);
      } else {
        ramdonNumTrainer.update((current) => current - 1);
      }
    }
  }

  /**
   * Devuelve un número aleatorio dentro de los límites de la Pokedex
   * @returns Número aleatorio
   */
  ramdonPokemonNumber(): number {
    return Math.floor(Math.random() * environment.numPokemonMax + 1);
  }

    /**
   * Función para cambiar el texto del dialogo y poder inutilizar los botones mientras se escribe el texto
   * @param text
   * @param disableButtons Si es true, los botones se deshabilitan.
   */
  changeTextMenu(text: string, disableButtons: boolean) {
    this.movePointerEvents.set('none');
    this.textMenu.set('');
    let i = 0;

    const intervalo = setInterval(() => {
      if (i < text.length) {
        this.textMenu.update((current) => current + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalo);
        if (disableButtons) this.movePointerEvents.set('auto');
      }
    }, textWritingSpeed);

    setTimeout(() => {}, text.length * textWritingSpeed);
  }

    /**
   * Cambia las señales responsables de los movimientos para esconderlos e inhabilitarlos
   */
  setMovesHidden() {
    this.visibleMoves.set(false);
    this.movePointerEvents.set('none');
  }

  /**
   * Cambia la señal responsable de que los movimientos sean visibles
   */
  setMovesVisible() {
    this.visibleMoves.set(true);
  }

  /**
   * Muestra por pantalla si el momento es más o menos eficaz
   */
  effectivenessCheck() {
    const effectiveness: number = this.combatService.getEffectiveness();
    if (effectiveness === normalEffectiveness) {
    } else if (effectiveness < normalEffectiveness) {
      this.changeTextMenu("It's not very effective...", !disableButtons);
    } else {
      this.changeTextMenu("It's super effective!", !disableButtons);
    }
  }
}
