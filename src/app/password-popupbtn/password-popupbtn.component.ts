import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PasswordPopupComponent } from '../password-popup/password-popup.component';
import { PasswordIconComponent } from '../auth/component/icons/password-icon/password-icon.component';

@Component({
  selector: 'app-password-popupbtn',
  standalone: true,
  imports: [CommonModule, PasswordPopupComponent, PasswordIconComponent],
  templateUrl: './password-popupbtn.component.html',
  styleUrl: './password-popupbtn.component.css',
})
export class PasswordPopupbtnComponent {
  isOpen: boolean = false;

  @Output() passwordChanged = new EventEmitter<{
    oldPassword: string;
    newPassword: string;
  }>();

  togglePopup() {
    this.isOpen = !this.isOpen;
  }

  handlePasswordChange(event: { oldPassword: string; newPassword: string }) {
    this.passwordChanged.emit(event);
    this.isOpen = false;
  }
}
