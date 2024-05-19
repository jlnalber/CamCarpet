import { Component } from '@angular/core';
import {DataService} from "../data.service";

@Component({
  selector: 'app-point-view',
  standalone: true,
  imports: [],
  templateUrl: './point-view.component.html',
  styleUrl: './point-view.component.css'
})
export class PointViewComponent {
  constructor(public readonly dataService: DataService) {

  }

  public getPoints() {
    return this.dataService.calc?.allePunkteBoden?.slice().sort((a, b) => {
      return a.x - b.x
    }) ?? [];
  }

  public getEintraege(): Eintraege[] {
    const res: Eintraege[] = [];
    const points = this.getPoints();
    for (let i = 0; i < points.length; i++) {
      res.push({
        nummer: `Nummer ${i + 1}`,
        x: this.convertVariable(points[i].x),
        y: this.convertVariable(points[i].y),
        z: this.convertVariable(points[i].z),
        vorne: points[i].vorne ? 'vorne' : 'hinten'
      })
    }

    return res;
  }

  public convertVariable(n: number): number {
    return Math.floor(n * 10e3) / 10e3;
  }

  public exportieren() {
    let str = '';

    for (let e of this.getEintraege()) {
      str += `${e.nummer},\t x: ${e.x},\t y: ${e.y},\t z: ${e.z},\t ${e.vorne}\n`
    }

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(str);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Punkte.txt");
    dlAnchorElem.click();
  }
}

interface Eintraege {
  nummer: string,
  x: number,
  y: number,
  z: number,
  vorne: string
}
