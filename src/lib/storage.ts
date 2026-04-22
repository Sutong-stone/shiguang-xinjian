// 纯前端数据存储 - 所有数据存在浏览器 localStorage 中
const STORAGE_KEYS = {
  albums: "shiguang_albums",
  messages: "shiguang_messages",
  milestones: "shiguang_milestones",
  cover: "shiguang_cover",
  initialized: "shiguang_initialized",
};

export interface Album {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  date: string | null;
  category: string | null;
  createdAt: string;
}

export interface Message {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Milestone {
  id: number;
  title: string;
  description: string | null;
  date: string;
  icon: string;
  createdAt: string;
}

export interface CoverSettings {
  imageUrl: string;
  title: string;
  subtitle: string;
}

const SEED_ALBUMS: Album[] = [
  {
    id: 1,
    title: "初来乍到",
    description: "你来到这个世界的第一天，小小的你躺在妈妈怀里，那一刻仿佛时间都静止了。",
    imageUrl: "/images/baby-sleeping.jpg",
    date: "2024-01-15",
    category: "满月",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: 2,
    title: "温柔守护",
    description: "妈妈握着你的小手，感受着你指尖的温度。这双手，将为你撑起一片天。",
    imageUrl: "/images/holding-hands.jpg",
    date: "2024-03-20",
    category: "百天",
    createdAt: "2024-03-20T00:00:00Z",
  },
  {
    id: 3,
    title: "第一步",
    description: "你的第一双小鞋子，虽然现在还穿不上，但爸爸妈妈已经在想象你迈出第一步的样子了。",
    imageUrl: "/images/baby-shoes.jpg",
    date: "2024-06-01",
    category: "成长",
    createdAt: "2024-06-01T00:00:00Z",
  },
  {
    id: 4,
    title: "阳光下的我们",
    description: "一家三口坐在洒满阳光的窗前，就这样静静地陪着你，就是最大的幸福。",
    imageUrl: "/images/family-window.jpg",
    date: "2024-08-15",
    category: "家庭",
    createdAt: "2024-08-15T00:00:00Z",
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: 1,
    content: "亲爱的宝贝，今天是你的满月。看着你熟睡的小脸，觉得整个世界都安静了下来。你是上天给我们最好的礼物，爸爸妈妈会用一生来爱你、守护你。",
    authorName: "妈妈",
    createdAt: "2024-02-15T10:30:00Z",
  },
  {
    id: 2,
    content: "小家伙，你知道吗？你第一次对我笑的时候，我这个大男人差点哭了。从那天起，我知道我的人生有了最柔软的牵挂。等你长大了，爸爸要带你去看海、爬山。",
    authorName: "爸爸",
    createdAt: "2024-04-20T14:20:00Z",
  },
  {
    id: 3,
    content: "今天给你拍了百天照，你特别配合，镜头感十足。妈妈把这些照片都存进了这个时光胶囊里，等你十八岁打开的那一天，希望能带给你满满的温暖和力量。",
    authorName: "妈妈",
    createdAt: "2024-05-25T09:15:00Z",
  },
];

const SEED_MILESTONES: Milestone[] = [
  { id: 1, title: "第一次微笑", description: "睡梦中露出甜甜的笑容，是在做什么美梦呢？", date: "2024-02-01", icon: "smile", createdAt: "2024-02-01T00:00:00Z" },
  { id: 2, title: "第一次翻身", description: "从仰卧翻到俯卧，虽然花了好大力气，但你做到了！", date: "2024-03-15", icon: "rotate", createdAt: "2024-03-15T00:00:00Z" },
  { id: 3, title: "第一次叫妈妈", description: "含糊不清的一声'妈妈'，让我的心都融化了。", date: "2024-05-20", icon: "mic", createdAt: "2024-05-20T00:00:00Z" },
  { id: 4, title: "第一次爬行", description: "像个小战士一样匍匐前进，目标是前面的玩具！", date: "2024-07-10", icon: "footprints", createdAt: "2024-07-10T00:00:00Z" },
  { id: 5, title: "第一次站立", description: "扶着沙发边缘摇摇晃晃地站了起来，好棒！", date: "2024-09-01", icon: "arrow-up", createdAt: "2024-09-01T00:00:00Z" },
];

const DEFAULT_COVER: CoverSettings = {
  imageUrl: "/images/hero-illustration.jpg",
  title: "拾光信笺",
  subtitle: "记录成长的每一刻",
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data) as T;
  } catch { /* ignore */ }
  return fallback;
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============ Init ============
export function initStorage(): void {
  if (localStorage.getItem(STORAGE_KEYS.initialized)) return;
  setItem(STORAGE_KEYS.albums, SEED_ALBUMS);
  setItem(STORAGE_KEYS.messages, SEED_MESSAGES);
  setItem(STORAGE_KEYS.milestones, SEED_MILESTONES);
  setItem(STORAGE_KEYS.cover, DEFAULT_COVER);
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

// ============ Albums ============
export function getAlbums(): Album[] {
  return getItem<Album[]>(STORAGE_KEYS.albums, SEED_ALBUMS);
}

export function addAlbum(album: Omit<Album, "id" | "createdAt">): Album {
  const albums = getAlbums();
  const newAlbum: Album = { ...album, id: Date.now(), createdAt: new Date().toISOString() };
  albums.unshift(newAlbum);
  setItem(STORAGE_KEYS.albums, albums);
  return newAlbum;
}

export function updateAlbum(id: number, updates: Partial<Omit<Album, "id" | "createdAt">>): void {
  const albums = getAlbums().map((a) => (a.id === id ? { ...a, ...updates } : a));
  setItem(STORAGE_KEYS.albums, albums);
}

export function deleteAlbum(id: number): void {
  setItem(STORAGE_KEYS.albums, getAlbums().filter((a) => a.id !== id));
}

// ============ Messages ============
export function getMessages(): Message[] {
  return getItem<Message[]>(STORAGE_KEYS.messages, SEED_MESSAGES);
}

export function addMessage(message: Omit<Message, "id" | "createdAt">): Message {
  const messages = getMessages();
  const newMessage: Message = { ...message, id: Date.now(), createdAt: new Date().toISOString() };
  messages.unshift(newMessage);
  setItem(STORAGE_KEYS.messages, messages);
  return newMessage;
}

export function updateMessage(id: number, updates: Partial<Omit<Message, "id" | "createdAt">>): void {
  const messages = getMessages().map((m) => (m.id === id ? { ...m, ...updates } : m));
  setItem(STORAGE_KEYS.messages, messages);
}

export function deleteMessage(id: number): void {
  setItem(STORAGE_KEYS.messages, getMessages().filter((m) => m.id !== id));
}

// ============ Milestones ============
export function getMilestones(): Milestone[] {
  return getItem<Milestone[]>(STORAGE_KEYS.milestones, SEED_MILESTONES);
}

export function addMilestone(milestone: Omit<Milestone, "id" | "createdAt">): Milestone {
  const milestones = getMilestones();
  const newMs: Milestone = { ...milestone, id: Date.now(), createdAt: new Date().toISOString() };
  milestones.unshift(newMs);
  setItem(STORAGE_KEYS.milestones, milestones);
  return newMs;
}

export function updateMilestone(id: number, updates: Partial<Omit<Milestone, "id" | "createdAt">>): void {
  const milestones = getMilestones().map((m) => (m.id === id ? { ...m, ...updates } : m));
  setItem(STORAGE_KEYS.milestones, milestones);
}

export function deleteMilestone(id: number): void {
  setItem(STORAGE_KEYS.milestones, getMilestones().filter((m) => m.id !== id));
}

// ============ Cover ============
export function getCover(): CoverSettings {
  return getItem<CoverSettings>(STORAGE_KEYS.cover, DEFAULT_COVER);
}

export function updateCover(updates: Partial<CoverSettings>): void {
  setItem(STORAGE_KEYS.cover, { ...getCover(), ...updates });
}

// ============ Storage Info ============
export function getStorageInfo(): { used: string; total: string; percentage: number } {
  let total = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const item = localStorage.getItem(key);
    if (item) total += item.length * 2; // UTF-16 = 2 bytes per char
  }
  const limit = 5 * 1024 * 1024; // 5MB typical limit
  return {
    used: (total / 1024 / 1024).toFixed(2) + " MB",
    total: "5 MB",
    percentage: Math.min((total / limit) * 100, 100),
  };
}
