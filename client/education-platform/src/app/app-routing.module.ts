import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import {
  UserResolver,
  DatabaseResolverService,
} from "./_services";

import { AboutComponent } from "./home/misc/about/about.component";
import { FeedbackComponent } from "./home/misc/feedback/feedback.component";
import { HelpSupportComponent } from "./home/misc/help-support/help-support.component";
import { ParentsComponent } from "./home/misc/parents/parents.component";
import { StudentsComponent } from "./home/misc/students/students.component";
import { TeachersComponent } from "./home/misc/teachers/teachers.component";
import { TermsConditionsComponent } from "./home/misc/terms-conditions/terms-conditions.component";
import { PageNotFoundComponent } from "./home/misc/page-not-found/page-not-found.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { LoggedInGuard } from "./_helpers";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [LoggedInGuard],
        resolve: {
          constants: DatabaseResolverService,
          user: UserResolver,
        },
      },
      { path: "feedback", component: FeedbackComponent },
      { path: "support", component: HelpSupportComponent },
      { path: "parents", component: ParentsComponent },
      { path: "students", component: StudentsComponent },
      { path: "teachers", component: TeachersComponent },
      { path: "terms", component: TermsConditionsComponent },
      { path: "about", component: AboutComponent },
      { path: "home", component: HomeComponent },
      { path: "**", component: PageNotFoundComponent },
    ],
    resolve: { user: UserResolver },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled",
      initialNavigation: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
