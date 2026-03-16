import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-step-pane',
  standalone: true,
  template: `
    <ng-template #paneContent>
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class StepPaneComponent {
  @Input() title!: string;
  @Input() pageTitle!: string;
  @Input() showEditButton: boolean = false;
  @Input() showBulkUpload: boolean = false;
  @Input() description!: string;
  @Input() secondCard: boolean = false;
  @Input() showInvitePmcBtn: boolean = false;
  @Input() showInviteOwnerBtn: boolean = false;
  @Input() blockCount!: number;
  @Input() unitCount!: number;
  @ViewChild('paneContent', { static: true }) content!: TemplateRef<any>;
}
