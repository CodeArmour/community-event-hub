"use client";

import { EventCard } from "@/components/event-card";
import type { Event } from "@/lib/types";
import { SessionProvider, useSession } from "next-auth/react";

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  
  if (events.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No events found</p>
      </div>
    );
  }

  return (
    <SessionProvider>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
    </SessionProvider>
  );
}