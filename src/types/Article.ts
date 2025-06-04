import mongoose from 'mongoose'

type Article = {
  _id: mongoose.Types.ObjectId
  parentid: string
  title: string
  content: string
  slug: string
  uid?: string
  isGuest: boolean
  childArticles?: Article[]
  createdAt?: Date
  updatedAt?: Date
}

export default Article
