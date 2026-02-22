import express from "express";
import wisp from "wisp-server-node";
import { createBareServer } from '@tomphttp/bare-server-node';
import { createServer } from "node:http";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { join } from "node:path";
import { hostname } from "node:os";
import { fileURLToPath } from "url";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { bareModulePath } from "@mercuryworkshop/bare-as-module3";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";


const publicPath = fileURLToPath(new URL("./public/", import.meta.url));

const bare = createBareServer("/bare/");
const app = express();

app.use(express.static(publicPath));
app.use("/uv/", express.static(uvPath));
app.use("/epoxy/", express.static(epoxyPath));
app.use("/libcurl/", express.static(libcurlPath));
app.use("/bareasmodule/", express.static(bareModulePath));
app.use("/baremux/", express.static(baremuxPath));
app.use("/scram/", express.static("scramjet"));

// Error for everything else
app.use((req, res) => {
  res.status(404); 
  res.sendFile(join(publicPath, "404.html"));
});

const server = createServer();

server.on("request", (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else app(req, res);
});
server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else socket.end();
});

let port = parseInt(process.env.PORT || "");

if (isNaN(port)) port = 3000;

server.on("listening", () => {
  const address = server.address();

  // by default we are listening on 0.0.0.0 (every interface)
  // we just need to list a few
  console.log("Listening on:");
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(
    `\thttp://${
      address.family === "IPv6" ? `[${address.address}]` : address.address
    }:${address.port}`
  );
});

// https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close();
  bare.close();
  process.exit(0);
}

// functions/[[path]].js   ← or rename to your entry if using Workers

import { createBareServer } from '@tomphttp/bare-server-node';
// Note: standard bare-server-node may still fail → consider switching to Worker port later

const bare = createBareServer("/bare/");

export async function onRequest(context) {
  const { request } = context;

  // Let bare-server handle its routes first
  if (bare.shouldRoute(request)) {
    // bare.routeRequest expects Node Request/Response → needs adaptation
    // This is where it gets tricky → see notes below
    return new Response("Bare routing not fully adapted yet", { status: 501 });
  }

  // Otherwise serve static assets (Pages does this automatically for /public/*)
  // If you need custom logic:
  const url = new URL(request.url);

  if (url.pathname.startsWith("/uv/")) {
    // You'd need to fetch from uvPath, but better to copy UV files into /public/uv/
    // and let Pages serve them statically
  }

  // Fallback: serve from static or 404
  return fetch(request);   // Pages will handle static serving
}

// If using full Worker mode (not Pages Functions), use:
// export default {
//   async fetch(request, env, ctx) { ... same body as above ... }
// };
