import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {DataService} from "../data.service";

@Component({
  selector: 'app-size',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './size.component.html',
  styleUrl: './size.component.css'
})
export class SizeComponent {
  constructor(public readonly dataService: DataService) {
  }
}
