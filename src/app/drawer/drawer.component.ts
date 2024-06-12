import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DataService} from "../data.service";
import {Punkt, Vector} from "../global/calculator";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent implements AfterViewInit {

  @Input() punkte: 'nein' | 'vorne' | 'hinten' | 'beides' = 'beides';
  @Input() bloecke: boolean = true;

  @ViewChild('canv') canv?: ElementRef<HTMLCanvasElement>;

  constructor(public readonly dataService: DataService) {
    this.dataService.recalculateEvent.push(() => {
      this.draw();
    })
  }

  private _aufloesung: number = 100;
  public get aufloesung(): number {
    return this._aufloesung;
  }
  public set aufloesung(value: number) {
    this._aufloesung = value;
    //this.draw();
  }

  public zahlen: boolean = true;

  public draw() {
    if (this.canv) {
      // Get Info about canvas
      const canvas = this.canv.nativeElement;
      const factor = this.aufloesung;
      const daten = this.dataService.getDaten();
      canvas.width = Math.abs(daten.rechts - daten.links) * factor;
      canvas.height = Math.abs(daten.oben - daten.unten) * factor;
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

      // draw
      if (this.bloecke) {
        this.drawBloecke(rtx, vecToPoint);
      }
      if (this.punkte !== 'nein') {
        this.drawPoints(rtx, vecToPoint);
      }
    }
  }

  public drawBloecke(rtx: CanvasRenderingContext2D, vecToPoint: (vec: Vector) => Punkt) {
    if (this.dataService.calc && this.dataService.calc.alleBloeckeBoden) {
      const drawPolygon = (one: Vector | Punkt, two: Vector | Punkt, three: Vector | Punkt, four: Vector | Punkt, color: string): void => {
        if (one instanceof Vector) {
          one = vecToPoint(one);
        }
        if (two instanceof Vector) {
          two = vecToPoint(two);
        }
        if (three instanceof Vector) {
          three = vecToPoint(three);
        }
        if (four instanceof Vector) {
          four = vecToPoint(four);
        }

        rtx.fillStyle = color;
        rtx.beginPath();
        rtx.moveTo(one.x, one.y);
        rtx.lineTo(two.x,two.y);
        rtx.lineTo(three.x, three.y);
        rtx.lineTo(four.x, four.y);
        rtx.closePath();
        rtx.fill();
      }

      const arr = this.dataService.calc.alleBloeckeBoden.slice().sort((a, b) => {
        if (a.ovl.y < b.ovl.y) {
          return -1;
        }
        else if (a.ovl.y > b.ovl.y) {
          return 1;
        }
        else if (Math.abs(a.ovl.x) < Math.abs(b.ovl.x)) {
          return 1;
        }
        else if (Math.abs(a.ovl.x) > Math.abs(b.ovl.x)) {
          return -1;
        }
        return 0;
      })

      for (let block of arr) {
        const col = '#999'
        if (block.ovl.x < 0) {
          // Dann muss man nur rechts malen
          drawPolygon(block.ovr, block.uvr, block.uhr, block.ohr, col);
        }
        else {
          // Sonst links
          drawPolygon(block.ovl, block.ohl, block.uhl, block.uvl, col)
        }

        // Male vorne!
        drawPolygon(block.uvl, block.uvr, block.ovr, block.ovl, '#444444')

        // Male oben!
        drawPolygon(block.ovl, block.ovr, block.ohr, block.ohl, '#777777')
      }
    }
  }

  public drawPoints(rtx: CanvasRenderingContext2D, vecToPoint: (vec: Vector) => Punkt) {
    if (this.dataService.calc && this.dataService.calc.allePunkteBoden) {
      const punkte = this.dataService.calc.allePunkteBoden.slice().sort((a, b) => {
        return a.x - b.x
      });
      for (let i = 0; i < punkte.length; i++) {
        const p = punkte[i];
        const point = vecToPoint(p);
        const offset = 5;

        if (this.punkte === 'beides' || (this.punkte === 'vorne' && p.vorne) || (this.punkte === 'hinten' && !p.vorne)) {
          rtx.beginPath();
          rtx.arc(point.x, point.y, 2, 0, 2 * Math.PI, false);
          rtx.fillStyle = p.vorne ? 'green' : 'red';
          rtx.fill();
          rtx.lineWidth = 2;
          rtx.strokeStyle = 'black';
          rtx.stroke();
          if (this.zahlen) {
            rtx.fillText((i + 1).toString(), point.x + offset, point.y + offset);
          }
        }
      }
    }
  }

  public ngAfterViewInit()
  {
    this.draw();
  }
}
