import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState } from '../store/state/user.state';
import { SetUser } from '../store/actions/user.actions';

@Component({
  selector: 'app-profile',
  template: `
    <div class="row">
      <div class="col-sm-8 offset-sm-2 col-md-6 offset-md-3 col-lg-4 offset-lg-4">
        <div class="card" *ngIf="(user$ | async) as user">
          <div class="card-body text-center">
            <div class="profile-picture">
              <img src="https://api.adorable.io/avatars/150/{{ (user$ | async)?.username }}" alt="profile">
            </div>
            <h5 class="mt-2">{{ (user$ | async)?.firstname }} {{ (user$ | async)?.lastname }}</h5>
            <small class="mb-4 d-block text-secondary">@{{ (user$ | async)?.username }}</small>
            <button class="btn btn-outline-secondary" (click)="onSignOutClick($event)">Выйти</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-picture {
      width: 80px;
      height: 80px;
      margin: auto;
      overflow: hidden;
      border-radius: 50%;
    }
    .profile-picture img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }
  `]
})
export class ProfileComponent implements OnInit {
  @Select(UserState.getUser) user$: Observable<User>;

  constructor(
    private authProvider: AuthService,
    private router: Router,
    private store: Store
  ) { }

  ngOnInit(): void { }

  onSignOutClick(e) {
    e.preventDefault();
    this.authProvider.signOut()
      .then(() => {
        this.store.dispatch(new SetUser(null));
        this.router.navigate(['']);
      })
      .catch(err => console.log('sign out err', err));
  }

}
