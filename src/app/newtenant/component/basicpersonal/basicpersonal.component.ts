import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { PropertyService } from '../../../dashboard/services/property.service';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { TenantsService } from '../../../dashboard/services/tenants.service';
import { FormService } from '../../../shared/services/form.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedService } from '../../../shared.service';

@Component({
  selector: 'app-basicpersonal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WhiteCardComponent,
    CustomSelectComponent,
    TranslateModule,
  ],
  templateUrl: './basicpersonal.component.html',
  styleUrl: './basicpersonal.component.css',
})
export class BasicpersonalComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() leadData: any = null;

  private sharedService = inject(SharedService);
  private sharedAPIService = inject(SharedApiService);
  private propertyService = inject(PropertyService);
  private formService = inject(NewTenantFromService);
  private tenantsService = inject(TenantsService);
  private destroyRef = inject(DestroyRef);
  private sharedFormService = inject(FormService);

  isInvalid = this.sharedFormService.isInvalid.bind(this.sharedFormService);

  tenantLookupLoading = false;

  propertyList: any[] = [];
  blockList: any[] = [];
  unitList: any[] = [];

  unitUsageList = [
    { key: 'RESIDENTIAL', value: 'Residential' },
    { key: 'COMMERCIAL', value: 'Commercial' },
  ];
  unitTypeList = [
    { key: 'FLAT', value: 'Flat' },
    { key: 'APARTMENT', value: 'Apartment' },
    { key: 'VILLA', value: 'Villa' },
  ];

  get ownerForms(): FormArray {
    return this.form.get('unitOwners') as FormArray;
  }

  ownerFormAt(i: number): FormGroup {
    return this.ownerForms.at(i) as FormGroup;
  }

  ngOnInit() {
    this.sharedAPIService.getOptionsType([
      {
        param: 'PARENT_PROPERTY',
        key: 'property',
        setter: (v) => (this.propertyList = v),
      },
    ]);

    if (this.leadData?.property_id) {
      this.loadBlocks(this.leadData.property_id);
    }

    if (this.leadData?.block_id) {
      this.loadUnits(this.leadData.block_id);
    }

    if (this.leadData?.unit_id) {
      this.propertyService
        .getUnits({ unit_id: this.leadData.unit_id })
        .subscribe((resp: any) => {
          const u = resp?.content;
          if (!u) return;
          this.form.patchValue({
            unit: {
              key: this.leadData.unit_id,
              value: this.leadData.unit_name ?? u.unit_name ?? '',
            },
            unitName: u.unit_name ?? '',
            unitSize: u.unit_size ?? '',
            landNo: u.land_no ?? '',
            dmNo: u.dm_no ?? '',
            unitUsage: u.unit_usage ?? '',
            unitType: u.unit_type ?? '',
            subType: u.sub_type ?? '',
            makaniNo: u.makani_no ?? '',
            floorNo: u.floor_no ?? '',
          });
          this.patchOwners(u.unit_owners ?? []);
          this.formService.setUnitCommercialData(u);
        });
    }

    if (this.leadData?.email) {
      this.lookupTenantByEmail(this.leadData.email);
    }
    this.sharedService.initLanguage();
  }

  private patchOwners(owners: any[]) {
    while (this.ownerForms.length > 0) this.ownerForms.removeAt(0);
    const list = owners.length > 0 ? owners : [null];
    list.forEach((o) =>
      this.ownerForms.push(this.formService.createOwnerGroup(o ?? undefined)),
    );
  }

  private loadBlocks(propertyId: number) {
    this.sharedAPIService.getOptionsType([
      {
        param: 'PROPERTY_BLOCK_BY_PROPERTY',
        params: { property_id: propertyId },
        key: 'property_block',
        setter: (v) => (this.blockList = v),
      },
    ]);
  }

  addOwner() {
    this.ownerForms.push(this.formService.createOwnerGroup());
  }

  removeOwner(index: number) {
    if (this.ownerForms.length > 1) this.ownerForms.removeAt(index);
  }

  onPropertySelect(property: any) {
    if (!property?.key) return;
    this.blockList = [];
    this.form.patchValue({ block: '', unitName: '' });
    this.clearUnitFields();
    this.loadBlocks(property.key);
  }

  onBlockSelect(block: any) {
    if (!block?.key) return;
    this.unitList = [];
    this.form.patchValue({ unit: '' });
    this.clearUnitFields();
    this.loadUnits(block.key);
  }

  private loadUnits(blockId: number) {
    this.propertyService
      .getUnits({ block_id: blockId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp: any) => {
        this.unitList = (resp?.content || []).map((u: any) => ({
          key: u.id,
          value: `${u.code} (${u.unit_name})`,
        }));
      });
  }

  onUnitSelect(unit: any) {
    if (!unit?.key) return;
    this.form.patchValue({
      unit: unit,
    });
    this.propertyService
      .getUnits({ unit_id: unit.key })
      .subscribe((resp: any) => {
        const u = resp?.content;
        if (!u) return;
        this.form.patchValue({
          unit: unit,
          unitName: u.unit_name ?? '',
          unitSize: u.unit_size ?? '',
          landNo: u.land_no ?? '',
          dmNo: u.dm_no ?? '',
          unitUsage: u.unit_usage ?? '',
          unitType: u.unit_type ?? '',
          subType: u.sub_type ?? '',
          makaniNo: u.makani_no ?? '',
          floorNo: u.floor_no ?? '',
        });
        this.patchOwners(u.unit_owners ?? []);
        this.formService.setUnitCommercialData(u);

        this.form.get('unit')?.updateValueAndValidity();
      });
  }

  onEmailBlur() {
    const email = (this.form.get('email')?.value || '').trim();
    if (!email) return;
    this.lookupTenantByEmail(email);
  }

  private lookupTenantByEmail(email: string) {
    this.tenantLookupLoading = true;
    this.tenantsService
      .getTenantByEmail(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp: any) => {
          this.tenantLookupLoading = false;
          const t = resp?.content;
          if (!t) return;
          this.form.patchValue({
            tenantId: t.id ?? null,
            tenantName: t.name ?? '',
            telNo: t.contact_number ?? '',
            emiratesId: t.emirates_id ?? '',
            nationality: t.nationality ?? '',
            passportNo: t.passport_number ?? '',
            passportExpiry: t.passport_expiry_date
              ? String(t.passport_expiry_date).slice(0, 10)
              : '',
            visaNo: t.visa_number ?? '',
            visaExpiry: t.visa_expiry_date
              ? String(t.visa_expiry_date).slice(0, 10)
              : '',
            addressLine1: t.address_line_1 ?? '',
            addressLine2: t.address_line_2 ?? '',
          });
        },
        error: () => {
          this.tenantLookupLoading = false;
        },
      });
  }

  onUnitUsageSelect(opt: any) {
    this.form.patchValue({ unitUsage: opt?.key ?? '' });
  }

  onUnitTypeSelect(opt: any) {
    this.form.patchValue({ unitType: opt?.key ?? '' });
  }

  private clearUnitFields() {
    this.form.patchValue({
      unitName: '',
      unitSize: '',
      landNo: '',
      dmNo: '',
      unitUsage: '',
      unitType: '',
      subType: '',
      makaniNo: '',
      floorNo: '',
    });
    this.patchOwners([]);
  }

  get preSelectedProperty() {
    const v = this.form?.value?.property;
    return v?.key ? v : null;
  }

  get preSelectedBlock() {
    const v = this.form?.value?.block;
    return v?.key ? v : null;
  }

  get preSelectedUnit() {
    const v = this.form?.value?.unit;
    return v?.key ? v : null;
  }

  get selectedUnitUsage() {
    const v = this.form?.value?.unitUsage;
    return v ? (this.unitUsageList.find((x) => x.key === v) ?? null) : null;
  }

  get selectedUnitType() {
    const v = this.form?.value?.unitType;
    return v ? (this.unitTypeList.find((x) => x.key === v) ?? null) : null;
  }
}
