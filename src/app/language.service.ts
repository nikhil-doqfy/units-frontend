import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private langSubject = new BehaviorSubject<string>(
    localStorage.getItem('lang') || 'en'
  );

  lang$ = this.langSubject.asObservable();

  constructor(private translate: TranslateService) {
    // Init language on service load
    const currentLang = this.getCurrentLanguage();
    this.translate.use(currentLang);
    this.setDirection(currentLang);
  }

  changeLanguage(lang: string) {
    localStorage.setItem('lang', lang);
    this.langSubject.next(lang);
    this.translate.use(lang);
    this.setDirection(lang);
  }

  getCurrentLanguage(): string {
    return this.langSubject.value;
  }

  private setDirection(lang: string) {
    const dir = lang === 'ar' || lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }
}
