import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { SetUser } from '../store/actions/user.actions';
import { User } from '../models/user';

@Component({
  selector: 'app-sign-in',
  template: `
    <div class="row">
      <div class="col-md-4 offset-md-4">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title text-center mb-4">Войти</h4>
            <form [formGroup]="signInForm" (submit)="onSignInFormSubmit()">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" class="form-control" id="username" formControlName="username"
                  [ngClass]="{ 'is-invalid': !f.username.valid && (f.username.dirty || f.username.touched) }">
              </div>
              <div class="form-group">
                <label for="password">Пароль</label>
                <input type="password" class="form-control" id="password" formControlName="password"
                  [ngClass]="{ 'is-invalid': !f.password.valid && (f.password.dirty || f.password.touched) }">
              </div>
              <div class="form-group" *ngIf="error">
                <small class="text-danger d-block">{{ error }}</small>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Войти</button>
            </form>
            <small class="d-block text-center mt-2">
              <a routerLink="reset_password">Забыли пароль?</a>
            </small>
            <small class="d-block text-center mt-2">
              У вас нет аккаунта? <a routerLink="signup">Зарегистрироваться</a> сейчас.
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  error: string;

  constructor(
    private authProvider: AuthService,
    private router: Router,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.signInForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  get f() {
    return this.signInForm.controls;
  }

  onSignInFormSubmit() {
    if (!this.signInForm.valid) return;
    
    const { username, password } = this.signInForm.value;
    this.authProvider.signIn(username, password)
      .then(() => {
        this.authProvider.getUserData()
          .then((data: User) => {
            this.store.dispatch(new SetUser(data));
            this.router.navigate(['profile']);
          });
      })
      .catch((err: any) => {
        this.error = err.error.detail;
      });
  }

}
