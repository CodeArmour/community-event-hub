"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EventSchema } from "@/schemas/event";
import { getEventById, updateEvent } from "@/actions/event";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function EditEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id;

  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof EventSchema>>({
    resolver: zodResolver(EventSchema),
  });

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getEventById(eventId);
        if (!data) {
          setError("Event not found");
          return;
        }
        setEvent(data);

        // Format the date as YYYY-MM-DD string
        const formattedDate =
          data.date instanceof Date
            ? data.date.toISOString().split("T")[0]
            : typeof data.date === "string"
            ? new Date(data.date).toISOString().split("T")[0]
            : "";

        reset({
          ...data,
          date: formattedDate,
          capacity: Number(data.capacity),
          // Ensure image is a string, not null
          image: data.image || "",
        });
      } catch (err) {
        console.error("Failed to fetch event:", err);
        setError("Failed to load event data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, reset]);

  const onSubmit = async (data: z.infer<typeof EventSchema>) => {
    const res = await updateEvent(eventId, data);
    if (res.success) router.push("/admin/events");
  };

  if (isLoading)
    return (
      <div className="container mx-auto p-8 text-center">
        Loading event data...
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto p-8 text-center text-red-500">
        {error}
      </div>
    );
  if (!event)
    return (
      <div className="container mx-auto p-8 text-center">Event not found</div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin/events"
        className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to events
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update the details of your community event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" {...register("title")} />
              <p className="text-sm text-red-500">{errors.title?.message}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                {...register("description")}
              />
              <p className="text-sm text-red-500">
                {errors.description?.message}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} />
                <p className="text-sm text-red-500">{errors.date?.message}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" {...register("time")} />
                <p className="text-sm text-red-500">{errors.time?.message}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
              <p className="text-sm text-red-500">{errors.location?.message}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" {...register("category")} />
                <p className="text-sm text-red-500">
                  {errors.category?.message}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register("capacity", { valueAsNumber: true })}
                />
                <p className="text-sm text-red-500">
                  {errors.capacity?.message}
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Event Image URL</Label>
              <Input id="image" {...register("image")} />
              <p className="text-xs text-muted-foreground">
                Enter a URL for the event cover image
              </p>
            </div>
            <Button type="submit">Update Event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
