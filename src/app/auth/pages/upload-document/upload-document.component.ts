import { Component, ElementRef, inject, ViewChild } from '@angular/core';
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
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
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
  private alert = inject(AlertService);
  @ViewChild('emiratesIdInput') emiratesIdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uaeVisaInput') uaeVisaInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dldCertInput') dldCertInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadedSection') uploadedSection!: ElementRef;

  uploadedFiles: any = { emiratesId: null, uaeVisa: null, dldCert: null };
  uploadedList: any[] = [];
  showUploadedSection = false;

  constructor(private router: Router, private authService: AuthService) {
    if (
      !this.authService.signupData ||
      Object.keys(this.authService.signupData).length < 1
    ) {
      this.router.navigate(['/auth/new-user']);
      return;
    }
  }
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 KB';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    const value = bytes / Math.pow(1024, i);

    return `${value.toFixed(2)} ${sizes[i]}`;
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // return pure base64 without prefix
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }

  async onFileSelect(event: any, type: string) {
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

    const base64 = await this.fileToBase64(file);

    const fileInfo = {
      type,
      name: file.name,
      size: this.formatFileSize(file.size),
      file,
      base64,
    };

    const index = this.uploadedList.findIndex((f) => f.type === type);
    if (index !== -1) this.uploadedList[index] = fileInfo;
    else this.uploadedList.push(fileInfo);

    console.log('Uploaded Files List: ', this.uploadedList);
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

  onLogin() {
    const isBase64AvailabeForAll = this.uploadedList.every((f) => f.base64);
    if (!isBase64AvailabeForAll) {
      this.alert.info(
        'Please upload all required documents before proceeding.'
      );
      return;
    }

    const getDocumentBase64 = (type: string): string => {
      const file = this.uploadedList.find((f) => f.type === type);
      return file ? file.base64 : '';
    };

    const userTypes: any = {
      owner: 'OWNER',
      'property-manager': 'PROPERTY_MANAGER',
      tenant: 'TENANT',
    };

    const data = this.authService.signupData;

    const selctedUsertype = userTypes[data['user_type']] || 'OWNER';

    const paylod: Record<string, any> = {
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirmPassword'],
      mobile_number: data['Contact_Number'],
      user_type: selctedUsertype,
      emirate_id: data['emirate_id'],
      uae_residence_visa: data['residenceVisa'],
      trade_license_number: data['tradeLicense'],
      emirates_id_doc: getDocumentBase64('emiratesId'),
      uae_residence_visa_doc: getDocumentBase64('uaeVisa'),
      dld_certificate_doc: getDocumentBase64('dldCert'),
    };

    if (selctedUsertype === 'PROPERTY_MANAGER') {
      paylod['company_name'] = data['company_name'];
      paylod['company_emirate_id'] = data['company_emirate_id'];
    } else if (selctedUsertype === 'TENANT') {
      paylod['first_name'] = data['first_name'];
      paylod['last_name'] = data['last_name'];
      paylod['emirate_id'] = data['emirate_id'];
      paylod['manage_through'] = data['manageThrough'];
    } else if (selctedUsertype === 'OWNER') {
      paylod['first_name'] = data['first_name'];
      paylod['last_name'] = data['last_name'];
      paylod['emirate_id'] = data['emirateId'];
      paylod['manage_through'] = data['manageThrough'];
    }

    this.authService.signUp(paylod).subscribe({
      next: (resp: any) => {
        this.alert.success(resp?.message || 'Signup successful');
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
