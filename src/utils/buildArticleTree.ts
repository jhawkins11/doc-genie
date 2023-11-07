import { ArticleModel } from '@/models/ArticleModel'
import Article from '@/types/Article'
import { Document } from 'mongoose'

const buildArticleTree = async (
  article: Document<any, any, Article>
): Promise<Article> => {
  // create a new article object to contain childArticles
  const updatedArticle = { ...article.toObject() }

  try {
    // fetch child articles
    const childArticles = await ArticleModel.find({ parentid: article._id })

    let updatedChildArticles = []
    // recursively fetch grandchild articles
    for (let childArticle of childArticles) {
      const updatedChild = await buildArticleTree(childArticle)
      if (updatedChild) {
        updatedChildArticles.push(updatedChild)
      }
    }

    // add childArticles to new article object
    updatedArticle.childArticles = updatedChildArticles
  } catch (error) {
    console.log('error getting child articles', error)
  }

  return updatedArticle
}

export default buildArticleTree
