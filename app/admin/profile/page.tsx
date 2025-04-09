"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Calendar,
  Edit,
  LogOut,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";

// Import our types
import { Admin, Activity } from "@/lib/types";
import type { FormEvent } from "react";

// Define FormSubmitEvent type if not already defined in types.ts
type FormSubmitEvent = FormEvent<HTMLFormElement>;

// Import our server actions
import {
  getCurrentAdmin,
  updateAdminProfile,
  updateAdminPassword,
  updateTwoFactorAuth,
} from "@/actions/users";
import { getRecentActivities } from "@/actions/activities";
import { signOut } from "next-auth/react";

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error({
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  // Handle avatar loading errors
  const handleAvatarError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    // Fallback to default avatar if loading fails
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder.svg"; // Use a default placeholder
  };

  // Fetch admin data and activities on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Call the getCurrentAdmin function from users.ts
        const adminData = await getCurrentAdmin();

        if (!adminData) {
          throw new Error("Failed to fetch admin data");
        }

        const activitiesData = await getRecentActivities(4); // Get top 4 recent activities

        setAdmin(adminData);
        setRecentActivity(activitiesData);

        // Initialize form states
        setName(adminData.name || "");
        setEmail(adminData.email || "");

        // Correctly extract phone from preferences
        const preferences = adminData.preferences || {};
        setPhone(preferences.phone || "");

        // Extract notification preferences from admin data if available
        const notifications = preferences.notifications || {};
        setEmailNotifications(notifications.email !== false); // Default to true if not set
        setSmsNotifications(notifications.sms === true); // Default to false if not set

        // Extract security preferences
        const security = preferences.security || {};
        setTwoFactorEnabled(security.twoFactorEnabled === true);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
        });
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Add function to refresh activity list
  const refreshActivities = async () => {
    try {
      const activitiesData = await getRecentActivities(4);
      setRecentActivity(activitiesData);
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: FormSubmitEvent) => {
    e.preventDefault();
    try {
      // Create a FormData object and add the form values
      const formData = new FormData(e.currentTarget);

      // Ensure required fields are set
      formData.set("name", name);
      formData.set("email", email);
      formData.set("phone", phone || "");

      // Add notification preferences to the same form data
      formData.set("emailNotifications", emailNotifications ? "true" : "false");
      formData.set("smsNotifications", smsNotifications ? "true" : "false");

      // Call updateAdminProfile from users.ts
      const result = await updateAdminProfile(formData);

      // Update local state with the new data
      if (admin) {
        setAdmin({
          ...admin,
          name,
          email,
          preferences: {
            ...(admin.preferences || {}),
            phone,
            notifications: {
              email: emailNotifications,
              sms: smsNotifications,
            },
          },
        });
      }

      setIsEditing(false);

      // Refresh the activities list to show the new activity
      await refreshActivities();

      toast.success({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Profile update error:", error);

      // Check if the error is specifically about activity recording
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.";

      // Still update profile if only the activity recording failed
      if (errorMessage.includes("Failed to record activity")) {
        if (admin) {
          setAdmin({
            ...admin,
            name,
            email,
            preferences: {
              ...(admin.preferences || {}),
              phone,
              notifications: {
                email: emailNotifications,
                sms: smsNotifications,
              },
            },
          });
        }

        setIsEditing(false);
        toast.success({
          title: "Profile Updated",
          description:
            "Your profile was updated, but we couldn't record this activity in your history.",
        });
      } else {
        toast.error({
          title: "Error",
          description: errorMessage,
        });
      }
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: FormSubmitEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);

      // Ensure password fields are valid
      const currentPassword = formData.get("current-password") as string;
      const newPassword = formData.get("new-password") as string;
      const confirmPassword = formData.get("confirm-password") as string;

      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error("All password fields are required");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New passwords don't match");
      }

      // Call updateAdminPassword from users.ts
      const result = await updateAdminPassword(formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to update password");
      }

      // Reset password fields using the form reference
      if (passwordFormRef.current) {
        passwordFormRef.current.reset();
      }

      // Update the editing state to exit edit mode
      setIsEditing(false);

      // Refresh the activities list to show the new activity
      await refreshActivities();

      toast.success({
        title: "Success",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again.";
      toast.error({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  // Handle 2FA toggle
  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      // Call updateTwoFactorAuth from users.ts
      const result = await updateTwoFactorAuth(enabled);

      if (!result.success) {
        throw new Error(
          result.error || "Failed to update two-factor authentication"
        );
      }

      setTwoFactorEnabled(enabled);

      // Refresh the activities list to show the new activity
      await refreshActivities();

      toast.success({
        title: "Success",
        description: `Two-factor authentication has been ${
          enabled ? "enabled" : "disabled"
        }.`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update two-factor authentication settings.";

      toast.error({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Could not load profile</h2>
            <p className="text-muted-foreground mb-4">
              There was a problem loading your profile information.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and account settings
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader className="relative pb-0 text-center">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
              </Button>
            </div>
            <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-md">
              <Image
                src={admin.avatar || "/placeholder.svg"}
                alt={admin.name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                onError={handleAvatarError}
              />
            </div>
            <CardTitle className="text-xl">{admin.name}</CardTitle>
            <Badge className="mx-auto mt-2 bg-primary/10 text-primary">
              {admin.role}
            </Badge>
          </CardHeader>
          <CardContent className="mt-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{admin.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{phone || "No phone number"}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {admin.joinDate}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              className="gap-2 rounded-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Events Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{admin.eventsCreated}</div>
              </CardContent>
            </Card>
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Attendees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{admin.totalAttendees}</div>
              </CardContent>
            </Card>
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">
                  {admin.lastLogin && admin.lastLogin !== "never"
                    ? typeof admin.lastLogin === "string"
                      ? admin.lastLogin
                      : new Date(admin.lastLogin).toLocaleString()
                    : "No recent logins"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Profile Details */}
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="w-full justify-start rounded-lg border bg-background p-1">
              <TabsTrigger value="account" className="rounded-md">
                Account
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-md">
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-md">
                Security
              </TabsTrigger>
            </TabsList>

            {/* Account Settings Tab */}
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and preferences
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileUpdate}>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={admin.role} disabled />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Notification Preferences
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notif" className="text-base">
                              Email Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive email notifications for new registrations
                              and event updates
                            </p>
                          </div>
                          <Switch
                            id="email-notif"
                            name="emailNotifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="sms-notif" className="text-base">
                              SMS Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Receive text messages for important alerts and
                              reminders
                            </p>
                          </div>
                          <Switch
                            id="sms-notif"
                            name="smsNotifications"
                            checked={smsNotifications}
                            onCheckedChange={setSmsNotifications}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">
                              {activity.action}:{" "}
                              <span className="text-primary">
                                {activity.target}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                          <Link href={activity.link}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No recent activity found.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/admin/activities" className="w-full">
                    <Button variant="outline" className="w-full">
                      View All Activity
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordUpdate} ref={passwordFormRef}>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <Input
                            id="current-password"
                            name="current-password"
                            type="password"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            name="new-password"
                            type="password"
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Enable Two-Factor Authentication
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          id="2fa"
                          checked={twoFactorEnabled}
                          onCheckedChange={(checked) => {
                            if (isEditing) {
                              handleTwoFactorToggle(checked);
                            }
                          }}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Session Management
                      </h3>
                      <div className="rounded-lg border p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">
                              Started {admin.lastLogin} •{" "}
                              {navigator?.userAgent?.includes("Chrome")
                                ? "Chrome"
                                : "Browser"}{" "}
                              on {navigator?.platform || "Unknown"}
                            </p>
                          </div>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                        <Link href="/admin/security/sessions">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Manage All Sessions
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setIsEditing(true)}>
                        Edit Security Settings
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
