import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuCloseIconComponent } from '../../../../shared/component/icons/menu-close-icon/menu-close-icon.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [MenuCloseIconComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
    constructor(
     private router:Router
){}
closePage(){
  this.router.navigate(['/auth/login'])
}
  }
