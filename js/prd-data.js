/* =========================================================
 * prd-data.js — 《旅行搭子鉴定局》PRD V1.0 数据配置层
 * 全部为产品设定/演示数据，页面需明确标注，不宣称真实价格或心理测评。
 * 纯数据模块，可被浏览器与 Node 测试共用。
 * ========================================================= */

/* ---------- 八个风格维度 ---------- */
export const DIMENSIONS = [
  { key: 'plan',      name: '计划性',   desc: '行程密度、时间预留、是否接受变更' },
  { key: 'pace',      name: '节奏',     desc: '活动数量和高强度活动比例' },
  { key: 'budget',    name: '预算倾向', desc: '花费、预算控制、体验取舍' },
  { key: 'social',    name: '社交能量', desc: '与同行者互动、共同活动比例' },
  { key: 'explore',   name: '探索欲',   desc: '小众地点、室内外探索、文化项目' },
  { key: 'aesthetic', name: '审美表达', desc: '拍照、夜景、设计酒店' },
  { key: 'adapt',     name: '随机应变', desc: '面对天气和临时变更的处理' },
  { key: 'comfort',   name: '舒适优先', desc: '休息、酒店、低体力活动' },
];
export const DIM_KEYS = DIMENSIONS.map((d) => d.key);
export const DIM_NAMES = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d.name]));

/* ---------- 活动卡（成都场景 · 8 张） ---------- */
export const ACTIVITIES = [
  {
    id: 'photo', name: '网红拍照点', icon: '📸', category: 'photo',
    categoryLabel: '拍照', durationMinutes: 90, cost: 80,
    energyDelta: -12, moodDelta: 8,
    styleEffects: { aesthetic: 9, explore: 4, pace: 2 },
    outdoor: true, sceneAction: 'photo', nodeId: 'photo',
    description: '东郊记忆的网红机位，出片率极高',
  },
  {
    id: 'hotpot', name: '成都火锅', icon: '🍲', category: 'food',
    categoryLabel: '餐饮', durationMinutes: 90, cost: 120,
    energyDelta: -6, moodDelta: 12,
    styleEffects: { social: 8, comfort: 2 },
    outdoor: false, sceneAction: 'eat', nodeId: 'hotpot',
    description: '和小满边涮边聊，社交能量拉满',
  },
  {
    id: 'cafe', name: '街角咖啡馆', icon: '☕', category: 'rest',
    categoryLabel: '休息', durationMinutes: 90, cost: 45,
    energyDelta: 14, moodDelta: 4,
    styleEffects: { comfort: 8, pace: -6 },
    outdoor: false, sceneAction: 'rest', nodeId: 'cafe',
    description: '慢下来，看看成都的街景',
  },
  {
    id: 'nap', name: '酒店补觉', icon: '🛏️', category: 'rest',
    categoryLabel: '休息', durationMinutes: 120, cost: 0,
    energyDelta: 26, moodDelta: 6,
    styleEffects: { comfort: 11, pace: -9 },
    outdoor: false, sceneAction: 'rest', nodeId: 'hotel',
    description: '床以外都是远方',
  },
  {
    id: 'park', name: '人民公园漫步', icon: '🌳', category: 'explore',
    categoryLabel: '探索', durationMinutes: 120, cost: 30,
    energyDelta: -10, moodDelta: 7,
    styleEffects: { explore: 7, social: 4, comfort: 3 },
    outdoor: true, sceneAction: 'explore', nodeId: 'park',
    description: '鹤鸣茶社喝盖碗茶，看成都慢生活',
  },
  {
    id: 'panda', name: '熊猫基地徒步', icon: '🐼', category: 'sport',
    categoryLabel: '运动', durationMinutes: 180, cost: 55,
    energyDelta: -20, moodDelta: 9,
    styleEffects: { pace: 10, explore: 5, comfort: -5 },
    outdoor: true, sceneAction: 'explore', nodeId: 'panda',
    description: '连续步行较多，注意小满的体力',
  },
  {
    id: 'museum', name: '博物馆看展', icon: '🏛️', category: 'culture',
    categoryLabel: '文化', durationMinutes: 120, cost: 25,
    energyDelta: -8, moodDelta: 5,
    styleEffects: { explore: 3, plan: 9 },
    outdoor: false, sceneAction: 'explore', nodeId: 'museum',
    description: '室内项目，雨天的好去处',
  },
  {
    id: 'night', name: '九眼桥夜景', icon: '🌃', category: 'photo',
    categoryLabel: '拍照', durationMinutes: 120, cost: 70,
    energyDelta: -10, moodDelta: 8,
    styleEffects: { aesthetic: 9, pace: 3, social: 3 },
    outdoor: true, sceneAction: 'photo', nodeId: 'night',
    description: '锦江边的夜色，适合慢门拍摄',
  },
];
export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

