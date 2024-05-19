import { Component } from '@angular/core';
import {DataService} from "../data.service";

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  constructor(public readonly dataService: DataService) { }
}
