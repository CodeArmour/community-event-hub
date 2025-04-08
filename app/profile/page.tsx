"use client"

import { useState } from "react"
import { X, User, Mail, Phone, MapPin, Bell, Tag, Globe, Clock, Eye, Palette, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

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
]

// Available notification types
const notificationTypes = [
  { value: "email", label: "Email notifications", description: "Receive updates via email" },
  { value: "sms", label: "SMS notifications", description: "Get text messages for important alerts" },
  { value: "reminder", label: "Event reminders", description: "Be reminded before your events start" },
  { value: "newsletter", label: "Weekly newsletter", description: "Get a summary of upcoming events" },
  { value: "promotions", label: "Promotional offers", description: "Receive special offers and discounts" },
]

export default function ProfilePage() {
  // State for selected categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["technology", "business", "social"])

  // State for selected notification types
  const [notifications, setNotifications] = useState<string[]>(["email", "reminder"])

  // State for theme preference
  const [themePreference, setThemePreference] = useState("system")

  // State for distance unit
  const [distanceUnit, setDistanceUnit] = useState("miles")

  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showAttendance: true,
    showProfile: true,
    allowMessages: true,
  })

  // State for language preference
  const [language, setLanguage] = useState("english")

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    if (selectedCategories.includes(value)) {
      setSelectedCategories(selectedCategories.filter((category) => category !== value))
    } else {
      setSelectedCategories([...selectedCategories, value])
    }
  }

  // Handle notification selection
  const handleNotificationChange = (value: string) => {
    if (notifications.includes(value)) {
      setNotifications(notifications.filter((notification) => notification !== value))
    } else {
      setNotifications([...notifications, value])
    }
  }

  // Remove a category
  const removeCategory = (value: string) => {
    setSelectedCategories(selectedCategories.filter((category) => category !== value))
  }

  // Remove a notification
  const removeNotification = (value: string) => {
    setNotifications(notifications.filter((notification) => notification !== value))
  }

  // Get category object by value
  const getCategoryByValue = (value: string) => {
    return eventCategories.find((category) => category.value === value)
  }

  // Handle privacy setting change
  const handlePrivacyChange = (key: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings({
      ...privacySettings,
      [key]: value,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 text-center">
              <Avatar className="mx-auto h-24 w-24 border-4 border-background">
                <AvatarImage src="/placeholder.svg?height=96&width=96&text=JD" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold">John Doe</h2>
              <p className="text-sm text-muted-foreground">Member since January 2023</p>
            </div>
            <div className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>john@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
              <div className="mt-6">
                <Button className="w-full">Edit Profile Picture</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 rounded-lg">
              <TabsTrigger value="personal" className="rounded-md">
                <User className="mr-2 h-4 w-4" />
                Personal Information
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-md">
                <Tag className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardContent className="p-6">
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue="Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Location</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" defaultValue="San Francisco" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input id="state" defaultValue="CA" />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" defaultValue="United States" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip/Postal Code</Label>
                          <Input id="zipCode" defaultValue="94105" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="button-gradient">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <div className="space-y-6">
                {/* Event Preferences */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-medium">Event Preferences</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">Event Categories</h4>
                          <Badge className="bg-primary/20 text-primary">{selectedCategories.length} Selected</Badge>
                        </div>

                        {/* Selected categories */}
                        <div className="flex flex-wrap gap-2">
                          {selectedCategories.map((value) => {
                            const category = getCategoryByValue(value)
                            return category ? (
                              <Badge
                                key={value}
                                className={`${category.color} text-white flex items-center gap-1 px-3 py-1.5`}
                              >
                                {category.label}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeCategory(value)} />
                              </Badge>
                            ) : null
                          })}
                          {selectedCategories.length === 0 && (
                            <p className="text-sm text-muted-foreground">No categories selected</p>
                          )}
                        </div>

                        {/* Category selection */}
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {eventCategories.map((category) => (
                            <div
                              key={category.value}
                              className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
                            >
                              <Checkbox
                                id={`category-${category.value}`}
                                checked={selectedCategories.includes(category.value)}
                                onCheckedChange={() => handleCategoryChange(category.value)}
                              />
                              <Label htmlFor={`category-${category.value}`} className="cursor-pointer font-normal">
                                {category.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-medium">Regional Preferences</h4>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                              <SelectTrigger id="language">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                                <SelectItem value="german">German</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label>Distance Unit</Label>
                            <RadioGroup value={distanceUnit} onValueChange={setDistanceUnit} className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="miles" id="miles" />
                                <Label htmlFor="miles" className="font-normal">
                                  Miles
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="kilometers" id="kilometers" />
                                <Label htmlFor="kilometers" className="font-normal">
                                  Kilometers
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notification Preferences */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-medium">Notification Preferences</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">Notification Types</h4>
                          <Badge className="bg-primary/20 text-primary">{notifications.length} Selected</Badge>
                        </div>

                        {/* Selected notifications */}
                        <div className="flex flex-wrap gap-2">
                          {notifications.map((value) => {
                            const type = notificationTypes.find((t) => t.value === value)
                            return type ? (
                              <Badge
                                key={value}
                                variant="outline"
                                className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5"
                              >
                                {type.label}
                                <X className="h-3 w-3 cursor-pointer" onClick={() => removeNotification(value)} />
                              </Badge>
                            ) : null
                          })}
                          {notifications.length === 0 && (
                            <p className="text-sm text-muted-foreground">No notifications selected</p>
                          )}
                        </div>

                        {/* Notification selection */}
                        <div className="space-y-3 rounded-lg border p-4">
                          {notificationTypes.map((type) => (
                            <div
                              key={type.value}
                              className="flex items-start space-x-3 rounded-md p-2 hover:bg-muted/50"
                            >
                              <Checkbox
                                id={`notification-${type.value}`}
                                checked={notifications.includes(type.value)}
                                onCheckedChange={() => handleNotificationChange(type.value)}
                                className="mt-1"
                              />
                              <div>
                                <Label htmlFor={`notification-${type.value}`} className="cursor-pointer font-medium">
                                  {type.label}
                                </Label>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-medium">Reminder Settings</h4>
                        </div>

                        <div className="space-y-3 rounded-lg border p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Event Start Reminder</p>
                              <p className="text-sm text-muted-foreground">Get notified before events start</p>
                            </div>
                            <Select defaultValue="1day">
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30min">30 minutes before</SelectItem>
                                <SelectItem value="1hour">1 hour before</SelectItem>
                                <SelectItem value="3hours">3 hours before</SelectItem>
                                <SelectItem value="1day">1 day before</SelectItem>
                                <SelectItem value="2days">2 days before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Registration Deadline Reminder</p>
                              <p className="text-sm text-muted-foreground">Get notified before registration closes</p>
                            </div>
                            <Select defaultValue="1day">
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3hours">3 hours before</SelectItem>
                                <SelectItem value="6hours">6 hours before</SelectItem>
                                <SelectItem value="12hours">12 hours before</SelectItem>
                                <SelectItem value="1day">1 day before</SelectItem>
                                <SelectItem value="2days">2 days before</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display & Privacy Preferences */}
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-medium">Display & Privacy</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Palette className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-medium">Display Preferences</h4>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                              <p className="font-medium">Theme Preference</p>
                              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                            </div>
                            <RadioGroup
                              value={themePreference}
                              onValueChange={setThemePreference}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="light" id="light" />
                                <Label htmlFor="light" className="font-normal">
                                  Light
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dark" id="dark" />
                                <Label htmlFor="dark" className="font-normal">
                                  Dark
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="system" id="system" />
                                <Label htmlFor="system" className="font-normal">
                                  System
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <h4 className="text-lg font-medium">Privacy Settings</h4>
                        </div>

                        <div className="space-y-3 rounded-lg border p-4">
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">Show Event Attendance</p>
                              <p className="text-sm text-muted-foreground">
                                Allow others to see events you're attending
                              </p>
                            </div>
                            <Switch
                              checked={privacySettings.showAttendance}
                              onCheckedChange={(checked) => handlePrivacyChange("showAttendance", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">Public Profile</p>
                              <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                            </div>
                            <Switch
                              checked={privacySettings.showProfile}
                              onCheckedChange={(checked) => handlePrivacyChange("showProfile", checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">Allow Direct Messages</p>
                              <p className="text-sm text-muted-foreground">Let other users send you messages</p>
                            </div>
                            <Switch
                              checked={privacySettings.allowMessages}
                              onCheckedChange={(checked) => handlePrivacyChange("allowMessages", checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button className="button-gradient">Save All Preferences</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
