import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { DashFormComponent } from '../../shared/component/dash-form/dash-form.component';
import { EditIconComponent } from '../component/icons/edit-icon/edit-icon.component';
import { UserService } from '../services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { StorageService } from '../../shared/services/storage.service';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../shared/services/alert.service';
@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbNavModule,
    WhiteCardComponent,
    DashFormComponent,
    EditIconComponent,
    TranslateModule,
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {
  private userService = inject(UserService);
  private storageService = inject(StorageService);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  @ViewChild('fileInput') fileInput!: ElementRef;

  userImage: string = '';
  fileType: string = 'png';
  editUserMode = false;
  editOtherDetailsMode = false;
  changedFields: any = {};
  private destroy$ = new Subject<void>();

  profile = {
    firstName: '',
    lastName: '',
    companyName: '',
    name: '',
    email: '',
    contact: '',
    role: '',
    password: '',
  };

  otherDetails = {
    country: '',
    timeZone: '',
    address: '',
    state: '',
    postalCode: '',
  };

  ngOnInit() {
    this.getUserProfileData();
  }

  getUserProfileData() {
    this.userService
      .getUserProfile({})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const content = response?.content;
          this.setUserFormData(content);
        },
      });
  }

  getBase64() {
    const fileUrl = 'assets/userDefaultProImg.png';

    this.http.get(fileUrl, { responseType: 'blob' }).subscribe((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        this.userImage = reader.result as string;
        this.fileType = 'png';
      };
    });
  }

  setUserFormData(content: any) {
    if (!content?.profile_image) {
      this.getBase64();
    } else {
      this.userImage = `data:image/${content.profile_image_type};base64,${content.profile_image}`;
    }

    this.profile = {
      name: content?.first_name + ' ' + content?.last_name,
      firstName: content?.first_name,
      lastName: content?.last_name,
      companyName:
        content?.user_type == 'PROPERTY_MANAGER' ? content.company_name : '',
      email: content?.email,
      contact: content?.contact_number,
      role: content?.user_type,
      password: '************',
    };

    this.otherDetails = {
      country: content?.country,
      timeZone: content?.time_zone,
      address: content?.address,
      state: content?.state,
      postalCode: content?.postal_code,
    };
  }

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
        this.fileType = file.name.split('.').at(-1) ?? 'png';
      };
      reader.readAsDataURL(file);
    }
  }

  onFieldChange(fieldName: string) {
    this.changedFields[fieldName] = true;
  }

  // User edit toggles
  enableUserEdit() {
    this.editUserMode = true;
  }

  saveAccountDetails() {
    const payload: Record<string, any> = {
      first_name: this.profile.firstName,
      last_name: this.profile.lastName,
      contact_number: this.profile.contact,
      profile_image: this.userImage.split(',')[1],
      profile_image_type: this.fileType,
    };

    if (this.profile.role === 'PROPERTY_MANAGER') {
      payload['company_name'] = this.profile.companyName;
    }
    this.saveUser(payload);
  }

  saveOtherDetails() {
    const payload: Record<string, any> = {
      country: this.otherDetails.country,
      time_zone: this.otherDetails.timeZone,
      address: this.otherDetails.address,
      state: this.otherDetails.state,
      postal_code: this.otherDetails.postalCode,
    };
    this.saveUser(payload);
  }

  saveUser(payload: Record<string, any>) {
    this.userService
      .editUserProfile(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.storageService.updateUserName(
            this.profile.firstName,
            this.profile.lastName
          );
          this.getUserProfileData();
          this.editUserMode = false;
          this.changedFields = {};
          this.editOtherDetailsMode = false;
          this.alertService.success(res?.message);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
        },
      });
  }

  cancelUser() {
    this.editUserMode = false;
    this.changedFields = {};
  }

  // Other Details edit toggles
  enableOtherDetailsEdit() {
    this.editOtherDetailsMode = true;
  }

  cancelOtherDetails() {
    this.editOtherDetailsMode = false;
    this.changedFields = {};
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
