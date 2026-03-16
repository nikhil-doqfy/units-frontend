import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { CustomSelectComponent } from '../../../dashboard/component/custom-select/custom-select.component';
import { SharedApiService } from '../../../shared/services/shared-api.service';
import { PropertyService } from '../../../dashboard/services/property.service';
import { NewTenantFromService } from '../service/new-tenant-from.service';
import { TranslateModule } from '@ngx-translate/core';

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

  private sharedAPIService = inject(SharedApiService);
  private propertyService = inject(PropertyService);
  private formService = inject(NewTenantFromService);
  private destroyRef = inject(DestroyRef);

  propertyList: any[] = [];
  blockList: any[] = [];

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

    if (this.leadData?.unit_id) {
      this.propertyService
        .getPropertyDetailsForLease({ property_unit_id: this.leadData.unit_id })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((resp: any) => {
          const u = resp?.content?.property_unit;
          const owners: any[] = resp?.content?.owners ?? [];
          if (!u) return;

          this.form.patchValue({
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

          this.patchOwners(owners);
        });
    }
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
    this.form.patchValue({ unitName: '' });
    this.clearUnitFields();
  }

  onUnitUsageSelect(opt: any) {
    this.form.patchValue({ unitUsage: opt?.key ?? '' });
  }

  onUnitTypeSelect(opt: any) {
    this.form.patchValue({ unitType: opt?.key ?? '' });
  }

  private clearUnitFields() {
    this.form.patchValue({
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

  get selectedUnitUsage() {
    const v = this.form?.value?.unitUsage;
    return v ? (this.unitUsageList.find((x) => x.key === v) ?? null) : null;
  }

  get selectedUnitType() {
    const v = this.form?.value?.unitType;
    return v ? (this.unitTypeList.find((x) => x.key === v) ?? null) : null;
  }
}
