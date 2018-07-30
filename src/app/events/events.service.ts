import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

import { Location } from "../events/location.model";
import { Event } from "./event.model";
import { environment } from "../../environments/environment";

 const BACKEND_URL = "https://locationappshimon.herokuapp.com/api/event/";

// const BACKEND_URL = "http://localhost:3000/api/event/";

@Injectable({ providedIn: "root" })
export class EventsService {
  private events: Event[] = [];
  private eventsUpdated = new Subject<Event[]>();

  // Ctor
  constructor(private http: HttpClient) {}

  // Get all events
  getEvents() {
    this.http
      .get<{ message: string; events: any }>(BACKEND_URL)
      .pipe(
        map(eventData => {
          return eventData.events.map(event => {
            return {
              location: event.location,
              title: event.title,
              description: event.description,
              id: event._id,
              creator: event.creator
              // participants: event.participants
            };
          });
        })
      )
      .subscribe(transformedEvents => {
        this.events = transformedEvents;
        this.eventsUpdated.next([...this.events]);
      });
  }

  // Delete event
  deleteEvent(eventId: string) {
    console.log(eventId);
    this.http.delete(BACKEND_URL + eventId).subscribe(() => {
      const updatedEvents = this.events.filter(event => event.id !== eventId);
      this.events = updatedEvents;
      this.eventsUpdated.next([...this.events]);
    });
  }

  getEventUpdateListener() {
    return this.eventsUpdated.asObservable();
  }

  // Get single event
  getEvent(id: string) {
    return this.http.get<{
      _id: string;
      lat: number;
      lng: number;
      title: string;
      description: string;
      creator: string;
      // participant: string;
    }>(BACKEND_URL + id);
  }

  joinToEvent() {

  }

  // Add event
  addEvent(title: string, description: string, location: Location) {
    const event: Event = {
      id: null,
      location: location,
      title: title,
      description: description,
      creator: null
      // participants: null
    };
    this.http
      .post<{ message: string; eventId: string }>(BACKEND_URL, event)
      .subscribe(responseData => {
        const id = responseData.eventId;
        event.id = id;
        this.events.push(event);
        this.eventsUpdated.next([...this.events]);
      });
  }
  // Update Event
  UpdateEvent(
    id: string,
    title: string,
    description: string,
    location: Location
  ) {
    let event: Event | FormData;
    event = {
      id: id,
      location: location,
      title: title,
      description: description,
      creator: null
      // participants: null
    };
    this.http.put(BACKEND_URL + id, event).subscribe(responseData => {
      console.log(responseData);
    });
  }

  // UpdateEventParticipants(
  //   id: string,
  //   title: string,
  //   description: string,
  //   location: Location
  //   // participants: string[]
  // ) {
  //   let event: Event | FormData;
  //   event = {
  //     id: id,
  //     location: location,
  //     title: title,
  //     description: description,
  //     creator: null
  //     // participants: participants
  //   };
  //   this.http.put(BACKEND_URL, event).subscribe(responseData => {
  //     console.log(responseData);
  //     console.log(event);
  //   });
  // }
}
