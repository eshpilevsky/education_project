import { Component, OnInit } from '@angular/core';

import { Store, Select } from '@ngxs/store';
import { SetUser } from './store/actions/user.actions';
import { User } from './models/user';
import { Course } from './models/course';
import { Observable } from 'rxjs';
import { UserState } from './store/state/user.state';
import { CourseState } from './store/state/course.state';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <navbar [user]="(user$ | async)"></navbar>
    <div class="container my-5">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  @Select(UserState.getUser) user$: Observable<User>;

  constructor(
    private store: Store,
    private authProvider: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authProvider.isAuthenticated) {
      this.authProvider.getUserData()
        .then((data: User) => this.store.dispatch(new SetUser(data)));
    }
  }
}
