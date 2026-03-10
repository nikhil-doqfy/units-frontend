import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';

@Component({
  selector: 'app-basicpersonal',
  standalone: true,
  imports: [ReactiveFormsModule, WhiteCardComponent, CustomSelectComponent],
  templateUrl: './basicpersonal.component.html',
  styleUrl: './basicpersonal.component.css',
})
export class BasicpersonalComponent {
  @Input() form!: FormGroup;
}
