import { formatError } from "./errorFormat.js";

/**
 * Display a Bulma modal with error details.
 * @param {Error} error
 */
export function showErrorOverlay(error) {
  const { title, detail } = formatError(error);

  const overlay = document.createElement("div");
  overlay.className = "modal is-active";
  overlay.innerHTML = `
    <div class="modal-background"></div>
    <div class="modal-content">
      <div class="notification is-danger">
        <button class="delete" aria-label="close"></button>
        <p class="title is-5">${title}</p>
        <p class="domus-error-overlay__detail">${detail}</p>
      </div>
    </div>
  `;

  overlay.querySelector(".delete").addEventListener("click", () => {
    overlay.remove();
  });
  overlay.querySelector(".modal-background").addEventListener("click", () => {
    overlay.remove();
  });

  document.body.appendChild(overlay);
}
