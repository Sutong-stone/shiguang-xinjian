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

  // Auto-push database schema and seed data on first startup
  try {
    const { execSync } = await import("child_process");
    console.log("Pushing database schema...");
    execSync("npx drizzle-kit push", { stdio: "inherit", timeout: 60000 });
    console.log("Schema pushed successfully!");
  } catch (e) {
    console.error("Schema push failed (tables may already exist):", e);
  }

  // Seed data if empty
  try {
    const db = getDb();
    const existingAlbums = await db.select().from(albums).limit(1);
    if (existingAlbums.length === 0) {
      console.log("Database empty, auto-seeding...");
      await db.insert(albums).values([
        { title: "初来乍到", description: "你来到这个世界的第一天，小小的你躺在妈妈怀里，那一刻仿佛时间都静止了。", imageUrl: "/images/baby-sleeping.jpg", isVideo: 0, date: "2024-01-15", category: "满月" },
        { title: "温柔守护", description: "妈妈握着你的小手，感受着你指尖的温度。这双手，将为你撑起一片天。", imageUrl: "/images/holding-hands.jpg", isVideo: 0, date: "2024-03-20", category: "百天" },
        { title: "第一步", description: "你的第一双小鞋子，虽然现在还穿不上，但爸爸妈妈已经在想象你迈出第一步的样子了。", imageUrl: "/images/baby-shoes.jpg", isVideo: 0, date: "2024-06-01", category: "成长" },
        { title: "阳光下的我们", description: "一家三口坐在洒满阳光的窗前，就这样静静地陪着你，就是最大的幸福。", imageUrl: "/images/family-window.jpg", isVideo: 0, date: "2024-08-15", category: "家庭" },
      ]);
      await db.insert(messages).values([
        { content: "亲爱的宝贝，今天是你的满月。看着你熟睡的小脸，觉得整个世界都安静了下来。你是上天给我们最好的礼物，爸爸妈妈会用一生来爱你、守护你。愿你的每一天都充满阳光和欢笑。", authorName: "妈妈", authorId: 0 },
        { content: "小家伙，你知道吗？你第一次对我笑的时候，我这个大男人差点哭了。从那天起，我知道我的人生有了最柔软的牵挂。等你长大了，爸爸要带你去看海、爬山、骑大马。", authorName: "爸爸", authorId: 0 },
        { content: "今天给你拍了百天照，你特别配合，镜头感十足。妈妈把这些照片都存进了这个时光胶囊里，等你十八岁打开的那一天，希望能带给你满满的温暖和力量。", authorName: "妈妈", authorId: 0 },
      ]);
      await db.insert(milestones).values([
        { title: "第一次微笑", description: "睡梦中露出甜甜的笑容，是在做什么美梦呢？", date: "2024-02-01", icon: "smile" },
        { title: "第一次翻身", description: "从仰卧翻到俯卧，虽然花了好大力气，但你做到了！", date: "2024-03-15", icon: "rotate" },
        { title: "第一次叫妈妈", description: "含糊不清的一声'妈妈'，让我的心都融化了。", date: "2024-05-20", icon: "mic" },
        { title: "第一次爬行", description: "像个小战士一样匍匐前进，目标是前面的玩具！", date: "2024-07-10", icon: "footprints" },
        { title: "第一次站立", description: "扶着沙发边缘摇摇晃晃地站了起来，好棒！", date: "2024-09-01", icon: "arrow-up" },
      ]);
      await db.insert(coverSettings).values({
        imageUrl: "/images/hero-illustration.jpg",
        title: "拾光信笺",
        subtitle: "记录成长的每一刻",
      });
      console.log("Auto-seed complete!");
    } else {
      console.log("Database already has data, skipping seed.");
    }
  } catch (e) {
    console.error("Auto-seed failed:", e);
  }
}
