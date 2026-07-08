const isDev = typeof window !== "undefined"
  ? window.location.hostname === "localhost"
  : process.env.NODE_ENV === "development";

export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
};
