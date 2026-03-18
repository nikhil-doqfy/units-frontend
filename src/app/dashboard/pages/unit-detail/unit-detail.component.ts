import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PropertyViewCardComponent } from '../../component/property-view-card/property-view-card.component';
import { PropertyService } from '../../services/property.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-unit-detail',
  standalone: true,
  imports: [CommonModule, WhiteCardComponent, PropertyViewCardComponent, TranslateModule],
  templateUrl: './unit-detail.component.html',
  styleUrl: './unit-detail.component.css',
})
export class UnitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  unitId!: number;
  loading = true;

  unitImages: { imgSrc: string }[] = [];
  unitName = '';
  unitLocation = '';
  unitStatus = '';
  unitRent = '';
  unitCode = '';
  status = "Occupied";
  unitSections: {
    title: string;
    items: { label: string; value: string }[];
  }[] = [];

  documentsByType: Record<string, any[]> = {};
  docTypeNames: Record<string, string> = {};
  activeDocTab = '';

  ngOnInit(): void {
    this.unitId = +(this.route.snapshot.paramMap.get('id') || 0);
    if (!this.unitId) {
      this.router.navigate(['/dashboard/properties'], { queryParams: { tab: 'units' } });
      return;
    }
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    forkJoin({
      unit: this.propertyService.getUnits({ unit_id: this.unitId }),
      images: this.propertyService.getUnitImages({ unit_id: this.unitId }),
      documents: this.propertyService.getUnitDocuments({ unit_id: this.unitId }),
    }).subscribe({
      next: ({ unit, images, documents }) => {
        const u = unit?.content || null;

        if (u) {
          this.unitName = u.unit_name || '';
          this.unitCode = String(u.code);
          this.unitLocation = [u.property_address_line_1, u.property_address_line_2, u.property_landmark]
            .filter(Boolean).join(', ');
          this.unitRent = u.rent ? `AED ${Number(u.rent).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '';
          this.unitImages = (images?.content || []).map((img: any) => ({ imgSrc: img.url }));

          const owners: any[] = u.unit_owners || [];
          this.unitSections = [
            {
              title: 'Unit Details',
              items: [
                { label: 'Property', value: u.property_name || '--' },
                { label: 'Block / Tower', value: u.block_name || '--' },
                { label: 'Unit Size (Sq ft)', value: u.unit_size || '--' },
                { label: 'Area', value: u.area || '--' },
                { label: 'DM No (Affection Plan)', value: u.dm_no || '--' },
                { label: 'Land No', value: u.land_no || '--' },
                { label: 'Unit Usage', value: u.unit_usage || '--' },
                { label: 'Unit Type', value: u.unit_type || '--' },
                { label: 'Sub Type / BHK', value: u.sub_type || '--' },
                { label: 'No of Bedrooms', value: u.no_of_bedrooms != null ? String(u.no_of_bedrooms) : '--' },
                { label: 'Floor No', value: u.floor_no != null ? String(u.floor_no) : '--' },
                { label: 'Parking No', value: u.parking_no || '--' },
                { label: 'No of Balcony', value: u.no_of_balcony != null ? String(u.no_of_balcony) : '--' },
                { label: 'Makani No', value: u.makani_no || '--' },
                { label: 'DEWA No', value: u.dewa_no || '--' },
              ],
            },
            {
              title: 'Commercials',
              items: [
                { label: 'Rent', value: u.rent ? `AED ${u.rent}` : '--' },
                { label: 'Security Deposit', value: u.security_deposit ? `AED ${u.security_deposit}` : '--' },
                { label: 'Booking Amount', value: u.booking_amount ? `AED ${u.booking_amount}` : '--' },
                { label: 'Maintenance Charges', value: u.maintenance_charges ? `AED ${u.maintenance_charges}` : '--' },
                { label: 'Cycle', value: u.cycle || '--' },
                { label: 'Notice Period', value: u.notice_period || '--' },
                { label: 'Commission %', value: u.commission_percent || '--' },
              ],
            },
            {
              title: 'Owner Details',
              items: owners.length
                ? owners.flatMap((o: any, i: number) => [
                  { label: `Owner ${i + 1}`, value: o.name || '--' },
                  { label: 'Email', value: o.email || '--' },
                  { label: 'Contact', value: o.contact_number || '--' },
                  { label: 'Emirates ID', value: o.emirates_id || '--' },
                  { label: 'Owner Number', value: o.owner_number || '--' },
                  { label: 'Trade License No', value: o.trade_license_number || '--' },
                  { label: 'License Number', value: o.license_number || '--' },
                  { label: 'License Expiry', value: o.license_expiry_date ? String(o.license_expiry_date).slice(0, 10) : '--' },
                  { label: 'License Issuer', value: o.license_issuer || '--' },
                  { label: 'Fax Number', value: o.fax_number || '--' },
                  { label: 'P.O. Box', value: o.po_box_number || '--' },
                ])
                : [{ label: 'Owners', value: 'No owners assigned' }],
            },
          ];
        }

        const docList: any[] = documents?.content || [];
        docList.forEach((d: any) => {
          this.docTypeNames[d.document_type_id] = d.document_type_name;
          if (!this.documentsByType[d.document_type_id]) {
            this.documentsByType[d.document_type_id] = [];
          }
          this.documentsByType[d.document_type_id].push(d);
        });
        this.activeDocTab = Object.keys(this.documentsByType)[0] || '';

        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  get docTabKeys(): string[] {
    return Object.keys(this.documentsByType);
  }

  openDocument(url: string): void {
    window.open(url, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/properties'], { queryParams: { tab: 'units' } });
  }
}
