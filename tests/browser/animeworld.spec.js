const path = require("node:path");
const { test, expect } = require("@playwright/test");
const { expectDomusButtonStyled } = require("./helpers.js");

async function setupAnimeWorld(page, content, url) {
  if (url) {
    await page.route(url, (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: content }),
    );
    await page.goto(url);
  } else {
    await page.setContent(content);
  }
  await page.evaluate(() => {
    window.GM_addStyle = (css) => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    };
    window.__downloads = [];
    window.__requests = [];
    HTMLAnchorElement.prototype.click = function () {
      window.__downloads.push({ href: this.href, filename: this.download });
    };
  });
  await page.addScriptTag({
    path: path.resolve(__dirname, "../../dist/animeworld.user.js"),
  });
}

test("built AnimeWorld script downloads the loaded episode video", async ({
  page,
}) => {
  await setupAnimeWorld(
    page,
    `
      <title>AnimeWorld Episode</title>
      <main id="player">
        <video
          preload="none"
          src="https://cdn.example.test/episodes/episode-01.mp4"
        ></video>
      </main>
    `,
  );

  const button = page.getByRole("button", { name: "Download MP4" });
  await expectDomusButtonStyled(button);
  await button.click();
  await expect(button).not.toHaveClass(/is-loading/);
  expect(await page.evaluate(() => window.__downloads)).toEqual([
    {
      href: "https://cdn.example.test/episodes/episode-01.mp4",
      filename: "episode-01.mp4",
    },
  ]);
});

test("built AnimeWorld script extracts video from the player iframe", async ({
  page,
}) => {
  const iframeUrl = "https://player.example.test/embed/episode-01";
  const videoUrl = "https://cdn.example.test/episodes/episode-01.mp4";
  await setupAnimeWorld(
    page,
    `<main id="player"><iframe src="${iframeUrl}"></iframe></main>`,
  );
  await page.evaluate((videoSource) => {
    window.GM_xmlhttpRequest = ({ url, onload }) => {
      window.__requests.push(url);
      onload({ responseText: `<video src="${videoSource}"></video>` });
    };
  }, videoUrl);

  const button = page.getByRole("button", { name: "Download MP4" });
  await button.click();
  await expect(button).not.toHaveClass(/is-loading/);
  expect(await page.evaluate(() => window.__requests)).toEqual([iframeUrl]);
  expect(await page.evaluate(() => window.__downloads[0])).toEqual({
    href: videoUrl,
    filename: "episode-01.mp4",
  });
});

test("built AnimeWorld script resolves an episode through its grabber API", async ({
  page,
}) => {
  const pageUrl = "https://www.animeworld.ac/play/episode-01";
  const grabberUrl = "https://player.example.test/grabber/episode-01";
  const videoUrl = "https://cdn.example.test/episodes/episode-01.mp4";
  await setupAnimeWorld(
    page,
    `
      <div class="server active">
        <div class="episodes">
          <a class="active" data-id="episode-42">Episode 1</a>
        </div>
      </div>
    `,
    pageUrl,
  );
  await page.evaluate(
    ({ grabberUrl: responseUrl, videoUrl: responseVideo }) => {
      window.GM_xmlhttpRequest = ({ url, onload, onerror }) => {
        window.__requests.push(url);
        const responseText =
          url === `${window.location.origin}/api/episode/info?id=episode-42`
            ? JSON.stringify({ grabber: responseUrl })
            : url === responseUrl
              ? JSON.stringify([{ file: responseVideo }])
              : null;
        if (responseText) onload({ responseText });
        else onerror();
      };
    },
    { grabberUrl, videoUrl },
  );

  const button = page.getByRole("button", { name: "Download MP4" });
  await button.click();
  await expect(button).not.toHaveClass(/is-loading/);
  expect(await page.evaluate(() => window.__requests)).toEqual([
    `${new URL(pageUrl).origin}/api/episode/info?id=episode-42`,
    grabberUrl,
  ]);
  expect(await page.evaluate(() => window.__downloads[0])).toEqual({
    href: videoUrl,
    filename: "episode-01.mp4",
  });
});
