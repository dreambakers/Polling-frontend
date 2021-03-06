import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { DataService } from './data.service';
import { SortDialogModel, SortDialogComponent } from '../dialogs/sort/sort-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AboutComponent } from '../dialogs/about/about.component';
import { constants } from '../app.constants';
import { ShareComponent } from '../dialogs/share/share.component';
import { InactivityComponent } from '../dialogs/inactivity/inactivity.component';
import { CookiePolicyComponent } from '../dialogs/cookie-policy/cookie-policy.component';
import { ImprintComponent } from '../dialogs/imprint/imprint.component';
import { TermsAndConditionsComponent } from '../dialogs/terms-and-conditions/terms-and-conditions.component';
import { FeedbackComponent } from '../dialogs/feedback/feedback.component';
import { UpgradeComponent } from '../dialogs/upgrade/upgrade.component';
import { ImportSurveyComponent } from '../dialogs/import-survey/import-survey.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constants = constants;

  constructor(
    public dialog: MatDialog,
    private translate: TranslateService
  ) { }

  confirm(title, message): Observable<any> {
    const dialogData = new ConfirmDialogModel(this.translate.instant(title), this.translate.instant(message));
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  sort(keys, currentSort): Observable<any> {
    const dialogData = new SortDialogModel(keys, currentSort);
    const dialogRef = this.dialog.open(SortDialogComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  about(): Observable<any> {
    const dialogRef = this.dialog.open(AboutComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

  cookiePolicy(): Observable<any> {
    const dialogRef = this.dialog.open(CookiePolicyComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

  imprint(): Observable<any> {
    const dialogRef = this.dialog.open(ImprintComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

  termsAndConditions(): Observable<any> {
    const dialogRef = this.dialog.open(TermsAndConditionsComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

  share(poll): Observable<any> {
    const dialogRef = this.dialog.open(ShareComponent, {
      width: '350px',
      data: { poll }
    });
    return dialogRef.afterClosed();
  }

  inactivity(): Observable<any> {
    const dialogRef = this.dialog.open(InactivityComponent, {
      width: '350px',
    });
    return dialogRef.afterClosed();
  }

  feedback(): Observable<any> {
    const dialogRef = this.dialog.open(FeedbackComponent, {
      width: '350px',
    });
    return dialogRef.afterClosed();
  }

  upgrade(): Observable<any> {
    const dialogRef = this.dialog.open(UpgradeComponent, {
      width: '350px',
    });
    return dialogRef.afterClosed();
  }

  importSurvey(): Observable<any> {
    const dialogRef = this.dialog.open(ImportSurveyComponent, {
      width: '350px',
    });
    return dialogRef.afterClosed();
  }

}
