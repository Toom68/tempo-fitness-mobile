/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

const ctx = self as unknown as ServiceWorkerGlobalScope;

// Byte-changes the compiled sw.js each build → forces update detection
const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

const serwist = new Serwist({
  // @ts-expect-error: self.__SW_MANIFEST is injected by Serwist at build time
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // No navigationPreload or runtimeCaching — let the server handle all
  // navigation requests so auth redirects always work correctly
});

// Allow the page to manually trigger skipWaiting or query the build version
ctx.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data?.type === "SKIP_WAITING") {
    ctx.skipWaiting();
  }
  if (event.data?.type === "GET_VERSION") {
    event.ports[0]?.postMessage({ buildId: BUILD_ID });
  }
});

serwist.addEventListeners();
