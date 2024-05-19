import { Injectable } from '@angular/core';
import {Calculator} from "./global/calculator";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public fields: boolean[][] = [[false]];
  public get rows(): number {
    return this.fields.length;
  }
  public get columns(): number {
    if (this.rows === 0) { return 0; }
    return this.fields[0].length;
  }
  public getFieldAt(x: number, y: number): boolean {
    return this.fields[y][x];
  }
  public setFieldAt(x: number, y: number, value: boolean): void {
    this.fields[y][x] = value;
  }
  public toggleFieldAt(x: number, y: number): void {
    this.fields[y][x] = !this.fields[y][x];
  }
  public addColumn(defaultValue: boolean = false) {
    for (let row of this.fields) {
      row.push(defaultValue);
    }
  }
  public addRow(defaultValue: boolean = false) {
    const columns = this.columns;
    const row: boolean[] = [];
    for (let i = 0; i < columns; i++) {
      row.push(defaultValue);
    }
    this.fields.push(row);
  }

  public hoehe: number = 0;
  public rechts: number = 0;
  public links: number = 0;
  public oben: number = 0;
  public unten: number = 0;
  public tiefe: number = 0;

  public calc: Calculator | undefined;
  public recalculateEvent: EventHandler = new EventHandler();

  constructor() {
    const str = localStorage[speicherort];
    if (typeof str === 'string') {
      const daten = JSON.parse(str) as Daten;
      this.setFromDaten(daten);
    }
  }

  public setFromDaten(daten: Daten) {
    this.links = daten.links;
    this.rechts = daten.rechts;
    this.oben = daten.oben;
    this.unten = daten.unten;
    this.hoehe = daten.hoehe;
    this.fields = daten.fields;
    this.tiefe = daten.tiefe;
  }

  public save() {
    const daten: Daten = this.getDaten();

    const str = JSON.stringify(daten);
    localStorage[speicherort] = str;
  }

  public getDaten(): Daten {
    return {
      hoehe: this.hoehe,
      oben: this.oben,
      unten: this.unten,
      links: this.links,
      rechts: this.rechts,
      tiefe: this.tiefe,
      fields: this.fields
    }
  }

  public reset() {
    this.hoehe = 0;
    this.oben = 0;
    this.tiefe = 0;
    this.unten = 0;
    this.links = 0;
    this.rechts = 0;
    this.fields = [[false]]
  }

  public download() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.getDaten()));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "export.json");
    dlAnchorElem.click();
  }

  public open() {
    let inp = document.getElementById('inp') as HTMLInputElement;

    if (inp.files) {
      const file = inp.files?.item(0);
      file?.text().then(t => {
        try {
          this.setFromDaten(JSON.parse(t) as Daten);
        } catch (e) {
          console.error(e);
        }
      })
    }
  }

  public berechnen() {
    this.calc = new Calculator(this.getDaten());
    this.calc.calculate();
    this.recalculateEvent.emit();
  }
}

const speicherort = 'GROSSES_GEHIRN'

export interface Daten {
  hoehe: number,
  rechts: number,
  links: number,
  oben: number,
  unten: number,
  tiefe: number,
  fields: boolean[][]
}

class EventHandler {
  private fs: (() => void)[] = [];
  public push(f: () => void) {
    this.fs.push(f);
  }
  public emit() {
    for (let f of this.fs) {
      f();
    }
  }
}
