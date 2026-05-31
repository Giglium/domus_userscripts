/**
 * Format an error into a user-friendly title and detail string.
 * @param {Error} error
 * @returns {{ title: string, detail: string }}
 */
export function formatError(error) {
  if (error instanceof Error) {
    return {
      title: error.message || "Unknown error",
      detail: error.stack || "",
    };
  }
  return {
    title: "Unexpected error",
    detail: String(error),
  };
}
