import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'change-username',
  template: `
    <div class="row">
      <div class="col-md-12">
        <h3 class="mb-4">Изменить имя пользователя</h3>
        <ngb-alert type="success" *ngIf="usernameChangeSuccess" (close)="usernameChangeSuccess = false">
          Имя пользователя успешно изменено.
        </ngb-alert>
      </div>
      <div class="col-md-8">
        <form action="#" (submit)="onUsernameChangeFormSubmit($event)">
          <div class="form-group">
            <label for="new-username">Новое имя пользователя</label>
            <input type="text" class="form-control" id="new-username" name="new-username">
          </div>
          <div class="form-group">
            <label for="re-new-username">Подтвердите новое имя пользователя</label>
            <input type="text" class="form-control" id="re-new-username" name="re-new-username">
          </div>
          <div class="form-group">
            <label for="password">Пароль</label>
            <input type="password" class="form-control" id="password" name="password">
          </div>
          <button class="btn btn-success" type="submit">Изменить</button>
        </form>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class ChangeUsernameComponent implements OnInit {
  usernameChangeSuccess: boolean = false;

  constructor(
    private authProvider: AuthService
  ) { }

  ngOnInit(): void {
  }

  onUsernameChangeFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const password = formData.get('password');
    const newUsername = formData.get('new-username');
    const reNewUsername = formData.get('re-new-username');
    this.authProvider.changeUsername(password, newUsername, reNewUsername)
      .then(() => {
        this.usernameChangeSuccess = true;
      })
      .catch(err => console.log('change username err', err));
  }

}
