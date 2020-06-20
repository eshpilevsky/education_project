import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProfileComponent } from './pages/profile.component';
import { SignUpComponent } from './pages/sign-up.component';
import { SignInComponent } from './pages/sign-in.component';
import { ActivationComponent } from './pages/activation.component';
import { ActivatedComponent } from './pages/activated.component';

import { NgxsModule } from '@ngxs/store';
import { UserState } from './store/state/user.state';
import { CourseState } from './store/state/course.state';
import { environment } from 'src/environments/environment';
import { NavbarComponent } from './components/navbar.component';
import { SettingsComponent } from './pages/settings.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordComponent } from './components/change-password.component';
import { EditProfileComponent } from './components/edit-profile.component';
import { ChangeEmailComponent } from './components/change-email.component';
import { ResetPasswordComponent } from './pages/reset-password.component';
import { httpInterceptorProviders } from './interceptors';
import { ChangeUsernameComponent } from './components/change-username.component';
import { DeleteAccountComponent } from './components/delete-account.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    SignUpComponent,
    SignInComponent,
    ActivationComponent,
    ActivatedComponent,
    NavbarComponent,
    SettingsComponent,
    ChangePasswordComponent,
    EditProfileComponent,
    ChangeEmailComponent,
    ResetPasswordComponent,
    ChangeUsernameComponent,
    DeleteAccountComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgxsModule.forRoot(
      [UserState, CourseState],
      { developmentMode: !environment.production }  
    ),
    NgbModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