export const HIGH_INTENSITY_THRESHOLD = -12; // energyDelta ≤ 此值视为高强度

/* ---------- 时段定义（用于时间校验） ---------- */
export const SLOTS = [
  { key: 'morning',   label: '上午', start: '09:00', capacity: 180 },
  { key: 'afternoon', label: '下午', start: '13:00', capacity: 300 },
  { key: 'evening',   label: '晚上', start: '18:30', capacity: 240 },
];

/* ---------- 事件配置 ---------- */
export const EVENTS = {
  rain: {
    id: 'rain', day: 2, title: '🌧️ 突发暴雨',
    story: '第二天清晨，窗外雨声不断——成都的雨毫无预兆。今天户外活动没法新增了，已安排的户外项目也会受影响。',
    options: [
      { id: 'museum',  label: '替换为博物馆',     cost: 60,  energyDelta: -8,  moodDelta: 2,  styleEffects: { plan: 8, explore: 6, adapt: 3 }, place: 'museum' },
      { id: 'cafe',    label: '去咖啡馆休息',     cost: 45,  energyDelta: 12,  moodDelta: 4,  styleEffects: { comfort: 7, pace: -4, adapt: 4 }, place: 'cafe' },
      { id: 'hotel',   label: '返回酒店补觉',     cost: 0,   energyDelta: 24,  moodDelta: 3,  styleEffects: { comfort: 10, pace: -6, adapt: 2 }, place: 'nap' },
      { id: 'explore', label: '临时探索室内地点', cost: 30,  energyDelta: -8,  moodDelta: 6,  styleEffects: { adapt: 9, explore: 7, plan: -4 } },
      { id: 'insist',  label: '坚持原计划（冒雨出行）', cost: 0, energyDelta: -8, moodDelta: -6, styleEffects: { adapt: 5, pace: 4, plan: -5, comfort: -4 }, markAffected: true },
    ],
  },
  fatigue: {
    id: 'fatigue', title: '😮‍💨 小满累了',
    story: '小满已经连续走了好几个小时，脚步慢了下来：「我们歇会儿吧……」',
    options: [
      { id: 'cancel',  label: '取消下一个活动，原地休息', cost: 0,  energyDelta: 18, moodDelta: 12, styleEffects: { comfort: 8, social: 6, pace: -5 }, removeLast: true },
      { id: 'shorten', label: '缩短活动时间，慢慢来',     cost: 0,  energyDelta: 8,  moodDelta: 6,  styleEffects: { adapt: 6, plan: 3, comfort: 4 } },
      { id: 'solo',    label: '让小满回酒店，自己继续',   cost: 0,  energyDelta: -4, moodDelta: -8, styleEffects: { pace: 6, social: -6, adapt: 4 } },
      { id: 'insist',  label: '继续原计划',               cost: 0,  energyDelta: -10, moodDelta: -10, styleEffects: { pace: 8, comfort: -6, social: -4 } },
    ],
  },
};

/* ---------- 8 种旅行风格原型 ---------- */
const V = (plan, pace, budget, social, explore, aesthetic, adapt, comfort) =>
  ({ plan, pace, budget, social, explore, aesthetic, adapt, comfort });

