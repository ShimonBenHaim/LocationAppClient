import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth/auth.service";
import { SwPush } from "@angular/service-worker";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  // Ctor
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoAuthUser();
  }
}
