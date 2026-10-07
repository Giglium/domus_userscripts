import { bootstrap } from "../lib/core/bootstrap.js";
import { createDownloadButton } from "../lib/dom/downloadButton.js";
import { extractQuiz } from "./quizExtractor.js";
import { getUiRoot } from "../lib/dom/uiRoot.js";

bootstrap(() => {
  // Only show the button if quiz questions exist in the DOM
  const hasQuiz =
    document.querySelectorAll(".quiz-question, .module-assessment-question")
      .length > 0;

  if (!hasQuiz) {
    return;
  }

  const btn = createDownloadButton(() => {
    // Extract at click time so answers are available after submission
    const questions = extractQuiz();

    if (questions.length === 0) {
      alert("No questions found on this page.");
      return;
    }

    const md = formatMarkdown(questions);
    downloadMarkdown(md, getFilename());
  }, "Download Notes");

  getUiRoot().appendChild(btn);
});

/**
 * Formats extracted questions into a Markdown string.
 * @param {Array} questions
 * @returns {string}
 */
function formatMarkdown(questions) {
  return questions
    .map((q) => {
      let md = `- **Question** ${q.question}\n`;
      for (const option of q.options) {
        md += `  - ${option}\n`;
      }
      if (q.answer || q.explanation) {
        md += `  - Answer\n`;
        if (q.answer) {
          md += `    - **${q.answer}**\n`;
        }
        if (q.explanation) {
          md += `    - ${q.explanation}\n`;
        }
      }
      return md;
    })
    .join("\n");
}

/**
 * Triggers a .md file download via a temporary anchor element.
 * @param {string} content
 * @param {string} filename
 */
function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Derives a filename from the page title.
 * @returns {string}
 */
function getFilename() {
  const title = document.title
    .replace(/- Training \| Microsoft Learn/i, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${title || "quiz-notes"}.md`;
}
