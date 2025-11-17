import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-no-data',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './no-data.component.html',
  styleUrl: './no-data.component.css',
})
export class NoDataComponent {}
