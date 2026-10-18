const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { expectDomusButtonStyled } = require("./helpers.js");

test("built MS Learn script downloads extracted quiz notes", async ({
  page,
}) => {
  await page.setContent(`
    <title>Manage resources - Training | Microsoft Learn</title>
    <main>
      <div class="quiz-question">
        <div id="quiz-question-1">
          <p>Which command creates a <code>resource group</code>?</p>
        </div>
        <label class="quiz-choice">
          <span class="radio-label-text">az login</span>
        </label>
        <label class="quiz-choice is-correct">
          <span class="radio-label-text">az group create</span>
        </label>
        <div class="quiz-choice-explanation">
          Use <code>az group create</code> to create the group.
        </div>
      </div>
    </main>
  `);
  await page.evaluate(() => {
    window.GM_addStyle = (css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    };
    window.__download = null;
    window.__downloadBlob = null;
    URL.createObjectURL = (blob) => {
      window.__downloadBlob = blob;
      return "blob:mslearn-test";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () {
      window.__download = { href: this.href, filename: this.download };
    };
  });
  await page.addScriptTag({
    path: path.resolve(__dirname, "../../dist/mslearn.user.js"),
  });

  const button = page.getByRole("button", { name: "Download Notes" });
  await expectDomusButtonStyled(button);
  await button.click();
  const download = await page.evaluate(async () => ({
    ...window.__download,
    content: await window.__downloadBlob.text(),
  }));

  expect(download.filename).toBe("manage-resources.md");
  expect(download.href).toBe("blob:mslearn-test");
  expect(download.content).toContain(
    "- **Question** Which command creates a `resource group`?",
  );
  expect(download.content).toContain("    - **az group create**");
  expect(download.content).toContain(
    "    - Use `az group create` to create the group.",
  );
});

test("built MS Learn script exports module assessment questions", async ({
  page,
}) => {
  await page.setContent(`
    <title>Assess your knowledge - Training | Microsoft Learn</title>
    <main>
      <section class="module-assessment-question">
        <div class="quiz-question-title">
          <p>Which command lists resource groups?</p>
        </div>
        <label class="quiz-choice">
          <span class="radio-label-text">az group create</span>
        </label>
        <label class="quiz-choice is-correct">
          <span class="radio-label-text">az group list</span>
        </label>
      </section>
    </main>
  `);
  await page.evaluate(() => {
    window.GM_addStyle = (css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    };
    window.__download = null;
    window.__downloadBlob = null;
    URL.createObjectURL = (blob) => {
      window.__downloadBlob = blob;
      return "blob:mslearn-assessment-test";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () {
      window.__download = { href: this.href, filename: this.download };
    };
  });
  await page.addScriptTag({
    path: path.resolve(__dirname, "../../dist/mslearn.user.js"),
  });

  await page.getByRole("button", { name: "Download Notes" }).click();
  const download = await page.evaluate(async () => ({
    ...window.__download,
    content: await window.__downloadBlob.text(),
  }));

  expect(download.filename).toBe("assess-your-knowledge.md");
  expect(download.content).toContain(
    "- **Question** Which command lists resource groups?",
  );
  expect(download.content).toContain("    - **az group list**");
});

test("built MS Learn script logs startup errors without rendering UI", async ({
  page,
}) => {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.setContent("<main></main>");
  await page.evaluate(() => {
    window.GM_addStyle = (css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
    };
    document.querySelectorAll = () => {
      throw new Error("boom");
    };
  });
  await page.addScriptTag({
    path: path.resolve(__dirname, "../../dist/mslearn.user.js"),
  });

  await expect
    .poll(() => consoleErrors.some((text) => text.includes("boom")))
    .toBe(true);
  await expect(page.locator(".modal")).toHaveCount(0);
});
