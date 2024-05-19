import {Daten} from "../data.service";

export class Calculator {
  constructor(private readonly daten: Daten) {
  }

  private allePunkteInKaestchen: Punkt[] | undefined;
  private allePunkte3D: Vector[] | undefined;
  public allePunkteBoden: Vector[] | undefined;

  public calculate() {
    this.calculateAllePunkteInKaestchen();
    this.calculateAllePunkte3D();
    this.calculateAllePunkteBoden();
  }

  private calculateAllePunkteInKaestchen() {
    const f = (x: number, y: number): [boolean, boolean, boolean, boolean] => {
      const res: [boolean, boolean, boolean, boolean] = [false, false, false, false]; // Gegenuhrzeigersinn
      if (x < this.daten.fields[0].length && y > 0 && this.daten.fields[y - 1][x]) {
        res[0] = true;
      }
      if (x > 0 && y > 0 && this.daten.fields[y - 1][x - 1]) {
        res[1] = true;
      }
      if (x > 0 && y < this.daten.fields.length && this.daten.fields[y][x - 1]) {
        res[2] = true;
      }
      if (x < this.daten.fields[0].length && y < this.daten.fields.length && this.daten.fields[y][x]) {
        res[3] = true;
      }
      return res;
    }

    this.allePunkteInKaestchen = [];

    for (let y = 0; y <= this.daten.fields.length; y++) {
      for (let x = 0; x <= this.daten.fields[0].length; x++) {
        const r = f(x, y);
        const count = r.filter(b => b).length;
        if (count === 1 || count === 3 || (count === 2 && r[0] === r[2])) {
          this.allePunkteInKaestchen.push({
            x,
            y
          })
        }
      }
    }

    console.log(this.allePunkteInKaestchen);
  }

  private calculateAllePunkte3D() {
    if (this.allePunkteInKaestchen) {
      this.allePunkte3D = [];

      // Annahme: Eher die Breite ist das Problem, nicht die Tiefe
      const maxWidthEbene = Math.abs(this.daten.links - this.daten.rechts);
      const linkestes2DX = Math.min(...this.allePunkteInKaestchen.map(p => p.x));
      const rechtestes2DX = Math.max(...this.allePunkteInKaestchen.map(p => p.x));
      const meterProKaestchen = maxWidthEbene / (rechtestes2DX - linkestes2DX);
      const unterstes2DY = Math.max(...this.allePunkteInKaestchen.map(p => p.y)) * meterProKaestchen;
      const oberstes2DY = Math.min(...this.allePunkteInKaestchen.map(p => p.y)) * meterProKaestchen;
      const mitteHoehe2D = (unterstes2DY + oberstes2DY) / 2;
      const untersteSicht = this.daten.hoehe * this.daten.oben / this.daten.unten - this.daten.hoehe;
      const mitteHoehe3D = untersteSicht / 2;
      const dispos = mitteHoehe3D - mitteHoehe2D; // so viel muss also noch nach unten verschoben werden!

      for (let p of this.allePunkteInKaestchen) {
        const x = this.daten.links + meterProKaestchen * (p.x - linkestes2DX);
        const z = this.daten.hoehe + p.y * meterProKaestchen + dispos;
        this.allePunkte3D.push(new Vector(x, this.daten.oben, z), new Vector(x, this.daten.oben - meterProKaestchen * this.daten.tiefe, z));
      }

      console.log(this.allePunkte3D)
    }
  }

  private calculateAllePunkteBoden() {
    if (this.allePunkte3D) {
      this.allePunkteBoden = this.allePunkte3D.map(p => {
        const factor = this.daten.hoehe / p.z;
        return new Vector(p.x * factor, p.y * factor, this.daten.hoehe);
      })

      console.log(this.allePunkteBoden);
    }
  }
}

type Punkt = {
  x: number,
  y: number
}

export class Vector {
  constructor(public x: number, public y: number, public z: number) { }

  public equals(vec: Vector): boolean {
    return this.x === vec.x && this.y === vec.y && this.z === vec.z;
  }

  public skalarprodukt(vec: Vector): number {
    return this.x * vec.x + this.y * vec.y + this.z * vec.z;
  }

  public vektorprodukt(vec: Vector): Vector {
    return new Vector(
      this.y * vec.z - this.z * vec.y,
      this.z * vec.x - this.x * vec.z,
      this.x * vec.y - this.y * vec.x
    );
  }

  public abs(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public getWinkel(vec: Vector): number {
    return Math.acos(Math.abs(this.skalarprodukt(vec)) / (this.abs() * vec.abs()))
  }

  public getAnderenWinkel(vec: Vector): number {
    return Math.PI / 2 - this.getWinkel(vec);
  }
}
