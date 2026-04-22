import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// File upload route
app.post("/api/upload", async (c) => {
  try {
    const body = await c.req.parseBody({ all: false });
    const file = body.file as File;
    const password = body.password as string;

    if (!password || password !== env.sitePassword) {
      return c.json({ error: "访问密码不正确" }, 401);
    }

    if (!file) {
      return c.json({ error: "没有上传文件" }, 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return c.json({ error: "只允许上传图片文件" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `upload_${timestamp}.${ext}`;

    // Determine upload directory
    const isDev = !env.isProduction;
    const uploadDir = isDev
      ? join(process.cwd(), "public", "images")
      : join(process.cwd(), "dist", "public", "images");

    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    return c.json({
      success: true,
      url: `/images/${filename}`,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "上传失败" }, 500);
  }
});

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
