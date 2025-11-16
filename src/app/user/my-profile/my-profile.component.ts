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
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {
  private userService = inject(UserService);
  @ViewChild('fileInput') fileInput!: ElementRef;

  userImage: string = '../../../../assets/userDefaultProImg.png';
  editUserMode = false;
  editOtherDetailsMode = false;
  changedFields: any = {};
  private destroy$ = new Subject<void>();

  profile = {
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

  setUserFormData(content: any) {
    this.userImage =
      content?.profile_image === 'N/A' || !content?.profile_image
        ? this.userImage
        : content?.profile_image;

    this.profile = {
      name: content?.name,
      email: content?.email,
      contact: content?.contact,
      role: content?.role,
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

  saveUser() {
    console.log('changedUser:---->', this.changedFields);
    this.editUserMode = false;
    this.changedFields = {};
  }

  cancelUser() {
    this.editUserMode = false;
    this.changedFields = {};
  }

  // Other Details edit toggles
  enableOtherDetailsEdit() {
    this.editOtherDetailsMode = true;
  }

  saveOtherDetails() {
    this.editOtherDetailsMode = false;
    this.changedFields = {};
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
