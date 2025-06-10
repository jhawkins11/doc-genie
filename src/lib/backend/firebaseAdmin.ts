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

  // For local development, use service account keys from env vars.
  const privateKey = process.env.CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY
  if (privateKey) {
    console.log(
      'Found private key. Attempting to initialize Firebase Admin with explicit credentials...'
    )
    const projectId = process.env.CUSTOM_FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL

    if (!projectId || !clientEmail) {
      throw new Error(
        'When using CUSTOM_FIREBASE_ADMIN_PRIVATE_KEY, you must also provide CUSTOM_FIREBASE_ADMIN_PROJECT_ID and CUSTOM_FIREBASE_ADMIN_CLIENT_EMAIL.'
      )
    }

    try {
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      })
      console.log(
        'Firebase Admin SDK initialized successfully with explicit credentials.'
      )
      return app
    } catch (error) {
      console.error(
        'Failed to initialize Firebase Admin SDK with explicit credentials:',
        error
      )
      throw new Error(
        `Firebase Admin SDK initialization failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    }
  }

  // For production on Google Cloud, use Application Default Credentials.
  console.log(
    'Attempting to initialize Firebase Admin with default credentials...'
  )
  try {
    const app = admin.initializeApp()
    console.log(
      'Firebase Admin SDK initialized successfully with default credentials.'
    )
    return app
  } catch (error) {
    console.error(
      'Failed to initialize Firebase Admin SDK with default credentials:',
      error
    )
    throw new Error(
      'Firebase Admin SDK initialization failed. Ensure you have set up Application Default Credentials correctly for your environment, or provide service account details via environment variables for local development.'
    )
  }
}

export default initializeFirebaseAdmin
