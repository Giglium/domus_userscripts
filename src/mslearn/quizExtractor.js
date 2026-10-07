/**
 * Extracts quiz questions and answers from Microsoft Learn training pages.
 *
 * Supports both:
 * - Knowledge check quizzes (form#question-container)
 * - Module assessment quizzes (form#module-assessment-questions-form)
 *
 * @returns {Array<{question: string, options: string[], answer: string, explanation: string}>}
 */
export function extractQuiz() {
  const questions = [];

  const quizItems = document.querySelectorAll(
    ".quiz-question, .module-assessment-question",
  );

  for (const item of quizItems) {
    const extracted = extractQuestion(item);
    if (extracted) {
      questions.push(extracted);
    }
  }

  return questions;
}

/**
 * Extracts a single question block.
 * @param {Element} questionEl
 * @returns {{question: string, options: string[], answer: string, explanation: string} | null}
 */
function extractQuestion(questionEl) {
  // Get the question text
  const titleEl = questionEl.querySelector(
    "[id^='quiz-question-'] p, .quiz-question-title p",
  );
  if (!titleEl) return null;

  const question = htmlToMarkdown(titleEl);

  // Get all options
  const options = [];
  let answer = "";
  let explanation = "";

  const choiceLabels = questionEl.querySelectorAll(".quiz-choice");

  for (const label of choiceLabels) {
    const textEl = label.querySelector(".radio-label-text");
    if (!textEl) continue;

    const optionText = htmlToMarkdown(textEl);
    options.push(optionText);

    // Check if this is the correct answer
    if (label.classList.contains("is-correct")) {
      answer = optionText;
    }

    // Explanation is always the sibling after the label
    const explanationEl = label.nextElementSibling;
    if (
      label.classList.contains("is-correct") &&
      explanationEl &&
      explanationEl.classList.contains("quiz-choice-explanation")
    ) {
      const expText = htmlToMarkdown(explanationEl);
      if (expText) {
        explanation = expText;
      }
    }
  }

  if (!question || options.length === 0) return null;

  return { question, options, answer, explanation };
}

/**
 * Converts an HTML element's content to Markdown, preserving:
 * - <code> → `backticks`
 * - <strong>/<b> → **bold**
 * - <em>/<i> → *italic*
 * - <a href> → [text](url)
 * - <br> → newline
 *
 * @param {Element} el
 * @returns {string}
 */
function htmlToMarkdown(el) {
  let result = "";

  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      if (tag === "code") {
        result += "`" + node.textContent + "`";
      } else if (tag === "strong" || tag === "b") {
        result += "**" + htmlToMarkdown(node) + "**";
      } else if (tag === "em" || tag === "i") {
        result += "*" + htmlToMarkdown(node) + "*";
      } else if (tag === "a") {
        const href = node.getAttribute("href") || "";
        result += "[" + htmlToMarkdown(node) + "](" + href + ")";
      } else if (tag === "br") {
        result += "\n";
      } else if (tag === "p") {
        result += htmlToMarkdown(node);
      } else {
        // Fallback: recurse into unknown elements
        result += htmlToMarkdown(node);
      }
    }
  }

  return result.trim();
}
