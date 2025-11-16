import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthTitleComponent } from '../../component/auth-title/auth-title.component';
import { AuthFormComponent } from '../../component/auth-form/auth-form.component';
import { CommonModule } from '@angular/common';
import { NewUserLinkComponent } from '../../component/new-user-link/new-user-link.component';
import { Router } from '@angular/router';
import { ArrowIconComponent } from '../../../icon/arrow-icon/arrow-icon.component';
import { IdentityIconComponent } from '../../../icon/identity-icon/identity-icon.component';
import { CloudIconComponent } from '../../../icon/cloud-icon/cloud-icon.component';
import { VerifyIconEditComponent } from '../../../icon/verify-icon-edit/verify-icon-edit.component';
import { EditIconComponent } from '../../../dashboard/component/icons/edit-icon/edit-icon.component';
import { DeleteIconComponent } from '../../../dashboard/component/icons/delete-icon/delete-icon.component';
@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [
    AuthTitleComponent,
    AuthFormComponent,
    CommonModule,
    ArrowIconComponent,
    IdentityIconComponent,
    CloudIconComponent,
    VerifyIconEditComponent,
    DeleteIconComponent,
  ],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.css',
})
export class UploadDocumentComponent {
  @ViewChild('emiratesIdInput') emiratesIdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uaeVisaInput') uaeVisaInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dldCertInput') dldCertInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadedSection') uploadedSection!: ElementRef;

  uploadedFiles: any = { emiratesId: null, uaeVisa: null, dldCert: null };
  uploadedList: any[] = [];
  showUploadedSection = false;

  constructor(private router: Router) {}
  triggerFile(type: string) {
    if (type === 'emiratesId') this.emiratesIdInput.nativeElement.click();
    if (type === 'uaeVisa') this.uaeVisaInput.nativeElement.click();
    if (type === 'dldCert') this.dldCertInput.nativeElement.click();
    this.showUploadedSection = true;
  }

  goToResetPassword(): void {
    this.router.navigate(['/auth/validation'], {});
  }
  back() {
    this.router.navigate(['/auth/validation']);
  }
  onFileSelect(event: any, type: string) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF or PNG files are allowed.');
      return;
    }

    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB.');
      return;
    }

    this.uploadedFiles[type] = file;

    const fileInfo = {
      type,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
    };

    const index = this.uploadedList.findIndex((f) => f.type === type);
    if (index !== -1) this.uploadedList[index] = fileInfo;
    else this.uploadedList.push(fileInfo);

    setTimeout(() => {
      this.uploadedSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  editFile(file: any) {
    this.triggerFile(file.type);
  }

  deleteFile(file: any) {
    this.uploadedFiles[file.type] = null;

    this.uploadedList = this.uploadedList.filter((f) => f.type !== file.type);
  }

  isUploaded(type: string): boolean {
    return !!this.uploadedFiles[type];
  }
}
