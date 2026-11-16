// Smoke test of the production build: opens a few pages of dist/ in headless Chromium and fails if the
// page stays blank or throws (e.g. a bundle chunk that runs before React exists). Run after `npm run build`.
// The API is not available here, so session restore fails and private pages fall back to the login screen.
import { chromium } from "playwright";
import { spawn } from "node:child_process";

const PORT = 4173;
const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], { stdio: "inherit" });
const base = `http://localhost:${PORT}`;

const waitForServer = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("vite preview did not start");
};

let failed = false;
try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const path of ["/login", "/signup", "/privacy", "/terms", "/dashboard", "/no-existe"]) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const text = (await page.locator("#root").innerText()).trim();
    if (errors.length > 0 || text.length === 0) {
      failed = true;
      console.error(`✗ ${path}: ${errors.join(" | ") || "the page is blank"}`);
    } else {
      console.log(`✓ ${path}: ${text.slice(0, 40).replace(/\s+/g, " ")}…`);
    }
    await page.close();
  }
  await browser.close();
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  server.kill();
}
process.exit(failed ? 1 : 0);
