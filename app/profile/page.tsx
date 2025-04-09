"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Bell, Tag, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  getCurrentUserForProfile,
  getAllEventCategories,
  updateUserProfile,
  updateUserPassword,
} from "@/actions/profile";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Available event categories
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

// Available notification types
const notificationTypes = [
  {
    value: "emailNotifications",
    label: "Email notifications",
    description: "Receive updates via email",
  },
  {
    value: "smsNotifications",
    label: "SMS notifications",
    description: "Get text messages for important alerts",
  },
  {
    value: "eventReminders",
    label: "Event reminders",
    description: "Be reminded before your events start",
  },
  {
    value: "weeklyNewsletter",
    label: "Weekly newsletter",
    description: "Get a summary of upcoming events",
  },
];

export default function ProfilePage() {
  // State for user profile data
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State for selected categories and notifications
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // State for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");

  // Load user profile data
  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await getCurrentUserForProfile();
        setUser(userData);

        // Set form fields
        setName(userData.name || "");
        setEmail(userData.email || "");
        setLocation(userData.location || "");

        // Set preferences
        setSelectedCategories(userData.preferences?.eventCategories || []);

        // Set notification preferences
        const messagePrefs = userData.preferences?.messagePreferences || {};
        const activeNotifications = Object.entries(messagePrefs)
          .filter(([_, value]) => value === true)
          .map(([key]) => key);

        setNotifications(activeNotifications);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(
        selectedCategories.filter((category) => category !== value)
      );
    } else {
      setSelectedCategories([...selectedCategories, value]);
    }
  };

  // Handle notification selection
  const handleNotificationChange = (value: string) => {
    if (notifications.includes(value)) {
      setNotifications(
        notifications.filter((notification) => notification !== value)
      );
    } else {
      setNotifications([...notifications, value]);
    }
  };

  // Handle profile update submission
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);

      // Add notification preferences
      formData.append(
        "emailNotifications",
        notifications.includes("emailNotifications").toString()
      );
      formData.append(
        "smsNotifications",
        notifications.includes("smsNotifications").toString()
      );
      formData.append(
        "eventReminders",
        notifications.includes("eventReminders").toString()
      );
      formData.append(
        "weeklyNewsletter",
        notifications.includes("weeklyNewsletter").toString()
      );

      // Add selected categories
      selectedCategories.forEach((category) => {
        formData.append("eventCategories", category);
      });

      const result = await updateUserProfile(formData);

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Handle password update submission
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const result = await updateUserPassword(formData);

      if (result.success) {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully",
        });
        form.reset();
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">Loading profile data...</div>
    );
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const memberSince = user?.createdAt
    ? `Member since ${format(new Date(user.createdAt), "MMMM yyyy")}`
    : "";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Profile Sidebar */}
        <div className="md:col-span-3">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 text-center">
              <Avatar className="mx-auto h-24 w-24 border-4 border-background">
                <AvatarImage
                  src={`/placeholder.svg?height=96&width=96&text=${userInitials}`}
                  alt={user?.name}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{memberSince}</p>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.location || "Location not set"}</span>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full">Edit Profile Picture</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-9">
          <Card>
            <CardContent className="p-6">
              <form className="space-y-8" onSubmit={handleProfileUpdate}>
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-medium">
                      Personal Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State/Province"
                    />
                  </div>
                </div>

                <Separator />

                {/* Category Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-medium">Event Categories</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Select the types of events you're interested in
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {eventCategories.map((category) => (
                      <div
                        key={category.value}
                        className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={selectedCategories.includes(category.value)}
                          onCheckedChange={() =>
                            handleCategoryChange(category.value)
                          }
                        />
                        <Label
                          htmlFor={`category-${category.value}`}
                          className="cursor-pointer font-normal"
                        >
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedCategories.map((value) => {
                      const category = eventCategories.find(
                        (c) => c.value === value
                      );
                      return category ? (
                        <Badge
                          key={value}
                          className={`${category.color} text-white`}
                        >
                          {category.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <Separator />

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-medium">Message Preferences</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to receive notifications
                  </p>

                  <div className="space-y-3">
                    {notificationTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-start space-x-3 rounded-md p-2 hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`notification-${type.value}`}
                          checked={notifications.includes(type.value)}
                          onCheckedChange={() =>
                            handleNotificationChange(type.value)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label
                            htmlFor={`notification-${type.value}`}
                            className="cursor-pointer font-medium"
                          >
                            {type.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="button-gradient" type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>

              <Separator className="my-8" />

              {/* Change Password */}
              <form className="space-y-8" onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-medium">Change Password</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Update your password to keep your account secure
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        name="current-password"
                        type="password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="button-gradient" type="submit">
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
