import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-invite-toast-component',
  standalone: true,
  template: `
    <div class="invite-toast">
      <span class="invite-icon"
        ><app-send-invite-icon></app-send-invite-icon
      ></span>
      <span class="invite-text">{{ data.msg }}</span>
    </div>
  `,
  imports: [],
  templateUrl: './invite-toast-component.component.html',
  styleUrl: './invite-toast-component.component.css',
})
export class InviteToastComponentComponent {
  // constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { msg: string }) {}
}
