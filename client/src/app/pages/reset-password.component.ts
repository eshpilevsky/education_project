import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  template: `
    <div class="row">
      <div class="col-md-4 offset-md-4">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title text-center mb-4">Сброс пароля</h4>
            <ngb-alert type="success" *ngIf="emailSentMessage" (close)="emailSentMessage = false">
              Письмо успешно отправлено
            </ngb-alert>
            <form action="#" (submit)="onSendResetPasswordEmailSubmit($event)" *ngIf="!(uid && token)">
              <div class="form-group">
                <input type="text" class="form-control" name="email" id="email" placeholder="Email Address">
              </div>
              <button class="btn btn-primary btn-block" type="submit">Сбросить пароль</button>
            </form>
            <ngb-alert type="success" *ngIf="passwordResetMessage" (close)="passwordResetMessage = false">
              Пароль успешно сброшен, пожалуйста <a routerLink="">войдите</a>.    
            </ngb-alert>
            <form action="#" (submit)="onResetPasswordSubmit($event)" *ngIf="uid && token">
              <div class="form-group">
                <label for="new-password">Новый пароль</label>
                <input type="password" class="form-control" name="new-password" id="new-password">
              </div>
              <div class="form-group">
                <label for="re-new-password">Подтвердите новый пароль</label>
                <input type="password" class="form-control" name="re-new-password" id="re-new-password">
              </div>
              <button class="btn btn-success btn-block" type="submit">Сменить пароль</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ResetPasswordComponent implements OnInit {
  emailSentMessage: boolean = false;
  passwordResetMessage: boolean = false;
  uid: string;
  token: string;

  constructor(
    private authProvider: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(data => {
      this.uid = data.uid;
      this.token = data.token;
    });
  }

  onSendResetPasswordEmailSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('email');
    this.authProvider.sendResetPasswordEmail(email)
      .then(() => {
        this.emailSentMessage = true;
      })
      .catch(err => console.log('sendResetPasswordEmail err', err));
  }

  onResetPasswordSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const newPassword = formData.get('new-password');
    const reNewPassword = formData.get('re-new-password');
    this.authProvider.resetPassword(this.uid, this.token, newPassword, reNewPassword)
      .then(() => {
        this.passwordResetMessage = true;
      })
      .catch(err => console.log('reset password errr', err));
  }

}
