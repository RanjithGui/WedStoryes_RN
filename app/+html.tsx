import { type PropsWithChildren } from "react";

// Root HTML for the static web export. Unlike Expo's default template this
// leaves out <ScrollViewStyleReset /> so the document itself scrolls.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#07070a" />
        <meta
          name="description"
          content="WedStoryes — plan wedding and event coverage and share polished quotations."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap"
        />
        <style dangerouslySetInnerHTML={{ __html: rootStyles }} />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
        <noscript>
          <style>{"#ws-splash { display: none; }"}</style>
        </noscript>
      </head>
      <body>
        {/* Loading screen shown until the app has hydrated and the page has
            fully loaded; removed by utils/hideSplash.web.ts. It lives outside
            #root so React never renders or reconciles it. */}
        <div id="ws-splash" role="status" aria-live="polite">
          <div className="ws-splash-mark">
            WedStoryes<span>.</span>
          </div>
          <div className="ws-splash-track">
            <div className="ws-splash-bar" />
          </div>
          <span className="ws-splash-sr">Loading…</span>
        </div>
        {children}
      </body>
    </html>
  );
}

// Runs before first paint: picks the dark splash for the (dark) landing page,
// and removes the splash after 15s no matter what, in case the bundle fails.
const splashScript = `
document.documentElement.setAttribute("data-splash", location.pathname === "/" ? "dark" : "light");
setTimeout(function () {
  var s = document.getElementById("ws-splash");
  if (s) s.remove();
}, 15000);
`;

const rootStyles = `
html, body { margin: 0; padding: 0; background: #faf7f2; }
#root { display: flex; flex-direction: column; min-height: 100vh; }

#ws-splash {
  --splash-bg: #faf7f2;
  --splash-ink: #1e1a16;
  --splash-track: #e9e1d4;
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  background: var(--splash-bg);
  color: var(--splash-ink);
  transition: opacity 0.45s ease, visibility 0.45s ease;
}
[data-splash="dark"] #ws-splash {
  --splash-bg: #07070a;
  --splash-ink: #f3ece2;
  --splash-track: rgba(255, 255, 255, 0.12);
}
#ws-splash.is-hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.ws-splash-mark {
  font-family: "Cormorant Garamond", "Times New Roman", serif;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: 0.01em;
  animation: ws-splash-breathe 1.8s ease-in-out infinite;
}
.ws-splash-mark span {
  color: #c89b3c;
}
.ws-splash-track {
  position: relative;
  width: 140px;
  height: 2px;
  overflow: hidden;
  border-radius: 2px;
  background: var(--splash-track);
}
.ws-splash-bar {
  position: absolute;
  inset: 0 auto 0 0;
  width: 40%;
  border-radius: 2px;
  background: #c89b3c;
  animation: ws-splash-slide 1.2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
.ws-splash-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
@keyframes ws-splash-slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
@keyframes ws-splash-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
@media (prefers-reduced-motion: reduce) {
  .ws-splash-mark, .ws-splash-bar { animation: none; }
  .ws-splash-bar { width: 100%; opacity: 0.6; }
}
`;
