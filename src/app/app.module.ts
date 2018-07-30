import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AgmCoreModule } from "@agm/core";

import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { AppRoutingModule } from "./app-routing.module";
import { LoginComponent } from "src/app/auth/login/login.component";
import { SignupComponent } from "src/app/auth/signup/signup.component";
import { AuthInterceptor } from "./auth/auth-interceptor";
import { EventCreateComponent } from "./events/event-create/event-create.component";
import { EventListComponent } from "./events/event-list/event-list.component";
import { LocationComponent } from "./location-map/location-map.component";
import { AngularMaterialModule } from "./angular-material.module";
import { environment } from "../environments/environment";
import { ErrorInterceptor } from "./error-interceptor";
import { ErrorComponent } from "./error/error.component";
import { ServiceWorkerModule } from "@angular/service-worker";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    EventCreateComponent,
    EventListComponent,
    LocationComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularMaterialModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {enabled: environment.production}),
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBx5rxWUm0yJQ_evuhlE36wVUOyVOFtkH0",
      libraries: ["places", "geometry"]
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule {}