export const PERSONALITIES = [
  {
    id: 'A', key: 'planner', name: '人形攻略机', emoji: '📋',
    catchphrase: '行程精确到分钟，安全感来自 Excel',
    traits: ['攻略逐小时', '核对狂魔', '拒绝随机'],
    skills: ['行程规划', '信息检索', '时间管理'],
    fatalFlaw: '计划被打乱会极度烦躁',
    compatibleWith: ['C', 'H'], avoidWith: ['G'],
    destinations: ['西安', '北京', '京都'],
    advice: ['留白半天防崩溃', '把攻略分享给同伴'],
    styleVector: V(92, 65, 65, 50, 70, 55, 35, 45),
    tags: { pace: '适中', decision: '计划型', budget: '平衡', social: '中', content: ['文化', '探索'] },
    img: 'assets/images/personality/bad-cat-人格-人形攻略机.png',
    video: 'assets/videos/reveal/人性攻略机揭晓视频.mov',
    color: '#7da7c9',
  },
  {
    id: 'B', key: 'commando', name: '特种兵指挥官', emoji: '⚔️',
    catchphrase: '两天一座城，睡眠是什么',
    traits: ['体力无限', '打卡高效', '越累越兴奋'],
    skills: ['高效执行', '体力管理', '路线压缩'],
    fatalFlaw: '同伴可能跟不上节奏',
    compatibleWith: ['D', 'A'], avoidWith: ['C'],
    destinations: ['重庆', '长沙', '新疆'],
    advice: ['每天留一顿好好吃饭', '注意同伴体力'],
    styleVector: V(70, 95, 50, 60, 75, 50, 60, 25),    tags: { pace: '快', decision: '计划型', budget: '平衡', social: '中', content: ['探索', '运动'] },
    img: 'assets/images/personality/bad-cat-人格-特种兵指挥官.png',
    video: 'assets/videos/reveal/特种兵指挥官揭晓视频.mov',
    color: '#e07a5f',
  },
  {
    id: 'C', key: 'hotel', name: '酒店躺平王', emoji: '🛏️',
    catchphrase: '酒店才是目的地，床以外都是远方',
    traits: ['泡澡优先', '退房前不睁眼', '休息即行程'],
    skills: ['放松', '酒店甄选', '拒绝内耗'],
    fatalFlaw: '景点可能一个没去',
    compatibleWith: ['A', 'E'], avoidWith: ['B'],
    destinations: ['三亚', '杭州', '莫干山'],
    advice: ['至少安排一个出门理由', '选个位置好的酒店'],
    styleVector: V(30, 20, 45, 40, 30, 45, 30, 95),
    tags: { pace: '慢', decision: '灵活型', budget: '平衡', social: '低', content: ['休息'] },
    img: 'assets/images/personality/bad-cat-人格-酒店躺平王.png',
    video: 'assets/videos/reveal/酒店躺平王揭晓视频.mov',
    color: '#a48ec9',
  },
  {
    id: 'D', key: 'director', name: '拍照导演', emoji: '🎥',
    catchphrase: '出片高于一切，机位比景点重要',
    traits: ['构图强迫症', '为一帧等十分钟', '九宫格大师'],
    skills: ['摄影构图', '光线判断', '场景发现'],
    fatalFlaw: '同伴沦为工具人',
    compatibleWith: ['B', 'E'], avoidWith: ['C'],
    destinations: ['大理', '厦门', '青岛'],
    advice: ['给同伴也拍几张', '日出机位提前踩点'],
    styleVector: V(60, 55, 55, 55, 60, 95, 55, 40),
    tags: { pace: '适中', decision: '灵活型', budget: '体验优先', social: '中', content: ['拍照'] },
    img: 'assets/images/personality/bad-cat-人格-拍照导演.png',
    video: 'assets/videos/reveal/拍照导演.mov',
    color: '#e8a366',
  },
  {
    id: 'E', key: 'foodie', name: '干饭社交悍匪', emoji: '🍲',
    catchphrase: '为吃而来，社交能量永远满格',
    traits: ['美食雷达', '和老板成朋友', '饭搭子收集者'],
    skills: ['美食挖掘', '破冰社交', '点菜决策'],
    fatalFlaw: '排队两小时起步',
    compatibleWith: ['D', 'C'], avoidWith: ['F'],
    destinations: ['成都', '顺德', '西安'],
    advice: ['错峰吃饭', '留点肚子给下一家'],
    styleVector: V(45, 60, 30, 95, 50, 50, 60, 50),
    tags: { pace: '适中', decision: '灵活型', budget: '体验优先', social: '高', content: ['美食'] },
    img: 'assets/images/personality/bad-cat-人格-干饭社交悍匪.png',
    video: 'assets/videos/reveal/干饭社交悍匪揭晓视频.mov',
    color: '#e56b6f',
  },
  {
    id: 'F', key: 'accountant', name: '预算会计', emoji: '🧮',
    catchphrase: '每一分钱，都要有明确的去向',
    traits: ['比价能手', '记账不断', '性价比正义'],
    skills: ['预算控制', '优惠挖掘', '行程核算'],
    fatalFlaw: '可能为省钱错过体验',
    compatibleWith: ['A', 'H'], avoidWith: ['E'],
    destinations: ['泉州', '潮州', '洛阳'],
    advice: ['留一笔「不设限」基金', '便宜和值得要分清'],
    styleVector: V(75, 40, 95, 45, 55, 40, 50, 50),
    tags: { pace: '适中', decision: '计划型', budget: '精打细算', social: '中', content: ['文化', '探索'] },
    img: 'assets/images/personality/bad-cat-人格-预算会计.png',
    video: 'assets/videos/reveal/预算会计揭晓视频.mov',
    color: '#6aa84f',
  },
  {
    id: 'G', key: 'wanderer', name: '佛系流浪汉', emoji: '🍃',
    catchphrase: '计划是什么？迷路也是风景',
    traits: ['随遇而安', '临时改道', '走走停停'],
    skills: ['即兴探索', '抗压随缘', '发现小巷'],
    fatalFlaw: '可能错过预约的景点',
    compatibleWith: ['D', 'E'], avoidWith: ['A'],
    destinations: ['大理', '拉萨', '黔东南'],
    advice: ['关键行程留个提醒', '迷路时记得看地图'],
    styleVector: V(30, 35, 50, 40, 80, 55, 70, 60),
    tags: { pace: '慢', decision: '灵活型', budget: '精打细算', social: '低', content: ['探索'] },
    img: 'assets/images/personality/bad-cat-人格-佛系流浪汉.png',
    video: 'assets/videos/reveal/佛系流浪汉揭晓视频.mov',
    color: '#8fb98f',
  },
  {
    id: 'H', key: 'follower', name: '安静跟团魂', emoji: '🧸',
    catchphrase: '旅伴的第一守护者，后勤担当',
    traits: ['行李管家', '默默化解矛盾', '陪伴至上'],
    skills: ['后勤保障', '情绪照顾', '危机处理'],
    fatalFlaw: '自己的需求总排最后',
    compatibleWith: ['A', 'F'], avoidWith: [],
    destinations: ['任意目的地'],
    advice: ['也说说自己想去哪', '照顾别人也照顾自己'],
    styleVector: V(65, 45, 55, 85, 30, 35, 70, 85),
    tags: { pace: '适中', decision: '跟随型', budget: '平衡', social: '高', content: ['美食', '休息'] },
    img: 'assets/images/personality/bad-cat-人格-安静跟团魂.png',
    video: 'assets/videos/reveal/安静跟团魂揭晓视频新.mov',
    color: '#d9a066',
  },
];
export const PERSONALITY_MAP = Object.fromEntries(PERSONALITIES.map((p) => [p.id, p]));

