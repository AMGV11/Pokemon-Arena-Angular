import { Stat } from "../interfaces/pokemon-data.interface";
import { StatsInterface } from "../interfaces/pokemon.interface";

export class Stats implements StatsInterface {
  public hp: number;
  public currentHp: number;
  public atk: number;
  public def: number;
  public spatk: number;
  public spdef: number;
  public spd: number;

  constructor(stats: Stat[]) {
    // Hacemos los calculos de las estadísticas en el constructor de la clase
    this.hp = Math.floor(stats[0].base_stat * 2 + 110);
    this.currentHp = this.hp;
    this.atk = Math.floor(stats[1].base_stat * 2 + 5);
    this.def = Math.floor(stats[2].base_stat * 2 + 5);
    this.spatk = Math.floor(stats[3].base_stat * 2 + 5);
    this.spdef = Math.floor(stats[4].base_stat * 2 + 5);
    this.spd = Math.floor(stats[5].base_stat * 2 + 5);
  }
}
