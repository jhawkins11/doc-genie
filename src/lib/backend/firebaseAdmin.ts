import admin from 'firebase-admin'

/**
 * Initialize Firebase Admin SDK with singleton pattern
 * Uses default credentials when running on Firebase/Google Cloud,
 * falls back to environment variables for local development
 * @returns Firebase Admin app instance
 * @throws Error if initialization fails
 */
export function initializeFirebaseAdmin(): admin.app.App {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    return admin.app()
  }

  try {
    // Try to initialize with default credentials first (works on Firebase/Google Cloud)
    const app = admin.initializeApp({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    })

    console.log(
      'Firebase Admin SDK initialized successfully with default credentials'
    )
    return app
  } catch (error) {
    console.log(
      'Default credentials failed, trying explicit credentials...',
      error
    )

    // Fallback to explicit credentials for local development
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase Admin SDK initialization failed. When running locally, please ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set.'
      )
    }

    try {
      // Initialize Firebase Admin with service account credentials
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
        }),
      })

      console.log(
        'Firebase Admin SDK initialized successfully with explicit credentials'
      )
      return app
    } catch (explicitError) {
      console.error('Failed to initialize Firebase Admin SDK:', explicitError)
      throw new Error(
        `Firebase Admin SDK initialization failed: ${
          explicitError instanceof Error
            ? explicitError.message
            : 'Unknown error'
        }`
      )
    }
  }
}

export default initializeFirebaseAdmin
