import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { EditIconComponent } from '../../user/component/icons/edit-icon/edit-icon.component';
import { UserService } from '../../user/services/user.service';
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
export class MyProfileComponent implements AfterViewInit {
  private translate = inject(TranslateService);
  private userService = inject(UserService);
  private storageService = inject(StorageService);
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);
  private sharedService = inject(SharedService);
  private sharedApiService = inject(SharedApiService);

  constructor(private cd: ChangeDetectorRef) {}
  @ViewChild('fileInput') fileInput!: ElementRef;
  stateList: any[] = [];
  selectedState: any = null;
  timezoneList: any[] = [];
  selectedTimezone: any = null;
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
    countryId: null as number | null,
    state: '',
    stateId: null as number | null,
    city: '',
    cityId: null as number | null,
    additionalAddress: '',
    timeZone: '',
    address: '',
    postalCode: '',
    locality: '',
  };
  // breadcrumbData: BreadCrumb[] = [];
  breadcrumbData = [
    { label: this.translate.instant('PAGE_TITLE.DASHBOARD'), link: '' },
  ];
  ngOnInit() {
    // this.loadBreadcrumb();
    this.sharedService.initLanguage();
    this.initLanguageListener();
    this.getUserProfileData();
    Promise.resolve().then(() => {
      this.breadcrumbData = [
        { label: this.translate.instant('PAGE_TITLE.DASHBOARD'), link: '' },
      ];
    });

    this.loadBreadcrumb();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cd.detectChanges();
    });
  }
  // ngAfterViewInit(): void {
  //   Promise.resolve().then(() => {
  //     this.cd.detectChanges();
  //   });
  // }

  changeLanguage(lang: string) {
    this.sharedService.setLanguage(lang);
  }

  showDetailView: boolean = false;

  initLanguageListener() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadBreadcrumb();
      });
  }
  loadBreadcrumb() {
    if (this.showDetailView) {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.PROPERTIES', link: '/dashboard/My Profile' },
        { label: 'PROPERTY_DETAILS', link: '' },
      ]);
    } else {
      this.setBreadCrumb([
        { label: 'PAGE_TITLE.DASHBOARD', link: '/dashboard/home' },
        { label: 'PAGE_TITLE.MY_PROFILE', link: '' },
      ]);
    }
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

    const roleKey = content?.user_role ?? '';
    const roleLabels: Record<string, string> = {
      COMPANY_USER: 'Property Manager',
      OWNER: 'Owner',
      TENANT: 'Tenant',
    };
    this.profile = {
      name: content?.first_name + ' ' + content?.last_name,
      firstName: content?.first_name ?? '',
      lastName: content?.last_name ?? '',
      companyName: roleKey === 'COMPANY_USER' ? (content?.company_name ?? '') : '',
      email: content?.email ?? '',
      contact: content?.contact_number ?? '',
      role: roleLabels[roleKey] ?? roleKey,
      password: '************',
    };

    const tz = content?.time_zone ?? '';
    this.otherDetails = {
      country: content?.country?.value ?? '',
      countryId: content?.country?.key ?? null,
      state: content?.state?.value ?? '',
      stateId: content?.state?.key ?? null,
      city: content?.city?.value ?? '',
      cityId: content?.city?.key ?? null,
      timeZone: tz,
      address: content?.address ?? '',
      additionalAddress: content?.additional_address ?? '',
      postalCode: content?.postal_code ?? '',
      locality: content?.locality ?? '',
    };
    if (tz) {
      this.selectedTimezone = { key: tz, value: tz };
    }
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
          this.userService.notifyProfileUpdated(payload);

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

  handleTimezoneClick() {
    if (this.timezoneList.length) return;
    this.sharedApiService
      .getOptions({ option_type: 'TIMEZONE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r: any) => (this.timezoneList = r?.content?.timezone ?? []) });
  }

  onTimezoneSelected(option: any) {
    this.selectedTimezone = option;
    this.otherDetails.timeZone = option?.key ?? '';
    this.onFieldChange('timeZone');
  }
  cancelUser() {
    this.editUserMode = false;
    this.changedFields = {};
  }

  enableOtherDetailsEdit() {
    this.editOtherDetailsMode = true;
    // Pre-populate selections from stored IDs so state/city dropdowns work
    // without requiring the user to re-select country first
    if (this.otherDetails.countryId) {
      this.selectedCountry = { key: this.otherDetails.countryId, value: this.otherDetails.country };
    }
    if (this.otherDetails.stateId) {
      this.selectedState = { key: this.otherDetails.stateId, value: this.otherDetails.state };
    }
    if (this.otherDetails.cityId) {
      this.selectedCity = { key: this.otherDetails.cityId, value: this.otherDetails.city };
    }
  }

  cancelOtherDetails() {
    this.editOtherDetailsMode = false;
    this.changedFields = {};
  }

  onCountrySelected(option: any) {
    this.selectedCountry = option;
    this.otherDetails.country = option?.value ?? '';
    this.otherDetails.countryId = option?.key ?? null;
    // Reset dependent fields
    this.selectedState = null;
    this.selectedCity = null;
    this.otherDetails.state = '';
    this.otherDetails.stateId = null;
    this.otherDetails.city = '';
    this.otherDetails.cityId = null;
    this.stateList = [];
    this.cityList = [];
    this.onFieldChange('country');
  }

  onStateSelected(option: any) {
    this.selectedState = option;
    this.otherDetails.state = option?.value ?? '';
    this.otherDetails.stateId = option?.key ?? null;
    this.otherDetails.city = '';
    this.otherDetails.cityId = null;
    this.selectedCity = null;
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
    const stateId = this.selectedState?.key ?? this.otherDetails.stateId;
    if (stateId) this.getCityOptions(stateId);
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
          this.stateList = response?.content?.state || [];
        },
        error: (err) => {
          console.error('State API error', err);
          this.stateList = [];
        },
      });
  }

  handleviewclicks() {
    const countryId = this.selectedCountry?.key ?? this.otherDetails.countryId;
    if (countryId) this.getStateOptions(countryId);
  }
  getOptionTypes(options: string[]) {
    this.sharedApiService
      .getOptions({ option_type: options.join(',') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.countryList = response.content.country;
        },
      });
  }
  //-------------------------error-----------------------------------------------
}
