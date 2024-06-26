import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {InputComponent} from "./input/input.component";
import {SizeComponent} from "./size/size.component";
import {DataService} from "./data.service";
import {DrawerComponent} from "./drawer/drawer.component";
import {PointViewComponent} from "./point-view/point-view.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InputComponent, SizeComponent, DrawerComponent, PointViewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(public readonly dataService: DataService) {
  }
}
