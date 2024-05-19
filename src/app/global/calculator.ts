import {Daten} from "../data.service";

export class Calculator {
  constructor(private readonly daten: Daten, private readonly fields: boolean[][]) {
  }

  private allePunkteInKaestchen: Punkt[] | undefined;
  private alleBloecke3D: Block[] | undefined;
  private allePunkte3D: Vector[] | undefined;
  public alleBloeckeBoden: Block[] | undefined;
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

    //console.log(this.allePunkteInKaestchen);
  }

  private calculateAllePunkte3D() {
    if (this.allePunkteInKaestchen) {
      this.allePunkte3D = [];
      this.alleBloecke3D = [];

      // Berechne zuerst die maximalen Meter pro Kästchen, wenn es nur um die Breite ginge!
      const maxWidthEbene = Math.abs(this.daten.links - this.daten.rechts);
      const linkestes2DX = Math.min(...this.allePunkteInKaestchen.map(p => p.x));
      const rechtestes2DX = Math.max(...this.allePunkteInKaestchen.map(p => p.x));
      const meterProKaestchenBreite = maxWidthEbene / (rechtestes2DX - linkestes2DX);

      // Berechne nun die maximalen Meter pro Kästchen, wenn es nur um die Höhe ginge!
      const unterstes2DY = Math.max(...this.allePunkteInKaestchen.map(p => p.y));
      const oberstes2DY = Math.min(...this.allePunkteInKaestchen.map(p => p.y));
      const o = this.daten.oben;
      const u = this.daten.unten;
      const h = this.daten.hoehe;
      const b = this.daten.tiefe;
      const n = unterstes2DY - oberstes2DY;
      const meterProKaestchenHoehe = (h*(o/u - 1)) / (h*b/u+n);

      // Nehme das Minimum der beiden!
      const meterProKaestchen = Math.min(meterProKaestchenBreite, meterProKaestchenHoehe);

      // Berechne entsprechend die Verschiebung
      // Die Höhe also z muss verschoben werden!
      const actualHeight = meterProKaestchen * n;
      const heightWhenHoehe = meterProKaestchenHoehe * n;
      const dZ = (heightWhenHoehe - actualHeight) / 3;
      const disposZ = dZ - oberstes2DY * meterProKaestchen + h; // Um Höhe nach unten und dZ Verschiebung + oberstes Kästchen sollte ganz oben am Rand liegen!

      // Die Höhe also z muss verschoben werden!
      const nBreite = rechtestes2DX - linkestes2DX;
      const actualWidth = meterProKaestchen * nBreite;
      const widthWhenBreite = meterProKaestchenBreite * nBreite;
      const dX = (widthWhenBreite - actualWidth) / 2;
      const disposX = dX - linkestes2DX * meterProKaestchen + this.daten.links; // Um Höhe nach unten und dZ Verschiebung + oberstes Kästchen sollte ganz oben am Rand liegen!

      /*const mitteHoehe2D = (unterstes2DY + oberstes2DY) / 2 * meterProKaestchen;
      const untersteSicht = this.daten.hoehe * this.daten.oben / this.daten.unten - this.daten.hoehe;
      const mitteHoehe3D = untersteSicht / 2;
      const dispos = mitteHoehe3D - mitteHoehe2D; // so viel muss also noch nach unten verschoben werden!*/

      const getXZToPoint = (p: Punkt): {
        x: number,
        z: number
      } => {
        return {
          x: p.x * meterProKaestchen + disposX,
          z: p.y * meterProKaestchen + disposZ
        }
      }

      const v = this.daten.oben - meterProKaestchen * this.daten.tiefe

      for (let p of this.allePunkteInKaestchen) {
        /*const x = this.daten.links + meterProKaestchen * (p.x - linkestes2DX);
        const z = this.daten.hoehe + p.y * meterProKaestchen + dispos;*/
        const res = getXZToPoint(p);
        this.allePunkte3D.push(new Vector(res.x, this.daten.oben, res.z, false), new Vector(res.x, v, res.z, true));
      }

      // Berechne alle 3D-Blöcke!
      for (let y = 0; y < this.fields.length; y++) {
        for (let x = 0; x < this.fields[y].length; x++) {
          if (this.fields[y][x]) {
            const ol = getXZToPoint({
              x, y
            })
            const or = getXZToPoint({
              x: x + 1,
              y
            })
            const ul = getXZToPoint({
              x,
              y: y + 1
            })
            const ur = getXZToPoint({
              x: x + 1,
              y: y + 1
            })

            const block: Block = {
              ovl: new Vector(ol.x, v, ol.z, true),
              ohl: new Vector(ol.x, this.daten.oben, ol.z, false),
              ovr: new Vector(or.x, v, or.z, true),
              ohr: new Vector(or.x, this.daten.oben, or.z, false),
              uvl: new Vector(ul.x, v, ul.z, true),
              uvr: new Vector(ur.x, v, ur.z, true),
              uhl: new Vector(ul.x, this.daten.oben, ul.z, false),
              uhr: new Vector(ur.x, this.daten.oben, ur.z, false)
            }

            this.alleBloecke3D.push(block);
          }
        }
      }

      //console.log(this.allePunkte3D, this.alleBloecke3D)
    }
  }

  private calculateAllePunkteBoden() {
    if (this.allePunkte3D && this.alleBloecke3D) {
      const mapVector = (p: Vector): Vector => {
        const factor = this.daten.hoehe / p.z;
        return new Vector(p.x * factor, p.y * factor, this.daten.hoehe, p.vorne);
      }

      this.allePunkteBoden = this.allePunkte3D.map(mapVector);

      this.alleBloeckeBoden = this.alleBloecke3D.map(b => {
        return {
          ovl: mapVector(b.ovl),
          ohl: mapVector(b.ohl),
          ovr: mapVector(b.ovr),
          ohr: mapVector(b.ohr),
          uvl: mapVector(b.uvl),
          uvr: mapVector(b.uvr),
          uhl: mapVector(b.uhl),
          uhr: mapVector(b.uhr)
        }
      })

      //console.log(this.allePunkteBoden);
    }
  }
}

export type Punkt = {
  x: number,
  y: number
}

export class Vector {
  constructor(public x: number, public y: number, public z: number, public vorne?: boolean | undefined) { }

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

export type Block = {
  ovl: Vector,
  ohl: Vector,
  ovr: Vector,
  ohr: Vector,
  uvl: Vector,
  uvr: Vector,
  uhl: Vector,
  uhr: Vector
}
