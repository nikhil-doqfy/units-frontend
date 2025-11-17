import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { BackIconComponent } from '../icons/back-icon/back-icon.component';
import { BHKIconComponent } from '../icons/bhk-icon/bhk-icon.component';
import { SqaureFeetIconComponent } from '../icons/sqaure-feet-icon/sqaure-feet-icon.component';
import { PropertyAccordianCardComponent } from '../property-accordian-card/property-accordian-card.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-property-view-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbAccordionModule,
    BackIconComponent,
    BHKIconComponent,
    SqaureFeetIconComponent,
    PropertyAccordianCardComponent,
  ],
  templateUrl: './property-view-card.component.html',
  styleUrls: ['./property-view-card.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyViewCardComponent {
  @Input() showBack: boolean = false;
  @Input() propertyImages: { imgSrc: string }[] = [];
  @Input() status!: string;
  @Input() name!: string;
  @Input() location!: string;
  @Input() price!: string;
  @Input() bhk!: string;
  @Input() sqft!: string;
  @Input() sections!: {
    title: string;
    items: { label: string; value: string }[];
  }[];

  @Output() back = new EventEmitter<void>();
  onBackClick() {
    this.back.emit();
  }

  @ViewChild('mainSwiper', { static: false }) mainSwiper!: ElementRef;
  @ViewChild('thumbSwiper', { static: false }) thumbSwiper!: ElementRef;

  thumbsSwiper: any;

  swiperBreakpoints = {
    320: { slidesPerView: 1, spaceBetween: 16 },
    576: { slidesPerView: 1, spaceBetween: 16 },
    768: { slidesPerView: 1, spaceBetween: 16 },
    992: { slidesPerView: 1, spaceBetween: 16 },
    1200: { slidesPerView: 1, spaceBetween: 16 },
  };

  swiperConfig: any = {
    slidesPerView: 1,
    spaceBetween: 16,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: this.swiperBreakpoints,
  };

  ngAfterViewInit() {
    setTimeout(() => {
      const mainEl = this.mainSwiper?.nativeElement;
      const thumbEl = this.thumbSwiper?.nativeElement;

      if (thumbEl) {
        Object.assign(thumbEl, {
          navigation: true,
          breakpoints: {
            // Mobile → horizontal
            0: {
              direction: 'horizontal',
              slidesPerView: 4,
            },
            // Desktop → vertical
            768: {
              direction: 'vertical',
              slidesPerView: 4,
            },
          },
        });
        thumbEl.initialize();
        this.thumbsSwiper = thumbEl.swiper;
      }

      if (mainEl) {
        Object.assign(mainEl, {
          thumbs: { swiper: this.thumbsSwiper },
          navigation: false,
          effect: 'fade',
          fadeEffect: { crossFade: true },
          pagination: false,
          autoplay: false,
        });
        mainEl.initialize();
      }
    }, 200);
  }
}
