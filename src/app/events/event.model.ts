import { Location } from "../events/location.model";

export interface Event {
  id: string;
  title: string;
  description: string;
  location: Location;
  creator: string;
  // participants: string[];
}
