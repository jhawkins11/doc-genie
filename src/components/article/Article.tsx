import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useRouter } from 'next/router'
import { useGenerateArticle } from '@/lib/useGenerateArticle'
import Logo from '../Logo'
import cn from 'classnames'
// import lamp svg from public

const Article = ({
  mdl,
  id,
  parentid,
  setChildId,
}: {
  mdl: string
  id: number | null
  parentid: number | null
  setChildId: React.Dispatch<React.SetStateAction<number | null>>
}) => {
  const router = useRouter()
  const h1Regex = /# (.*)\n/
  const [subtopic, setSubtopic] = useState<string | null>(null)
  const [subtopics, setSubtopics] = useState<
    { text: string | null; route: string }[]
  >([])
  const topic = h1Regex.exec(mdl)?.[1] || null

  const { article, error, success, loading } = useGenerateArticle(
    topic,
    subtopic,
    parentid,
    subtopic ? true : false
  )

  useEffect(() => {
    if (success && article) {
      setChildId(article.id)
    }
  }, [success, article])
  //   find all h2s within the content and add a button to copy the html of the h2 and its sibling p tags
  useEffect(() => {
    const h2s =
      typeof window !== 'undefined' ? document.querySelectorAll('h2') : []
    if (!mdl) return
    if (h2s.length < 1) return

    setSubtopics(
      Array.from(h2s).map((h2) => {
        const text = h2.textContent
        const route = `/${id}?subtopic=${text}`
        return { text, route }
      })
    )

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

  if (!mdl) {
    return null
  }
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Logo />
        <ul className={styles.mainList}>
          <li className={cn(styles.topic, !subtopic ? styles.active : '')}>
            {' '}
            {topic}
          </li>
          {subtopics.map((subTopic, index /* Render subtopics */) => (
            <ul className={styles.subList} key={index}>
              <li
                onClick={() => setSubtopic(subTopic.text)}
                className={subTopic.text === subtopic ? styles.active : ''}
              >
                <a href={subTopic.route}>{subTopic.text}</a>
              </li>
            </ul>
          ))}
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
