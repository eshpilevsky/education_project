import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <div class="row">
      <div class="col-md-3">
        <div class="list-group" role="tablist" ngbNav #nav="ngbNav">
          <a class="list-group-item list-group-item-action" ngbNavItem="profile" ngbNavLink>
            Профиль
            <ng-template ngbNavContent>             
              <edit-profile></edit-profile>   
              <hr>            
              <change-email></change-email>
            </ng-template>
          </a>
          <a class="list-group-item list-group-item-action" ngbNavItem="account" ngbNavLink>
            Аккаунт
            <ng-template ngbNavContent>
              <change-username></change-username>
              <hr>
              <delete-account></delete-account>
            </ng-template>
          </a>
          <a class="list-group-item list-group-item-action" ngbNavItem="security" ngbNavLink>
            Безопасность
            <ng-template ngbNavContent>
              <change-password></change-password>
            </ng-template>
          </a>
          <a class="list-group-item list-group-item-action" ngbNavItem="" ngbNavLink>
            Баланс
            <ng-template ngbNavContent>
<!--              <balance></balance>-->
            </ng-template>
          </a>
          <a class="list-group-item list-group-item-action" ngbNavItem="" ngbNavLink>
            История платежей
            <ng-template ngbNavContent>
<!--              <payments></payments>-->
            </ng-template>
          </a>
        </div>
      </div>
      <div class="col-md-9">
        <div class="card">
          <div class="card-body" [ngbNavOutlet]="nav"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
