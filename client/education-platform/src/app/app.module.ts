import {
  BrowserModule,
  BrowserTransferStateModule,
} from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

// Third party modules
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { LoadingBarRouterModule } from "@ngx-loading-bar/router";
import { LoadingBarHttpClientModule } from "@ngx-loading-bar/http-client";

import { JwtInterceptor, ErrorInterceptor } from "./_helpers";

// Components
import { AppComponent } from "./app.component";
import { AccountModule } from "./account/account.module";
import { RouletteModule } from "./roulette/roulette.module";

import { HomeComponent } from "./home/home.component";
import { AboutComponent } from "./home/misc/about/about.component";
import { HelpSupportComponent } from "./home/misc/help-support/help-support.component";
import { FeedbackComponent } from "./home/misc/feedback/feedback.component";
import { ParentsComponent } from "./home/misc/parents/parents.component";
import { StudentsComponent } from "./home/misc/students/students.component";
import { TeachersComponent } from "./home/misc/teachers/teachers.component";
import { TermsConditionsComponent } from "./home/misc/terms-conditions/terms-conditions.component";
import { FooterComponent } from "./home/misc/footer/footer.component";
import { NavbarComponent } from "./home/misc/navbar/navbar.component";
import { PageNotFoundComponent } from "./home/misc/page-not-found/page-not-found.component";

import {
  DatabaseService,
  AuthenticationService,
  ToastService,
  RouletteService,
  BannerService,
} from "./_services";

import { MiscComponentsModule } from "./_misc_components/misc-components.module";
import { MoreInformationComponent } from "./home/more-information/more-information.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ScrollSpyDirective } from './_helpers/scroll-spy.directive';
import { PartnersComponent } from './home/more-information/partners/partners.component';
import { FeaturesComponent } from './home/more-information/features/features.component';
import { VideoComponent } from './home/more-information/video/video.component';
import { MissionComponent } from './home/more-information/mission/mission.component';
import { NumbersComponent } from './home/more-information/numbers/numbers.component';
import { TeamComponent } from './home/more-information/team/team.component';
import { JoinTheCommunityComponent } from './home/more-information/join-the-community/join-the-community.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MoreInformationComponent,
    AboutComponent,
    FeedbackComponent,
    HelpSupportComponent,
    ParentsComponent,
    StudentsComponent,
    TeachersComponent,
    TermsConditionsComponent,
    FooterComponent,
    NavbarComponent,
    PageNotFoundComponent,
    DashboardComponent,
    ScrollSpyDirective,
    PartnersComponent,
    FeaturesComponent,
    VideoComponent,
    MissionComponent,
    NumbersComponent,
    TeamComponent,
    JoinTheCommunityComponent,
  ],
  imports: [
    NgbModule,
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    BrowserTransferStateModule,
    HttpClientModule,
    // Loading bar
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    // Stuff for reactive / template driven forms
    ReactiveFormsModule,
    FormsModule,
    // modules (arbitrary order)
    AccountModule,
    RouletteModule,
    MiscComponentsModule,
    // AppRoutingComponent needs to be the last routing module
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthenticationService,
    DatabaseService,
    RouletteService,
    ToastService,
    BannerService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
