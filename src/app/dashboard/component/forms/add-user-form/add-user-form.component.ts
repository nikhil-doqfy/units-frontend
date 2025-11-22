import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalFormCardComponent } from '../../modal-form-card/modal-form-card.component';
import { CustomSelectComponent } from '../../custom-select/custom-select.component';
import { EmailIconComponent } from '../../../../auth/component/icons/email-icon/email-icon.component';
import { PasswordShowIconComponent } from '../../../../auth/component/icons/password-show-icon/password-show-icon.component';
import { PasswordHideIconComponent } from '../../../../auth/component/icons/password-hide-icon/password-hide-icon.component';
import { UploadBigIconComponent } from '../../icons/upload-big-icon/upload-big-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-user-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ModalFormCardComponent,
    CustomSelectComponent,
    EmailIconComponent,
    PasswordShowIconComponent,
    PasswordHideIconComponent,
    UploadBigIconComponent,
  ],
  templateUrl: './add-user-form.component.html',
  styleUrl: './add-user-form.component.css',
})
export class AddUserFormComponent {
  userImage: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedType: string = '';
  hidePassword = false;
  hideConfirmPassword = false;

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

  togglePasswordHidden(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordHidden(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
