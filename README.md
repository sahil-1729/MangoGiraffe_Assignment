
# DocuSign Pro: Professional Document Signing Platform
This is a professional document signing platform built with Next.js, designed to streamline your document workflow with API integration, real-time status tracking, and efficient document management. The application provides a user-friendly interface for uploading PDF documents and managing the signature process.

## Key Features
Secure Document Upload: Upload PDF documents with file type and size validation.

API Integration: Seamlessly integrate with a document signing API to initiate and manage signature requests.

Real-time Status Tracking: Monitor the signing progress of your documents with live status updates.

API Settings Management: Configure your API credentials (Client ID, Client Secret, Product Instance ID) through a dedicated settings page.

Mobile-Responsive UI: A modern and professional interface built with Tailwind CSS and Radix UI components.

## Security Notice
This application is designed for demonstration and testing purposes. The API credentials you enter in the Settings page are stored directly in your browser's localStorage.

This is a significant security risk and is not recommended for production use. For any real-world application, you should use environment variables or a secure, server-side credential management system to store and handle API keys. This is an important trade-off to consider for the simplicity of this demo.

# Getting Started
Prerequisites
Node.js (v18.17.0 or higher)

pnpm (or npm/yarn)

# Installation
Clone the repository:
git clone <repository-url>

Navigate to the project directory:
cd <project-name>

Install dependencies:
pnpm install

Run the development server:
pnpm dev

Open your browser and visit http://localhost:3000.

## Usage
1. Settings Page
Before using the other features, you must configure your API credentials.

Navigate to the /settings page.

Enter your Client ID, Client Secret, and Product Instance ID.

Click "Save Credentials". Your credentials will be stored locally in your browser.

2. Upload Contract Page

Go to the /upload page.

Drag and drop a PDF file or click the upload area to browse for a file.

Enter the required signer details and a document name.

Click "Upload & Initiate Signature". The application will upload the document and generate a unique signature URL.

3. Status Page

Visit the /status page to track a document's progress.

Enter a Signature ID (obtained from the upload process) in the input field.

Click "Check Status" to view the document's current state. The page will automatically refresh for pending or in-progress documents.

Once the status is "Completed", a download button will appear to retrieve the signed document.

## Technologies Used
Next.js - A React framework for production.

React - The JavaScript library for building user interfaces.

Tailwind CSS - A utility-first CSS framework for rapid UI development.

Radix UI - An open-source component library for building high-quality, accessible design systems.

Setu API - The third-party service used for document signing.
