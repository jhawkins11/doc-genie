import mongoose from 'mongoose'

const connectToDb = async (): Promise<void> => {
  // Here is where we check if there is an active connection.
  if (mongoose.connections[0].readyState) return

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined.')
  }

  try {
    // Here is where we create a new connection.
    await mongoose.connect(mongoUri)

    console.log('Connected to database.')
  } catch (error) {
    console.error('DB error', error)
    throw error
  }
}

export default connectToDb
