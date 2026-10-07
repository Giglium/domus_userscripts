import { showErrorOverlay } from "./errorOverlay.js";
import { logger } from "./logger.js";

/**
 * Run a userscript entry point with full error reporting.
 *
 * Catches:
 *  - synchronous errors thrown by `fn`
 *  - rejections from a Promise returned by `fn`
 *
 * @param {() => void | Promise<void>} fn
 */
export function bootstrap(fn) {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      return Promise.resolve(result).catch(handle);
    }
    return result;
  } catch (error) {
    handle(error);
  }
}

function handle(error) {
  logger.error("Userscript error", error);
  if (document.body) {
    showErrorOverlay(error);
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      () => showErrorOverlay(error),
      { once: true },
    );
  }
}
