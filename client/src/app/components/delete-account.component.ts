import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'delete-account',
  template: `
    <div class="row">
      <div class="col-md-12">
        <h3 class="mb-4">Удалить аккаунт</h3>
      </div>
      <div class="col-md-8">
        <form action="#" (submit)="onDeleteAccountFormSubmit($event)">
          <div class="form-group">
            <label for="del_password">Пароль</label>
            <input type="password" class="form-control" id="del_password" name="password">
          </div>
          <button class="btn btn-danger" type="submit">Удалить аккаунт</button>
        </form>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class DeleteAccountComponent implements OnInit {

  constructor(
    private authProvider: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onDeleteAccountFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('password');
    this.authProvider.deleteAccount(password)
      .then(() => this.authProvider.signOut())
      .then(() => this.router.navigate(['']))
      .catch(err => console.log('account delete err', err));
  }

}
