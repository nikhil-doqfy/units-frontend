import {
  Component,
  DestroyRef,
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
import { TranslateService } from '@ngx-translate/core';
import { PasswordPopupComponent } from '../../password-popup/password-popup.component';
import { PasswordPopupbtnComponent } from '../../password-popupbtn/password-popupbtn.component';
import { AuthService } from '../../auth/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedService } from '../../shared.service';
import { CustomSelectComponent } from '../../dashboard/component/custom-select/custom-select.component';
import { SharedApiService } from '../../shared/services/shared-api.service';
import { BreadCrumb } from '../../shared/model/shared.model';
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
    PasswordPopupbtnComponent,
    CustomSelectComponent,
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {
  private translate = inject(TranslateService);
  private userService = inject(UserService);
  private storageService = inject(StorageService);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private sharedService = inject(SharedService);
  private sharedApiService = inject(SharedApiService);

  @ViewChild('fileInput') fileInput!: ElementRef;
  stateList: any[] = [];
  selectedState: any = null;
  currentLanguage = 'en';
  isOpen: boolean = false;
  userImage: string = '';
  fileType: string = 'png';
  editUserMode = false;
  editOtherDetailsMode = false;
  changedFields: any = {};
  countryList: any[] = [];
  selectedCountry: any = null;
  cityList: any[] = [];
  selectedCity: any = null;
  selectedLocality: any;
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
    city: '',
    cityId: null,
    additionalAddress: '',
    timeZone: '',
    address: '',
    state: '',
    postalCode: '',
    locality: '',
  };

  breadcrumbData = [
    { label: this.translate.instant('PAGE_TITLE.DASHBOARD'), link: '' },
  ];
  ngOnInit() {
    this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getUserProfileData();
  }

  changeLanguage(lang: string) {
    this.sharedService.setLanguage(lang);
  }

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }

  loadBreadcrumb() {
    this.setBreadCrumb([
      {
        label: 'PAGE_TITLE.DASHBOARD',
        link: '/dashboard/home',
      },
    ]);
  }

  setBreadCrumb(breadCrumb: BreadCrumb[]) {
    this.sharedService
      .getBreadcrumbs(breadCrumb)
      .subscribe((data) => (this.breadcrumbData = data));
  }
  showPasswordPopup = false;
  togglePopup() {
    this.isOpen = !this.isOpen;
  }
  openPasswordPopup() {
    this.showPasswordPopup = true;
  }

  closePasswordPopup() {
    this.showPasswordPopup = false;
  }

  getUserProfileData() {
    this.userService
      .getUserProfile({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const content = response?.content;
          this.setUserFormData(content);
        },
      });
  }

  getBase64() {
    const fileUrl = 'assets/userDefaultProImg.png';

    this.http
      .get(fileUrl, { responseType: 'blob' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          this.userImage = reader.result as string;
          this.fileType = 'png';
        };
      });
  }

  onLocalitySelected(event: any) {
    this.selectedLocality = event;
    this.otherDetails.locality = event.value;
  }

  handleLocalityClick() {}
  setUserFormData(content: any) {
    if (!content?.profile_image) {
      this.getBase64();
    } else {
      this.userImage = content.profile_image;
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
      country: content?.country.value,
      timeZone: content?.time_zone,
      address: content?.address,
      additionalAddress: content?.additional_address,
      city: content?.city.value,
      cityId: content?.city_id,
      state: content?.state.value,
      postalCode: content?.postal_code,
      locality: content?.locality,
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

  enableUserEdit() {
    this.editUserMode = true;
  }

  saveAccountDetails() {
    const payload: Record<string, any> = {
      first_name: this.profile.firstName,
      last_name: this.profile.lastName,
      contact_number: this.profile.contact,
      profile_image: this.userImage,
      profile_image_type: this.fileType,
    };

    if (this.profile.role === 'PROPERTY_MANAGER') {
      payload['company_name'] = this.profile.companyName;
    }
    this.saveUser(payload);
  }

  saveOtherDetails() {
    console.log(' otherDetails: ', this.otherDetails);
    const payload: Record<string, any> = {
      time_zone: this.otherDetails.timeZone,
      city: this.otherDetails.cityId,
      address: this.otherDetails.address,
      additional_address: this.otherDetails.additionalAddress,
      pin_code: this.otherDetails.postalCode,
      locality: this.otherDetails.locality,
    };
    this.saveUser(payload);
  }

  saveUser(payload: Record<string, any>) {
    this.userService
      .editUserProfile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.storageService.saveUserProfile(payload);

          this.profile = this.storageService.getUserProfile();
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
  handleviewclick() {
    this.getOptionTypes(['COUNTRY']);
  }
  cancelUser() {
    this.editUserMode = false;
    this.changedFields = {};
  }

  enableOtherDetailsEdit() {
    console.log('Edit mode enabled');
    this.editOtherDetailsMode = true;

    this.selectedCountry = this.countryList.find(
      (c) => c.value === this.otherDetails.country
    );
  }

  cancelOtherDetails() {
    this.editOtherDetailsMode = false;
    this.changedFields = {};
  }

  onCountrySelected(option: any) {
    this.selectedCountry = option;

    this.otherDetails.country = option?.value;

    this.onFieldChange('country');
  }

  onStateSelected(option: any) {
    this.selectedState = option;
    this.otherDetails.state = option?.value || '';
    this.otherDetails.city = '';
    this.selectedCity = null;
    this.otherDetails.cityId = null;
    this.cityList = [];

    this.onFieldChange('state');
  }

  onCitySelected(option: any) {
    this.selectedCity = option;
    this.otherDetails.city = option?.value || '';
    this.otherDetails.cityId = option?.key || null;
    this.onFieldChange('city');
  }
  handleviewclickcity() {
    this.getCityOptions(this.selectedState.key);
  }
  getCityOptions(stateId: number) {
    this.sharedApiService
      .getOptions({
        option_type: 'CITY',
        state_id: stateId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.cityList = res?.content?.city || [];
        },
        error: () => {
          this.cityList = [];
        },
      });
  }

  getStateOptions(countryId: number | string) {
    this.sharedApiService
      .getOptions({
        option_type: 'STATE',
        country_id: countryId,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('STATE API RESPONSE:', response);
          this.stateList = response?.content?.state || [];
        },
        error: (err) => {
          console.error('State API error', err);
          this.stateList = [];
        },
      });
  }

  handleviewclicks() {
    this.getStateOptions(this.selectedCountry?.key);
  }
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('COUNTRY API RESPONSE:', response.content.COUNTRY);
          this.countryList = response.content.country;
        },
      });
  }
}
