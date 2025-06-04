import Article from '@/types/Article'
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ArticleSchema = new Schema(
  {
    parentid: String,
    title: String,
    content: String,
    slug: { type: String, unique: true },
    uid: { type: String, index: true },
    isGuest: { type: Boolean, default: false, index: true },
    childArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  },
  {
    timestamps: true,
  }
)

// TTL index for guest articles - automatically delete after 48 hours
ArticleSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 172800, // 48 hours in seconds
    partialFilterExpression: { isGuest: true },
  }
)

// this is a workaround to avoid the error:
// "Cannot overwrite `Article` model once compiled.""
const ArticleModel =
  (mongoose.models.Article as mongoose.Model<Article>) ||
  mongoose.model<Article>('Article', ArticleSchema, 'articles')

export { ArticleModel }
