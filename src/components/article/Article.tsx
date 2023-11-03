import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useRouter } from 'next/router'
import { Article, useGenerateArticle } from '@/lib/useGenerateArticle'
import Logo from '../Logo'
import cn from 'classnames'

const Article = ({
  article,
  loading,
}: {
  article: Article
  loading: boolean
}) => {
  const [mdl, setMdl] = useState<string>(article.content)
  const router = useRouter()
  const h1Regex = /# (.*)\n/
  const [subtopic, setSubtopic] = useState<string | null>(null)
  const [subtopics, setSubtopics] = useState<
    { text: string | null; route: string }[]
  >([])
  const topic = article.title

  //   find all h2s within the content and add a button to copy the html of the h2 and its sibling p tags
  useEffect(() => {
    const h2s =
      typeof window !== 'undefined' ? document.querySelectorAll('h2') : []
    if (!mdl) return
    if (h2s.length < 1) return

    h2s.forEach((h2) => {
      const hasButton = h2.querySelector('button')
      if (hasButton) {
        return
      }
      const id = Math.random().toString(36).substring(7)
      const button = document.createElement('button')
      button.id = id
      button.classList.add(styles.lampSVG)
      button.addEventListener('click', () => {
        const subArticlePrompt = h2.textContent
        setSubtopic(subArticlePrompt)
      })
      h2.appendChild(button)
      if (!document.getElementById(id)) return
      ReactDOM.render(<LampSVG />, document.getElementById(id))
    })
  }, [mdl])

  const renderChildren = (children: Article[]) => {
    console.log('rendering children', children)
    if (!children) {
      return null
    }
    return (
      <ul className={styles.subList}>
        {children?.map((childArticle, index) => (
          <li
            key={index}
            className={childArticle.title === subtopic ? styles.active : ''}
            onClick={() => {
              setSubtopic(childArticle.title)
              setMdl(childArticle.content)
            }}
          >
            {childArticle.title}
            {childArticle.childArticles &&
              renderChildren(childArticle.childArticles)}
          </li>
        ))}
      </ul>
    )
  }

  console.log('article', article)
  if (!mdl) {
    return null
  }
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Logo />
        <ul className={styles.mainList}>
          <li
            className={cn(styles.topic, !subtopic ? styles.active : '')}
            onClick={() => {
              setSubtopic(null)
              setMdl(article.content)
            }}
          >
            {' '}
            {topic}
          </li>
          {article && renderChildren(article.childArticles || [])}
        </ul>
      </div>
      <div className={styles.content}>
        <div className={styles.root} id='article'>
          <ReactMarkdown>{mdl}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default Article
