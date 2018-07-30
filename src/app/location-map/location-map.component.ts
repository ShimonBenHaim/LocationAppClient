import {
  Component,
  ViewChild,
  ElementRef,
  NgZone,
  OnInit,
  OnDestroy
} from "@angular/core";
import { MouseEvent as AGMMouseEvent, MapsAPILoader } from "@agm/core";
import {} from "@types/googlemaps";
import { FormControl } from "@angular/forms";
import { coerceNumberProperty } from "@angular/cdk/coercion";
import { MatDialog } from "@angular/material";

import { EventsService } from "src/app/events/events.service";
import { Location } from "../events/location.model";
import { Event } from "../events/event.model";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { AgmInfoWindow } from "@agm/core/directives/info-window";
import { EventCreateComponent } from "src/app/events/event-create/event-create.component";
import { AgmMarker } from "@agm/core/directives/marker";

@Component({
  selector: "app-location",
  templateUrl: "./location-map.component.html",
  styleUrls: ["./location-map.component.css"]
})
export class LocationComponent implements OnInit, OnDestroy {
  public events: Event[] = [];
  public filteredEvents = [];
  private eventsSub: Subscription;
  private authStatusSub: Subscription;
  private mode: string;
  public enteredRadius;
  public location: Location;
  public zoom;
  public searchControl: FormControl;
  public locationChosen;
  public userId: string;
  public userIsAuthenticated;

  @ViewChild("search") public searchElementRef: ElementRef;

  // Ctor
  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public eventsService: EventsService,
    public authService: AuthService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.enteredRadius = 2000;
    this.location = { lat: 51.678418, lng: 7.809007 };
    this.zoom = 16;
    this.locationChosen = false;
    this.userIsAuthenticated = false;
    this.searchControl = new FormControl();
    //
    this.getUserLocation();
    this.loadMap();
    this.getEvents();
    this.showAllEventsInRadius();
    this.checkUserAuthenticated();
  }

  // For loading the map on my application
  loadMap() {
    this.mapsAPILoader.load().then(() => {
      const autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          types: ["address"]
        }
      );
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.location.lat = place.geometry.location.lat();
          this.location.lng = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  // Check User Authenticated
  checkUserAuthenticated() {
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  // Get All Events
  getEvents() {
    this.eventsService.getEvents();
    this.eventsSub = this.eventsService
      .getEventUpdateListener()
      .subscribe((events: Event[]) => {
        this.events = events;
      });
  }

  // start of slider
  onInputChange($event) {
    this.enteredRadius = $event.value;
    this.showAllEventsInRadius();
  }

  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }
    if (value >= 1000) {
      return Math.round(value / 1000) + "k";
    }
    return value;
  }
  // end of slider

  // Calculate Distance for all events in radius
  showAllEventsInRadius() {
    this.mapsAPILoader.load().then(() => {
      const center = new google.maps.LatLng(
        this.location.lat,
        this.location.lng
      );
      this.filteredEvents = this.events.filter(m => {
        const markerLoc = new google.maps.LatLng(
          m.location.lat,
          m.location.lng
        );
        const distanceInKm =
          google.maps.geometry.spherical.computeDistanceBetween(
            markerLoc,
            center
          ) / 1000;
        if (distanceInKm < this.enteredRadius / 1000) {
          return m;
        }
      });
    });
  }

  // When the user want to go to event
  // onGoToEvent(event: Event) {
  //   if (event.participants.find(p => p !== this.authService.getUserId())){
  //     event.participants.push(this.authService.getUserId());
  //     this.eventsService.UpdateEventParticipants(
  //       event.id,
  //       event.title,
  //       event.description,
  //       event.location,
  //       event.participants
  //     );
  //     console.log(event);
  //   }
  // }

  // Adding event to map
  pushEvent($event) {
    console.log("new event", $event);
    const event = {
      id: null,
      title: $event.title,
      description: $event.description,
      location: { lat: $event.location.lat, lng: $event.location.lng },
      creator: this.authService.getUserId()
      // participants: null
    };
    this.events.push(event);
    this.showAllEventsInRadius();
  }

  // Delete Event
  onDelete(event: Event) {
    console.log("on delete");
    this.eventsService.deleteEvent(event.id);
    const index = this.events.indexOf(event, 0);
    if (index > -1) {
      this.events.splice(index, 1);
      this.showAllEventsInRadius();
    }
  }

  // Update Event
  onUpdate(eventId: string) {
    console.log("location map : on update");
    this.mode = "UPDATE";
    const dialogRef = this.dialog.open(EventCreateComponent, {
      width: "300px",
      data: {
        location: { lat: this.location.lat, lng: this.location.lng },
        eventId: eventId,
        mode: this.mode
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`dialog closed: ${result}`);
      this.showUpdatedItem(result);
    });
  }

  // Show event after updating
  private showUpdatedItem(newItem: Event) {
    const updateItem = this.events.find(this.findIndexToUpdate, newItem.id);
    const index = this.events.indexOf(updateItem);
    this.events[index].id = newItem.id;
    this.events[index].title = newItem.title;
    this.events[index].description = newItem.description;
    this.events[index].creator = newItem.creator;
    this.showAllEventsInRadius();
  }

  // Find the event who need to updating
  private findIndexToUpdate(newItem) {
    return newItem.id === this;
  }

  // Get location on mouse click
  mapClicked($event: AGMMouseEvent) {
    this.location.lat = $event.coords.lat;
    this.location.lng = $event.coords.lng;
    this.showAllEventsInRadius();
  }

  // Open the dialog for creating Event
  openCreateEvent() {
    console.log("location map : open create event");
    const dialogRef = this.dialog.open(EventCreateComponent, {
      width: "300px",
      data: { location: { lat: this.location.lat, lng: this.location.lng } }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.pushEvent(result);
    });
  }

  // Get users location
  getUserLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.zoom = 12;
      });
    }
    this.showAllEventsInRadius();
  }

  ngOnDestroy() {
    this.eventsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
