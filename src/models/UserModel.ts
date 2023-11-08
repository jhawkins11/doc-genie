import mongoose from 'mongoose'

const Schema = mongoose.Schema

interface User extends mongoose.Document {
  _id: string
  email: string
  password: string
  username: string
  createdAt: string
  updatedAt: string
}

const UserSchema = new Schema(
  {
    email: String,
    password: String,
    username: String,
  },
  {
    timestamps: true,
  }
)

// this is a workaround to avoid the error:
// "Cannot overwrite  model once compiled.""
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema, 'users')

export { UserModel }
