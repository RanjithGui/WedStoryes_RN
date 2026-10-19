// Fades out the #ws-splash loading screen from app/+html.tsx once the page
// has fully loaded: React has hydrated (this runs from an effect), the
// window `load` event has fired (images, CSS, scripts), web fonts are ready,
// and any extra work passed in (e.g. store rehydration) has settled.

const MIN_VISIBLE_MS = 500; // avoid a sub-second flash on fast/cached loads
const MAX_WAIT_MS = 8000; // never hold the page hostage to a slow asset

const windowLoaded = () =>
  document.readyState === "complete"
    ? Promise.resolve()
    : new Promise<void>((resolve) =>
        window.addEventListener("load", () => resolve(), { once: true }),
      );

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function hideSplash(...waitFor: Promise<unknown>[]) {
  const splash = document.getElementById("ws-splash");
  if (!splash) return;

  const ready = Promise.all([
    windowLoaded(),
    document.fonts?.ready,
    delay(Math.max(0, MIN_VISIBLE_MS - performance.now())),
    ...waitFor,
  ]);

  Promise.race([ready, delay(MAX_WAIT_MS)])
    .catch(() => undefined)
    .then(() => {
      splash.classList.add("is-hidden");
      splash.addEventListener("transitionend", () => splash.remove(), { once: true });
      setTimeout(() => splash.remove(), 1000);
    });
}
