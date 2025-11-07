import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService, UserRole } from '../../../theme.service';

import { StepFormLayoutComponent } from "../../component/step-form-layout/step-form-layout.component";
import { StepPaneComponent } from "../../component/step-form-layout/step-pane.component";
import { CustomSelectComponent } from '../../component/custom-select/custom-select.component';
import { UploadDocumentComponent } from '../../component/upload-document/upload-document.component';

@Component({
  selector: 'app-add-property',
  standalone: true,
  imports: [CommonModule, StepFormLayoutComponent, StepPaneComponent, CustomSelectComponent, UploadDocumentComponent],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css'
})
export class AddPropertyComponent {
  breadcrumbData = [
    { label: 'Dashboard', link: '/dashboard/home' },
    { label: 'Properties', link: '/dashboard/properties' },
    { label: 'Add Property', link: '' },
  ];

  currentRole: UserRole = 'owner';
  selectedType: string = '';

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.themeService.currentRole$.subscribe(role => {
      this.currentRole = role;
    });
  }

  onOptionSelected(option: string) {
    this.selectedType = option;
  }

  submitProperty(): void {
    console.log("Final Step Completed — Submitting Property...");
    // Call API or navigate
    this.router.navigate(['dashboard/properties']);
  }

}
