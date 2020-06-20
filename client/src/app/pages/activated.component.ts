import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-activated',
  template: `
    <div class="card">
      <div class="card-body">
        <h3 class="text-center">Аккаунт активирован!</h3>
        Пожалуйста <a routerLink="">войдите</a>.    
      </div>
    </div>
  `,
  styles: [
  ]
})
export class ActivatedComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
