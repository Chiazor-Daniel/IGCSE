import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()
 
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Credentials', "true")
  response.headers.set('Access-Control-Allow-Origin', '*') // Allow all origins
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
 
  return response
}
 
// Configure which paths should handle CORS
export const config = {
  matcher: '/api/:path*',
}
