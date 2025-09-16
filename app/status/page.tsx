"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, RefreshCw, Download, Clock, CheckCircle, AlertCircle, FileText, Calendar, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getStoredCredentials } from "@/lib/api-client"

interface SignatureStatus {
  signatureId: string
  documentId: string
  status: "sign_pending" | "sign_in_progress" | "sign_complete" | "sign_initiated" | "cancelled"
  // createdAt: string
  // completedAt?: string
  // signerEmail?: string
  // documentName: string
  downloadUrl?: string
}

const statusConfig = {
  sign_pending: {
    label: "Pending Signature",
    color: "bg-yellow-500",
    icon: Clock,
    description: "Waiting for signer to start the process",
  },
  sign_in_progress: {
    label: "In Progress",
    color: "bg-blue-500",
    icon: RefreshCw,
    description: "Signer is currently reviewing the document",
  },
  sign_complete: {
    label: "Completed",
    color: "bg-green-500",
    icon: CheckCircle,
    description: "Document has been successfully signed",
  },
  sign_initiated: {
    label: "Initiated",
    color: "bg-red-100",
    icon: AlertCircle,
    description: "Signature request has initiated",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-500",
    icon: AlertCircle,
    description: "Signature request was cancelled",
  },
}

export default function StatusPage() {
  const [requestId, setRequestId] = useState("")
  const [status, setStatus] = useState<SignatureStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Auto-populate from URL params
  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setRequestId(id)
      handleStatusCheck(id)
    }
  }, [searchParams])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !requestId || status?.status === "sign_complete") return

    const interval = setInterval(() => {
      handleStatusCheck(requestId, true)
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, requestId, status?.status])

  const handleStatusCheck = async (id?: string, silent = false) => {
    const targetId = id || requestId
    if (!targetId.trim()) {
      setError("Please enter a signature ID")
      return
    }

    // Check if credentials are configured
    const credentials = getStoredCredentials()
    if (!credentials) {
      setError("API credentials not configured. Please visit Settings to configure your credentials.")
      return
    }

    if (!silent) setIsLoading(true)
    setError(null)

    try {


      const statusResponse = await fetch('/api/status', {
        method: 'POST',
        headers: {
          "x-client-id": credentials.clientId,
          "x-client-secret": credentials.clientSecret,
          "x-product-instance-id": credentials.productInstanceId,
        },
        body: JSON.stringify({ requestId: requestId })
      })

      const signaturestatus = await statusResponse.json()
      // console.log(" sign status:", signaturestatus)f0bd8e42-f902-4132-b0e8-a5aa2d582469

      const mockStatus: SignatureStatus = {
        signatureId: targetId,
        documentId: signaturestatus?.signers[0]?.id,
        status: signaturestatus?.status,
        // documentName: "Contract_Agreement.pdf",
        // signerEmail: "signer@example.com",
      }


      // Add completion details if sign_complete
      if (mockStatus.status === "sign_complete") {
        // mockStatus.completedAt = new Date().toISOString()
        const downloadResponse = await fetch('/api/download', {
          method: 'POST',
          headers: {
            "x-client-id": credentials.clientId,
            "x-client-secret": credentials.clientSecret,
            "x-product-instance-id": credentials.productInstanceId,
          },
          body: JSON.stringify({ requestId: requestId })
        })

        const downloadResponseBody = await downloadResponse.json()

        const Url = downloadResponseBody?.downloadUrl
        mockStatus.downloadUrl = Url
      }

      setStatus(mockStatus)

      if (!silent) {
        toast({
          title: "Status Updated",
          description: `Document status: ${statusConfig[mockStatus.status].label}`,
        })
      }

      // Auto-enable refresh for pending/in-progress documents
      if (mockStatus.status === "sign_pending" || mockStatus.status === "sign_in_progress") {
        setAutoRefresh(true)
      } else {
        setAutoRefresh(false)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch status"
      setError(errorMessage)
      if (!silent) {
        toast({
          title: "Status Check Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!status?.downloadUrl) return

    try {
      // In a real implementation, you would make an authenticated request
      // to download the signed document
      window.open(status.downloadUrl, "_blank")

      toast({
        title: "Download Started",
        description: "Signed document download initiated",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "sign_pending":
        return 25
      case "sign_in_progress":
        return 75
      case "sign_complete":
        return 100
      default:
        return 0
    }
  }

  const StatusIcon = status ? statusConfig[status.status].icon : Clock

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-manrope font-bold text-3xl text-foreground">Document Status</h1>
          <p className="text-muted-foreground mt-2">Track the progress of your document signing requests</p>
        </div>

        {/* Status Check Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">Check Signature Status</CardTitle>
            <CardDescription>Enter a signature ID to check the current status of your document</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="requestId" className="sr-only">
                  Signature ID
                </Label>
                <Input
                  id="requestId"
                  placeholder="Enter signature ID (e.g., sig_1234567890)"
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStatusCheck()}
                />
              </div>
              <Button onClick={() => handleStatusCheck()} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Checking..." : "Check Status"}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Status Display */}
        {status && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusIcon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="font-manrope">Document Status</CardTitle>
                    <CardDescription>Last updated: {new Date().toLocaleString()}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {autoRefresh && (
                    <Badge variant="secondary" className="animate-pulse">
                      Auto-refreshing
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleStatusCheck()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{getStatusProgress(status.status)}%</span>
                </div>
                <Progress value={getStatusProgress(status.status)} className="w-full" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusConfig[status.status].color}`} />
                <Badge variant="secondary" className="text-sm">
                  {statusConfig[status.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">{statusConfig[status.status].description}</span>
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Document</span>
                  </div>

                  {/* <p className="text-sm">{status.documentName}</p> */}

                  <p className="text-xs text-muted-foreground font-mono">ID: {status.documentId}</p>
                </div>

                {/* <div className="space-y-3"> */}
                {/* <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Timeline</span>
                  </div> */}
                {/* <p className="text-sm">Created: {new Date(status.createdAt).toLocaleString()}</p> */}
                {/* {status.completedAt && (
                    <p className="text-sm">Completed: {new Date(status.completedAt).toLocaleString()}</p>
                  )} */}
                {/* </div> */}

                {/* {status.signerEmail && (
                  <div className="space-y-3 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Signer</span>
                    </div>
                    <p className="text-sm">{status.signerEmail}</p>
                  </div>
                )} */}
              </div>

              {/* Download Section */}
              {status.status === "sign_complete" && status.downloadUrl && (
                <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-secondary">Document Ready</h3>
                      <p className="text-sm text-muted-foreground">Your signed document is ready for download</p>
                    </div>
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter the signature ID you received after uploading a document</li>
              <li>Click "Check Status" to fetch the latest information</li>
              <li>The page will auto-refresh for pending and in-progress documents</li>
              <li>Download the signed document once the process is sign_complete</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
