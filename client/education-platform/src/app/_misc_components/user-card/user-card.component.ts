import { Component, OnInit, Input } from "@angular/core";
import { User, Match } from "src/app/_models";
import { RouletteRequestType } from "src/app/_services";

@Component({
  selector: "misc-user-card",
  templateUrl: "./user-card.component.html",
  styleUrls: ["./user-card.component.scss"],
})
export class UserCardComponent implements OnInit {
  @Input() readonly user: User;
  @Input() readonly type: RouletteRequestType;
  @Input() readonly match: Match;

  img: string;

  constructor() {}
  ngOnInit(): void {
    this.img =
      this.type === "teacher" &&
      !(this.user.teacherdata.profilePicture as string).includes("undefined")
        ? this.user.teacherdata.profilePicture
        : "assets/img/icons/user_default.png";
  }

  get teacherdata() {
    return this.match.teacher.teacherdata;
  }
  get schoolData() {
    return this.match.student.studentdata.schoolData;
  }
}
