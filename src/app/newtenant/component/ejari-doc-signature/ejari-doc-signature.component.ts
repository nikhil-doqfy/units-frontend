import { Component, Input } from '@angular/core';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ejari-doc-signature',
  standalone: true,
  imports: [WhiteCardComponent, ReactiveFormsModule],
  templateUrl: './ejari-doc-signature.component.html',
  styleUrl: './ejari-doc-signature.component.css',
})
export class EjariDocSignatureComponent {
  @Input() form!: FormGroup;
}
