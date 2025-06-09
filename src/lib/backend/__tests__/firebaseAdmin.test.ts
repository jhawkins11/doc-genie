import admin from 'firebase-admin'
import { initializeFirebaseAdmin } from '../firebaseAdmin'

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  apps: [] as unknown[],
  app: jest.fn(),
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}))

const mockAdmin = admin as jest.Mocked<typeof admin>

describe('Firebase Admin SDK Initialization', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset apps array
    mockAdmin.apps.length = 0
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('initializeFirebaseAdmin', () => {
    it('should initialize Firebase Admin with valid credentials', () => {
      // Set up environment variables
      process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID = 'test-project'
      process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL =
        'test@test-project.iam.gserviceaccount.com'
      process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY =
        '-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----'

      const mockApp = { name: 'test-app' }
      mockAdmin.initializeApp.mockReturnValue(mockApp as admin.app.App)
      ;(mockAdmin.credential.cert as jest.Mock).mockReturnValue(
        {} as admin.credential.Credential
      )

      const result = initializeFirebaseAdmin()

      expect(mockAdmin.credential.cert).toHaveBeenCalledWith({
        projectId: 'test-project',
        clientEmail: 'test@test-project.iam.gserviceaccount.com',
        privateKey:
          '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
      })
      expect(mockAdmin.initializeApp).toHaveBeenCalledWith({
        credential: {},
      })
      expect(result).toBe(mockApp)
    })

    it('should return existing app if already initialized', () => {
      // Simulate existing app
      const existingApp = { name: 'existing-app' }
      mockAdmin.apps.length = 1
      mockAdmin.app.mockReturnValue(existingApp as admin.app.App)

      const result = initializeFirebaseAdmin()

      expect(mockAdmin.app).toHaveBeenCalled()
      expect(mockAdmin.initializeApp).not.toHaveBeenCalled()
      expect(result).toBe(existingApp)
    })

    it('should throw error when CUSTOM_FIREBASE_ADMIN_PROJECT_ID is missing', () => {
      process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL =
        'test@test-project.iam.gserviceaccount.com'
      process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY = 'test-key'
      delete process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID

      expect(() => initializeFirebaseAdmin()).toThrow(
        'Missing required Firebase Admin SDK environment variables. Please ensure CUSTOM_FIREBASE_ADMIN_PROJECT_ID, CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL, and CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY are set.'
      )
    })

    it('should throw error when CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL is missing', () => {
      process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID = 'test-project'
      process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY = 'test-key'
      delete process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL

      expect(() => initializeFirebaseAdmin()).toThrow(
        'Missing required Firebase Admin SDK environment variables. Please ensure CUSTOM_FIREBASE_ADMIN_PROJECT_ID, CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL, and CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY are set.'
      )
    })

    it('should throw error when CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY is missing', () => {
      process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID = 'test-project'
      process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL =
        'test@test-project.iam.gserviceaccount.com'
      delete process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY

      expect(() => initializeFirebaseAdmin()).toThrow(
        'Missing required Firebase Admin SDK environment variables. Please ensure CUSTOM_FIREBASE_ADMIN_PROJECT_ID, CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL, and CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY are set.'
      )
    })

    it('should handle Firebase Admin initialization errors', () => {
      process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID = 'test-project'
      process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL =
        'test@test-project.iam.gserviceaccount.com'
      process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY = 'test-key'

      const initError = new Error('Invalid credentials')
      mockAdmin.initializeApp.mockImplementation(() => {
        throw initError
      })

      expect(() => initializeFirebaseAdmin()).toThrow(
        'Firebase Admin SDK initialization failed: Invalid credentials'
      )
    })

    it('should handle unknown initialization errors', () => {
      process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID = 'test-project'
      process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL =
        'test@test-project.iam.gserviceaccount.com'
      process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY = 'test-key'

      mockAdmin.initializeApp.mockImplementation(() => {
        throw 'Unknown error'
      })

      expect(() => initializeFirebaseAdmin()).toThrow(
        'Firebase Admin SDK initialization failed: Unknown error'
      )
    })

    it('should properly handle escaped newlines in private key', () => {
      process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID = 'test-project'
      process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL =
        'test@test-project.iam.gserviceaccount.com'
      process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY =
        '-----BEGIN PRIVATE KEY-----\\nline1\\nline2\\n-----END PRIVATE KEY-----'

      const mockApp = { name: 'test-app' }
      mockAdmin.initializeApp.mockReturnValue(mockApp as admin.app.App)
      ;(mockAdmin.credential.cert as jest.Mock).mockReturnValue(
        {} as admin.credential.Credential
      )

      initializeFirebaseAdmin()

      expect(mockAdmin.credential.cert).toHaveBeenCalledWith({
        projectId: 'test-project',
        clientEmail: 'test@test-project.iam.gserviceaccount.com',
        privateKey:
          '-----BEGIN PRIVATE KEY-----\nline1\nline2\n-----END PRIVATE KEY-----',
      })
    })
  })
})
