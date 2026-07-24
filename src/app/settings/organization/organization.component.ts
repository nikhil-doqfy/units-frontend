import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';

import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { DashFormComponent } from '../../shared/component/dash-form/dash-form.component';
import { EditIconComponent } from '../../user/component/icons/edit-icon/edit-icon.component';
import { CustomSelectComponent } from '../../dashboard/component/custom-select/custom-select.component';
import { SharedApiService } from '../../shared/services/shared-api.service';
import { AlertService } from '../../shared/services/alert.service';
import { SharedService } from '../../shared.service';
import { OrganizationService } from './organization.service';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    WhiteCardComponent,
    DashFormComponent,
    EditIconComponent,
    CustomSelectComponent,
  ],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.css',
})
export class OrganizationComponent implements AfterViewInit {
  private translate = inject(TranslateService);
  private sharedApiService = inject(SharedApiService);
  private alertService = inject(AlertService);
  private sharedService = inject(SharedService);
  private orgService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);

  constructor(private cd: ChangeDetectorRef) {}

  @ViewChild('logoInput') logoInput!: ElementRef;

  currentLanguage = 'en';

  // ── Org Details ─────────────────────────────────────────────────
  editOrgMode = false;
  orgLogo = 'assets/userDefaultProImg.png';
  orgLogoType = 'png';

  orgDetails = {
    name: '',
    email: '',
    contact: '',
    type: '',
    registrationNo: '',
    website: '',
  };

  // ── Address Details ──────────────────────────────────────────────
  editAddressMode = false;

  addressDetails = {
    country: '',
    countryId: null as number | null,
    state: '',
    stateId: null as number | null,
    city: '',
    cityId: null as number | null,
    locality: '',
    postalCode: '',
    timeZone: '',
    address: '',
    additionalAddress: '',
  };

  // ── Dropdown lists ───────────────────────────────────────────────
  countryList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  timezoneList: any[] = [];

  selectedCountry: any = null;
  selectedState: any = null;
  selectedCity: any = null;
  selectedTimezone: any = null;

  changedFields: any = {};
  addressChangedFields: any = {};

  ngOnInit() {
    this.sharedService.initLanguage();
    this.getOrgDetails();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.cd.detectChanges());
  }

  // ── Load org data ────────────────────────────────────────────────
  getOrgDetails() {
    this.orgService
      .getOrganization()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const c = res?.content;
          if (!c) return;

          if (c.logo) {
            this.orgLogo = c.logo;
          } else {
            this.getDefaultLogo();
          }

          this.orgDetails = {
            name: c.name ?? '',
            email: c.email ?? '',
            contact: c.contact_number ?? '',
            type: c.organization_type ?? '',
            registrationNo: c.registration_no ?? '',
            website: c.website ?? '',
          };

          this.addressDetails = {
            country: c.country?.value ?? '',
            countryId: c.country?.key ?? null,
            state: c.state?.value ?? '',
            stateId: c.state?.key ?? null,
            city: c.city?.value ?? '',
            cityId: c.city?.key ?? null,
            locality: c.locality ?? '',
            postalCode: c.postal_code ?? '',
            timeZone: c.time_zone ?? '',
            address: c.address ?? '',
            additionalAddress: c.additional_address ?? '',
          };

          const tz = c.time_zone ?? '';
          if (tz) this.selectedTimezone = { key: tz, value: tz };
        },
      });
  }

  getDefaultLogo() {
    this.http
      .get('assets/userDefaultProImg.png', { responseType: 'blob' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          this.orgLogo = reader.result as string;
          this.orgLogoType = 'png';
        };
      });
  }

  // ── Org Details edit ─────────────────────────────────────────────
  enableOrgEdit() {
    this.editOrgMode = true;
  }

  cancelOrg() {
    this.editOrgMode = false;
    this.changedFields = {};
    this.getOrgDetails();
  }

  saveOrgDetails() {
    const payload: Record<string, any> = {
      name: this.orgDetails.name,
      email: this.orgDetails.email,
      contact_number: this.orgDetails.contact,
      organization_type: this.orgDetails.type,
      registration_no: this.orgDetails.registrationNo,
      website: this.orgDetails.website,
      logo: this.orgLogo,
      logo_type: this.orgLogoType,
    };

    this.orgService
      .saveOrganization(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.editOrgMode = false;
          this.changedFields = {};
          this.alertService.success(
            res?.message ?? 'Organization details saved.',
          );
          this.getOrgDetails();
        },
        error: () => {
          this.alertService.error('Failed to save organization details.');
        },
      });
  }

  // ── Address edit ─────────────────────────────────────────────────
  enableAddressEdit() {
    this.editAddressMode = true;
    if (this.addressDetails.countryId) {
      this.selectedCountry = {
        key: this.addressDetails.countryId,
        value: this.addressDetails.country,
      };
    }
    if (this.addressDetails.stateId) {
      this.selectedState = {
        key: this.addressDetails.stateId,
        value: this.addressDetails.state,
      };
    }
    if (this.addressDetails.cityId) {
      this.selectedCity = {
        key: this.addressDetails.cityId,
        value: this.addressDetails.city,
      };
    }
  }

  cancelAddress() {
    this.editAddressMode = false;
    this.addressChangedFields = {};
    this.getOrgDetails();
  }

  saveAddressDetails() {
    const payload: Record<string, any> = {
      city: this.addressDetails.cityId,
      locality: this.addressDetails.locality,
      pin_code: this.addressDetails.postalCode,
      time_zone: this.addressDetails.timeZone,
      address: this.addressDetails.address,
      additional_address: this.addressDetails.additionalAddress,
    };

    this.orgService
      .saveOrganization(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.editAddressMode = false;
          this.addressChangedFields = {};
          this.alertService.success(res?.message ?? 'Address saved.');
          this.getOrgDetails();
        },
        error: () => {
          this.alertService.error('Failed to save address.');
        },
      });
  }

  // ── Logo upload ──────────────────────────────────────────────────
  triggerLogoInput() {
    this.logoInput.nativeElement.click();
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowed = ['image/png', 'image/jpeg'];
      if (!allowed.includes(file.type)) {
        this.alertService.error('Only PNG and JPG images are allowed.');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.orgLogo = reader.result as string;
        this.orgLogoType = file.name.split('.').at(-1) ?? 'png';
      };
      reader.readAsDataURL(file);
    }
  }

  // ── Dropdown handlers ────────────────────────────────────────────
  onFieldChange(field: string) {
    this.changedFields[field] = true;
  }
  onAddressFieldChange(field: string) {
    this.addressChangedFields[field] = true;
  }

  loadCountries() {
    if (this.countryList.length) return;
    this.sharedApiService
      .getOptions({ option_type: 'COUNTRY' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => (this.countryList = r?.content?.country ?? []),
      });
  }

  onCountrySelected(option: any) {
    this.selectedCountry = option;
    this.addressDetails.country = option?.value ?? '';
    this.addressDetails.countryId = option?.key ?? null;
    this.selectedState = null;
    this.selectedCity = null;
    this.addressDetails.state = '';
    this.addressDetails.stateId = null;
    this.addressDetails.city = '';
    this.addressDetails.cityId = null;
    this.stateList = [];
    this.cityList = [];
    this.onAddressFieldChange('country');
  }

  loadStates() {
    const id = this.selectedCountry?.key ?? this.addressDetails.countryId;
    if (!id) return;
    this.sharedApiService
      .getOptions({ option_type: 'STATE', country_id: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => (this.stateList = r?.content?.state ?? []),
      });
  }

  onStateSelected(option: any) {
    this.selectedState = option;
    this.addressDetails.state = option?.value ?? '';
    this.addressDetails.stateId = option?.key ?? null;
    this.selectedCity = null;
    this.addressDetails.city = '';
    this.addressDetails.cityId = null;
    this.cityList = [];
    this.onAddressFieldChange('state');
  }

  loadCities() {
    const id = this.selectedState?.key ?? this.addressDetails.stateId;
    if (!id) return;
    this.sharedApiService
      .getOptions({ option_type: 'CITY', state_id: id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => (this.cityList = r?.content?.city ?? []),
      });
  }

  onCitySelected(option: any) {
    this.selectedCity = option;
    this.addressDetails.city = option?.value ?? '';
    this.addressDetails.cityId = option?.key ?? null;
    this.onAddressFieldChange('city');
  }

  loadTimezones() {
    if (this.timezoneList.length) return;
    this.sharedApiService
      .getOptions({ option_type: 'TIMEZONE' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => (this.timezoneList = r?.content?.timezone ?? []),
      });
  }

  onTimezoneSelected(option: any) {
    this.selectedTimezone = option;
    this.addressDetails.timeZone = option?.key ?? '';
    this.onAddressFieldChange('timeZone');
  }
}
