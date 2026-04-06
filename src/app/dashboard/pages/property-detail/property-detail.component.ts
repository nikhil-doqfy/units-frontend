import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { WhiteCardComponent } from '../../../shared/component/white-card/white-card.component';
import { PropertyViewCardComponent } from '../../component/property-view-card/property-view-card.component';
import { PropertyService } from '../../services/property.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    WhiteCardComponent,
    PropertyViewCardComponent,
    TranslateModule,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  propertyId!: number;
  loading = true;

  // Inputs for PropertyViewCardComponent
  propertyImages: { imgSrc: string }[] = [];
  propertyName = '';
  propertyLocation = '';
  propertyStatus = '';
  propertyCode = '';
  propertyRent = '';
  propertySections: {
    title: string;
    items: { label: string; value: string }[];
    tableColumns?: { key: string; label: string }[];
    tableRows?: Record<string, string>[];
  }[] = [];

  // Documents
  documentsByType: Record<string, any[]> = {};
  docTypeNames: Record<string, string> = {};
  activeDocTab = '';

  ngOnInit(): void {
    this.propertyId = +(this.route.snapshot.paramMap.get('id') || 0);
    if (!this.propertyId) {
      this.router.navigate(['/dashboard/properties']);
      return;
    }
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    forkJoin({
      property: this.propertyService.getProperties({
        property_id: this.propertyId,
      }),
      blocks: this.propertyService.getPropertyBlocks({
        property_id: this.propertyId,
      }),
      images: this.propertyService.getPropertyImages({
        property_id: this.propertyId,
      }),
      documents: this.propertyService.getPropertyDocuments({
        property_id: this.propertyId,
      }),
    }).subscribe({
      next: ({ property, blocks, images, documents }) => {
        const prop = property?.content || null;

        if (prop) {
          this.propertyName = prop.property_name || '';
          this.propertyCode = prop.code || '';
          this.propertyLocation =
            [prop.address_line_1, prop.address_line_2, prop.landmark]
              .filter(Boolean)
              .join(', ') || '';
          this.propertyStatus = prop.status === 'PUBLIC' ? 'Public' : 'Draft';
          this.propertyRent = prop.approx_rent
            ? `AED${Number(prop.approx_rent).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
            : '';

          this.propertyImages = (images?.content || []).map((img: any) => ({
            imgSrc: img.url,
          }));
          const blockList: any[] = blocks?.content || [];

          this.propertySections = [
            {
              title: 'Property Details',
              items: [
                { label: 'Property Code', value: prop.code || '--' },
                { label: 'Property Type', value: prop.property_type || '--' },
                {
                  label: 'No of Blocks',
                  value: String(prop.no_of_blocks ?? '--'),
                },
                {
                  label: 'No of Units',
                  value: String(prop.no_of_units ?? '--'),
                },
                {
                  label: 'Land Area',
                  value: prop.land_area
                    ? `${prop.land_area} ${prop.land_area_unit}`
                    : '--',
                },
                { label: 'Land DM No', value: prop.land_dm_no || '--' },
                { label: 'Plot No', value: prop.plot_no || '--' },
                { label: 'Makani No', value: prop.makani_no || '--' },
                { label: 'DEWA No', value: prop.dewa_no || '--' },
                { label: 'Pincode', value: prop.pincode || '--' },
                { label: 'Address 1', value: prop.address_line_1 || '--' },
                { label: 'Address 2', value: prop.address_line_2 || '--' },
              ],
            },
            {
              title: 'Block Details',
              items: blockList.length
                ? blockList.flatMap((b: any, i: number) => [
                    { label: `Block ${i + 1}`, value: b.block_name || '--' },
                    {
                      label: 'No of Floors',
                      value: String(b.no_of_floors ?? '--'),
                    },
                    {
                      label: 'No of Parking',
                      value: String(b.no_of_parking ?? '--'),
                    },
                    {
                      label: 'No of Units',
                      value: String(b.no_of_units ?? '--'),
                    },
                  ])
                : [{ label: 'Blocks', value: 'No blocks added' }],
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
      error: () => {
        this.loading = false;
      },
    });
  }

  get docTabKeys(): string[] {
    return Object.keys(this.documentsByType);
  }

  goBack(): void {
    this.router.navigate(['/dashboard/properties']);
  }

  openDocument(url: string): void {
    window.open(url, '_blank');
  }
}
