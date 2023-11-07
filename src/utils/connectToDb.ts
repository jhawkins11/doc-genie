import mongoose from 'mongoose'

const connectToDb = async (): Promise<void> => {
  // Here is where we check if there is an active connection.
  if (mongoose.connections[0].readyState) return

  try {
    // Here is where we create a new connection.
    await mongoose.connect(process.env.MONGODB_URI as string)

    console.log('Connected to database.')
  } catch (error) {
    console.log('DB error', error)
  }
}

export default connectToDb
