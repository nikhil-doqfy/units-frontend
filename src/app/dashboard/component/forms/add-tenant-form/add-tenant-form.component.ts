import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalFormCardComponent } from "../../modal-form-card/modal-form-card.component";
import { CustomSelectComponent } from "../../custom-select/custom-select.component";
import { UploadIconComponent } from "../../icons/upload-icon/upload-icon.component";

@Component({
  selector: 'app-add-tenant-form',
  standalone: true,
  imports: [CommonModule, ModalFormCardComponent, CustomSelectComponent, UploadIconComponent],
  templateUrl: './add-tenant-form.component.html',
  styleUrl: './add-tenant-form.component.css'
})

export class AddTenantFormComponent {
  userImage: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedType: string = '';

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      const allowedTypes = ['image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PNG and JPG images are allowed.');
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.userImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onOptionSelected(option: string) {
    this.selectedType = option;
  }
}

