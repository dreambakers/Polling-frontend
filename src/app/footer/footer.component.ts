import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import { EmitterService } from '../services/emitter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { constants } from '../app.constants';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';

export interface MobileNavbarProps {
  home?: Boolean;
  arrange?: Boolean;
  add?: Boolean;
  create?: Boolean;
  preview?: Boolean;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  contants = constants;
  navbarProps: MobileNavbarProps = {
    home: false,
    arrange: false,
    add: false,
    create: false,
    preview: false
  };
  labels = {
    home: 'labels.home',
    arrange: 'labels.arrange',
    add: 'labels.addSurvey',
    create: 'labels.create',
    preview: 'labels.preview'
  };
  labelsCopy = JSON.stringify(this.labels);
  keysToHighlight = {};
  selectedLanguage;
  languages;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private translate: TranslateService,
    private emitterService: EmitterService,
    private router: Router,
    private languageService: LanguageService) { }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.updateNavbarProps:
          return this.navbarProps = { ...this.navbarProps, ...emitted.data };
        case constants.emitterKeys.resetNavbar:
          return this.reset();
        case constants.emitterKeys.updateNavbarLabels:
          return this.labels = { ...this.labels, ...emitted.data };
        case constants.emitterKeys.highlightKeys:
          return this.keysToHighlight = { ...this.keysToHighlight, ...emitted.data };
      }
    });
    this.languageService.getLanguages().subscribe(
      (res: any) => {
        this.languages = res.languages;
      }
    );
  }

  reset() {
    this.labels = JSON.parse(this.labelsCopy);
    this.keysToHighlight = {};
    Object.keys(this.navbarProps).forEach(key => {
      this.navbarProps[key] = false;
    });
  }

  languageChanged(event) {
    this.emitterService.emit(constants.emitterKeys.languageChanged, event);
  }

  isActive(key) {
    return this.navbarProps[key];
  }

  btnClick(key) {
    if (!this.shouldShowSort && ['preview', 'arrange'].includes(key) && this.isActive(key)) {
      this.keysToHighlight[key] = !this.keysToHighlight[key];
    }
    if (this.isActive(key)) {
      this.emitterService.emit(key);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get shouldShowSort() {
    return this.router.url.includes('all') || this.router.url.includes('responses');
  }

  get isMobile() {
    return DataService.isMobile;
  }

  get showMobileNav() {
    return this.isMobile && this.router.url.includes('/dashboard');
  }
}
