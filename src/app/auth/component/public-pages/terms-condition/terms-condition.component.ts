import { Component, OnInit } from '@angular/core';
import { PublicLayoutComponent } from '../public-layout/public-layout-component';
import {
  PublicPage,
  PublicPagesService,
} from '../../../services/public-pages.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-condition',
  standalone: true,
  imports: [PublicLayoutComponent, CommonModule, RouterLink],
  templateUrl: './terms-condition.component.html',
  styleUrl: './terms-condition.component.css',
})
export class TermsConditionComponent implements OnInit {
  page?: PublicPage;

  constructor(private publicPagesService: PublicPagesService) {}

  ngOnInit(): void {
    this.getTermsCondition();
  }

  getTermsCondition(): void {
    this.publicPagesService.getTermsCondition().subscribe({
      next: (response) => {
        this.page = response;
      },

      error: (error) => {
        console.error('Failed to load terms condition', error);
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
