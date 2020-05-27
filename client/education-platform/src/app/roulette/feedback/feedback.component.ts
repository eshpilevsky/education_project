import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import {
  RouletteRequestType,
  RouletteService,
  ToastService,
} from "src/app/_services";
import { Meeting, Feedback } from "src/app/_models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { rangeValidator } from "src/app/_helpers";

@Component({
  selector: "roulette-feedback",
  templateUrl: "./feedback.component.html",
  styleUrls: ["./feedback.component.scss"],
})
export class FeedbackComponent implements OnInit {
  @Input() readonly requestType: RouletteRequestType;
  @Input() readonly meeting: Meeting;
  @Output() done = new EventEmitter<boolean>();

  form: FormGroup;

  submitSuccess = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private rouletteService: RouletteService,
    private ts: ToastService
  ) {}
  ngOnInit(): void {
    this.form = this.fb.group({
      rating: [-1, [Validators.required, rangeValidator(1, 6)]],
      message: [""],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const f: Feedback = {
      receiver:
        this.requestType === "teacher"
          ? this.meeting.student
          : this.meeting.teacher,
      provider:
        this.requestType === "teacher"
          ? this.meeting.teacher
          : this.meeting.student,
      rating: this.f.rating.value,
      message: this.f.message.value,
      meeting: this.meeting.meetingId,
      created: new Date().toISOString(),
    };

    console.log("sending feedback: ", f);
    this.rouletteService.postFeedback(f).subscribe(
      (data) => {
        this.done.emit(true);
      },
      (error) => {
        this.ts.error(JSON.stringify(error));
      }
    );
  }
}
