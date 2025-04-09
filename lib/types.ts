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
  };
}

// Admin user types
export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  eventsCreated: number;
  totalAttendees: number;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
    security?: {
      twoFactorEnabled?: boolean;
    };
  };
}

// Activity types for tracking admin actions
export interface Activity {
  id: string;
  action: string;
  target: string;
  time: string;
  link: string;
}

// Form event type
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

// Form submission types
export interface ProfileFormData extends FormData {
  get(key: string): string;
}

// Error type for consistent error handling
export interface ApiError extends Error {
  message: string;
}
