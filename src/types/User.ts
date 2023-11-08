import mongoose from 'mongoose'

interface User extends mongoose.Document {
  _id: string
  email: string
  password: string
  name: string
  authProvider: string
  createdAt: string
  updatedAt: string
}

export default User
