import { Move, MovesInterface } from "../interfaces/moves.interface";

export class Moves implements MovesInterface {
  move1: Move;
  move2: Move;
  move3: Move;
  move4: Move;

  constructor(moves: Move[]) {
    this.move1 = moves[0];
    this.move2 = moves[1];
    this.move3 = moves[2];
    this.move4 = moves[3];
  }
}
