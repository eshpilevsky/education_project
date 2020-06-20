import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-activation',
  template: `
    <div class="card" *ngIf="showMessage">
      <div class="card-body">
        Пожалуйста, активируйте свой аккаунт, нажав на ссылку, отправленную на <b>{{ email }}</b>.
        <button (click)="onResendActivationLinkClick($event)" class="btn btn-primary d-block mt-3 mx-auto">
          Переслать заново ссылку активации
        </button>
      </div>
    </div>
  `,
  styles: [
  ]
})
export class ActivationComponent implements OnInit {
  showMessage: boolean = false;
  email: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authProvider: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(data => {
      if (data.uid && data.token) {
        this.authProvider.activate(data.uid, data.token)
          .then(() => {
            localStorage.removeItem('email');
            this.router.navigate(['activated']);
          })
          .catch(err => console.log('activation error', err));
      } else {
        this.email = localStorage.getItem('email');
        this.showMessage = true;
      }
    });
  }

  onResendActivationLinkClick(e) {
    e.preventDefault();
    
    this.authProvider.resendActivationLink(this.email)
      .then(() => {
        console.log('Link sent again');
      })
      .catch(err => console.log('resend error', err));
  }

}
