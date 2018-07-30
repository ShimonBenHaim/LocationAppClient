import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Inject
} from "@angular/core";
import { NgForm } from "@angular/forms";

import { EventsService } from "../events.service";
import { Location } from "src/app/events/location.model";
import { Event } from "src/app/events/event.model";
import { AuthService } from "src/app/auth/auth.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { NotificationService } from "src/app/events/notificationService";

@Component({
  selector: "app-event-create",
  templateUrl: "./event-create.component.html",
  styleUrls: ["./event-create.component.css"]
})
export class EventCreateComponent implements OnInit {
  public enteredTitle;
  public enteredDescription;
  public event: Event;
  public form: FormGroup;
  public title: FormControl;
  public description: FormControl;
  @Input() location: Location;

  // Ctor
  constructor(
    public eventsService: EventsService,
    public authServise: AuthService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EventCreateComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA)
    public data: { location: Location; eventId: string; mode: string }
  ) {}

  // Add new form for create event
  ngOnInit() {
    this.enteredTitle = "";
    this.enteredDescription = "";
    this.notificationService.subscribeToNotifications();
    this.title = new FormControl("", Validators.required);
    this.description = new FormControl("", Validators.required);
    this.form = new FormGroup({
      title: this.title,
      description: this.description
    });
  }

  // To know if add or update
  AddOrUpdate() {
    if (this.form.invalid) {
      return;
    }
    if (this.data.mode === "UPDATE") {
      this.onUpdateEvent();
    } else {
      this.onAddEvent();
    }
  }
  // Add Event
  onAddEvent() {
    this.eventsService.addEvent(
      this.form.value.title,
      this.form.value.description,
      this.data.location
    );
    this.event = {
      id: null,
      title: this.form.value.title,
      description: this.form.value.description,
      location: this.data.location,
      creator: this.authServise.getUserId()
      // participants: null
    };
    this.notificationService.sendNotifications();
    this.dialogRef.close(this.event);
  }
  // Update Event
  onUpdateEvent() {
    this.eventsService.UpdateEvent(
      this.data.eventId,
      this.form.value.title,
      this.form.value.description,
      this.data.location
    );
    this.event = {
      id: this.data.eventId,
      title: this.form.value.title,
      description: this.form.value.description,
      location: this.data.location,
      creator: this.authServise.getUserId()
      // participants: null
    };
    this.dialogRef.close(this.event);
  }
}
