import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { UploadIconComponent } from '../../icons/upload-icon/upload-icon.component';
import { SharedApiService } from '../../../../shared/services/shared-api.service';
import { Subject, takeUntil } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FileService } from '../../../../shared/services/file.service';
import { FormService } from '../../../../shared/services/form.service';

@Component({
  selector: 'app-add-tenant-form',
  standalone: true,
  imports: [
    CommonModule,
    ModalFormCardComponent,
    CustomSelectComponent,
    UploadIconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-tenant-form.component.html',
  styleUrl: './add-tenant-form.component.css',
})
export class AddTenantFormComponent {
  private sharedApiService = inject(SharedApiService);
  private formBuilder = inject(FormBuilder);
  private fileService = inject(FileService);
  private formService = inject(FormService);
  private destroy$ = new Subject<void>();

  tenantForm!: FormGroup;
  propertyList = [];
  isInvalid = this.formService.isInvalid;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor() {
    this.tenantForm = this.formBuilder.group({
      imageBase64: ['', [Validators.required]],
      imageFile: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      contactNumber: ['', [Validators.required]],
      emiratesID: ['', [Validators.required]],
      property: ['', [Validators.required]],
    });
    this.getOptionTypes(['OWNER_PROPERTIES']);
  }

  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.propertyList = response?.content?.owner_properties;
        },
      });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PNG, JPEG or JPG images are allowed.');
        input.value = '';
        return;
      }

      const base64 = await this.fileService.getFileToBase64(file);

      this.tenantForm.patchValue({
        imageBase64: base64,
        imageFile: file,
      });
    }
  }

  get imageBase64() {
    return this.tenantForm.get('imageBase64')?.value;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
