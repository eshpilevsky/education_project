import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState } from '../store/state/user.state';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'change-password',
  template: `
    <ngb-alert type="success" *ngIf="passwordChangeSuccess" (close)="passwordChangeSuccess = false">
      Пароль успешно изменен.
    </ngb-alert>
    <div class="row">
      <div class="col-md-12">
        <h3 class="mb-4">Изменить пароль</h3>
      </div>
      <div class="col-md-4">
        <form [formGroup]="changePassswordForm" (submit)="onChangePassswordFormSubmit()">
          <div class="form-group">
            <label for="current">Текущий пароль</label>
            <input type="password" class="form-control" id="current" formControlName="currentPassword" [ngClass]="{
                'is-invalid': (!f.currentPassword.valid || f.currentPassword.value == f.newPassword.value) && 
                              (f.currentPassword.dirty || f.currentPassword.touched) 
              }">
          </div>
          <div class="form-group">
            <label for="new">Новый пароль</label>
            <input type="password" class="form-control" id="new" formControlName="newPassword" [ngClass]="{
                'is-invalid': (!f.newPassword.valid || f.reNewPassword.value != f.newPassword.value || 
                                f.currentPassword.value == f.newPassword.value) && 
                              (f.newPassword.dirty || f.newPassword.touched) 
              }">
          </div>
          <div class="form-group">
            <label for="re_new">Подтвердите новый пароль</label>
            <input type="password" class="form-control" id="re_new" formControlName="reNewPassword" [ngClass]="{
                'is-invalid': (!f.reNewPassword.valid || f.reNewPassword.value != f.newPassword.value) && 
                              (f.reNewPassword.dirty || f.reNewPassword.touched) 
              }">
          </div>
          <button class="btn btn-success" type="submit">Изменить</button>
        </form>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class ChangePasswordComponent implements OnInit {
  @Select(UserState.getUser) user$: Observable<User>;
  changePassswordForm: FormGroup;
  passwordChangeSuccess: boolean = false;

  constructor(
    private authProvider: AuthService
  ) { }

  ngOnInit(): void {
    this.changePassswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
      reNewPassword: new FormControl('', Validators.required),
    });
  }

  get f() {
    return this.changePassswordForm.controls;
  }

  onChangePassswordFormSubmit() {
    if (!this.changePassswordForm.valid || 
        this.f.reNewPassword.value != this.f.newPassword.value || 
        this.f.currentPassword.value == this.f.newPassword.value) return;

    const { currentPassword, newPassword, reNewPassword } = this.changePassswordForm.value;
    this.authProvider.changePassword(currentPassword, newPassword, reNewPassword)
      .then(() => {
        this.passwordChangeSuccess = true;
      })
      .catch(err => console.log('change password err', err));
  }

}
