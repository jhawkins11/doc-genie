import React, { useEffect, useState } from 'react'
import styles from './OnThisPage.module.css'

interface Heading {
  id: string
  text: string
  level: number
}

interface OnThisPageProps {
  content: string
  isDarkMode: boolean
}

export const generateHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}
const OnThisPage: React.FC<OnThisPageProps> = ({ content, isDarkMode }) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeHeading, setActiveHeading] = useState<string>('')

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm
    const extractedHeadings: Heading[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = generateHeadingId(text)

      extractedHeadings.push({ id, text, level })
    }

    setHeadings(extractedHeadings)
  }, [content])

  useEffect(() => {
    // Set up intersection observer to track active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  if (headings.length === 0) return null

  return (
    <div
      className={`${styles.container} ${
        isDarkMode ? styles.dark : styles.light
      }`}
    >
      <h3 className={styles.title}>On this page</h3>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {headings.map(({ id, text, level }) => (
            <li
              key={id}
              className={`${styles.item} ${styles[`level${level}`]} ${
                activeHeading === id ? styles.active : ''
              }`}
            >
              <button
                onClick={() => scrollToHeading(id)}
                className={styles.link}
                title={text}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default OnThisPage
