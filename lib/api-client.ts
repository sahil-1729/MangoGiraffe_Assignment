interface ApiCredentials {
  clientId: string
  clientSecret: string
  productInstanceId: string
}

export function getStoredCredentials(): ApiCredentials | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("api-credentials")
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Failed to parse stored credentials:", error)
    return null
  }
}

export function getApiHeaders(): Record<string, string> {
  const credentials = getStoredCredentials()

  if (!credentials) {
    throw new Error("API credentials not configured. Please visit Settings to configure your credentials.")
  }

  return {
    "x-client-id": credentials.clientId,
    "x-client-secret": credentials.clientSecret,
    "x-product-instance-id": credentials.productInstanceId,
    "Content-Type": "application/json",
  }
}

export async function makeApiRequest(url: string, options: RequestInit = {}) {
  try {
    const headers = getApiHeaders()

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}
