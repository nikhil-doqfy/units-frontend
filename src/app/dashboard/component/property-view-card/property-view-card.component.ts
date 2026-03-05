import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { BackIconComponent } from '../icons/back-icon/back-icon.component';
import { BHKIconComponent } from '../icons/bhk-icon/bhk-icon.component';
import { SqaureFeetIconComponent } from '../icons/sqaure-feet-icon/sqaure-feet-icon.component';
import { PropertyAccordianCardComponent } from '../property-accordian-card/property-accordian-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharePlatfromIconComponent } from '../../../icons/share-platfrom-icon/share-platfrom-icon.component';

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
    SharePlatfromIconComponent,
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
  @ViewChild('mainSwiper', { static: false }) mainSwiper!: ElementRef;
  @ViewChild('thumbSwiper', { static: false }) thumbSwiper!: ElementRef;
  showSharePopup = false;
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

  onBackClick() {
    this.back.emit();
  }
  toggleShare() {
    this.showSharePopup = !this.showSharePopup;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['propertyImages'] && this.propertyImages.length > 0) {
      this.initSwipersSafely();
    }
  }

  initSwipersSafely() {
    requestAnimationFrame(() => {
      this.initSwipers();
    });
  }

  initSwipers() {
    const mainEl = this.mainSwiper?.nativeElement;
    const thumbEl = this.thumbSwiper?.nativeElement;

    if (!mainEl || !thumbEl) return;

    if (mainEl.swiper || thumbEl.swiper) return;

    Object.assign(thumbEl, {
      navigation: true,
      breakpoints: {
        0: { direction: 'horizontal', slidesPerView: 4 },
        768: { direction: 'vertical', slidesPerView: 4 },
      },
    });

    thumbEl.initialize();
    this.thumbsSwiper = thumbEl.swiper;

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
}
