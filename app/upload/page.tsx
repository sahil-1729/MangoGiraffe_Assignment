"use client"

import type React from "react"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, AlertCircle, CheckCircle, ExternalLink, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getStoredCredentials } from "@/lib/api-client"

interface UploadResult {
  documentId: string
  signatureId: string
  signatureUrl: string
  status: string
}

interface DocumentUploadResponse {
  documentType: string
  id: string
  name: string
  validUpto: string
  traceId: string
}

interface SignatureResponse {
  documentId: string
  id: string
  reason: string
  redirectUrl: string
  signers: Array<{
    birthYear: string
    displayName: string
    errCode: string | null
    id: string
    identifier: string
    location: string | null
    signatureDetails: any
    status: string
    url: string
  }>
  status: string
  traceId: string
}

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [documentName, setDocumentName] = useState("")
  const [documentPassword, setDocumentPassword] = useState("")
  const [signerIdentifier, setSignerIdentifier] = useState("")
  const [signerDisplayName, setSignerDisplayName] = useState("")
  const [signerBirthYear, setSignerBirthYear] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("http://setu.co")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file")
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadResult(null)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      // Create a synthetic event to reuse validation logic
      const syntheticEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(syntheticEvent)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const simulateUploadProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 200)
    return interval
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    // Check if credentials are configured
    const credentials = getStoredCredentials()

    // console.log(credentials)

    if (!credentials) {
      setError("API credentials not configured. Please visit Settings to configure your credentials.")
      return
    }

    // Validate required fields
    if (!documentName.trim()) {
      setError("Document name is required")
      return
    }
    if (!signerIdentifier.trim()) {
      setError("Signer identifier is required")
      return
    }
    if (!signerDisplayName.trim()) {
      setError("Signer display name is required")
      return
    }
    if (!signerBirthYear.trim()) {
      setError("Signer birth year is required")
      return
    }

    setIsUploading(true)
    setError(null)

    const progressInterval = simulateUploadProgress()

    try {
      // Step 1: Upload document to Documents API
      const formData = new FormData()
      formData.append("document", selectedFile)
      formData.append("name", documentName)
      if (documentPassword) {
        formData.append("password", documentPassword)
      }
      // console.log("Starting document upload to Setu API ", credentials)

      const documentResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          "x-client-id": credentials.clientId,
          "x-client-secret": credentials.clientSecret,
          "x-product-instance-id": credentials.productInstanceId,
        },
        body: formData
      })

      if (!documentResponse.ok) {
        const errorText = await documentResponse.text()
        console.log("[v0] Document upload failed:", errorText)
        throw new Error(`Document upload failed: ${documentResponse.status} ${errorText}`)
      }

      const documentData: DocumentUploadResponse = await documentResponse.json()
      // console.log("Document uploaded successfully:", documentData)

      setUploadProgress(50)

      // Step 2: Initiate signature request
      const signaturePayload = {
        documentId: documentData.id,
        redirectUrl: redirectUrl,
        signers: [
          {
            identifier: signerIdentifier,
            displayName: signerDisplayName,
            birthYear: signerBirthYear,
            signature: {
              height: 60,
              onPages: ["1"],
              position: "bottom-left",
              width: 180,
            },
          },
        ],
      }

      // console.log("Starting signature initiation with payload:", signaturePayload)

      const signatureResponse = await fetch("/api/signature", {
        method: "POST",
        headers: {
          "x-client-id": credentials.clientId,
          "x-client-secret": credentials.clientSecret,
          "x-product-instance-id": credentials.productInstanceId,
        },
        body: JSON.stringify(signaturePayload),
      })

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text()
        console.log("[v0] Signature initiation failed:", errorText)
        throw new Error(`Signature initiation failed: ${signatureResponse.status} ${errorText}`)
      }

      const signatureData: SignatureResponse = await signatureResponse.json()
      // console.log("Signature initiated successfully:", signatureData)

      // Extract the signature URL from the first signer
      const signerUrl = signatureData.signers[0]?.url || ""

      const result: UploadResult = {
        documentId: documentData.id,
        signatureId: signatureData.id,
        signatureUrl: signerUrl,
        status: signatureData.status,
      }

      setUploadProgress(100)
      setUploadResult(result)

      toast({
        title: "Upload Successful",
        description: "Document uploaded and signature request initiated",
      })
    } catch (error) {
      console.log("[v0] Upload error:", error)
      setError(error instanceof Error ? error.message : "Upload failed. Please try again.")
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
  }

  const openSigningUrl = () => {
    if (uploadResult?.signatureUrl) {
      window.open(uploadResult.signatureUrl, "_blank")
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-manrope font-bold text-3xl text-foreground">Upload Contract</h1>
          <p className="text-muted-foreground mt-2">Upload PDF documents and initiate signature requests</p>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">Document Upload</CardTitle>
            <CardDescription>Select a PDF file to upload and initiate the signing process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Drop Zone */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {selectedFile ? selectedFile.name : "Drop your PDF here or click to browse"}
              </p>
              <p className="text-sm text-muted-foreground">Supports PDF files up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Badge variant="secondary">PDF</Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name *</Label>
                <Input
                  id="documentName"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentPassword">Document Password (optional)</Label>
                <Input
                  id="documentPassword"
                  type="password"
                  value={documentPassword}
                  onChange={(e) => setDocumentPassword(e.target.value)}
                  placeholder="Enter document password if required"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Signer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signerIdentifier">Signer Identifier *</Label>
                  <Input
                    id="signerIdentifier"
                    value={signerIdentifier}
                    onChange={(e) => setSignerIdentifier(e.target.value)}
                    placeholder="Phone number or ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signerDisplayName">Display Name *</Label>
                  <Input
                    id="signerDisplayName"
                    value={signerDisplayName}
                    onChange={(e) => setSignerDisplayName(e.target.value)}
                    placeholder="Full name of signer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signerBirthYear">Birth Year *</Label>
                  <Input
                    id="signerBirthYear"
                    value={signerBirthYear}
                    onChange={(e) => setSignerBirthYear(e.target.value)}
                    placeholder="YYYY"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirectUrl">Redirect URL</Label>
                <Input
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="URL to redirect after signing"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading document...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Button */}
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
              {isUploading ? "Uploading..." : "Upload & Initiate Signature"}
            </Button>
          </CardContent>
        </Card>

        {/* Upload Result */}
        {uploadResult && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-secondary" />
                <CardTitle className="font-manrope">Upload Successful</CardTitle>
              </div>
              <CardDescription>Your document has been uploaded and signature request initiated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document ID</Label>
                  <div className="flex items-center gap-2">
                    <Input value={uploadResult.documentId} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(uploadResult.documentId, "Document ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Signature ID</Label>
                  <div className="flex items-center gap-2">
                    <Input value={uploadResult.signatureId} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(uploadResult.signatureId, "Signature ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{uploadResult.status.replace("_", " ")}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Signature URL</Label>
                <div className="flex items-center gap-2">
                  <Input value={uploadResult.signatureUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(uploadResult.signatureUrl, "Signature URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={openSigningUrl} className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Signing Page
                </Button>
                <Button variant="outline" asChild>
                  <a href={`/status?id=${uploadResult.signatureId}`}>Track Status</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-manrope">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Upload your PDF document and fill in the required details</li>
              <li>Provide signer information including identifier, name, and birth year</li>
              <li>Copy the signature URL and share it with the signer</li>
              <li>The signer will complete the signing process on the Setu platform</li>
              <li>Use the Status page to track progress and download completed documents</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
