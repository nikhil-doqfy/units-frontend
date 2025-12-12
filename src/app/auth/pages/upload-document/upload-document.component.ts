import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
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
import { FileService } from '../../../shared/services/file.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private fileService = inject(FileService);
  private destroyRef = inject(DestroyRef);
  @ViewChild('emiratesIdInput') emiratesIdInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uaeVisaInput') uaeVisaInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dldCertInput') dldCertInput!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadedSection') uploadedSection!: ElementRef;

  uploadedFiles: any = { emiratesId: null, uaeVisa: null, dldCert: null };
  uploadedList: any[] = [];
  showUploadedSection = false;
  formatFileSize = this.fileService.formatFileSize;
  private cardElement: HTMLElement | null = null;

  constructor(private router: Router, private authService: AuthService) {
    if (
      !this.authService.signupData ||
      Object.keys(this.authService.signupData).length < 1
    ) {
      this.router.navigate(['/auth/new-user']);
      return;
    }
  }

  ngAfterViewInit() {
    const card = document.querySelector('.authFrmCol') as HTMLElement;

    if (card) {
      card.style.width = '50%';
      card.style.maxWidth = 'fit-content';
      this.cardElement = card;
    }
  }
  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.style.width = '';
      this.cardElement.style.maxWidth = '100%';
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

  getUserType(): string {
    const userTypes: any = {
      owner: 'OWNER',
      'property-manager': 'PROPERTY_MANAGER',
      tenant: 'TENANT',
    };

    const selectedUserType = localStorage.getItem('userRole') ?? 'owner';

    return userTypes[selectedUserType];
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

    const base64: string = await this.fileService.getFileToBase64(file);

    const fileInfo = {
      type,
      name: file.name,
      size: this.formatFileSize(file.size),
      file,
      base64: base64,
    };

    const index = this.uploadedList.findIndex((f) => f.type === type);
    if (index !== -1) this.uploadedList[index] = fileInfo;
    else this.uploadedList.push(fileInfo);
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
  validateRequiredDocs(): boolean {
    const requiredDocs = ['emiratesId', 'uaeVisa', 'dldCert'];
    return requiredDocs.every((doc) =>
      this.uploadedList.some((file) => file.type === doc)
    );
  }

  onLogin() {
    if (!this.validateRequiredDocs()) {
      this.alert.info(
        'Please upload all required documents before proceeding.'
      );
      return;
    }
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

    const data = this.authService.signupData;

    const selctedUsertype = this.getUserType();

    const paylod: Record<string, any> = {
      first_name: data['first_name'],
      last_name: data['last_name'],
      email: data['email'],
      password: data['password'],
      confirm_password: data['confirmPassword'],
      mobile_number: data['contact_number'],
      user_type: selctedUsertype,
      manage_through: data['manageThrough'],
      emirate_id: data['emirateId'],
      uae_residence_visa: data['residenceVisa'],
      trade_license_number: data['tradeLicense'],
      emirates_id_doc: getDocumentBase64('emiratesId'),
      uae_residence_visa_doc: getDocumentBase64('uaeVisa'),
      dld_certificate_doc: getDocumentBase64('dldCert'),
    };

    if (selctedUsertype === 'PROPERTY_MANAGER') {
      paylod['company_name'] = data['company_name'];
      paylod['company_emirate_id'] = data['emirateId'];
    }

    this.authService
      .signUp(paylod)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.alert.success(resp?.message || 'Signup successful');
          this.router.navigate(['/auth/login']);
        },
      });
  }
}
