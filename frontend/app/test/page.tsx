'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface ApiItem {
  id: string
  name: string
}

export default function TestPage() {
  const [data, setData] = useState<ApiItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tested, setTested] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    setTested(true)

    try {
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Integration Test Page</h1>
          <p className="text-muted-foreground">
            Testing connection between Next.js frontend (Vercel) and AWS API Gateway backend
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              API Integration Test
              {tested && !loading && !error && <CheckCircle className="h-5 w-5 text-green-500" />}
              {error && <XCircle className="h-5 w-5 text-red-500" />}
            </CardTitle>
            <CardDescription>
              Testing GET request to: <code className="bg-muted px-2 py-1 rounded">{apiUrl}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={fetchData}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Testing Connection...' : 'Test API Connection'}
            </Button>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="text-red-600 mt-1">{error}</p>
                </CardContent>
              </Card>
            )}

            {data.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Success! API Response Received
                  </CardTitle>
                  <CardDescription>
                    Received {data.length} item(s) from the API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {item.id}</div>
                        </div>
                        <Badge variant="secondary">Item {index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {tested && !loading && !error && data.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="text-yellow-700">
                    <span className="font-medium">API responded successfully but returned no data.</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Frontend:</span> Next.js on Vercel
              </div>
              <div>
                <span className="font-medium">Backend:</span> AWS API Gateway
              </div>
              <div>
                <span className="font-medium">Method:</span> GET
              </div>
              <div>
                <span className="font-medium">Auth:</span> None
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}