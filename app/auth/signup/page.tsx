import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to events
      </Link>

      <Card className="form-card w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Sign up to register for events and get personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" className="rounded-lg" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" className="rounded-lg" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="rounded-lg" required />
                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" className="rounded-lg" required />
              </div>
              <Button type="submit" className="button-gradient mt-2 rounded-lg">
                Create Account
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

