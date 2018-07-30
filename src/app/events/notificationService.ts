import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SwPush } from "@angular/service-worker";

 const BACKEND_URL = "https://locationappshimon.herokuapp.com/api/notification/";
// const BACKEND_URL = "http://localhost:3000/api/notification/";

@Injectable({ providedIn: "root" })
export class NotificationService {


  constructor(private http: HttpClient, private swPush: SwPush) {}
  sub: PushSubscription;
  readonly VAPID_PUBLIC_KEY =
  "BM17fVhQ2uuLQXDKHG05krqnuXAli9nqBpq2fLx7grFTV4mFNZAWGrDkVq7rdRm-MT7_YwANt8e5vLaxE7Qj2Hk";

  subscribeToNotifications() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then(sub => {
        this.sub = sub;
        console.log("Notification Subscription: ", sub);
        this.addPushSubscriber(sub).subscribe(
          () => console.log("Sent push subscription object to server."),
          err =>
            console.log(
              "Could not send subscription object to server, reason: ",
              err
            )
        );
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

  sendNotifications() {
    console.log("Sending Newsletter to all Subscribers ...");
    this.send().subscribe();
  }

  addPushSubscriber(sub: any) {
   // return this.http.post(BACKEND_URL + "add", sub);
    return this.http.post(BACKEND_URL + "add", sub);
  }

  send() {
   // return this.http.post(BACKEND_URL + "send", null);
    return this.http.post(BACKEND_URL + "send", null);
  }
}
