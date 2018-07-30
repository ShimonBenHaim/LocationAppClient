import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { EventsService } from "../events.service";
import { Event } from "../event.model";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-event-list",
  templateUrl: "./event-list.component.html",
  styleUrls: ["./event-list.component.css"]
})
export class EventListComponent implements OnInit, OnDestroy {
  public events: Event[] = [];
  private eventsSub: Subscription;
  private authStatusSub: Subscription;
  public userId: string;
  public userIsAuthenticated;

  // Ctor
  constructor(
    public eventService: EventsService,
    private authService: AuthService
  ) {}

  // Get all event and check if user is authenticated when the app start
  ngOnInit() {
    this.userIsAuthenticated = false;
    this.eventService.getEvents();
    this.userId = this.authService.getUserId();
    this.eventsSub = this.eventService
      .getEventUpdateListener()
      .subscribe((events: Event[]) => {
        this.events = events;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  // Delete Event
  onDelete(eventId: string) {
    this.eventService.deleteEvent(eventId);
  }

  ngOnDestroy() {
    this.eventsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
