import mongoose from 'mongoose'

const Schema = mongoose.Schema

interface RateLimit {
  key: string
  count: number
  resetTime: Date
  createdAt?: Date
  updatedAt?: Date
}

const RateLimitSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
    resetTime: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index - documents expire at resetTime
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient queries
RateLimitSchema.index({ key: 1, resetTime: 1 })

// This is a workaround to avoid the error:
// "Cannot overwrite `RateLimit` model once compiled."
const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<RateLimit>) ||
  mongoose.model<RateLimit>('RateLimit', RateLimitSchema, 'ratelimits')

export { RateLimitModel, type RateLimit }
