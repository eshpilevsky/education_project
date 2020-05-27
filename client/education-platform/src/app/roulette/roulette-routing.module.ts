import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RouletteComponent } from "./roulette.component";
import { LoggedInGuard, StudentGuard, TeacherGuard } from "../_helpers";
import { DatabaseResolverService, UserResolver } from "../_services";
import { MailVerifiedGuard } from '../_helpers/email-verified.guard';

const routes: Routes = [
  {
    path: "roulette",
    children: [
      {
        path: "student",
        component: RouletteComponent,
        canActivate: [StudentGuard],
        children: [],
      },
      {
        path: "teacher",
        component: RouletteComponent,
        canActivate: [TeacherGuard],
        children: [],
      },
    ],
    resolve: { constants: DatabaseResolverService, user: UserResolver },
    canActivate: [LoggedInGuard, MailVerifiedGuard],
    canActivateChild: [LoggedInGuard, MailVerifiedGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouletteRoutingModule {}
