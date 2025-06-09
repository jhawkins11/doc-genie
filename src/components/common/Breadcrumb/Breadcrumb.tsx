import React from 'react'
import Link from 'next/link'
import Article from '@/types/Article'
import styles from './Breadcrumb.module.css'

interface BreadcrumbProps {
  selected: Article
  articles: Article[]
  isDarkMode: boolean
}

const Breadcrumb = React.memo(
  ({ selected, articles, isDarkMode }: BreadcrumbProps) => {
    // Build breadcrumb path from article hierarchy
    const buildBreadcrumbPath = (): {
      label: string
      href: string
      current?: boolean
    }[] => {
      const path: { label: string; href: string; current?: boolean }[] = [
        { label: 'Home', href: '/' },
      ]

      if (!articles || articles.length === 0) return path

      const findRootArticle = (): Article | null => {
        // If selected article has no parentid, it is a root article
        if (!selected.parentid) {
          return selected
        }

        // Search through all articles to find the one that contains the selected article
        for (const article of articles) {
          const findInTree = (current: Article): boolean => {
            if (current._id.toString() === selected._id.toString()) {
              return true
            }
            if (current.childArticles && current.childArticles.length > 0) {
              return current.childArticles.some((child) => findInTree(child))
            }
            return false
          }

          if (findInTree(article)) {
            return article
          }
        }

        return articles[0] || null
      }

      const rootArticle = findRootArticle()

      if (rootArticle) {
        path.push({
          label: rootArticle.title,
          href: `/${rootArticle.slug}`,
          current: selected._id.toString() === rootArticle._id.toString(),
        })
      }

      // If selected is not the root, find the path to it
      if (
        rootArticle &&
        selected._id.toString() !== rootArticle._id.toString()
      ) {
        const findPath = (
          article: Article,
          targetId: string,
          currentPath: Article[]
        ): Article[] | null => {
          if (article._id.toString() === targetId) {
            return [...currentPath, article]
          }

          if (article.childArticles && article.childArticles.length > 0) {
            for (const child of article.childArticles) {
              const result = findPath(child, targetId, [
                ...currentPath,
                article,
              ])
              if (result) return result
            }
          }

          return null
        }

        const pathToSelected = findPath(
          rootArticle,
          selected._id.toString(),
          []
        )

        if (pathToSelected && pathToSelected.length > 1) {
          // Skip the root (already added) and add the rest
          for (let i = 1; i < pathToSelected.length; i++) {
            const article = pathToSelected[i]
            path.push({
              label: article.title,
              href: `/${article.slug}`,
              current: i === pathToSelected.length - 1,
            })
          }
        }
      }

      return path
    }

    const breadcrumbItems = buildBreadcrumbPath()

    return (
      <nav className={`${styles.breadcrumb} mb-4`} aria-label='Breadcrumb'>
        <ol className='flex items-center space-x-1'>
          {breadcrumbItems.map((item, index) => (
            <li key={index} className='flex items-center'>
              {index > 0 && (
                <span
                  className={`mx-2 text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  /
                </span>
              )}
              {item.current ? (
                <span className={`${styles.breadcrumbCurrent} text-sm`}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`${styles.breadcrumbLink} text-sm`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

export default Breadcrumb
