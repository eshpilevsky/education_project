import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../_services";
import { Router } from "@angular/router";
import { Meta, Title } from "@angular/platform-browser";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private meta: Meta,
    private title: Title
  ) {
    this.meta.addTag({
      name: "description",
      content:
        "Репетиторы дают студентам обучение - очень легко и доступно для всех.",
    });
    this.title.setTitle(
      "Education Platform - платформа для онлайн обучения с репетиторами"
    );
    this.meta.addTag({name: "keywords", content: "Обучение высокого качества"});
  }

  ngOnInit(): void {
    this.authenticationService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }
}
