const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { expectDomusButtonStyled } = require("./helpers.js");

test("built ExamHeist script hides and reveals answers", async ({ page }) => {
  await page.setContent(`
    <main>
      <article>
        <p>Which option is correct?</p>
        <ul style="color: rgb(24, 72, 112)">
          <li class="multi-choice-item">A. Incorrect option</li>
          <li
            class="multi-choice-item correct-hidden"
            style="color: rgb(196, 0, 0)"
          >
            <span class="multi-choice-letter" data-choice-letter="D">D.</span>
            Correct option
          </li>
        </ul>
        <div class="question-answer-wrapper">
          <div class="question-answer">
            <div class="question-answer-title">
              Answer:
              <div class="inline-answer" style="display: inline">D</div>
            </div>
          </div>
        </div>
      </article>
      <button class="button is-primary" id="host-button">Host control</button>
    </main>
  `);
  const hostButton = page.locator("#host-button");
  const hostButtonStyle = await hostButton.evaluate((button) => {
    const style = getComputedStyle(button);
    return [style.display, style.padding, style.backgroundColor];
  });
  await page.evaluate(() => {
    window.GM_addStyle = (css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    };
  });
  await page.addScriptTag({
    path: path.resolve(__dirname, "../../dist/examheist.user.js"),
  });

  const answer = page.locator(".question-answer-wrapper");
  const correctChoice = page.locator(".multi-choice-item.correct-hidden");
  const toggle = page.getByRole("button", { name: "Show Answers" });
  await expect(answer).toHaveCSS("opacity", "0");
  await expect(correctChoice).toHaveCSS("color", "rgb(24, 72, 112)");
  await expect(toggle).toHaveCSS("position", "fixed");
  await expectDomusButtonStyled(toggle);
  expect(
    await hostButton.evaluate((button) => {
      const style = getComputedStyle(button);
      return [style.display, style.padding, style.backgroundColor];
    }),
  ).toEqual(hostButtonStyle);
  await toggle.click();
  await expect(answer).not.toHaveCSS("opacity", "0");
  await page.getByRole("button", { name: "Hide Answers" }).click();
  await expect(answer).toHaveCSS("opacity", "0");
});
