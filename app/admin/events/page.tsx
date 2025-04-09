'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Plus, Trash2 } from "lucide-react";
import { getEvents, deleteEvent } from "@/actions/event";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

export default function EventsManagementPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    getEvents()
      .then((data) => {
        setEvents(data.events);
        toast.success({
          title: "Events loaded",
          description: `Successfully loaded ${data.events.length} events`,
        });
      })
      .catch((error) => {
        toast.error({
          title: "Error loading events",
          description: error.message || "Failed to load events",
        });
      });
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
    } catch (error: any) {
      toast.error({
        title: "Error deleting event",
        description: error.message || "Failed to delete event",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
          <p className="text-muted-foreground">Create, edit, and delete your events</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="button-gradient rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Create New Event
          </Button>
        </Link>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.time}</TableCell>
                <TableCell className="max-w-[200px] truncate">{event.location}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/events/${event.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDelete(event.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
