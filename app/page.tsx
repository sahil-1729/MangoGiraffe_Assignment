import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Activity, Settings, FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="font-manrope font-bold text-4xl text-foreground text-balance">
            Professional Document Signing Platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Streamline your document workflow with secure API integration, real-time status tracking, and professional
            document management.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-manrope">Upload Contract</CardTitle>
              <CardDescription>
                Upload PDF documents and initiate signature requests with our secure API integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/upload">Start Upload</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle className="font-manrope">Track Status</CardTitle>
              <CardDescription>
                Monitor document signing progress and download completed contracts in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/status">Check Status</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="font-manrope">API Settings</CardTitle>
              <CardDescription>
                Configure your API credentials and manage integration settings securely.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/settings">Configure</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope text-2xl">Platform Features</CardTitle>
            <CardDescription>Everything you need for professional document management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-manrope font-semibold mb-1">Secure Document Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload PDF contracts with validation and secure API integration
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-manrope font-semibold mb-1">Real-time Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Track signature progress with live status updates and notifications
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-manrope font-semibold mb-1">Automated Workflow</h3>
                  <p className="text-sm text-muted-foreground">
                    Streamlined process from upload to signature completion
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Settings className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h3 className="font-manrope font-semibold mb-1">API Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless integration with document signing APIs and services
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