/* ---------- 地图节点（Canvas 归一化坐标 0–100） ---------- */
export const MAP_NODES = [
  { id: 'hotel',  name: '酒店',       icon: '🏨', x: 18, y: 72 },
  { id: 'photo',  name: '东郊记忆',   icon: '📸', x: 74, y: 24 },
  { id: 'hotpot', name: '老码头火锅', icon: '🍲', x: 44, y: 58 },
  { id: 'cafe',   name: '街角咖啡馆', icon: '☕', x: 28, y: 42 },
  { id: 'park',   name: '人民公园',   icon: '🌳', x: 22, y: 20 },
  { id: 'panda',  name: '熊猫基地',   icon: '🐼', x: 82, y: 62 },
  { id: 'museum', name: '博物馆',     icon: '🏛️', x: 52, y: 14 },
  { id: 'night',  name: '九眼桥',     icon: '🌃', x: 62, y: 82 },
];
export const MAP_NODE_MAP = Object.fromEntries(MAP_NODES.map((n) => [n.id, n]));

/* ---------- 初始化设定 ---------- */
export const GOALS = [
  { id: 'relax',  name: '放松',  icon: '🌿', hint: '少安排，多休息' },
  { id: 'photo',  name: '出片',  icon: '📷', hint: '机位优先，风景第二' },
  { id: 'food',   name: '美食',  icon: '🍜', hint: '跟着味蕾走' },
  { id: 'explore',name: '探索',  icon: '🧭', hint: '去没去过的地方' },
];

