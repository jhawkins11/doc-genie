import Article from '@/types/Article'
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const ArticleSchema = new Schema(
  {
    parentid: String,
    title: String,
    content: String,
    slug: { type: String, unique: true },
    childArticles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
  },
  {
    timestamps: true,
  }
)

// this is a workaround to avoid the error:
// "Cannot overwrite `Article` model once compiled.""
const ArticleModel =
  (mongoose.models.Article as mongoose.Model<Article>) ||
  mongoose.model<Article>('Article', ArticleSchema, 'articles')

export { ArticleModel }
