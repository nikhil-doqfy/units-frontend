import { Component } from '@angular/core';
import {
  PublicPage,
  PublicPagesService,
} from '../../../services/public-pages.service';
import { PublicLayoutComponent } from '../public-layout/public-layout-component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [PublicLayoutComponent, CommonModule, RouterLink],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css',
})
export class PrivacyPolicyComponent {
  page?: PublicPage;

  constructor(private publicPagesService: PublicPagesService) {}

  ngOnInit(): void {
    this.getPrivacyPolicy();
  }

  getPrivacyPolicy(): void {
    this.publicPagesService.getPrivacyContent().subscribe({
      next: (response) => {
        this.page = response;
      },

      error: (error) => {
        console.error('Failed to load privacy policy', error);
      },
    });
  }

  scrollToSection(id: string): void {
    const element = document.getElementById(id);

    if (element) {
      const headerOffset = 90; // auth header height

      const elementPosition = element.getBoundingClientRect().top;

      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,

        behavior: 'smooth',
      });
    }
  }
}
