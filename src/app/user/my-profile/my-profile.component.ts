import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

import { WhiteCardComponent } from '../../shared/component/white-card/white-card.component';
import { DashFormComponent } from '../../shared/component/dash-form/dash-form.component';
import { EditIconComponent } from "../component/icons/edit-icon/edit-icon.component";

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbNavModule, WhiteCardComponent, DashFormComponent, EditIconComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css'
})
export class MyProfileComponent {
  userImage: string = '../../../../assets/userProImg.png';
  @ViewChild('fileInput') fileInput!: ElementRef;

  editUserMode = false;
  editOtherDetailsMode = false;
  changedFields: any = {};

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

  profile = {
    name: 'Ali Musif',
    email: 'Ali@doqfy.in',
    contact: '878987887',
    role: 'Owner',
    password: '************'
  };

  otherDetails = {
    country: 'India',
    timeZone: 'UTC',
    address: '2nd Floor, 161, Basavanagar Main Rd, Above Reliance Trends, Vignan Nagar, Basavanagara, Bengaluru, Karnataka 560037',
    state: 'Karnataka',
    postalCode: '560087'
  };


  onFieldChange(fieldName: string) {
    this.changedFields[fieldName] = true;
  }

  // User edit toggles
  enableUserEdit() {
    this.editUserMode = true;
  }

  saveUser() {
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
}
