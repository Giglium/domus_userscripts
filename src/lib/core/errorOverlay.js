import { formatError } from "./errorFormat.js";
import "../css/errorOverlay.scss";
import { errorDetail } from "../css/errorOverlay.module.scss";
import { getUiRoot } from "../dom/uiRoot.js";

/**
 * Display a Bulma modal with error details.
 * @param {Error} error
 */
export function showErrorOverlay(error) {
  const { title, detail } = formatError(error);

  const overlay = document.createElement("div");
  overlay.className = "modal is-active";
  const background = document.createElement("div");
  background.className = "modal-background";
  const content = document.createElement("div");
  content.className = "modal-content";
  const notification = document.createElement("div");
  notification.className = "notification is-danger";
  const closeButton = document.createElement("button");
  closeButton.className = "delete";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "close");
  const titleElement = document.createElement("p");
  titleElement.className = "title is-5";
  titleElement.textContent = title;
  const detailElement = document.createElement("p");
  detailElement.className = errorDetail;
  detailElement.textContent = detail;

  notification.append(closeButton, titleElement, detailElement);
  content.appendChild(notification);
  overlay.append(background, content);

  const closeOverlay = () => {
    overlay.remove();
  };
  closeButton.addEventListener("click", closeOverlay);
  background.addEventListener("click", closeOverlay);

  getUiRoot().appendChild(overlay);
}
