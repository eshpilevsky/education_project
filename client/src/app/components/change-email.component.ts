import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState } from '../store/state/user.state';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'change-email',
  template: `
    <div class="row">
      <div class="col-md-12">
        <h3 class="mb-4">Изменить Email</h3>
      </div>
      <div class="col-md-8">
        <form action="#" (submit)="onEmailChangeFormSubmit($event)">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="text" class="form-control" id="email" name="email" [value]="(user$ | async)?.email">
          </div>
          <button class="btn btn-success" type="submit">Сохранить</button>
        </form>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class ChangeEmailComponent implements OnInit {
  @Select(UserState.getUser) user$: Observable<User>;

  constructor(
    private authProvider: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onEmailChangeFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get('email');
    this.authProvider.editUserData({ email })
      .then(() => {
        this.authProvider.signOut()
          .then(() => this.router.navigate(['activate']));
      })
      .catch(err => console.log('edit user errr', err));
  }

}
