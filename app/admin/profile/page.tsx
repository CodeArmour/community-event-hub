"use client"

import { useState } from "react"
import { ArrowUpRight, Calendar, Edit, LogOut, Mail, Phone, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEvents } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  // Mock admin data - in a real app, this would come from an API or auth context
  const admin = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator",
    joinDate: "January 15, 2023",
    avatar: "/placeholder.svg?height=200&width=200&text=AJ",
    eventsCreated: mockEvents.length,
    totalAttendees: mockEvents.reduce((sum, event) => sum + event.attendees, 0),
    lastLogin: "Today at 9:30 AM",
  }

  // Mock recent activity - in a real app, this would come from an API
  const recentActivity = [
    {
      id: "1",
      action: "Created new event",
      target: "Tech Conference 2025",
      time: "2 hours ago",
      link: "/admin/events/1",
    },
    {
      id: "2",
      action: "Updated event details",
      target: "Community Hackathon",
      time: "Yesterday",
      link: "/admin/events/2",
    },
    {
      id: "3",
      action: "Approved registration",
      target: "Business Networking Mixer",
      time: "2 days ago",
      link: "/admin/events/3",
    },
    {
      id: "4",
      action: "Added new category",
      target: "Workshops",
      time: "1 week ago",
      link: "/admin",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
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
              />
            </div>
            <CardTitle className="text-xl">{admin.name}</CardTitle>
            <Badge className="mx-auto mt-2 bg-primary/10 text-primary">{admin.role}</Badge>
          </CardHeader>
          <CardContent className="mt-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{admin.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{admin.phone}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {admin.joinDate}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" className="gap-2 rounded-full">
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
                <CardTitle className="text-sm font-medium">Events Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{admin.eventsCreated}</div>
              </CardContent>
            </Card>
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{admin.totalAttendees}</div>
              </CardContent>
            </Card>
            <Card className="stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last Login</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-medium">{admin.lastLogin}</div>
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
                  <CardDescription>Update your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={admin.name} disabled={!isEditing} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={admin.email} disabled={!isEditing} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue={admin.phone} disabled={!isEditing} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue={admin.role} disabled />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notif" className="text-base">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for new registrations and event updates
                          </p>
                        </div>
                        <Switch id="email-notif" defaultChecked disabled={!isEditing} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notif" className="text-base">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive text messages for important alerts and reminders
                          </p>
                        </div>
                        <Switch id="sms-notif" disabled={!isEditing} />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Recent Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">
                            {activity.action}: <span className="text-primary">{activity.target}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                        <Link href={activity.link}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <ArrowUpRight className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" disabled={!isEditing} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" disabled={!isEditing} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" disabled={!isEditing} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Switch id="2fa" disabled={!isEditing} />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Session Management</h3>
                    <div className="rounded-lg border p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-muted-foreground">Started {admin.lastLogin} • Chrome on Windows</p>
                        </div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Manage All Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Edit Security Settings</Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
