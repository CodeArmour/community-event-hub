"use client"

import { useState } from "react"
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AiSetupPage() {
  const [apiKey, setApiKey] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("OPENAI_API_KEY=your-api-key-here")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success({
      title: "Copied to clipboard",
      description: "Environment variable template copied to clipboard",
    })
  }

  const handleSaveLocally = () => {
    if (!apiKey.trim()) {
      toast.error({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
      })
      return
    }

    // In a real app, you would save this to your environment variables
    // For this demo, we'll just show a success message
    toast.success({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved (demo only)",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin" className="mb-8 flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to admin dashboard
      </Link>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>AI Chat Setup</CardTitle>
          <CardDescription>Configure your AI assistant with OpenAI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 font-medium">How to set up your AI assistant</h3>
            <ol className="ml-5 list-decimal space-y-2 text-sm text-muted-foreground">
              <li>
                Create an account on{" "}
                <a
                  href="https://platform.openai.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI Platform <ExternalLink className="inline h-3 w-3" />
                </a>
              </li>
              <li>
                Generate an API key from the{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  API Keys section <ExternalLink className="inline h-3 w-3" />
                </a>
              </li>
              <li>Add the API key to your environment variables</li>
              <li>Restart your application</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label htmlFor="env-var">Environment Variable</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted p-2 text-sm">OPENAI_API_KEY=your-api-key-here</code>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this to your <code>.env.local</code> file in your project root
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">Your OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This is for demonstration purposes only. In a production environment, never expose your API key in the
              browser.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
            <h3 className="mb-2 font-medium text-amber-800 dark:text-amber-400">Important Notes</h3>
            <ul className="ml-5 list-disc space-y-1 text-sm text-amber-800 dark:text-amber-400">
              <li>Keep your API key secure and never expose it in client-side code</li>
              <li>OpenAI API usage incurs costs based on the number of tokens processed</li>
              <li>Set up usage limits in your OpenAI account to prevent unexpected charges</li>
              <li>Consider implementing rate limiting to control API usage</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button onClick={handleSaveLocally}>Save Configuration</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
