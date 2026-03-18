import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-field-link',
  standalone: true,
  imports: [],
  templateUrl: './field-link.component.html',
  styleUrl: './field-link.component.css',
})
export class FieldLinkComponent {
  @Input() title: string | undefined;
  @Output() click = new EventEmitter<void>();

  handleClick(): void {
    this.click.emit();
  }
}
