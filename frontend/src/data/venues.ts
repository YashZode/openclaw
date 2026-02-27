export interface Venue {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  wifi: string;
  outlets: string;
  noise: string;
  seats: number;
}

export const venues: Venue[] = [
  {
    id: "1",
    name: "Coffee & Code",
    address: "2300 S Lamar Blvd, Austin TX",
    distance: "0.3 mi",
    rating: 4.8,
    wifi: "85 Mbps",
    outlets: "12/16",
    noise: "Moderate",
    seats: 8,
  },
  {
    id: "2",
    name: "Houndstooth Coffee",
    address: "401 Congress Ave, Austin TX",
    distance: "0.8 mi",
    rating: 4.5,
    wifi: "60 Mbps",
    outlets: "8/10",
    noise: "Quiet",
    seats: 5,
  },
  {
    id: "3",
    name: "Spokesman",
    address: "1122 E 6th St, Austin TX",
    distance: "1.2 mi",
    rating: 4.3,
    wifi: "45 Mbps",
    outlets: "6/8",
    noise: "Lively",
    seats: 3,
  },
];
