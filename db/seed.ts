import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2";
import * as schema from "./schema";
import { config } from "dotenv";

config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set");
}
const connection = createConnection(dbUrl);
const db = drizzle(connection, { schema, mode: "planetscale" });

async function seed() {
  console.log("Seeding database...");

  // Seed albums
  const albumData = [
    {
      title: "初来乍到",
      description: "你来到这个世界的第一天，小小的你躺在妈妈怀里，那一刻仿佛时间都静止了。你的第一声啼哭，是我们听过最美妙的音乐。",
      imageUrl: "/images/baby-sleeping.jpg",
      date: "2024-01-15",
      category: "满月",
    },
    {
      title: "温柔守护",
      description: "妈妈握着你的小手，感受着你指尖的温度。这双手，将为你撑起一片天。",
      imageUrl: "/images/holding-hands.jpg",
      date: "2024-03-20",
      category: "百天",
    },
    {
      title: "第一步",
      description: "你的第一双小鞋子，虽然现在还穿不上，但爸爸妈妈已经在想象你迈出第一步的样子了。",
      imageUrl: "/images/baby-shoes.jpg",
      date: "2024-06-01",
      category: "成长",
    },
    {
      title: "阳光下的我们",
      description: "一家三口坐在洒满阳光的窗前，不需要说什么，就这样静静地陪着你，就是最大的幸福。",
      imageUrl: "/images/family-window.jpg",
      date: "2024-08-15",
      category: "家庭",
    },
  ];

  for (const album of albumData) {
    await db.insert(schema.albums).values(album);
  }
  console.log("Albums seeded.");

  // Seed milestones
  const milestoneData = [
    {
      title: "第一次微笑",
      description: "睡梦中露出甜甜的笑容，是在做什么美梦呢？",
      date: "2024-02-01",
      icon: "smile",
    },
    {
      title: "第一次翻身",
      description: "从仰卧翻到俯卧，虽然花了好大力气，但你做到了！",
      date: "2024-03-15",
      icon: "rotate",
    },
    {
      title: "第一次叫妈妈",
      description: "含糊不清的一声'妈妈'，让我的心都融化了。",
      date: "2024-05-20",
      icon: "mic",
    },
    {
      title: "第一次爬行",
      description: "像个小战士一样匍匐前进，目标是前面的玩具！",
      date: "2024-07-10",
      icon: "footprints",
    },
    {
      title: "第一次站立",
      description: "扶着沙发边缘摇摇晃晃地站了起来，好棒！",
      date: "2024-09-01",
      icon: "arrow-up",
    },
  ];

  for (const milestone of milestoneData) {
    await db.insert(schema.milestones).values(milestone);
  }
  console.log("Milestones seeded.");

  // Seed messages (sample parent messages)
  const messageData = [
    {
      content: "亲爱的宝贝，今天是你的满月。看着你熟睡的小脸，觉得整个世界都安静了下来。你是上天给我们最好的礼物，爸爸妈妈会用一生来爱你、守护你。愿你的每一天都充满阳光和欢笑。",
      authorName: "妈妈",
      authorId: 1,
    },
    {
      content: "小家伙，你知道吗？你第一次对我笑的时候，我这个大男人差点哭了。从那天起，我知道我的人生有了最柔软的牵挂。等你长大了，爸爸要带你去看海、爬山、骑大马。",
      authorName: "爸爸",
      authorId: 2,
    },
    {
      content: "今天给你拍了百天照，你特别配合，镜头感十足。妈妈把这些照片都存进了这个时光胶囊里，等你十八岁打开的那一天，希望能带给你满满的温暖和力量。",
      authorName: "妈妈",
      authorId: 1,
    },
  ];

  for (const message of messageData) {
    await db.insert(schema.messages).values(message);
  }
  console.log("Messages seeded.");

  console.log("Seed complete!");
  connection.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  connection.end();
  process.exit(1);
});
