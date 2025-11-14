import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { EditIconComponent } from '../icons/edit-icon/edit-icon.component';

@Component({
  selector: 'app-user-upload',
  standalone: true,
  imports: [EditIconComponent],
  templateUrl: './user-upload.component.html',
  styleUrl: './user-upload.component.css'
})
export class UserUploadComponent {
  @Input() userImage: string = '../../../../assets/userDefaultProImg.png'; // Default image
  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.userImage = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }
}
