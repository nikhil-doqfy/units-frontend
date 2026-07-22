import { Component } from '@angular/core';
import { PublicPagesService } from '../../../services/public-pages.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PublicLayoutComponent } from '../public-layout/public-layout-component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink, CommonModule, PublicLayoutComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.css',
})
export class Helpcomponent {
  helpCards: any[] = [];
  faqs: any[] = [];

  activeFaq: number | null = null;

  toggleFaq(index: number) {
    this.activeFaq = this.activeFaq === index ? null : index;
  }

  constructor(
    private publicPagesService: PublicPagesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.helpCards = this.publicPagesService.getHelpCards();

    this.faqs = this.publicPagesService.getFAQs();
  }

  closePage() {
    this.router.navigate(['/auth/login']);
  }
}