/* ---------- 预算去向（直接选项，替代手动滑杆） ----------
 * 用户只回答「钱主要花在哪」，分配由预设方案自动配平至 5,000。 */
export const SPEND_FOCUS = [
  { id: 'stay',    name: '住得舒服', icon: '🏨', hint: '酒店是旅行的一部分',
    allocation: { hotel: 2600, food: 1300, experience: 1100 } },
  { id: 'eat',     name: '吃得开心', icon: '🍜', hint: '一路吃过去',
    allocation: { hotel: 1300, food: 2500, experience: 1200 } },
  { id: 'play',    name: '玩得尽兴', icon: '🎡', hint: '门票和体验拉满',
    allocation: { hotel: 1200, food: 1300, experience: 2500 } },
  { id: 'balance', name: '均衡安排', icon: '⚖️', hint: '什么都不耽误',
    allocation: { hotel: 1400, food: 1600, experience: 2000 } },
];

export const SCENARIO = {
  totalBudget: 5000,
  defaultAllocation: { hotel: 1400, food: 1600, experience: 2000 },
  companion: '小满',
  companionNote: '小满喜欢拍照，但不适合连续高强度步行。',
  city: '成都',
  days: 3,
};

/* ---------- 存储键（PRD 11.4） ---------- */
export const STORAGE_KEYS = {
  session: 'tap_journey_session_v1',
  lastResult: 'tap_last_result_v1',
  prefs: 'tap_preferences_v1',
};
export const SESSION_VERSION = 3; // v3：七场景新计分规则（旧三场景会话不再兼容，重新开始） // v2：新增人格积分 / 剧情场景字段（v1 会话自动迁移）

/* =========================================================
 * 人格积分系统（后台八维独立计分 → 前端三倾向进度条）
 * 说明：分值是可调业务规则，非心理测量量表。
 * ========================================================= */
export const PERSONA_INITIAL = 50;      // 每个人格初始 50，范围 0–100
export const PERSONA_META = [
  { code: 'A', key: 'planner',   name: '人形攻略机' },
  { code: 'B', key: 'commando',  name: '特种兵指挥官' },
  { code: 'C', key: 'hotel',     name: '酒店躺平王' },
  { code: 'D', key: 'director',  name: '拍照导演' },
  { code: 'E', key: 'foodie',    name: '干饭社交悍匪' },
  { code: 'F', key: 'accountant',name: '预算会计' },
  { code: 'G', key: 'wanderer',  name: '佛系流浪汉' },
  { code: 'H', key: 'follower',  name: '安静跟团魂' },
];
export const PERSONA_CODES = PERSONA_META.map((p) => p.code);

/* 三个展示维度：集团内加权平均（权重集中在此，便于调整） */
export const TENDENCIES = [
  { key: 'plan',  name: '计划与行动', desc: '规划路线、执行强度',
    weights: { A: 1, B: 1 } },
  { key: 'enjoy', name: '享受与体验', desc: '舒适、出片与美食',
    weights: { C: 1, D: 1, E: 1 } },
  { key: 'adapt', name: '应变与协作', desc: '预算、变通与同伴',
    weights: { F: 1, G: 1, H: 1 } },
];

