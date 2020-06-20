import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SetUser } from '../store/actions/user.actions';
import { Store } from '@ngxs/store';

@Component({
  selector: 'navbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container">
        <a routerLink="" class="navbar-brand font-weight-bold">New Edutech</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav ml-auto" id="navbarNav" *ngIf="!user">
            <li class="nav-item mr-2">
              <button class="btn btn-primary" routerLink="">Войти</button>
            </li>
            <li class="nav-item">
              <button class="btn btn-secondary" routerLink="signup">Зарегистрироваться</button>
            </li>
          </ul>
          <ul class="navbar-nav ml-auto" id="navbarNav" *ngIf="user">
            <li class="nav-item" ngbDropdown>
              <a class="nav-link dropdown-toggle" role="button" ngbDropdownToggle>
                {{ user.firstname }}
              </a>
              <div class="dropdown-menu" ngbDropdownMenu>
                <a class="dropdown-item" href="#" routerLink="profile" ngbDropdownItem>Профиль</a>
                <a class="dropdown-item" href="#" routerLink="settings" ngbDropdownItem>Настройки</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" (click)="onSignOutClick($event)" ngbDropdownItem>Выйти</a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  @Input() user: User;

  constructor(
    private authProvider: AuthService,
    private router: Router,
    private store: Store
  ) { }

  ngOnInit(): void {
  }

  onSignOutClick(e) {
    e.preventDefault();

    this.authProvider.signOut()
      .then(() => {
        this.store.dispatch(new SetUser(null));
        this.router.navigate(['']);
      });
  }

}
