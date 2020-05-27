import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../_services";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SendableLogin } from "src/app/_models";
import { first } from "rxjs/operators";

@Component({
  selector: "account-teacher",
  templateUrl: "./teacher.component.html",
  styleUrls: ["./teacher.component.scss"],
})
export class TeacherComponent implements OnInit {
  registerUrl: string = "/account/teacher/register";
  constructor() {}

  ngOnInit(): void {}
}