/* 预算去向的初始偏好分（小额：只反映意向，不决定结局） */
export const SETUP_SCORES = {
  stay:    { C: 2,           reason: '预算优先给住宿：住得舒服' },
  eat:     { E: 2,           reason: '预算优先给餐饮：吃得开心' },
  play:    { B: 1, D: 2,     reason: '预算优先给体验：玩得尽兴' },
  balance: { A: 1, F: 2,     reason: '均衡安排：计划性与预算规划' },
};

/* 日常行为计分：按真实完成的活动类型（每张卡只按实际放置计一次） */
export const ACTIVITY_SCORES = {
  photo:  { D: 3, reason: '完成一次拍照任务' },
  night:  { D: 3, reason: '完成一次夜景拍摄' },
  hotpot: { E: 3, reason: '主动选择美食并完成体验' },
  cafe:   { C: 4, reason: '主动选择休息并完成该时段' },
  nap:    { C: 4, reason: '主动选择回酒店休息' },
  park:   { G: 4, reason: '偏离原路线探索新地点' },
  panda:  { B: 4, reason: '完成高强度户外活动' },
  museum: { A: 2, G: 2, reason: '调整行程改为室内文化项目' },
};
/* 当天首次安排活动 → 主动规划路线 */
export const ROUTE_SCORE = { A: 4, reason: '主动规划并确认当天路线' };

/* =========================================================
 * 三个剧情场景（视频 + 中部文案 + 选项 + 隐藏计分规则）
 * ========================================================= */
