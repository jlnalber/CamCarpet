import {AfterViewInit, Component} from '@angular/core';
import {DataService} from "../data.service";
import {Vector} from "../global/calculator";

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent implements AfterViewInit {
  constructor(public readonly dataService: DataService) {
  }

  public ngAfterViewInit() {
    if (this.dataService.calc && this.dataService.calc.allePunkteBoden) {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      const daten = this.dataService.getDaten();
      const factor = 20;
      canvas.width = Math.abs(daten.rechts - daten.links) * factor;
      canvas.height = Math.abs(daten.oben - daten.unten) * factor;

      console.log()

      const rtx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const vecToPoint = (vec: Vector): {
        x: number,
        y: number
      } => {
        return {
          x: (vec.x - daten.links) * factor,
          y: (daten.oben - vec.y) * factor
        }
      }

      for (let p of this.dataService.calc.allePunkteBoden) {
        const point = vecToPoint(p);

        rtx.beginPath();
        rtx.arc(point.x, point.y, 2, 0, 2 * Math.PI, false);
        rtx.fillStyle = 'green';
        rtx.fill();
        rtx.lineWidth = 5;
        rtx.strokeStyle = '#003300';
        rtx.stroke();
      }
    }
  }
}
