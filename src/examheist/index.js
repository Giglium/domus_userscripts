import '../lib/css/style.scss'
import { bootstrap } from '../lib/core/bootstrap.js'

const STYLE_ID = 'domus-examheist-hide-style'

/**
 * Injects a <style> element that hides correct answers.
 * - `.correct-hidden` gets `color: inherit !important` to neutralise any
 *   highlight colour the page applies.
 * - `.question-answer-wrapper` is hidden entirely.
 */
function applyHiddenStyle () {
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .correct-hidden {
      color: inherit !important;
    }
    .question-answer-wrapper {
      opacity: 0 !important;
    }
  `
  document.head.appendChild(style)
}

/**
 * Removes the injected <style> element, revealing answers again.
 */
function removeHiddenStyle () {
  const style = document.getElementById(STYLE_ID)
  if (style) style.remove()
}

bootstrap(() => {
  // Apply hiding immediately on page load
  applyHiddenStyle()

  let hidden = true

  const btn = document.createElement('button')
  btn.className = 'button is-primary is-medium domus-download-btn'
  btn.innerHTML = `
    <span class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </span>
    <span>Show Answers</span>
  `

  btn.addEventListener('click', () => {
    if (hidden) {
      removeHiddenStyle()
      btn.querySelector('span:last-child').textContent = 'Hide Answers'
    } else {
      applyHiddenStyle()
      btn.querySelector('span:last-child').textContent = 'Show Answers'
    }
    hidden = !hidden
  })

  document.body.appendChild(btn)
})
