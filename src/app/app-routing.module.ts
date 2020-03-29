import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreatePollComponent } from './poll/create-poll/create-poll.component';
import { ViewPollComponent } from './poll/view-poll/view-poll.component';
import { ViewPollsComponent } from './poll/view-polls/view-polls.component';
import { LoginComponent } from './landing/login/login.component';
import { SignupComponent } from './landing/signup/signup.component';
import { AuthGuardService } from './services/auth-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManagePollComponent } from './poll/manage-poll/manage-poll.component';
import { LandingComponent } from './landing/landing.component';
import { RespondComponent } from './landing/respond/respond.component';

const routes: Routes = [

  {
    path: '', component: LandingComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full'},
      {
        path: 'signup', component: SignupComponent
      },
      {
        path: 'respond', component: RespondComponent
      },
      {
        path: 'view', component: ViewPollComponent
      },
      {
        path: 'login', component: LoginComponent
      },
    ]
  },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'create', component: CreatePollComponent, pathMatch: 'full' },
      { path: 'all', component: ViewPollsComponent },
      { path: 'manage', component: ManagePollComponent },
      { path: '**', redirectTo: '/create', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }