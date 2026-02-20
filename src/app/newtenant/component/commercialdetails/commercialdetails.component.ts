import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-commercialdetails',
  standalone: true,
  imports: [],
  templateUrl: './commercialdetails.component.html',
  styleUrl: './commercialdetails.component.css',
})
export class CommercialdetailsComponent {
  @Input() form!: FormGroup;
}