export const SCENE_ORDER = ['hike_rain', 'queue', 'budget_short', 'photo_spot', 'eat_local', 'climb_mountain', 'sunrise'];
export const SCENES = {
  hike_rain: {
    id: 'hike_rain', day: 1, title: '🌧️ 下雨了，原定徒步无法进行',
    theme: 'rain',
    video: 'assets/videos/scenes/下雨2.mov',
    story: '小猫和小狼背包出门，准备去山里徒步。刚走到山脚，雨点就砸了下来——原定的户外徒步泡汤了。',
    options: [
      { id: 'indoor_plan', label: '别慌！我来查查附近有没有好玩的室内地方，咱们改改路线~', cost: 40, energyDelta: -6, moodDelta: 2,
        scores: { A: 2, F: 1 }, why: '不慌不忙改路线，规划型应对' },
      { id: 'cafe_rain', label: '下雨正好呀，找家暖和舒服的咖啡馆坐着听雨聊天，多轻松~', cost: 45, energyDelta: 12, moodDelta: 5,
        scores: { C: 2, E: 1 }, why: '听雨聊天，舒服最重要' },
      { id: 'rain_stroll', label: '雨中的街景也别有风味呢，去附近小巷逛逛，说不定有小惊喜！', cost: 0, energyDelta: -10, moodDelta: 6,
        scores: { G: 2, D: 1 }, why: '把雨当风景，随性探索' },
      { id: 'follow_wolf', label: '出来玩开心最重要啦，小狼你想去哪我都陪你，咱们随缘逛~', cost: 0, energyDelta: -2, moodDelta: 4,
        scores: { H: 2, C: 1 }, why: '以陪伴为先，随缘而行' },
    ],
  },
  queue: {
    id: 'queue', day: 2, title: '🥱 小狼不想排队，提议去旁边的小巷',
    theme: 'queue',
    video: 'assets/videos/scenes/不排队.mov',
    story: '网红店门口排了四十多分钟。小狼放下手机：「我不想排队了，我们去旁边的小巷看看吧。」',
    options: [
      { id: 'no_queue', label: '没问题呀！听你的咱们不排了，小巷子肯定也特别有意思~', cost: 0, energyDelta: -4, moodDelta: 7,
        scores: { H: 1, G: 2 }, why: '一起逛小巷，随性探索为主' },
      { id: 'keep_queue', label: '来都来了，这可是我做过功课必打卡的点，咱们坚持排一下吧！', cost: 0, energyDelta: -8, moodDelta: -4,
        scores: { A: 2, B: 1 }, why: '做过功课必打卡，坚持排队' },
      { id: 'alley_treasure', label: '好呀！去小巷子里探索探索，看看有什么宝藏小店~', cost: 0, energyDelta: -6, moodDelta: 6,
        scores: { G: 2, D: 1 }, why: '说走就走找宝藏小店' },
      { id: 'borrow_angle', label: '等一下下，咱们在队伍旁边借个位快速拍张照，然后再去逛小巷！', cost: 0, energyDelta: -4, moodDelta: 4,
        scores: { D: 2, A: 1 }, why: '借位拍照两不误' },
    ],
  },
  budget_short: {
    id: 'budget_short', day: 3, title: '💸 预算只剩 ¥300',
    theme: 'budget',
    video: 'assets/videos/scenes/没钱了.mov',
    story: '翻遍口袋，只剩 ¥300 了。还有两顿饭和返程交通没着落，小狼有点慌：「怎么办？」',
    budgetNote: true,
    options: [
      { id: 'notebook', label: '等一下，我拿出小账本认真精打细算一下，把每笔必要开支都算清楚！', cost: 0, energyDelta: 2, moodDelta: -2,
        scores: { F: 3, A: 1 }, why: '小账本精打细算' },
      { id: 'share_burden', label: '两个人一起想办法！小狼你管大头，我来省小钱，咱们一起把这 ¥300 花好~', cost: 0, energyDelta: 1, moodDelta: 4,
        scores: { H: 2, F: 1 }, why: '一起分担，信任同伴' },
      { id: 'keep_wish', label: '虽然钱不多了，但那个心愿体验我真的很想试试，咬咬牙保留它！', cost: 0, energyDelta: -4, moodDelta: 5,
        scores: { C: 1, G: 1, F: 1 }, why: '咬牙保留心愿体验' },
      { id: 'cheap_yummy', label: '咱们去搜搜便宜又好吃的本地苍蝇馆子，省钱又能吃到地道美食~', cost: 0, energyDelta: 4, moodDelta: 3,
        scores: { F: 2, E: 2 }, why: '性价比美食两不误' },
    ],
  },
  photo_spot: {
    id: 'photo_spot', day: 4, title: '📸 在景区拍照',
    theme: 'photo',
    video: 'assets/videos/scenes/拍照2.mov',
    story: '到了热门景点，大家都挤在一处机位。小狼举着手机回头问：「这张怎么拍才好看？」',
    options: [
      { id: 'master_shot', label: '等我好好琢磨琢磨构图和光线，难得来一趟，一定要拍出高级大片！', cost: 0, energyDelta: -6, moodDelta: 6,
        scores: { D: 3, A: 1 }, why: '琢磨构图光线，拍高级大片' },
      { id: 'quick_snap', label: '排队拍照太耗时间啦，咱们咔嚓快速拍两张留念，就赶紧看下一个景点吧~', cost: 0, energyDelta: -3, moodDelta: 1,
        scores: { B: 2 }, why: '快速留念，行程优先' },
      { id: 'shoot_wolf', label: '小狼你快站过去！我来给你抓拍，今天保证把你拍得超好看！', cost: 0, energyDelta: -4, moodDelta: 5,
        scores: { H: 2, D: 2 }, why: '给小狼抓拍，情绪价值拉满' },
      { id: 'quiet_corner', label: '热门机位人太多啦，咱们去周围没人的角落逛逛，发现属于咱们的冷门风景~', cost: 0, energyDelta: -8, moodDelta: 4,
        scores: { G: 2 }, why: '避开人群找冷门风景' },
    ],
  },
  eat_local: {
    id: 'eat_local', day: 5, title: '🍜 在餐馆吃当地美食',
    theme: 'eat',
    video: 'assets/videos/scenes/吃饭2.mp4',
    story: '晚餐时间，街上飘着当地美食的香气。小狼的肚子先叫了起来：「今晚吃什么？」',
    options: [
      { id: 'share_taste', label: '这家店看起来好棒！咱们点不一样的招牌菜，一会儿换着尝尝~', cost: 150, energyDelta: 10, moodDelta: 7,
        scores: { E: 2, H: 1 }, why: '点不一样的换着尝，美食为主' },
      { id: 'top_feast', label: '管它排不排队呢，来都来了，直接冲最红最顶的当地特色大餐！', cost: 220, energyDelta: 14, moodDelta: 8,
        scores: { E: 4 }, why: '直接冲最红的特色大餐' },
      { id: 'slow_diner', label: '咱们不凑这个热闹啦，找一家人少安静的小店，慢悠悠吃一顿很舒服~', cost: 90, energyDelta: 10, moodDelta: 6,
        scores: { C: 2, E: 1 }, why: '安静小店慢悠悠吃' },
      { id: 'menu_list', label: '按我之前精心查好的招牌菜单来点，排队也值得，一定要吃到最地道的！', cost: 120, energyDelta: 8, moodDelta: 4,
        scores: { A: 1, F: 1, E: 1 }, why: '按攻略菜单点最地道的' },
    ],
  },
  climb_mountain: {
    id: 'climb_mountain', day: 6, title: '⛰️ 天气晴朗，要不要去爬山',
    theme: 'climb',
    video: 'assets/videos/scenes/爬山.mov',
    story: '第二天一早，天空晴朗得不像话。远处那座山看起来很诱人，小狼望着山顶：「要不要去爬山？」',
    options: [
      { id: 'assess_first', label: '我先查查登山路线、看好时间和体力补给，评估一下再决定要不要出发~', cost: 60, energyDelta: -10, moodDelta: 3,
        scores: { A: 2, F: 1 }, why: '先评估再决定，理性出发' },
      { id: 'cheer_wolf', label: '想去的话我就全程陪你！累了咱们就停下休息，有我给你加油打气~', cost: 50, energyDelta: -14, moodDelta: 6,
        scores: { H: 2, B: 1 }, why: '全程陪伴加油打气' },
      { id: 'summit_goal', label: '天气这么好，太适合运动啦！咱们现在就出发，目标登顶！', cost: 60, energyDelta: -22, moodDelta: 6,
        scores: { B: 3 }, why: '说走就走目标登顶' },
      { id: 'foot_stroll', label: '爬山太消耗体力啦，咱们去山脚下轻松散散步、呼吸呼吸新鲜空气就好~', cost: 30, energyDelta: -6, moodDelta: 4,
        scores: { C: 2 }, why: '山脚散步轻松就好' },
    ],
  },
  sunrise: {
    id: 'sunrise', day: 7, title: '🌅 决定去看日出',
    theme: 'sunrise',
    video: 'assets/videos/scenes/看日出.mov',
    story: '旅行最后一晚，小狼查了明天的日出时间：「要不要早起去看日出？」',
    options: [
      { id: 'alarm_ready', label: '日出必须看！定好闹钟，明天清晨绝对不拖拉，准时出发！', cost: 20, energyDelta: -18, moodDelta: 6,
        scores: { B: 2 }, why: '定好闹钟绝不拖拉' },
      { id: 'go_with_flow', label: '先定个闹钟，明早看看天气和精神状态再说，随缘一点~', cost: 0, energyDelta: -6, moodDelta: 3,
        scores: { G: 2, C: 1 }, why: '看状态随缘决定' },
      { id: 'wake_wolf', label: '难得和你出来一次，起大早也值得！明早我叫你，咱们一起去看最美日出~', cost: 20, energyDelta: -12, moodDelta: 8,
        scores: { H: 2, D: 1 }, why: '叫小狼一起看日出' },
      { id: 'full_prep', label: '查好日出时间、确定好明早的交通和路线，做足准备再安心出发~', cost: 20, energyDelta: -14, moodDelta: 5,
        scores: { A: 2, F: 1 }, why: '查好交通路线做足准备' },
    ],
  },
};
