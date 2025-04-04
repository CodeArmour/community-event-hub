import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and how we can reach you</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select defaultValue="sf">
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sf">San Francisco, CA</SelectItem>
                    <SelectItem value="nyc">New York, NY</SelectItem>
                    <SelectItem value="chi">Chicago, IL</SelectItem>
                    <SelectItem value="la">Los Angeles, CA</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your event preferences and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6">
              <div className="grid gap-4">
                <Label>Event Categories</Label>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="tech" defaultChecked />
                    <Label htmlFor="tech" className="font-normal">
                      Technology
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="business" defaultChecked />
                    <Label htmlFor="business" className="font-normal">
                      Business
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="social" defaultChecked />
                    <Label htmlFor="social" className="font-normal">
                      Social
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="education" />
                    <Label htmlFor="education" className="font-normal">
                      Education
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="arts" />
                    <Label htmlFor="arts" className="font-normal">
                      Arts & Culture
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <Label>Notifications</Label>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="email-notif" defaultChecked />
                    <Label htmlFor="email-notif" className="font-normal">
                      Email notifications
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="sms-notif" />
                    <Label htmlFor="sms-notif" className="font-normal">
                      SMS notifications
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="reminder" defaultChecked />
                    <Label htmlFor="reminder" className="font-normal">
                      Event reminders
                    </Label>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

