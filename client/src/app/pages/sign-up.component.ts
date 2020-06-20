import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  template: `
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title text-center mb-4">Регистрация</h4>
            <form [formGroup]="signUpForm" (submit)="onSignUpFormSubmit()">
              <div class="form-group">
                <div class="row">
                  <div class="col">
                    <label for="firstname">Имя</label>
                    <input type="text" class="form-control" id="firstname" formControlName="firstname" [ngClass]="{ 
                      'is-invalid': !f.firstname.valid && (f.firstname.dirty || f.firstname.touched),
                      'is-valid': f.firstname.valid && (f.firstname.dirty || f.firstname.touched)
                    }">
                    <div class="invalid-feedback">
                      Неверное имя.
                    </div>
                    <div class="valid-feedback">
                      Good
                    </div>
                  </div>
                  <div class="col">
                    <label for="lastname">Фамилия</label>
                    <input type="text" class="form-control" id="lastname" formControlName="lastname" [ngClass]="{ 
                      'is-invalid': !f.lastname.valid && (f.lastname.dirty || f.lastname.touched),
                      'is-valid': f.lastname.valid && (f.lastname.dirty || f.lastname.touched)
                    }">
                    <div class="invalid-feedback">
                      Неверная фамилия.
                    </div>
                    <div class="valid-feedback">
                      Good
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" class="form-control" id="username" formControlName="username" [ngClass]="{ 
                'is-invalid': !f.username.valid && (f.username.dirty || f.username.touched),
                'is-valid': f.username.valid && (f.username.dirty || f.username.touched)
              }">
                <div class="invalid-feedback">
                  Неверный username.
                </div>
                <div class="valid-feedback">
                  Good
                </div>
              </div>
              <div class="form-group">
                <label for="email">Email адрес</label>
                <input type="email" class="form-control" id="email" formControlName="email" [ngClass]="{
                'is-invalid': !f.email.valid && (f.email.dirty || f.email.touched),
                'is-valid': f.email.valid && (f.email.dirty || f.email.touched)
              }">
                <div class="invalid-feedback">
                  Неверный адрес электронной почты.
                </div>
                <div class="valid-feedback">
                  Good
                </div>
              </div>
              <div class="form-group">
                <label for="password">Пароль</label>
                <input type="password" class="form-control" id="password" formControlName="password" [ngClass]="{
                'is-invalid': !f.password.valid && (f.password.dirty || f.password.touched),
                'is-valid': f.password.valid && (f.password.dirty || f.password.touched)
              }">
                <div class="invalid-feedback">
                  Неверный пароль (4-8).
                </div>
                <div class="valid-feedback">
                  Good
                </div>
              </div>
              <div class="form-group" *ngIf="error">
                <small class="text-danger d-block">{{ error }}</small>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Зарегистрироваться</button>
            </form>
            <small class="d-block text-center mt-2">
              У вас уже есть аккаунт? <a routerLink="/">Войти</a>.
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  error: string;

  constructor(
    private authProvider: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signUpForm = new FormGroup({
      firstname: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(255)
      ])),
      lastname: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(255)
      ])),
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(10),
        Validators.minLength(5)
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.email
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(16),
        Validators.minLength(4)
      ]))
    });
  }

  get f() {
    return this.signUpForm.controls;
  }

  onSignUpFormSubmit() {
    if (!this.signUpForm.valid) return;

    const user = this.signUpForm.value;
    this.authProvider.signUp(user)
      .then(() => {
        localStorage.setItem('email', user.email);
        this.router.navigate(['activate']);
      })
      .catch((err: any) => {
        this.error = err.error.detail;
      });
  }

}
