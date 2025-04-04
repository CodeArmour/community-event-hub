export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date; // Changed from string to Date
  time: string;
  location: string;
  category: string;
  image: string | null;
  capacity: number;
  attendees: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    registrations: number;
  }
}

