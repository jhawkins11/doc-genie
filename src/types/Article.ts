import mongoose from 'mongoose'

type Article = {
  _id: mongoose.Types.ObjectId
  parentid: string
  title: string
  content: string
  slug: string
  uid: string
  childArticles?: Article[]
}

export default Article
