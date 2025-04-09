"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { toast } from "@/components/ui/toast";
import { MultipleImageUpload } from "@/components/image-upload";
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

interface EventImage {
  id?: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  position: number;
}

export default function EditEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id;

  const [event, setEvent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<EventImage[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
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

        // Setup event images from fetched data
        const existingImages: EventImage[] = data.images || [];
        
        // If there are no images in the new format but there is a legacy image
        if (existingImages.length === 0 && data.image) {
          existingImages.push({
            url: data.image,
            isPrimary: true,
            position: 0,
          });
        }
        
        setEventImages(existingImages);

        reset({
          ...data,
          date: formattedDate,
          capacity: Number(data.capacity),
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

  const handleImagesUpdated = (images: EventImage[]) => {
    setEventImages(images);
    
    // Set the primary image as the main event image
    const primaryImage = images.find(img => img.isPrimary);
    if (primaryImage) {
      setValue("image", primaryImage.url);
    } else if (images.length > 0) {
      setValue("image", images[0].url);
    } else {
      setValue("image", "");
    }
  };

  const onSubmit = async (data: z.infer<typeof EventSchema>) => {
    try {
      // Prepare event data with images
      const eventData = {
        ...data,
        // Include images array for the API
        images: eventImages,
      };
      
      const res = await updateEvent(eventId, eventData);
      if (res.success) {
        toast.success({ 
          title: "Success",
          description: "Event updated successfully" 
        });
        router.push("/admin/events");
      } else {
        toast.error({ 
          title: "Error",
          description: res.message || "Failed to update event" 
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error({ 
        title: "Error",
        description: "Something went wrong. Please try again." 
      });
    }
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
              <Label>Event Images</Label>
              <MultipleImageUpload 
                onImagesUpdated={handleImagesUpdated} 
                defaultImages={eventImages}
                maxImages={10}
              />
              <p className="text-xs text-muted-foreground">
                Upload up to 10 images. Set one as primary to be the main event image.
              </p>
              {/* Hidden input for form validation */}
              <input type="hidden" {...register("image")} />
            </div>
            <Button type="submit">Update Event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}