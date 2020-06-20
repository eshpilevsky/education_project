import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInComponent } from './pages/sign-in.component';
import { SignUpComponent } from './pages/sign-up.component';
import { ProfileComponent } from './pages/profile.component';
import { LoggedIn, NotLoggedIn } from './guards/auth.guard';
import { ActivationComponent } from './pages/activation.component';
import { ActivatedComponent } from './pages/activated.component';
import { SettingsComponent } from './pages/settings.component';
import { ResetPasswordComponent } from './pages/reset-password.component';


const routes: Routes = [
  {
    path: '',
    component: SignInComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'signup',
    component: SignUpComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'activate',
    component: ActivationComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'activate/:uid/:token',
    component: ActivationComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'activated',
    component: ActivatedComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [LoggedIn]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [LoggedIn]
  },
  {
    path: 'reset_password',
    component: ResetPasswordComponent,
    canActivate: [NotLoggedIn]
  },
  {
    path: 'reset_password/:uid/:token',
    component: ResetPasswordComponent,
    canActivate: [NotLoggedIn]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
