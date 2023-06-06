import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './Article.module.css'
import LampSVG from '../LampSVG'
import ReactDOM from 'react-dom'
import { useRouter } from 'next/router'
// import lamp svg from public

const Article = ({ mdl }: { mdl: string | null }) => {
  const router = useRouter()
  //   find all h2s and add a button to copy the html of the h2 and its sibling p tags
  useEffect(() => {
    const h2s =
      typeof window !== 'undefined' ? document.querySelectorAll('h2') : []
    if (!mdl) return
    if (h2s.length < 1) return
    console.log('H2S', h2s)
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
        const p = h2.nextElementSibling as HTMLParagraphElement
        const subArticlePrompt =
          h2.textContent + '\n\n' + p.textContent + '\n\n'
        router.push('/' + encodeURIComponent(subArticlePrompt))
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
    <div className={styles.root} id='article'>
      <ReactMarkdown>{mdl}</ReactMarkdown>
    </div>
  )
}

export default Article
