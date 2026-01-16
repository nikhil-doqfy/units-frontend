import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AIChatOption {
  label: string;
  value: string;
  depth: number;
  speed: number;
  hasChatPro?: boolean;
}

import { ArrowDownIconComponent } from '../../../shared/component/icons/arrow-down-icon/arrow-down-icon.component';
// import { CheckIconComponent } from '../icons/check-icon/check-icon.component';
// import { CheckFillIconComponent } from '../icons/check-fill-icon/check-fill-icon.component';
// import { ChatProIconComponent } from '../icons/chat-pro-icon/chat-pro-icon.component';
// import { DepthIconComponent } from '../icons/depth-icon/depth-icon.component';
// import { SpeedIconComponent } from '../icons/speed-icon/speed-icon.component';

@Component({
  selector: 'app-ai-chat-select',
  standalone: true,
  imports: [
    CommonModule,
    ArrowDownIconComponent,
    // CheckIconComponent,
    // CheckFillIconComponent,
    // ChatProIconComponent,
    // DepthIconComponent,
    // SpeedIconComponent,
  ],
  templateUrl: './ai-chat-select.component.html',
  styleUrls: ['./ai-chat-select.component.css'],
})
export class AIChatSelectComponent implements OnInit {
  @Input() options: AIChatOption[] = [];
  @Input() placeholder: string = 'Select';
  @Output() optionSelected = new EventEmitter<string>();

  selectedOption: string | null = null;
  isDropdownOpen = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    // Check if "GPT-4o-mini" exists in the options and set it as default
    const defaultOption = this.options.find(
      (opt) => opt.value === 'GPT-4o-mini'
    );
    if (defaultOption) {
      this.selectedOption = defaultOption.value;
      this.optionSelected.emit(this.selectedOption); // Emit event for default selection
      this.cdRef.detectChanges();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(value: string) {
    this.selectedOption = value;
    this.optionSelected.emit(value);
    this.isDropdownOpen = false;
    this.cdRef.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!(event.target as HTMLElement).closest('.aiChatSelect')) {
      this.isDropdownOpen = false;
    }
  }
}
