import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError, combineLatest } from "rxjs";
import { environment } from "../../environments/environment";
import { catchError, map, tap } from "rxjs/operators";
import { of } from "rxjs";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  Gender,
  Constants,
  SendableSchoolData,
  sendableToLocalSchoolData,
} from "../_models";

@Injectable({ providedIn: "root" })
export class DatabaseService {
  public states: Observable<State[]>;
  public subjects: Observable<Subject[]>;
  public schoolTypes: Observable<SchoolType[]>;
  public schoolData: Observable<SchoolData[]>;
  public genders: Observable<Gender[]>;

  constructor(private http: HttpClient) {
    // this.states = this.get<State[]>("/account/states/");
    // this.subjects = this.get<Subject[]>("/account/subjects/");
    // this.schoolTypes = this.get<SchoolType[]>("/account/schooltypes/");
    this.schoolData = combineLatest(
      this.schoolTypes,
      this.get<SendableSchoolData[]>("/account/schooldata/")
    ).pipe(
      map(([schoolTypes, schoolData]) =>
        schoolData.map((s) => sendableToLocalSchoolData(s, schoolTypes))
      )
    );

    this.genders = of(
      JSON.parse(
        '[{"id":1,"gender":"Female", "shortcode": "Ж"},{"id":2,"gender":"Male", "shortcode": "М"}]'
      ) as Gender[]
    );
  }

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(environment.apiUrl + url).pipe(
      catchError((err) => {
        console.log("Database request error: ", err);
        return throwError(err);
      })
    );
  }

  public getConstants() {
    return combineLatest(
      this.states,
      this.subjects,
      this.schoolTypes,
      this.schoolData,
      this.genders
    ).pipe(map((value) => new Constants(...value)));
  }
}
