import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-form-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomSelectComponent],
  templateUrl: './form-select-field.component.html',
  styleUrl: './form-select-field.component.css',
})
export class FormSelectFieldComponent {
  private formService = inject(FormService);

  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() options: any[] = [];
  @Input() key: string = 'key';
  @Input() value: string = 'value';
  @Input() placeholder: string = 'Select';
  @Input() showFilterInput: boolean = true;
  /** When true, binds formControlName on the inner select (CVA mode). Default false = validation-only mode. */
  @Input() bindToControl: boolean = false;
  @Input() form!: FormGroup;
  @Input() controlName: string = '';
  @Output() optionSelected = new EventEmitter<any>();

  get errorState() {
    if (!this.form || !this.controlName) return { status: false, msg: '' };
    return this.formService.isInvalid(this.form, this.controlName);
  }
}
