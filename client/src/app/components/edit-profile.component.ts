import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../store/state/user.state';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { SetUser } from '../store/actions/user.actions';

@Component({
  selector: 'edit-profile',
  template: `
    <div class="row">
      <div class="col-md-12">
        <h3 class="mb-4">Редактировать профиль</h3>
        <ngb-alert type="success" *ngIf="profileEditSuccess" (close)="profileEditSuccess = false">
          Профиль успешно отредактирован.
        </ngb-alert>
      </div>
      <div class="col-md-8">
        <form action="#" (submit)="onEditProfileFormSubmit($event)">
          <div class="form-group">
            <div class="row">
              <div class="col">
                <label for="firstname">Имя</label>
                <input type="text" [value]="(user$ | async)?.firstname" class="form-control" id="firstname" name="firstname">
              </div>
              <div class="col">
                <label for="lastname">Фамилия</label>
                <input type="text" [value]="(user$ | async)?.lastname" class="form-control" id="lastname" name="lastname">
              </div>
            </div>
          </div>
          <button class="btn btn-success" type="submit">Сохранить</button>
        </form>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class EditProfileComponent implements OnInit {
  @Select(UserState.getUser) user$: Observable<User>;
  profileEditSuccess: boolean = false;

  constructor(
    private authProvider: AuthService,
    private store: Store
  ) { }

  ngOnInit(): void {
  }

  onEditProfileFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const firstname = formData.get('firstname');
    const lastname = formData.get('lastname');
    this.authProvider.editUserData({ firstname, lastname })
      .then((data: User) => {
        this.profileEditSuccess = true;
        this.store.dispatch(new SetUser(data));
      })
      .catch(err => console.log('fullname edit err', err));
  }

}
