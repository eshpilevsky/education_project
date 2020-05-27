import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

export type RegisterType = "student" | "teacher";

@Component({
  selector: "account-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {

  type : RegisterType;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        if (params.get("type") === "student") {
          this.type = "student";
        } else if (params.get("type") === "teacher") {
          this.type = "teacher";
        } else {
          this.type = null;
        }
        console.log(this.type);
      }
    )
  }
}
