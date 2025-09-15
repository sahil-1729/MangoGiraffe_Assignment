"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiCredentials {
  clientId: string
  clientSecret: string
  productInstanceId: string
}

export default function SettingsPage() {
  const [credentials, setCredentials] = useState<ApiCredentials>({
    clientId: "",
    clientSecret: "",
    productInstanceId: "",
  })
  const [showSecrets, setShowSecrets] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load credentials from localStorage on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("api-credentials")
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials)
        setCredentials(parsed)
      } catch (error) {
        console.error("Failed to parse saved credentials:", error)
      }
    }
  }, [])

  const handleInputChange = (field: keyof ApiCredentials, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Validate required fields
      if (!credentials.clientId || !credentials.clientSecret || !credentials.productInstanceId) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive",
        })
        return
      }

      // Save to localStorage
      localStorage.setItem("api-credentials", JSON.stringify(credentials))
      // console.log(...credentials)
      console.log('executed')

      toast({
        title: "Settings Saved",
        description: "Your API credentials have been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setCredentials({
      clientId: "",
      clientSecret: "",
      productInstanceId: "",
    })
    localStorage.removeItem("api-credentials")
    toast({
      title: "Credentials Cleared",
      description: "All API credentials have been removed",
    })
  }

  const hasCredentials = credentials.clientId || credentials.clientSecret || credentials.productInstanceId

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-manrope font-bold text-3xl text-foreground">API Settings</h1>
          <p className="text-muted-foreground mt-2">Configure your API credentials for document signing integration</p>
        </div>

        {/* Security Warning */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Your API credentials will be stored in your browser's local storage. This
            is not recommended for production use. Consider using environment variables or secure credential management
            for production applications.
          </AlertDescription>
        </Alert>

        {/* Credentials Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">API Credentials</CardTitle>
            <CardDescription>Enter your API credentials to enable document signing functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Enter your x-client-id"
                value={credentials.clientId}
                onChange={(e) => handleInputChange("clientId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="Enter your x-client-secret"
                  value={credentials.clientSecret}
                  onChange={(e) => handleInputChange("clientSecret", e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productInstanceId">Product Instance ID</Label>
              <Input
                id="productInstanceId"
                type={showSecrets ? "text" : "password"}
                placeholder="Enter your x-product-instance-id"
                value={credentials.productInstanceId}
                onChange={(e) => handleInputChange("productInstanceId", e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Credentials"}
              </Button>

              {hasCredentials && (
                <Button variant="outline" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">Connection Status</CardTitle>
            <CardDescription>Current status of your API integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasCredentials ? "bg-secondary" : "bg-muted"}`} />
              <span className="text-sm">{hasCredentials ? "Credentials configured" : "No credentials configured"}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {hasCredentials
                ? "Your API credentials are saved and ready to use for document operations."
                : "Configure your API credentials above to enable document signing functionality."}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
