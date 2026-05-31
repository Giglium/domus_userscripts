/**
 * Creates a Bulma-styled download button fixed in the top-right corner.
 * @param {() => void} onClick - Callback when the button is clicked.
 * @returns {HTMLButtonElement}
 */
export function createDownloadButton(onClick) {
  const btn = document.createElement("button");
  btn.className = "button is-primary is-medium domus-download-btn";
  btn.innerHTML = `
    <span class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </span>
    <span>Download MP4</span>
  `;

  btn.addEventListener("click", onClick);
  return btn;
}
