import type { NextApiRequest } from 'next'
import {
  verifyFirebaseToken,
  extractTokenFromRequest,
  verifyOptionalAuthentication,
  requireAuthentication,
  AuthenticationError,
} from '../authService'

// Mock Firebase Admin initialization
jest.mock('../firebaseAdmin', () => ({
  initializeFirebaseAdmin: jest.fn(),
}))

import { initializeFirebaseAdmin } from '../firebaseAdmin'

const mockInitializeFirebaseAdmin =
  initializeFirebaseAdmin as jest.MockedFunction<typeof initializeFirebaseAdmin>

// Helper function to create mock request
const createMockRequest = (
  authHeader?: string,
  headers?: Record<string, string>
): NextApiRequest => {
  const mockHeaders: Record<string, string> = { ...headers }
  if (authHeader) {
    mockHeaders.authorization = authHeader
  }

  return {
    headers: mockHeaders,
  } as NextApiRequest
}

describe('Authentication Service', () => {
  const mockAuth = {
    verifyIdToken: jest.fn(),
  }

  const mockAdmin = {
    auth: jest.fn().mockReturnValue(mockAuth),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockInitializeFirebaseAdmin.mockReturnValue(
      mockAdmin as unknown as import('firebase-admin').app.App
    )
  })

  describe('verifyFirebaseToken', () => {
    it('should verify valid token and return user info', async () => {
      const mockDecodedToken = {
        uid: 'user123',
        email: 'test@example.com',
      }
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)

      const result = await verifyFirebaseToken('valid-token')

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
      })
    })

    it('should throw AuthenticationError for empty token', async () => {
      await expect(verifyFirebaseToken('')).rejects.toThrow(AuthenticationError)
      await expect(verifyFirebaseToken('')).rejects.toMatchObject({
        code: 'missing_token',
        statusCode: 401,
      })
    })

    it('should throw AuthenticationError for null token', async () => {
      await expect(verifyFirebaseToken('   ')).rejects.toThrow(
        AuthenticationError
      )
      await expect(verifyFirebaseToken('   ')).rejects.toMatchObject({
        code: 'missing_token',
        statusCode: 401,
      })
    })

    it('should handle expired token error', async () => {
      const expiredError = new Error('Token expired')
      mockAuth.verifyIdToken.mockRejectedValue(expiredError)

      await expect(verifyFirebaseToken('expired-token')).rejects.toThrow(
        AuthenticationError
      )
      await expect(verifyFirebaseToken('expired-token')).rejects.toMatchObject({
        code: 'token_expired',
        message: 'Authentication token has expired',
      })
    })

    it('should handle invalid token error', async () => {
      const invalidError = new Error('Invalid token format')
      mockAuth.verifyIdToken.mockRejectedValue(invalidError)

      await expect(verifyFirebaseToken('invalid-token')).rejects.toThrow(
        AuthenticationError
      )
      await expect(verifyFirebaseToken('invalid-token')).rejects.toMatchObject({
        code: 'invalid_token',
        message: 'Invalid authentication token',
      })
    })

    it('should handle malformed token error', async () => {
      const malformedError = new Error('Malformed JWT')
      mockAuth.verifyIdToken.mockRejectedValue(malformedError)

      await expect(verifyFirebaseToken('malformed-token')).rejects.toThrow(
        AuthenticationError
      )
      await expect(
        verifyFirebaseToken('malformed-token')
      ).rejects.toMatchObject({
        code: 'malformed_token',
        message: 'Malformed authentication token',
      })
    })

    it('should handle generic verification failure', async () => {
      const genericError = new Error('Network error')
      mockAuth.verifyIdToken.mockRejectedValue(genericError)

      await expect(verifyFirebaseToken('token')).rejects.toThrow(
        AuthenticationError
      )
      await expect(verifyFirebaseToken('token')).rejects.toMatchObject({
        code: 'token_verification_failed',
        message: 'Unable to verify authentication token',
      })
    })

    it('should handle non-Error exceptions', async () => {
      mockAuth.verifyIdToken.mockRejectedValue('String error')

      await expect(verifyFirebaseToken('token')).rejects.toThrow(
        AuthenticationError
      )
      await expect(verifyFirebaseToken('token')).rejects.toMatchObject({
        code: 'token_verification_failed',
        message: 'Unable to verify authentication token',
      })
    })
  })

  describe('extractTokenFromRequest', () => {
    it('should extract token from valid Bearer header', () => {
      const req = createMockRequest('Bearer valid-token-123')
      const result = extractTokenFromRequest(req)
      expect(result).toBe('valid-token-123')
    })

    it('should return null for missing authorization header', () => {
      const req = createMockRequest()
      const result = extractTokenFromRequest(req)
      expect(result).toBeNull()
    })

    it('should return null for non-Bearer authorization header', () => {
      const req = createMockRequest('Basic dXNlcjpwYXNz')
      const result = extractTokenFromRequest(req)
      expect(result).toBeNull()
    })

    it('should return null for Bearer header without token', () => {
      const req = createMockRequest('Bearer ')
      const result = extractTokenFromRequest(req)
      expect(result).toBeNull()
    })

    it('should return null for Bearer header with only spaces', () => {
      const req = createMockRequest('Bearer    ')
      const result = extractTokenFromRequest(req)
      expect(result).toBeNull()
    })

    it('should trim whitespace from extracted token', () => {
      const req = createMockRequest('Bearer  token-with-spaces  ')
      const result = extractTokenFromRequest(req)
      expect(result).toBe('token-with-spaces')
    })
  })

  describe('verifyOptionalAuthentication', () => {
    it('should return guest status when no token provided', async () => {
      const req = createMockRequest()
      const result = await verifyOptionalAuthentication(req)

      expect(result).toEqual({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })
    })

    it('should return authenticated status with valid token', async () => {
      const mockDecodedToken = {
        uid: 'user123',
        email: 'test@example.com',
      }
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)

      const req = createMockRequest('Bearer valid-token')
      const result = await verifyOptionalAuthentication(req)

      expect(result).toEqual({
        isAuthenticated: true,
        isGuest: false,
        user: {
          uid: 'user123',
          email: 'test@example.com',
        },
      })
    })

    it('should return guest status when token verification fails', async () => {
      const invalidError = new Error('Invalid token')
      mockAuth.verifyIdToken.mockRejectedValue(invalidError)

      const req = createMockRequest('Bearer invalid-token')
      const result = await verifyOptionalAuthentication(req)

      expect(result).toEqual({
        isAuthenticated: false,
        isGuest: true,
        user: null,
      })
    })
  })

  describe('requireAuthentication', () => {
    it('should return user info for valid token', async () => {
      const mockDecodedToken = {
        uid: 'user123',
        email: 'test@example.com',
      }
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken)

      const req = createMockRequest('Bearer valid-token')
      const result = await requireAuthentication(req)

      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
      })
    })

    it('should throw AuthenticationError when no token provided', async () => {
      const req = createMockRequest()

      await expect(requireAuthentication(req)).rejects.toThrow(
        AuthenticationError
      )
      await expect(requireAuthentication(req)).rejects.toMatchObject({
        code: 'missing_token',
        message: 'Authentication token is required',
      })
    })

    it('should throw AuthenticationError for invalid token', async () => {
      const invalidError = new Error('Invalid token')
      mockAuth.verifyIdToken.mockRejectedValue(invalidError)

      const req = createMockRequest('Bearer invalid-token')

      await expect(requireAuthentication(req)).rejects.toThrow(
        AuthenticationError
      )
      await expect(requireAuthentication(req)).rejects.toMatchObject({
        code: 'invalid_token',
      })
    })
  })

  describe('AuthenticationError', () => {
    it('should create error with correct properties', () => {
      const error = new AuthenticationError('Test message', 'test_code', 403)

      expect(error.message).toBe('Test message')
      expect(error.code).toBe('test_code')
      expect(error.statusCode).toBe(403)
      expect(error.name).toBe('AuthenticationError')
      expect(error).toBeInstanceOf(Error)
    })

    it('should default to 401 status code', () => {
      const error = new AuthenticationError('Test message', 'test_code')

      expect(error.statusCode).toBe(401)
    })
  })
})
