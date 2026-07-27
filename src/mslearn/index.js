import '../lib/css/style.scss'
import { bootstrap } from '../lib/core/bootstrap.js'
import { extractQuiz } from './quizExtractor.js'

bootstrap(() => {
  // Only show the button if quiz questions exist in the DOM
  const hasQuiz =
    document.querySelectorAll('.quiz-question, .module-assessment-question')
      .length > 0

  if (!hasQuiz) {
    return
  }

  const btn = createDownloadMdButton(() => {
    // Extract at click time so answers are available after submission
    const questions = extractQuiz()

    if (questions.length === 0) {
      alert('No questions found on this page.')
      return
    }

    const md = formatMarkdown(questions)
    downloadMarkdown(md, getFilename())
  })

  document.body.appendChild(btn)
})

/**
 * Creates a Bulma-styled download button fixed in the top-right corner.
 * Only shown when quiz questions are detected.
 * @param {() => void} onClick
 * @returns {HTMLButtonElement}
 */
function createDownloadMdButton (onClick) {
  const btn = document.createElement('button')
  btn.className = 'button is-primary is-medium domus-download-btn'
  btn.innerHTML = `
    <span class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </span>
    <span>Download Notes</span>
  `

  btn.addEventListener('click', onClick)
  return btn
}

/**
 * Formats extracted questions into a Markdown string.
 * @param {Array} questions
 * @returns {string}
 */
function formatMarkdown (questions) {
  return questions
    .map((q) => {
      let md = `- **Question** ${q.question}\n`
      for (const option of q.options) {
        md += `  - ${option}\n`
      }
      if (q.answer || q.explanation) {
        md += `  - Answer\n`
        if (q.answer) {
          md += `    - **${q.answer}**\n`
        }
        if (q.explanation) {
          md += `    - ${q.explanation}\n`
        }
      }
      return md
    })
    .join('\n')
}

/**
 * Triggers a .md file download via a temporary anchor element.
 * @param {string} content
 * @param {string} filename
 */
function downloadMarkdown (content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Derives a filename from the page title.
 * @returns {string}
 */
function getFilename () {
  const title = document.title
    .replace(/- Training \| Microsoft Learn/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
  return `${title || 'quiz-notes'}.md`
}
