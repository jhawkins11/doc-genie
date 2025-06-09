import admin from 'firebase-admin'

/**
 * Initialize Firebase Admin SDK with singleton pattern
 * Uses environment variables for service account credentials
 * @returns Firebase Admin app instance
 * @throws Error if required environment variables are missing or initialization fails
 */
export function initializeFirebaseAdmin(): admin.app.App {
  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    return admin.app()
  }

  // Validate required environment variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing required Firebase Admin SDK environment variables. Please ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set.'
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

    console.log('Firebase Admin SDK initialized successfully')
    return app
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error)
    throw new Error(
      `Firebase Admin SDK initialization failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

export default initializeFirebaseAdmin
