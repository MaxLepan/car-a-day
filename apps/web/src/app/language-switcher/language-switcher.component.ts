import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type Locale = 'fr' | 'en';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent implements OnInit {
  readonly locales = [
    { code: 'fr', label: $localize`:@@langFr:FR` },
    { code: 'en', label: $localize`:@@langEn:EN` }
  ] as const;

  current: Locale = 'fr';

  private readonly storageKey = 'caraday:lang';

  ngOnInit(): void {
    this.syncAndRedirect();
  }

  onChange(code: string): void {
    if (code !== 'fr' && code !== 'en') {
      return;
    }
    this.saveLocale(code);
    this.navigateToLocale(code);
  }

  private syncAndRedirect(): void {
    const path = window.location.pathname;
    const saved = this.getSavedLocale();
    const current = this.getLocaleFromPath(path);

    this.current = saved ?? current;

    if (!this.hasLocalePrefix(path)) {
      const target = saved ?? current;
      this.saveLocale(target);
      this.current = target;
      this.navigateToLocale(target);
      return;
    }

    if (saved && saved !== current) {
      this.current = saved;
      this.navigateToLocale(saved);
      return;
    }

    this.saveLocale(current);
    this.current = current;
  }

  private getSavedLocale(): Locale | null {
    const saved = localStorage.getItem(this.storageKey);
    return saved === 'fr' || saved === 'en' ? saved : null;
  }

  private saveLocale(locale: Locale): void {
    localStorage.setItem(this.storageKey, locale);
    this.current = locale;
  }

  private hasLocalePrefix(path: string): boolean {
    return path === '/fr' || path.startsWith('/fr/') || path === '/en' || path.startsWith('/en/');
  }

  private getLocaleFromPath(path: string): Locale {
    if (path === '/en' || path.startsWith('/en/')) {
      return 'en';
    }
    if (path === '/fr' || path.startsWith('/fr/')) {
      return 'fr';
    }
    return 'fr';
  }

  private stripLocalePrefix(path: string): string {
    if (path === '/fr' || path === '/fr/' || path === '/en' || path === '/en/') {
      return '/';
    }
    if (path.startsWith('/fr/')) {
      return path.slice(3);
    }
    if (path.startsWith('/en/')) {
      return path.slice(3);
    }
    return path.startsWith('/') ? path : `/${path}`;
  }

  private navigateToLocale(locale: Locale): void {
    const rest = this.stripLocalePrefix(window.location.pathname);
    const targetPath = `/${locale}${rest}`;
    const target = `${targetPath}${window.location.search}${window.location.hash}`;

    if (`${window.location.pathname}${window.location.search}${window.location.hash}` === target) {
      return;
    }

    window.location.assign(target);
  }
}
