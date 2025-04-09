"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventSchema } from "@/schemas/event";
import { z } from "zod";
import { createEvent } from "@/actions/event";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventCategories = [
  { value: "technology", label: "Technology", color: "bg-blue-500" },
  { value: "business", label: "Business", color: "bg-green-500" },
  { value: "social", label: "Social", color: "bg-purple-500" },
  { value: "education", label: "Education", color: "bg-yellow-500" },
  { value: "arts", label: "Arts & Culture", color: "bg-pink-500" },
  { value: "sports", label: "Sports", color: "bg-orange-500" },
  { value: "health", label: "Health & Wellness", color: "bg-teal-500" },
  { value: "food", label: "Food & Drink", color: "bg-red-500" },
];

export default function NewEventPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof EventSchema>>({
    resolver: zodResolver(EventSchema),
  });

  const onSubmit = async (data: z.infer<typeof EventSchema>) => {
    const res = await createEvent(data);
    if (res.success) router.push("/admin/events");
  };

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
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the details to create a new community event
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
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-3 w-3 rounded-full ${category.color}`}
                              ></span>
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Select the event category
                </p>
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
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" {...register("image")} />
              <p className="text-xs text-muted-foreground">
                Enter a URL for the event image
              </p>
            </div>
            <Button type="submit">Create Event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
