import { NextApiRequest } from 'next'
import { initializeFirebaseAdmin } from './firebaseAdmin'

/**
 * Authenticated user information extracted from verified Firebase token
 */
export interface AuthenticatedUser {
  uid: string
  email?: string
}

/**
 * Custom error class for authentication-related errors
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Verify Firebase ID token and return user information
 * @param token Firebase ID token to verify
 * @returns Promise resolving to authenticated user information
 * @throws AuthenticationError if token is invalid, expired, or verification fails
 */
export async function verifyFirebaseToken(
  token: string
): Promise<AuthenticatedUser> {
  if (!token || token.trim() === '') {
    throw new AuthenticationError('Token is required', 'missing_token')
  }

  try {
    const admin = initializeFirebaseAdmin()
    const decodedToken = await admin.auth().verifyIdToken(token)

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }
  } catch (error) {
    console.error('Token verification failed:', error)

    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (errorMessage.includes('expired')) {
        throw new AuthenticationError(
          'Authentication token has expired',
          'token_expired'
        )
      }
      if (errorMessage.includes('invalid')) {
        throw new AuthenticationError(
          'Invalid authentication token',
          'invalid_token'
        )
      }
      if (errorMessage.includes('malformed') || errorMessage.includes('jwt')) {
        throw new AuthenticationError(
          'Malformed authentication token',
          'malformed_token'
        )
      }
    }

    // Generic token verification failure
    throw new AuthenticationError(
      'Unable to verify authentication token',
      'token_verification_failed'
    )
  }
}

/**
 * Extract Bearer token from Authorization header
 * @param req Next.js API request object
 * @returns Token string if found, null otherwise
 */
export function extractTokenFromRequest(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return null
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7).trim() // Remove 'Bearer ' prefix
  return token || null
}

/**
 * Verify authentication for API requests that support both guest and authenticated users
 * @param req Next.js API request object
 * @returns Object containing authentication status and user info if authenticated
 */
export async function verifyOptionalAuthentication(
  req: NextApiRequest
): Promise<{
  isAuthenticated: boolean
  isGuest: boolean
  user: AuthenticatedUser | null
}> {
  const token = extractTokenFromRequest(req)

  if (!token) {
    return {
      isAuthenticated: false,
      isGuest: true,
      user: null,
    }
  }

  try {
    const user = await verifyFirebaseToken(token)
    return {
      isAuthenticated: true,
      isGuest: false,
      user,
    }
  } catch (error) {
    // For optional authentication, we don't throw errors for invalid tokens
    // Instead, we treat them as guest users but log the issue
    console.warn('Optional authentication failed:', error)
    return {
      isAuthenticated: false,
      isGuest: true,
      user: null,
    }
  }
}

/**
 * Require authentication for API requests - throws error if not authenticated
 * @param req Next.js API request object
 * @returns Authenticated user information
 * @throws AuthenticationError if token is missing or invalid
 */
export async function requireAuthentication(
  req: NextApiRequest
): Promise<AuthenticatedUser> {
  const token = extractTokenFromRequest(req)

  if (!token) {
    throw new AuthenticationError(
      'Authentication token is required',
      'missing_token'
    )
  }

  return await verifyFirebaseToken(token)
}
