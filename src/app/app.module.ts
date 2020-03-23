import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from '../app/interceptors/token.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CreatePollComponent } from './poll/create-poll/create-poll.component';
import { ViewPollComponent } from './poll/view-poll/view-poll.component';
import { ViewPollsComponent } from './poll/view-polls/view-polls.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { LoginComponent } from './landing/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignupComponent } from './landing/signup/signup.component';
import { RespondComponent } from './landing/respond/respond.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { NavbarComponent } from './navbar/navbar.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ManagePollComponent } from './poll/manage-poll/manage-poll.component';
import { LandingComponent } from './landing/landing.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    CreatePollComponent,
    ViewPollComponent,
    NavbarComponent,
    ViewPollsComponent,
    StarRatingComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    ManagePollComponent,
    LandingComponent,
    RespondComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatListModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    DragDropModule,
    MatTabsModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent]
})
export class AppModule { }
