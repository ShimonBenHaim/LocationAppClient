import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "src/app/auth/login/login.component";
import { SignupComponent } from "src/app/auth/signup/signup.component";
import { AuthGuard } from "./auth/auth.guard";
import { EventCreateComponent } from "./events/event-create/event-create.component";
import { LocationComponent } from "src/app/location-map/location-map.component";
import { EventListComponent } from "src/app/events/event-list/event-list.component";

const routes: Routes = [
  { path: "", component: EventListComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "map", component: LocationComponent },
  { path: "create", component: EventCreateComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
