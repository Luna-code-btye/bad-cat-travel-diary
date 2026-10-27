/* 自动生成：node build-bundle.mjs —— 请勿手编，源码在 js/prd-*.js */
(function(){
"use strict";

/* ======== js/prd-data.js ======== */
/* =========================================================
 * prd-data.js — 《旅行搭子鉴定局》PRD V1.0 数据配置层
 * 全部为产品设定/演示数据，页面需明确标注，不宣称真实价格或心理测评。
 * 纯数据模块，可被浏览器与 Node 测试共用。
 * ========================================================= */

/* ---------- 八个风格维度 ---------- */
const DIMENSIONS = [
  { key: 'plan',      name: '计划性',   desc: '行程密度、时间预留、是否接受变更' },
  { key: 'pace',      name: '节奏',     desc: '活动数量和高强度活动比例' },
  { key: 'budget',    name: '预算倾向', desc: '花费、预算控制、体验取舍' },
  { key: 'social',    name: '社交能量', desc: '与同行者互动、共同活动比例' },
  { key: 'explore',   name: '探索欲',   desc: '小众地点、室内外探索、文化项目' },
  { key: 'aesthetic', name: '审美表达', desc: '拍照、夜景、设计酒店' },
  { key: 'adapt',     name: '随机应变', desc: '面对天气和临时变更的处理' },
  { key: 'comfort',   name: '舒适优先', desc: '休息、酒店、低体力活动' },
];
const DIM_KEYS = DIMENSIONS.map((d) => d.key);
const DIM_NAMES = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d.name]));

/* ---------- 活动卡（成都场景 · 8 张） ---------- */
const ACTIVITIES = [
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
const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a]));

const HIGH_INTENSITY_THRESHOLD = -12; // energyDelta ≤ 此值视为高强度

/* ---------- 时段定义（用于时间校验） ---------- */
const SLOTS = [
  { key: 'morning',   label: '上午', start: '09:00', capacity: 180 },
  { key: 'afternoon', label: '下午', start: '13:00', capacity: 300 },
  { key: 'evening',   label: '晚上', start: '18:30', capacity: 240 },
];

/* ---------- 事件配置 ---------- */
const EVENTS = {
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

const PERSONALITIES = [
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
const PERSONALITY_MAP = Object.fromEntries(PERSONALITIES.map((p) => [p.id, p]));

/* ---------- 地图节点（Canvas 归一化坐标 0–100） ---------- */
const MAP_NODES = [
  { id: 'hotel',  name: '酒店',       icon: '🏨', x: 18, y: 72 },
  { id: 'photo',  name: '东郊记忆',   icon: '📸', x: 74, y: 24 },
  { id: 'hotpot', name: '老码头火锅', icon: '🍲', x: 44, y: 58 },
  { id: 'cafe',   name: '街角咖啡馆', icon: '☕', x: 28, y: 42 },
  { id: 'park',   name: '人民公园',   icon: '🌳', x: 22, y: 20 },
  { id: 'panda',  name: '熊猫基地',   icon: '🐼', x: 82, y: 62 },
  { id: 'museum', name: '博物馆',     icon: '🏛️', x: 52, y: 14 },
  { id: 'night',  name: '九眼桥',     icon: '🌃', x: 62, y: 82 },
];
const MAP_NODE_MAP = Object.fromEntries(MAP_NODES.map((n) => [n.id, n]));

/* ---------- 初始化设定 ---------- */
const GOALS = [
  { id: 'relax',  name: '放松',  icon: '🌿', hint: '少安排，多休息' },
  { id: 'photo',  name: '出片',  icon: '📷', hint: '机位优先，风景第二' },
  { id: 'food',   name: '美食',  icon: '🍜', hint: '跟着味蕾走' },
  { id: 'explore',name: '探索',  icon: '🧭', hint: '去没去过的地方' },
];

/* ---------- 预算去向（直接选项，替代手动滑杆） ----------
 * 用户只回答「钱主要花在哪」，分配由预设方案自动配平至 5,000。 */
const SPEND_FOCUS = [
  { id: 'stay',    name: '住得舒服', icon: '🏨', hint: '酒店是旅行的一部分',
    allocation: { hotel: 2600, food: 1300, experience: 1100 } },
  { id: 'eat',     name: '吃得开心', icon: '🍜', hint: '一路吃过去',
    allocation: { hotel: 1300, food: 2500, experience: 1200 } },
  { id: 'play',    name: '玩得尽兴', icon: '🎡', hint: '门票和体验拉满',
    allocation: { hotel: 1200, food: 1300, experience: 2500 } },
  { id: 'balance', name: '均衡安排', icon: '⚖️', hint: '什么都不耽误',
    allocation: { hotel: 1400, food: 1600, experience: 2000 } },
];

const SCENARIO = {
  totalBudget: 5000,
  defaultAllocation: { hotel: 1400, food: 1600, experience: 2000 },
  companion: '小满',
  companionNote: '小满喜欢拍照，但不适合连续高强度步行。',
  city: '成都',
  days: 3,
};

/* ---------- 存储键（PRD 11.4） ---------- */
const STORAGE_KEYS = {
  session: 'tap_journey_session_v1',
  lastResult: 'tap_last_result_v1',
  prefs: 'tap_preferences_v1',
};
const SESSION_VERSION = 3; // v3：七场景新计分规则（旧三场景会话不再兼容，重新开始） // v2：新增人格积分 / 剧情场景字段（v1 会话自动迁移）

/* =========================================================
 * 人格积分系统（后台八维独立计分 → 前端三倾向进度条）
 * 说明：分值是可调业务规则，非心理测量量表。
 * ========================================================= */
const PERSONA_INITIAL = 50;      // 每个人格初始 50，范围 0–100
const PERSONA_META = [
  { code: 'A', key: 'planner',   name: '人形攻略机' },
  { code: 'B', key: 'commando',  name: '特种兵指挥官' },
  { code: 'C', key: 'hotel',     name: '酒店躺平王' },
  { code: 'D', key: 'director',  name: '拍照导演' },
  { code: 'E', key: 'foodie',    name: '干饭社交悍匪' },
  { code: 'F', key: 'accountant',name: '预算会计' },
  { code: 'G', key: 'wanderer',  name: '佛系流浪汉' },
  { code: 'H', key: 'follower',  name: '安静跟团魂' },
];
const PERSONA_CODES = PERSONA_META.map((p) => p.code);

/* 三个展示维度：集团内加权平均（权重集中在此，便于调整） */
const TENDENCIES = [
  { key: 'plan',  name: '计划与行动', desc: '规划路线、执行强度',
    weights: { A: 1, B: 1 } },
  { key: 'enjoy', name: '享受与体验', desc: '舒适、出片与美食',
    weights: { C: 1, D: 1, E: 1 } },
  { key: 'adapt', name: '应变与协作', desc: '预算、变通与同伴',
    weights: { F: 1, G: 1, H: 1 } },
];

/* 预算去向的初始偏好分（小额：只反映意向，不决定结局） */
const SETUP_SCORES = {
  stay:    { C: 2,           reason: '预算优先给住宿：住得舒服' },
  eat:     { E: 2,           reason: '预算优先给餐饮：吃得开心' },
  play:    { B: 1, D: 2,     reason: '预算优先给体验：玩得尽兴' },
  balance: { A: 1, F: 2,     reason: '均衡安排：计划性与预算规划' },
};

/* 日常行为计分：按真实完成的活动类型（每张卡只按实际放置计一次） */
const ACTIVITY_SCORES = {
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
const ROUTE_SCORE = { A: 4, reason: '主动规划并确认当天路线' };

/* =========================================================
 * 三个剧情场景（视频 + 中部文案 + 选项 + 隐藏计分规则）
 * ========================================================= */
const SCENE_ORDER = ['hike_rain', 'queue', 'budget_short', 'photo_spot', 'eat_local', 'climb_mountain', 'sunrise'];
const SCENES = {
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


/* ======== js/prd-engine.js ======== */
/* =========================================================
 * prd-engine.js — 会话状态与规则引擎（纯逻辑，无 DOM）
 *
 * PRD 核心原则落地：
 * - 交互必须改变系统状态（每个操作先校验、后写入、再由 UI 播动画）
 * - 八维人格积分以流水（scoreLog）为唯一事实来源，可追溯、可复算
 * - 结果由七幕场景积分直接排名计算，可解释；同分按支持集中度裁决，
 *   镜像并列保留（V2.1/V2.2）
 * ========================================================= */



/* ---------- 创建会话 ---------- */
function createSession({ goalId, allocation, reducedMotion, focusId }) {
  const total = SCENARIO.totalBudget;
  const sum = allocation.hotel + allocation.food + allocation.experience;
  if (sum > total) throw new Error(`预算分配超出 ${sum - total} 元`);
  const session = {
    version: SESSION_VERSION,
    sessionId: `s_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    phase: 'planning',           // planning → completed
    currentDay: 1,
    budget: { total, remaining: total, allocation },
    goalId: goalId || null,
    focusId: focusId || null,
    energy: 100,
    mood: 75,
    weather: 'sunny',
    activities: [],              // 旧模拟器遗留字段，仅为会话结构兼容保留（不再写入）
    events: [],                  // 同上
    actionLog: [],               // { t, type, text, dimEffects, detail }
    scoreLog: [],                // 人格积分流水（可追溯、可复算）
    sceneQueue: [...SCENE_ORDER],               // 七个剧情场景依次结算
    sceneLog: [],                // { sceneId, day, optionId }
    completedDays: [],
    reducedMotion: !!reducedMotion,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  // 预算去向的初始偏好分（只反映意向，不决定结局）
  const setup = SETUP_SCORES[focusId];
  if (setup) {
    const deltas = {};
    for (const [k, v] of Object.entries(setup)) if (PERSONA_CODES.includes(k)) deltas[k] = v;
    setScoreEntries(session, 'setup:focus', deltas, setup.reason, focusId, 0);
  }
  return session;
}

/* =========================================================
 * 人格积分：后台 A–H 各自独立，初始 50，范围 0–100
 * 每条流水记录事件、选项、人格、变化值与依据，可追溯
 * ========================================================= */
function setScoreEntries(session, eventKey, deltas, reason, optionId = '', day = session.currentDay) {
  if (!Array.isArray(session.scoreLog)) session.scoreLog = [];
  // 幂等：同一事件之前的分值先撤销，再加新分值，避免重复计分
  session.scoreLog = session.scoreLog.filter((e) => e.eventKey !== eventKey);
  for (const [persona, delta] of Object.entries(deltas || {})) {
    if (!delta || !PERSONA_CODES.includes(persona)) continue;
    session.scoreLog.push({
      t: Date.now(), eventKey, optionId, persona, delta,
      reason: reason || '', day,
    });
  }
}

/* 八维人格当前分（由流水汇总，永不单独维护） */
function personaScores(session) {
  const scores = Object.fromEntries(PERSONA_CODES.map((c) => [c, PERSONA_INITIAL]));
  for (const e of session.scoreLog || []) {
    if (e.persona in scores) scores[e.persona] = clamp(scores[e.persona] + e.delta, 0, 100);
  }
  return scores;
}

/* 三个展示倾向：组内加权平均（权重集中配置在 TENDENCIES） */
function tendencyScores(personaMap) {
  const out = {};
  for (const t of TENDENCIES) {
    let wSum = 0, sum = 0;
    for (const [code, w] of Object.entries(t.weights)) {
      if (!(code in personaMap)) continue;
      sum += personaMap[code] * w;
      wSum += w;
    }
    out[t.key] = wSum ? Math.round(clamp(sum / wSum, 0, 100)) : PERSONA_INITIAL;
  }
  return out;
}

/* 某次行为是否已计分（防重复点击） */
function hasScored(session, eventKey) {
  return (session.scoreLog || []).some((e) => e.eventKey === eventKey);
}

/* 结算剧情场景：同一场景只能生效一个选项（幂等）。
 * 纯场景流：只改预算/体力/心情与八维积分，不再联动活动排程。 */
function resolveScene(session, sceneId, optionId) {
  const sc = SCENES[sceneId];
  if (!sc) return { ok: false, reason: '未知场景' };
  if (session.sceneLog.some((e) => e.sceneId === sceneId)) {
    return { ok: false, reason: '该场景已结算，不能重复计分' };
  }
  const opt = sc.options.find((o) => o.id === optionId);
  if (!opt) return { ok: false, reason: '未知选项' };
  if (opt.cost > session.budget.remaining) {
    return { ok: false, reason: `预算不足：还差 ¥${opt.cost - session.budget.remaining}` };
  }

  session.sceneLog.push({ sceneId, day: sc.day, optionId });
  session.budget.remaining -= opt.cost;
  session.energy = clamp(session.energy + (opt.energyDelta || 0), 0, 100);
  session.mood = clamp(session.mood + (opt.moodDelta || 0), 0, 100);

  // 后台八维计分（集中规则表 → 再算前端三倾向）
  setScoreEntries(session, `scene:${sceneId}`, opt.scores || {}, opt.why || opt.label, optionId, sc.day);

  logAction(session, 'scene', `【${sc.title}】选择了「${opt.label}」`, opt.styleEffects || {}, { sceneId, optionId });
  const qi = session.sceneQueue.indexOf(sceneId);
  if (qi >= 0) session.sceneQueue.splice(qi, 1);
  // 三个场景全部结算完 → 旅行完成
  if (!session.sceneQueue.length) session.phase = 'completed';
  touch(session);
  return { ok: true, opt };
}

function touch(session) { session.updatedAt = Date.now(); }

function logAction(session, type, text, dimEffects, detail = {}) {
  session.actionLog.push({ t: Date.now(), type, text, dimEffects: dimEffects || {}, ...detail });
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* ---------- 纯场景流结果：由八维人格分数直接排名 ----------
 * 旅行只由「预算去向 + 七个剧情场景选择」构成，
 * 最高分人格即结果；同分按支持集中度 Σdelta² 裁决（V2.1），
 * 镜像并列仍保留。 */
function computePersonaResult(session) {
  const problems = [];
  const totalScenes = SCENE_ORDER.length;
  const done = SCENE_ORDER.filter((id) => session.sceneLog.some((e) => e.sceneId === id));
  if (done.length < totalScenes) {
    problems.push(`还有 ${totalScenes - done.length} 个场景未完成选择`);
  }
  if (problems.length) return { ok: false, problems };

  const scores = personaScores(session);
  const ranked = PERSONA_META
    .map((m) => {
      const personality = PERSONALITIES.find((p) => p.key === m.key);
      return { code: m.code, key: m.key, id: personality.id, name: personality.name, p: personality, score: scores[m.code] };
    })
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));

  /* 并列裁决（V2.1）：与最高分同分的维度，先比较「支持集中度」Σdelta²——
   * 单项强支持（如 +3）优先于分散弱支持（+1+1+1），语义为「行为证据更明确者优先」；
   * 集中度仍完全相同（镜像选择）时保留并列，不强行偏向。 */
  const concentration = (code) => (session.scoreLog || [])
    .filter((e) => e.persona === code)
    .reduce((s, e) => s + e.delta * e.delta, 0);
  const topScore = ranked[0].score;
  let tied = ranked.filter((r) => r.score === topScore);
  if (tied.length > 1) {
    const bestConc = Math.max(...tied.map((r) => concentration(r.code)));
    tied = tied.filter((r) => concentration(r.code) === bestConc);
  }
  const isTie = tied.length > 1;
  const winnerCodes = tied.map((r) => r.code);
  const winnerIds = tied.map((r) => r.id);

  // 证据：支撑该人格的真实选择记录（按 |分值| 取最相关）
  const evidence = (session.scoreLog || [])
    .filter((e) => winnerCodes.includes(e.persona))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 5)
    .map((e) => {
      const meta = PERSONA_META.find((m) => m.code === e.persona);
      return `${meta.name} ${e.delta > 0 ? '+' : ''}${e.delta}：${e.reason || e.eventKey}`;
    });
  if (!evidence.length) evidence.push('本次选择较为均衡，呈现多种旅行倾向。');

  const spent = session.budget.total - session.budget.remaining;
  return {
    ok: true,
    type: isTie ? 'tie' : 'single',
    winner: isTie ? null : winnerIds[0],
    winners: isTie ? winnerIds : null,
    top3: ranked.slice(0, 3).map((r) => ({ id: r.id, key: r.key, name: r.name, score: r.score, p: r.p })),
    scores,
    evidence,
    stats: {
      sceneCount: totalScenes,
      spend: spent,
      remaining: session.budget.remaining,
      spendRatio: Math.round((spent / session.budget.total) * 100),
    },
  };
}

/* ---------- 本地持久化（PRD 11.4，含版本校验） ---------- */
function saveSession(session) {
  try {
    localStorage.setItem('tap_journey_session_v1', JSON.stringify(session));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem('tap_journey_session_v1');
    if (!raw) return { ok: true, session: null };
    const data = JSON.parse(raw);
    if (data.version !== SESSION_VERSION) {
      // v1 → v2：补人格积分与场景字段（旧会话可直接继续，不丢进度）
      if (data.version === 1 && Array.isArray(data.activities)) {
        data.scoreLog = data.scoreLog || [];
        data.sceneLog = data.sceneLog || [];
        data.sceneQueue = data.sceneQueue || [];
        data.version = SESSION_VERSION;
        return { ok: true, session: data, migrated: true };
      }
      return { ok: false, reason: 'incompatible', detail: `会话版本 ${data.version} 与当前 ${SESSION_VERSION} 不兼容` };
    }
    if (!Array.isArray(data.activities) || typeof data.budget?.remaining !== 'number') {
      return { ok: false, reason: 'corrupted', detail: '会话数据结构不完整' };
    }
    // 运行期兜底：字段缺失时补默认值，避免场景层读取 undefined
    data.scoreLog = data.scoreLog || [];
    data.sceneLog = data.sceneLog || [];
    data.sceneQueue = data.sceneQueue || [];
    return { ok: true, session: data };
  } catch (e) {
    return { ok: false, reason: 'corrupted', detail: String(e) };
  }
}

function clearSession() {
  try {
    localStorage.removeItem('tap_journey_session_v1');
    localStorage.removeItem('tap_last_result_v1');
    return { ok: true };
  } catch (e) { return { ok: false, error: e }; }
}

function saveLastResult(result) {
  try {
    const summary = {
      type: result.type, winner: result.winner, winners: result.winners,
      top3: result.top3.map((t) => ({ id: t.id, name: t.name, score: t.score })),
      savedAt: Date.now(),
    };
    localStorage.setItem('tap_last_result_v1', JSON.stringify(summary));
    return { ok: true };
  } catch (e) { return { ok: false, error: e }; }
}

function loadLastResult() {
  try {
    const raw = localStorage.getItem('tap_last_result_v1');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ---------- 偏好（减少动画） ---------- */
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem('tap_preferences_v1') || '{}');
  } catch { return {}; }
}
function savePrefs(prefs) {
  try { localStorage.setItem('tap_preferences_v1', JSON.stringify(prefs)); } catch { /* 忽略 */ }
}

/* ---------- 埋点适配层（PRD 14：未接分析服务时仅本地记录） ---------- */
function track(event, payload = {}) {
  if (typeof console !== 'undefined' && console.debug) {
    console.debug(`[track] ${event}`, payload);
  }
}


/* ======== js/prd-app.js ======== */
/* =========================================================
 * prd-app.js — 视图与交互层（纯场景流版本）
 * 流程：开场动画 → 主页 → 初始化（目标+预算去向）
 *       → 场景一 → 场景二 → 场景三 → 结果页
 * 原则：先校验 → 写入状态 → 保存 → 再更新 UI / 播动画。
 * ========================================================= */




const $ = (s) => document.querySelector(s);
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{FE0F}\u{2600}-\u{27BF}]/gu;
const stripEmoji = (t) => t.replace(EMOJI_RE, '').trim();
/* 内联 SVG 图标（Feather Icons，MIT 许可，可免费使用） */
const ICON = (paths, size = 17) =>
  `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICON_AWARD = ICON('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.89"/>');
const $$ = (s) => [...document.querySelectorAll(s)];

/* ---------- 全局状态 ---------- */
let session = null;          // 当前会话
let lastResult = null;       // 最近结果摘要
let lastFullResult = null;   // 本次完整结果（含证据）
let prefs = loadPrefs();     // { reducedMotion }
let compareSet = [];         // 对比集合（最多 3）
let filters = {};            // 图鉴筛选 { pace:Set, ... }

/* =========================================================
 * 基础 UI 工具
 * ========================================================= */
function showScreen(name) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  $(`#screen-${name}`).classList.add('active');
  window.scrollTo(0, 0);
  /* 人格揭晓视频背景：只在结果页循环播放 */
  if (name === 'result') {
    if (resultBgArmed) startResultBgLoop();
  } else {
    stopResultBg();
  }
}

/* ---- 结果页背景：对应人格揭晓视频循环播放（含原声） ---- */
let resultBgArmed = false;
function setResultBg(personaId) {
  const bv = $('#result-bg-video');
  const p = PERSONALITY_MAP[personaId];
  if (!bv || !p?.video) return;
  if (bv.dataset.src !== p.video) {
    bv.dataset.src = p.video;
    setVideoPosterBg(bv, p.video);   // 背景循环视频防黑屏
    bv.src = p.video;
  }
  updateBgSoundBtn();
}
function startResultBgLoop() {
  const bv = $('#result-bg-video');
  const btn = $('#btn-result-bg-sound');
  if (!bv || !bv.dataset.src) return;
  resultBgArmed = true;
  bv.hidden = false;
  btn.hidden = false;
  bv.muted = false;
  const pr = bv.play();
  if (pr && pr.catch) {
    pr.catch(() => {
      bv.muted = true;                       // 被拦截则静音循环兜底
      updateBgSoundBtn();
      bv.play().catch(() => {});
    });
  }
  updateBgSoundBtn();
}
function stopResultBg() {
  const bv = $('#result-bg-video');
  if (bv) bv.pause();
}
function updateBgSoundBtn() {
  const bv = $('#result-bg-video');
  const btn = $('#btn-result-bg-sound');
  if (!bv || !btn || btn.hidden) return;
  btn.textContent = bv.muted ? '🔇 背景声音：关' : '🔊 背景音乐播放中';
}
$('#btn-result-bg-sound')?.addEventListener('click', () => {
  const bv = $('#result-bg-video');
  if (!bv) return;
  bv.muted = !bv.muted;
  updateBgSoundBtn();
  if (!bv.paused) return;
  bv.play().catch(() => {});
});

/* ---- 点击音效：软萌「啵」声（Web Audio 合成，无音频文件依赖） ---- */
let popAudioCtx = null;
function playPop() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    popAudioCtx = popAudioCtx || new AC();
    if (popAudioCtx.state === 'suspended') popAudioCtx.resume();
    const t = popAudioCtx.currentTime;
    const o = popAudioCtx.createOscillator();
    const g = popAudioCtx.createGain();
    const base = 520 + Math.random() * 160;       // 轻微随机音高，避免机械感
    o.type = 'sine';
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * 1.9, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(popAudioCtx.destination);
    o.start(t);
    o.stop(t + 0.18);
  } catch (e) { /* 音频不可用时静默 */ }
}
/* 选项类元素点击统一播放音效（事件委托，含动态生成的卡片） */
document.addEventListener('click', (e) => {
  if (e.target.closest('.scene-opt, .opt-card, .tp-card, #btn-scene-confirm, #btn-confirm-setup')) playPop();
});

function toast(text, cls = '') {
  const t = document.createElement('div');
  t.className = `toast ${cls}`;
  t.textContent = text;
  $('#toast-root').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function openModal(html, opts = {}) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `<div class="modal ${opts.cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
  $('#modal-root').appendChild(mask);
  mask.addEventListener('click', (e) => { if (e.target === mask && !opts.sticky) mask.remove(); });
  const esc = (e) => { if (e.key === 'Escape') { mask.remove(); document.removeEventListener('keydown', esc); } };
  document.addEventListener('keydown', esc);
  return mask;
}

function showPersistentError(text) {
  $('#error-text').textContent = text;
  $('#error-bar').hidden = false;
}
function hideError() { $('#error-bar').hidden = true; }

function fmt(n) { return `¥${n.toLocaleString('zh-CN')}`; }

/* =========================================================
 * 保存（每次状态变更自动保存 + 状态在场景层可见）
 * ========================================================= */
function persist() {
  if (!session) return;
  const r = saveSession(session);
  const el = $('#scene-save');
  if (el) el.textContent = r.ok ? '已保存' : '保存失败';
  if (!r.ok) showPersistentError('本地保存失败：进度可能不会被记住，请勿关闭页面（存储空间不足或被禁用）。');
}

/* =========================================================
 * 减少动画
 * ========================================================= */
function applyMotionPref() {
  document.body.classList.toggle('reduced-motion', !!prefs.reducedMotion);
  $('#btn-motion-toggle').textContent = `减少动画：${prefs.reducedMotion ? '开' : '关'}`;
  const sceneBtn = $('#btn-motion-toggle-scene');
  if (sceneBtn) sceneBtn.textContent = prefs.reducedMotion ? '🎞 动画：关' : '🎞 动画：开';
}
function toggleMotion() {
  prefs.reducedMotion = !prefs.reducedMotion;
  savePrefs(prefs);
  applyMotionPref();
  if (session) session.reducedMotion = prefs.reducedMotion;
  toast(prefs.reducedMotion ? '已开启减少动画' : '已恢复动画');
}

/* =========================================================
 * 首页
 * ========================================================= */
function initWelcome() {
  const contBtn = $('#btn-continue');
  const lastBtn = $('#btn-last-result');
  lastBtn.hidden = !lastResult;
  if (lastResult) {
    const name = lastResult.winners
      ? lastResult.winners.map((id) => PERSONALITY_MAP[id].name).join(' + ')
      : PERSONALITY_MAP[lastResult.winner]?.name || '';
    lastBtn.innerHTML = `${ICON_AWARD}<span>查看上次结果：${name}</span>`;
  }
  const scenesDone = session && session.sceneLog && session.sceneLog.length >= SCENE_ORDER.length;
  contBtn.hidden = !session;
  if (session) {
    contBtn.textContent = scenesDone
      ? '▶ 查看本次旅行结果'
      : `▶ 继续剧情（第 ${session.sceneLog.length + 1} / ${SCENE_ORDER.length} 幕）`;
  }
}

$('#btn-new').addEventListener('click', () => {
  track('home_cta_click', { entry_state: session ? 'has_session' : 'fresh' });
  showScreen('setup');
  renderSetup();
});
$('#btn-continue').addEventListener('click', () => {
  track('home_cta_click', { entry_state: 'continue' });
  const scenesDone = session.sceneLog.length >= SCENE_ORDER.length;
  if (scenesDone) finishTrip();
  else startSceneFlow();
});
$('#btn-last-result').addEventListener('click', () => showResultFromSummary(lastResult));
$('#btn-explore-home').addEventListener('click', () => { showScreen('explore'); renderExplore(); });
$('#btn-explore-back').addEventListener('click', () => { showScreen('welcome'); initWelcome(); });
$('#btn-howto').addEventListener('click', showHowto);
$('#btn-clear-data').addEventListener('click', confirmClearData);
$('#btn-motion-toggle').addEventListener('click', toggleMotion);

function showHowto() {
  openModal(`
    <div class="modal-head">📖 体验说明<button class="modal-close" data-x aria-label="关闭">✕</button></div>
    <div class="modal-body">
      <ol style="padding-left:20px;font-size:14.5px;line-height:2">
        <li><b>初始化</b>：选择旅行目标，再选择大部分预算花在哪（自动配平 ¥5,000）。</li>
        <li><b>三个剧情</b>：徒步遇雨、排队分歧、预算告急——每个场景看视频、读文案、选应对方式。</li>
        <li><b>实时倾向</b>：顶部三条进度条（计划与行动 / 享受与体验 / 应变与协作）随每次选择变化。</li>
        <li><b>拿结果</b>：三幕结束后，基于全部选择计算八种旅行人格，可查看依据、对比与生成海报。</li>
      </ol>
      <p style="font-size:12.5px;color:var(--ink-soft)">选项不显示计分规则；所有数据仅保存在本地。</p>
    </div>`).querySelector('[data-x]').addEventListener('click', (e) => e.target.closest('.modal-mask').remove());
}

function confirmClearData() {
  const mask = openModal(`
    <div class="modal-head">🗑 清除本地记录？<button class="modal-close" data-x aria-label="关闭">✕</button></div>
    <div class="modal-body">
      <p>将删除进行中的会话与最近结果，此操作无法撤销。</p>
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:18px">
        <button class="btn btn-ghost" data-x>取消</button>
        <button class="btn btn-danger" id="btn-confirm-clear">确认清除</button>
      </div>
    </div>`);
  mask.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => mask.remove()));
  mask.querySelector('#btn-confirm-clear').addEventListener('click', () => {
    const r = clearSession();
    session = null; lastResult = null; lastFullResult = null;
    initWelcome();
    mask.remove();
    toast(r.ok ? '本地记录已清除' : '清除失败，请重试', r.ok ? 'good' : 'warn');
  });
}

/* =========================================================
 * 初始化页（目标 + 预算去向单选 + 自动配平）
 * ========================================================= */
let alloc = { ...SCENARIO.defaultAllocation };
let goalSel = null;
let focusSel = null;

function bindCardKeyboard(rowEl, attr, onPick) {
  rowEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest(`[data-${attr}]`);
    if (!card) return;
    e.preventDefault();
    onPick(card);
  });
}

function renderSetup() {
  $('#goal-row').innerHTML = GOALS.map((g) => `
    <div class="opt-card" data-goal="${g.id}" role="button" tabindex="0"
         aria-pressed="false" aria-label="旅行目标：${g.name}，${g.hint}">
      <div class="oc-icon">${g.icon}</div><h4>${g.name}</h4><p>${g.hint}</p>
    </div>`).join('');
  const pickGoal = (card) => {
    $$('#goal-row .opt-card').forEach((c) => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    goalSel = card.dataset.goal;
    updateSetupUI();
  };
  $('#goal-row').onclick = (e) => { const c = e.target.closest('[data-goal]'); if (c) pickGoal(c); };
  bindCardKeyboard($('#goal-row'), 'goal', pickGoal);

  $('#focus-row').innerHTML = SPEND_FOCUS.map((f) => `
    <div class="opt-card" data-focus="${f.id}" role="button" tabindex="0"
         aria-pressed="false" aria-label="预算去向：${f.name}，${f.hint}">
      <div class="oc-icon">${f.icon}</div><h4>${f.name}</h4><p>${f.hint}</p>
    </div>`).join('');
  const pickFocus = (card) => {
    $$('#focus-row .opt-card').forEach((c) => { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    focusSel = card.dataset.focus;
    alloc = { ...SPEND_FOCUS.find((f) => f.id === focusSel).allocation };
    updateSetupUI();
  };
  $('#focus-row').onclick = (e) => { const c = e.target.closest('[data-focus]'); if (c) pickFocus(c); };
  bindCardKeyboard($('#focus-row'), 'focus', pickFocus);

  updateSetupUI();
}

function updateSetupUI() {
  const preview = $('#alloc-preview');
  if (focusSel) {
    const f = SPEND_FOCUS.find((x) => x.id === focusSel);
    preview.innerHTML =
      `🏨 住宿 <b>${fmt(alloc.hotel)}</b> · 🍜 餐饮 <b>${fmt(alloc.food)}</b> · 🎡 体验 <b>${fmt(alloc.experience)}</b>` +
      `（${f.name} · 合计 ${fmt(SCENARIO.totalBudget)}）`;
  } else {
    preview.textContent = '选择一个去向，预算会自动按方案配平，不用自己算。';
  }
  const ready = goalSel && focusSel;
  $('#btn-confirm-setup').disabled = !ready;
  $('#setup-hint').textContent = ready
    ? `目标：${GOALS.find((g) => g.id === goalSel).name} · 预算：${SPEND_FOCUS.find((f) => f.id === focusSel).name} · 确认后直接进入第一幕剧情`
    : !goalSel ? '请先选择旅行目标' : '再选择预算去向即可出发';
}

$('#btn-confirm-setup').addEventListener('click', () => {
  if ($('#btn-confirm-setup').disabled) return;
  session = createSession({ goalId: goalSel, allocation: { ...alloc }, focusId: focusSel, reducedMotion: prefs.reducedMotion });
  const r = saveSession(session);
  track('journey_start', { scenario_id: 'chengdu_3d' });
  if (!r.ok) showPersistentError('本地保存失败：关闭页面后进度将丢失。');
  toast('旅行计划已创建，进入第一幕', 'good');
  startSceneFlow();
});

/* =========================================================
 * 剧情场景流（全屏视频 + 顶部三倾向条 + 底部选项）
 * ========================================================= */
let sceneSel = null;
let sceneHintTimer = null;   // 缓冲提示延时
let sceneWatchdog = null;    // 视频迟迟不就绪时放行选项，避免卡死

function startSceneFlow() {
  if (!session || !session.sceneQueue.length) return;
  openScene();
}

/* ---------- 场景视频加载优化：首帧封面 + 预加载 ----------
 * 场景层底色为深色，视频 src 切换后首帧解码前会渲染成黑屏。
 * 解决方式双层保险：
 *   1) 独立 <img id="scene-cover"> 封面层铺在视频下方，进场景瞬间就有画面；
 *   2) 视频 opacity:0，首帧就绪（loadeddata/playing）后才淡入覆盖封面。
 * 注意：不做「后台预加载下一幕视频」——媒体缓存不跨元素共享，
 * 反而会与当前幕抢带宽，导致后续幕长时间等不到首帧。 */
const scenePoster = (id) => `assets/images/scene-posters/${id}.jpg`;

/* ---------- 全站视频防黑屏（通用机制） ----------
 * 视频未解码出首帧时，video 元素不渲染任何内容，露出深色容器底 = 黑屏。
 * 统一解法：给每个 video 元素设置 background-image = 该视频的首帧封面图，
 * 首帧画好后自动覆盖背景。对任何容器（全屏/圆窗/弹窗）、任何换 src 场景都生效，
 * 不依赖 poster 属性（Chrome 连续换 src 时 poster 会失效）。 */
const VIDEO_POSTERS = {
  'assets/videos/开场场景1.mp4': 'assets/images/video-posters/intro.jpg',
  'assets/videos/用户吃饭.mp4': 'assets/images/video-posters/analyze.jpg',
  'assets/videos/reveal/人性攻略机揭晓视频.mov': 'assets/images/video-posters/reveal_a.jpg',
  'assets/videos/reveal/特种兵指挥官揭晓视频.mov': 'assets/images/video-posters/reveal_b.jpg',
  'assets/videos/reveal/酒店躺平王揭晓视频.mov': 'assets/images/video-posters/reveal_c.jpg',
  'assets/videos/reveal/拍照导演.mov': 'assets/images/video-posters/reveal_d.jpg',
  'assets/videos/reveal/干饭社交悍匪揭晓视频.mov': 'assets/images/video-posters/reveal_e.jpg',
  'assets/videos/reveal/预算会计揭晓视频.mov': 'assets/images/video-posters/reveal_f.jpg',
  'assets/videos/reveal/佛系流浪汉揭晓视频.mov': 'assets/images/video-posters/reveal_g.jpg',
  'assets/videos/reveal/安静跟团魂揭晓视频新.mov': 'assets/images/video-posters/reveal_h.jpg',
};
function posterForVideo(videoSrc) {
  if (!videoSrc) return '';
  if (VIDEO_POSTERS[videoSrc]) return VIDEO_POSTERS[videoSrc];
  const sid = SCENE_ORDER.find((id) => SCENES[id].video === videoSrc);
  return sid ? scenePoster(sid) : '';
}
function setVideoPosterBg(videoEl, videoSrc) {
  if (!videoEl) return;
  const p = posterForVideo(videoSrc);
  if (p) videoEl.style.backgroundImage = `url("${p}")`;
}
/* 启动时为页面里写死 src 的视频挂上首帧背景（开场/欢迎/分析页） */
function prewarmVideoPosters() {
  ['#intro-video', '#welcome-video', '#analyze-video', '#result-bg-video'].forEach((sel) => {
    const el = $(sel);
    if (el) setVideoPosterBg(el, el.getAttribute('src'));
  });
  for (const id of SCENE_ORDER) {
    const img = new Image();
    img.src = posterForVideo(SCENES[id].video);
  }
}

function openScene() {
  const sceneId = session.sceneQueue[0];
  const sc = SCENES[sceneId];
  if (!sc) return;
  sceneSel = null;
  hideError();

  $('#scene-title').textContent = stripEmoji(sc.title);
  $('#scene-story').textContent = sc.story;

  const v = $('#scene-video');
  const cover = $('#scene-cover');
  /* 封面先行：进场景立刻有画面，视频就绪后再淡入盖住 */
  cover.hidden = false;
  cover.src = scenePoster(sceneId);
  v.classList.remove('is-ready');
  v.poster = scenePoster(sceneId);
  setVideoPosterBg(v, sc.video);     // 双保险：背景图 + 封面层
  v.src = sc.video;                  // 换 src 后自动从头播放
  const layer = $('#scene-layer');
  layer.dataset.theme = sc.theme || 'neutral';        // 选项卡片跟随视频色调
  layer.classList.remove('video-failed');
  layer.classList.add('awaiting-choice');             // 视频播完前不显示选项
  layer.hidden = false;
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  document.body.style.overflow = 'hidden';

  /* 缓冲提示 + 看门狗：1s 未就绪提示「加载中」，12s 仍未就绪直接放行选项 */
  const loadingEl = $('#scene-loading');
  loadingEl.hidden = true;
  clearTimeout(sceneHintTimer);
  clearTimeout(sceneWatchdog);
  sceneHintTimer = setTimeout(() => {
    if (!v.classList.contains('is-ready')) loadingEl.hidden = false;
  }, 1000);
  sceneWatchdog = setTimeout(() => {
    loadingEl.hidden = true;
    revealOptions();
  }, 12000);

  $('#scene-options').innerHTML = sc.options.map((o, i) => `
    <button class="scene-opt" data-si="${i}" aria-pressed="false">
      <b>${o.label}</b>
      <span class="so-meta"><span class="so-en">体力${o.energyDelta > 0 ? '+' : ''}${o.energyDelta}</span><span class="so-mo">心情${o.moodDelta > 0 ? '+' : ''}${o.moodDelta}</span></span>
    </button>`).join('');
  /* 所有选项同一行（flex 等分，窄屏横向滚动） */
  $('#scene-options').querySelectorAll('[data-si]').forEach((b) => {
    b.addEventListener('click', () => pickSceneOption(Number(b.dataset.si)));
  });
  $('#btn-scene-confirm').disabled = true;
  $('#scene-hint-text').textContent = '先选一个应对方式（不会显示内部计分）';

  // 快播完（剩余 ≤1.5s）即显示选项：片尾音乐自然衔接选择环节，避免音乐戛然而止；
  // 播完/失败/被拦截仍兜底显示，不阻断剧情
  v.onended = () => revealOptions();
  // 首帧就绪 → 视频淡入盖住封面（黑屏期彻底由封面兜住）
  const showVideo = () => {
    v.classList.add('is-ready');
    clearTimeout(sceneHintTimer);
    clearTimeout(sceneWatchdog);
    $('#scene-loading').hidden = true;
  };
  v.onloadeddata = showVideo;
  v.onplaying = showVideo;
  v.ontimeupdate = () => {
    if (!v.classList.contains('is-ready')) v.classList.add('is-ready');
    if (v.duration && !v.ended && v.duration - v.currentTime <= Math.min(1.5, v.duration * 0.3)) {
      revealOptions();
    }
  };
  if (v.readyState >= 2) showVideo();
  if (prefs.reducedMotion) {
    v.pause();
    revealOptions();
  } else {
    const p = v.play();
    if (p && p.catch) p.catch(() => {
      v.muted = true;                          // 兜底：静音也要继续播
      const q = v.play();
      if (q && q.catch) q.catch(() => revealOptions());
    });
  }

  syncSceneStrip(false);
}

function pickSceneOption(i) {
  const sc = SCENES[session.sceneQueue[0]];
  if (!sc) return;
  const opt = sc.options[i];
  sceneSel = opt.id;
  $('#scene-options').querySelectorAll('[data-si]').forEach((b) => {
    const on = Number(b.dataset.si) === i;
    b.classList.toggle('selected', on);
    b.setAttribute('aria-pressed', String(on));
  });
  const unaffordable = opt.cost > session.budget.remaining;
  $('#btn-scene-confirm').disabled = unaffordable;
  $('#scene-hint-text').textContent = unaffordable
    ? `预算不足：还差 ${fmt(opt.cost - session.budget.remaining)}，换一个更省的方案`
    : `已选择「${opt.label}」，确认后计入旅行倾向`;
}

/* 顶部进度条：三条倾向（后台八维换算）+ 体力/心情实时状态 */
function syncSceneStrip(animate) {
  const tend = tendencyScores(personaScores(session));
  const setBar = (key, value) => {
    const fill = $(`#${key}`);
    const num = $(`#${key}-num`);
    if (!fill || !num) return;
    const v = Math.round(value);
    fill.style.width = `${v}%`;
    const before = Number(num.textContent);
    num.textContent = v;
    if (animate && before !== v && !prefs.reducedMotion) {
      num.classList.remove('bump');
      void num.offsetWidth;
      num.classList.add('bump');
    }
  };
  for (const t of TENDENCIES) setBar(`scene-tend-${t.key}`, tend[t.key]);
  setBar('scene-energy', session.energy ?? 100);
  setBar('scene-mood', session.mood ?? 75);
}

function closeScene() {
  $('#scene-layer').hidden = true;
  document.body.style.overflow = '';
  clearTimeout(sceneHintTimer);
  clearTimeout(sceneWatchdog);
  $('#scene-loading').hidden = true;
  const v = $('#scene-video');
  v.onended = null;
  v.ontimeupdate = null;
  v.onloadeddata = null;
  v.onplaying = null;
  v.classList.remove('is-ready');
  v.pause();
}

/* 视频加载失败：不阻断剧情，暗色底 + 文案选项照常可用 */
$('#scene-video').addEventListener('error', () => {
  $('#scene-layer').classList.add('video-failed');
  revealOptions();
});

$('#btn-scene-confirm').addEventListener('click', () => {
  const btn = $('#btn-scene-confirm');
  if (!sceneSel || btn.disabled) return;
  const sceneId = session.sceneQueue[0];
  if (!sceneId || !SCENES[sceneId]) { sceneSel = null; return; }  // 防连点/重复结算
  btn.disabled = true;
  /* resolveScene 为先校验后写入的原子操作：失败时无任何状态变更，无需快照回滚 */
  const r = resolveScene(session, sceneId, sceneSel);
  if (!r.ok) {
    btn.disabled = false;
    showPersistentError(`无法结算场景：${r.reason}`);
    return;
  }
  track('scene_choice', { scene_id: sceneId, option_id: sceneSel });
  hideError();
  persist();
  syncSceneStrip(true);               // 先在场景内展示三条进度条的变化
  const delay = prefs.reducedMotion ? 0 : 520;
  setTimeout(() => {
    if (session.sceneQueue.length) {
      openScene();                    // 直接进入下一幕
    } else {
      closeScene();
      runAnalysis(finishTrip);        // 假装分析 → 结果
    }
  }, delay);
});

/* ---- 视频播完才出现选项 ---- */
function revealOptions() {
  const layer = $('#scene-layer');
  if (!layer || layer.hidden) return;
  layer.classList.remove('awaiting-choice');
  if (sceneSel) return;                     // 已选择：保持原位，不抢焦点
  setTimeout(() => $('#scene-options').querySelector('[data-si]')?.focus({ preventScroll: true }), 120);
}

/* ---- 分析进度（仪式感演出，约 4.6s；减少动画时瞬间完成） ---- */
function runAnalysis(done) {
  showScreen('analyze');
  const fill = $('#analyze-fill');
  const num = $('#analyze-num');
  const steps = $$('#analyze-steps li');
  const v = $('#analyze-video');
  if (!prefs.reducedMotion) v.play().catch(() => { v.hidden = true; });
  else v.pause();
  const dur = prefs.reducedMotion ? 250 : 4600;
  const t0 = performance.now();
  cancelAnimationFrame(runAnalysis._raf);
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const pct = Math.round(p * 100);
    fill.style.width = `${pct}%`;
    num.textContent = `${pct}%`;
    steps.forEach((li, i) => li.classList.toggle('done', p >= (i + 1) / steps.length - 0.05));
    if (p < 1) runAnalysis._raf = requestAnimationFrame(tick);
    else setTimeout(done, prefs.reducedMotion ? 50 : 450);
  };
  requestAnimationFrame(tick);
  track('analysis_start', {});
}
/* 视频解码失败：隐藏圆窗视频，保留爪印雷达动画 */
$('#analyze-video')?.addEventListener('error', function () { this.hidden = true; });

/* ---- 人格揭晓视频弹窗 ---- */
function playReveal(p, auto = false) {
  const mask = openModal(`
    <div class="reveal-modal">
      <div class="reveal-head"><span class="rh-badge">AI 鉴定完成</span>${p.emoji} 你是「${p.name}」<button class="modal-close" data-x aria-label="关闭">✕</button></div>
      <div class="reveal-video-box">
        <video src="${p.video}" playsinline autoplay style="background-image:url('${posterForVideo(p.video)}')"></video>
        <button class="btn btn-ghost btn-sm reveal-skip" data-skip>跳过 ›</button>
      </div>
      <div class="reveal-foot">
        <button class="btn btn-primary" data-continue>查看完整报告 →</button>
      </div>
    </div>`, { cls: 'reveal', sticky: true });
  const close = () => { mask.querySelector('video')?.pause(); mask.remove(); startResultBgLoop(); };
  mask.querySelector('[data-x]').addEventListener('click', close);
  mask.querySelector('[data-skip]').addEventListener('click', close);
  mask.querySelector('[data-continue]').addEventListener('click', close);
  const v = mask.querySelector('video');
  const pv = v.play();
  if (pv && pv.catch) pv.catch(() => { v.controls = true; });   // 自动播放被拦截 → 显示控制条手动播
  v.addEventListener('ended', () => mask.querySelector('[data-continue]').classList.add('glow'));
  v.addEventListener('error', () => {
    mask.querySelector('.reveal-video-box').classList.add('failed');
    mask.querySelector('[data-skip]').hidden = true;
  });
  if (auto) track('reveal_auto_play', { style_id: p.id });
}

/* =========================================================
 * 三幕完成 → 计算最终人格
 * ========================================================= */
function finishTrip() {
  const result = computePersonaResult(session);
  if (!result.ok) {
    showPersistentError(`旅行未完成：${result.problems.join('；')}`);
    return;
  }
  lastFullResult = result;
  saveLastResult(result);
  lastResult = loadLastResult();
  track('journey_complete', { spend: result.stats.spend });
  showResult(result);
}

/* =========================================================
 * 结果页
 * ========================================================= */
function showResult(result) {
  lastFullResult = result;
  closeScene();
  showScreen('result');
  const displayId = result.type === 'single' ? result.winner : result.winners[0];
  renderResult(result, displayId);
  resultBgArmed = false;                          // 等揭晓弹窗关闭后再开始背景循环
  setResultBg(displayId);
  stopResultBg();
  playReveal(PERSONALITY_MAP[displayId], true);   // 揭晓视频弹窗
  track('result_view', { style_id: displayId, match_score: result.top3[0].score });
}

function showResultFromSummary(summary) {
  setResultBg(summary.winners ? summary.winners[0] : summary.winner);
  resultBgArmed = true;
  showScreen('result');
  $('#result-body').innerHTML = `
    <p style="text-align:center;color:var(--ink-soft);font-size:13px;margin-bottom:14px">以下为最近一次保存的结果摘要（只读）。</p>
    ${summary.winners ? tieSummaryHtml(summary) : singleSummaryHtml(summary)}
    <p class="result-disclaimer">本结果由互动模拟规则生成，仅用于旅行风格交流与娱乐，不构成心理测评或专业建议。</p>`;
}
function singleSummaryHtml(summary) {
  const p = PERSONALITY_MAP[summary.winner];
  const t3 = summary.top3.map((t) => `<div class="match-row"><span class="m-name">${PERSONALITY_MAP[t.id].name}</span><div class="m-bar"><div class="m-fill" style="width:${t.score}%;background:${PERSONALITY_MAP[t.id].color}"></div></div><span class="m-num">${t.score}%</span></div>`).join('');
  return resultCardHtml(p, ['（摘要模式：完整依据请在同一次会话中查看）']) + `<div class="result-block"><h3>🥇 Top 3 匹配度</h3>${t3}</div>`;
}
function tieSummaryHtml(summary) {
  return summary.winners.map((id) => resultCardHtml(PERSONALITY_MAP[id], ['（摘要模式）'])).join('');
}

function resultCardHtml(p, evidenceLines) {
  return `
  <div class="result-card" style="--rc-accent:${p.color}55">
    <img src="${p.img}" alt="${p.name}形象图">
    <div>
      <div class="rc-name" style="color:${p.color}">${p.emoji} ${p.name}</div>
      <div class="rc-slogan">「${p.catchphrase}」</div>
      <div class="rc-traits">${p.traits.map((t) => `<span class="badge">${t}</span>`).join('')}</div>
      <div class="rc-evidence">
        <h5>为什么更接近「${p.name}」？（来自你的真实选择）</h5>
        <ul>${evidenceLines.map((l) => `<li>🐱 ${l}</li>`).join('')}</ul>
      </div>
    </div>
  </div>`;
}

function renderResult(result, displayId) {
  const p = PERSONALITY_MAP[displayId];
  const evidence = result.evidence || [];
  const top3Html = result.top3.map((t, i) => `
    <div class="match-row ${i === 0 ? 'top1' : ''}">
      <span class="m-name">${PERSONALITY_MAP[t.id].emoji} ${PERSONALITY_MAP[t.id].name}</span>
      <div class="m-bar"><div class="m-fill" style="width:${t.score}%;background:${PERSONALITY_MAP[t.id].color}"></div></div>
      <span class="m-num">${t.score}%</span>
    </div>`).join('');
  const dimHtml = TENDENCIES.map((t) => `
    <div class="dim-row">
      <span class="d-label">${t.name}</span>
      <div class="d-bar"><div class="d-fill" data-w="${result.scores ? tendencyDisplay(result, t.key) : 50}"></div></div>
      <span class="d-num">${result.scores ? tendencyScores(result.scores)[t.key] : '—'}</span>
    </div>`).join('');
  const sceneSummary = (session?.sceneLog || []).map((e) => {
    const sc = SCENES[e.sceneId];
    const opt = sc?.options.find((o) => o.id === e.optionId);
    if (!sc || !opt) return '';
    const dayCn = ['一', '二', '三', '四', '五', '六', '七'][e.day - 1] || e.day;
    const title = stripEmoji(sc.title);
    return `第${dayCn}幕，${title}——你选择「<b>${opt.label}</b>」`;
  }).filter(Boolean).join('；');
  const storyText = sceneSummary ? `${sceneSummary}。` : '暂无记录';
  $('#result-body').innerHTML = `
    ${result.type === 'tie' ? `
      <div class="tie-note">⚖️ 你的最高分人格出现了并列：<b>${result.winners.map((id) => PERSONALITY_MAP[id].name).join('、')}</b> —— 并列结果已完整保留，点击下方卡片切换查看。</div>
      <div class="tie-pick">
        ${result.winners.map((id) => {
          const t = result.top3.find((x) => x.id === id);
          return `<div class="tp-card" data-style="${id}"><img src="${PERSONALITY_MAP[id].img}" alt=""><h4>${PERSONALITY_MAP[id].name} ${t ? `${t.score}分` : ''}</h4></div>`;
        }).join('')}
      </div>` : ''}
    ${resultCardHtml(p, evidence.slice(0, 3))}
    <div class="result-cols">
      <div class="result-block"><h3>🥇 八种人格匹配排名</h3>${top3Html}<p style="font-size:11.5px;color:var(--ink-soft);margin-top:8px">排名来自你在预算分配与七个剧情中的全部选择，不是准确率或人口占比。</p></div>
      <div class="result-block"><h3>📊 你的三条旅行倾向</h3>${dimHtml}</div>
    </div>
    <div class="result-block" style="margin-bottom:20px">
      <h3>🧾 旅行记录（七个剧情选择）</h3>
      <p class="trip-story">${storyText}</p>
    </div>
    <p class="result-disclaimer">本结果由互动模拟规则生成，仅用于旅行风格交流与娱乐，不构成心理测评或专业建议。</p>`;

  $$('#result-body .tp-card').forEach((c) => c.addEventListener('click', () => renderResult(result, c.dataset.style)));
  requestAnimationFrame(() => setTimeout(() => {
    $$('#result-body .d-fill').forEach((f) => f.style.width = `${f.dataset.w}%`);
  }, 60));
}
function tendencyDisplay(result, key) {
  return tendencyScores(result.scores)[key];
}

$('#btn-result-evidence').addEventListener('click', () => {
  if (!lastFullResult) return;
  const lines = (session?.actionLog || []).map((l) => {
    const dims = Object.entries(l.dimEffects || {}).map(([k, v]) => `${DIM_NAMES[k]}${v > 0 ? '+' : ''}${v}`).join(' ');
    return `<li><b>${l.type === 'scene' ? '🎬' : '＋'}</b> ${l.text}${dims ? ` <span style="color:var(--ink-soft);font-size:12px">[${dims}]</span>` : ''}</li>`;
  }).join('');
  openModal(`
    <div class="modal-head">📄 完整行为依据<button class="modal-close" data-x aria-label="关闭">✕</button></div>
    <div class="modal-body"><ul class="evidence-list">${lines || '<li>暂无记录</li>'}</ul></div>`
  ).querySelector('[data-x]').addEventListener('click', (e) => e.target.closest('.modal-mask').remove());
  track('result_evidence_open', {});
});

$('#btn-result-compare').addEventListener('click', () => {
  if (lastFullResult) {
    const id = lastFullResult.winner || lastFullResult.winners[0];
    if (!compareSet.includes(id)) compareSet.push(id);
  }
  showScreen('explore');
  renderExplore();
});
$('#btn-result-explore').addEventListener('click', () => { showScreen('explore'); renderExplore(); });
$('#btn-result-replan').addEventListener('click', () => {
  const mask = openModal(`
    <div class="modal-head">🔄 重新规划？<button class="modal-close" data-x aria-label="关闭">✕</button></div>
    <div class="modal-body">
      <p>将创建一个全新的会话重新体验，当前数据会被覆盖（结果摘要仍保留在「上次结果」）。</p>
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:18px">
        <button class="btn btn-ghost" data-x>取消</button>
        <button class="btn btn-primary" id="btn-confirm-replan">创建新会话</button>
      </div>
    </div>`);
  mask.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', () => mask.remove()));
  mask.querySelector('#btn-confirm-replan').addEventListener('click', () => {
    mask.remove();
    session = null;
    showScreen('setup');
    renderSetup();
  });
});

/* ---- 海报（Canvas 生成 + 下载） ---- */
$('#btn-result-poster').addEventListener('click', () => {
  if (!lastFullResult) return;
  const id = lastFullResult.winner || lastFullResult.winners[0];
  const p = PERSONALITY_MAP[id];
  const mask = openModal(`
    <div class="modal-head">🖼 分享海报<button class="modal-close" data-x aria-label="关闭">✕</button></div>
    <div class="modal-body poster-modal">
      <canvas id="poster-canvas" width="480" height="720"></canvas>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:16px">
        <button class="btn btn-primary" id="btn-poster-download">⬇ 下载海报</button>
      </div>
      <p style="font-size:11.5px;color:var(--ink-soft);margin-top:10px">结果链接：<code>${location.origin}${location.pathname}#result?style=${id}&shared=1</code>（原型期以链接代替二维码）</p>
    </div>`);
  mask.querySelector('[data-x]').addEventListener('click', (e) => e.target.closest('.modal-mask').remove());
  const canvas = mask.querySelector('#poster-canvas');
  const ctx = canvas.getContext('2d');
  const draw = (img) => {
    ctx.fillStyle = '#f6f2e9';
    ctx.fillRect(0, 0, 480, 720);
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 24px "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('坏小贝旅行日记', 240, 60);
    ctx.fillStyle = '#6e6353';
    ctx.font = '13px "PingFang SC", sans-serif';
    ctx.fillText('互动旅行模拟 · 演示数据', 240, 84);
    if (img) {
      const ratio = img.naturalWidth / img.naturalHeight;
      const w = 300; const h = w / ratio;
      ctx.drawImage(img, 240 - w / 2, 105, w, h);
    }
    ctx.fillStyle = p.color;
    ctx.font = 'bold 34px "PingFang SC", sans-serif';
    ctx.fillText(`${p.name}`, 240, img ? 480 : 420);
    ctx.fillStyle = '#2f2a22';
    ctx.font = '14px "PingFang SC", sans-serif';
    ctx.fillText(`「${p.catchphrase}」`, 240, img ? 508 : 448);
    const ev = (lastFullResult.evidence || []).slice(0, 3);
    ctx.textAlign = 'left';
    ctx.font = '12.5px "PingFang SC", sans-serif';
    ctx.fillStyle = '#6e6353';
    ev.forEach((line, i) => {
      const text = line.length > 24 ? line.slice(0, 24) + '…' : line;
      ctx.fillText(`• ${text}`, 60, (img ? 545 : 485) + i * 22);
    });
    ctx.textAlign = 'center';
    ctx.fillStyle = '#2f2a22';
    ctx.font = 'bold 13px "PingFang SC", sans-serif';
    ctx.fillText('三个剧情选择 · 你的旅行人格档案', 240, 640);
    ctx.fillStyle = '#9a8e7d';
    ctx.font = '10.5px "PingFang SC", sans-serif';
    ctx.fillText('结果基于互动模拟生成，仅供娱乐，不构成心理测评', 240, 690);
  };
  const img = new Image();
  img.onload = () => draw(img);
  img.onerror = () => draw(null); // 图片失败不阻断海报生成
  img.src = p.img;
  mask.querySelector('#btn-poster-download').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.disabled = true; btn.textContent = '正在下载…';
    try {
      const a = document.createElement('a');
      a.download = `坏小贝旅行日记-${p.name}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      btn.textContent = '✅ 已下载';
      track('poster_download', { status: 'ok' });
    } catch (err) {
      btn.disabled = false; btn.textContent = '⬇ 重试下载';
      toast(`下载失败：${err.message}`, 'warn');
      track('poster_download', { status: 'failed' });
    }
  });
  track('poster_generate', { status: 'ready' });
});

/* =========================================================
 * 图鉴（搜索 + 多维筛选，同维度或、跨维度与）
 * ========================================================= */
const FILTER_DEFS = [
  { key: 'pace', label: '旅行节奏', options: ['快', '适中', '慢'] },
  { key: 'decision', label: '决策方式', options: ['计划型', '灵活型', '跟随型'] },
  { key: 'budget', label: '预算倾向', options: ['精打细算', '平衡', '体验优先'] },
  { key: 'social', label: '社交能量', options: ['高', '中', '低'] },
  { key: 'content', label: '内容类型', options: ['拍照', '美食', '探索', '休息', '文化', '运动'] },
];

function renderExplore() {
  $('#filter-groups').innerHTML = FILTER_DEFS.map((f) => `
    <div class="filter-group" role="group" aria-label="${f.label}筛选">
      <span class="fg-label">${f.label}</span>
      ${f.options.map((o) => `<button class="filter-chip ${filters[f.key]?.has(o) ? 'on' : ''}" data-fk="${f.key}" data-fv="${o}" aria-pressed="${!!filters[f.key]?.has(o)}">${o}</button>`).join('')}
    </div>`).join('');
  $$('.filter-chip').forEach((chip) => chip.addEventListener('click', () => {
    const { fk, fv } = chip.dataset;
    filters[fk] = filters[fk] || new Set();
    filters[fk].has(fv) ? filters[fk].delete(fv) : filters[fk].add(fv);
    track('explore_filter', {});
    renderExplore();
  }));
  renderExploreResults();
}

function renderExploreResults() {
  const q = ($('#explore-search').value || '').trim().toLowerCase();
  const activeChips = Object.entries(filters).filter(([, s]) => s && s.size);
  $('#chips-selected').innerHTML = activeChips.flatMap(([k, set]) =>
    [...set].map((v) => `<span class="chip-selected">${FILTER_DEFS.find((f) => f.key === k).label}：${v}<button data-rk="${k}" data-rv="${v}" aria-label="移除筛选">✕</button></span>`)).join('');
  $$('#chips-selected button').forEach((b) => b.addEventListener('click', () => {
    filters[b.dataset.rk].delete(b.dataset.rv);
    renderExplore();
  }));

  let list = PERSONALITIES.filter((p) => {
    if (q) {
      const hay = [p.name, p.catchphrase, ...p.skills, ...p.destinations].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    for (const [k, set] of activeChips) {
      if (k === 'content') {
        if (![...set].some((v) => p.tags.content.includes(v))) return false;
      } else if (!set.has(p.tags[k])) return false;
    }
    return true;
  });
  const myResultId = lastResult?.winner || lastResult?.winners?.[0];
  $('#explore-count').textContent = `显示 ${list.length} / ${PERSONALITIES.length} 种风格`;
  $('#explore-empty').hidden = list.length > 0;
  $('#style-grid').innerHTML = list.map((p) => `
    <div class="style-card" data-id="${p.id}">
      ${p.id === myResultId ? '<span class="sc-mine">我的结果</span>' : ''}
      <img class="sc-img" src="${p.img}" alt="${p.name}">
      <h4>${p.emoji} ${p.name}</h4>
      <p class="sc-slogan">「${p.catchphrase}」</p>
      <div class="sc-traits">${p.traits.map((t) => `<span>${t}</span>`).join('')}</div>
      <div class="sc-actions">
        <button class="btn btn-ghost btn-sm" data-detail="${p.id}">查看详情</button>
        <button class="btn btn-secondary btn-sm ${compareSet.includes(p.id) ? 'joined' : ''}" data-cmp="${p.id}">${compareSet.includes(p.id) ? '已加入 ✓' : '＋ 加入比较'}</button>
      </div>
    </div>`).join('');

  $$('[data-detail]').forEach((b) => b.addEventListener('click', () => showStyleDetail(b.dataset.detail)));
  $$('[data-cmp]').forEach((b) => b.addEventListener('click', () => toggleCompare(b.dataset.cmp)));
  renderCompareBar();
}

function showStyleDetail(id) {
  const p = PERSONALITY_MAP[id];
  openModal(`
    <div class="modal-head">${p.emoji} ${p.name}<button class="modal-close" data-x aria-label="关闭">✕</button></div>
    <div class="modal-body">
      <div style="text-align:center"><img src="${p.img}" alt="" style="width:200px;border-radius:var(--r-md)"></div>
      <p style="text-align:center;color:var(--ink-soft)">「${p.catchphrase}」</p>
      <ul style="list-style:none;font-size:14px;line-height:2;margin-top:10px">
        <li>🧠 核心技能：${p.skills.join('、')}</li>
        <li>💔 致命伤：${p.fatalFlaw}</li>
        <li>🤝 适合同行：${p.compatibleWith.map((i) => PERSONALITY_MAP[i].name).join('、') || '—'}</li>
        <li>⚠️ 建议避雷：${p.avoidWith.map((i) => PERSONALITY_MAP[i].name).join('、') || '—'}</li>
        <li>🗺 适合目的地：${p.destinations.join('、')}</li>
        <li>💡 建议：${p.advice.join('；')}</li>
      </ul>
      ${p.video ? `<div style="text-align:center;margin-top:12px"><button class="btn btn-secondary btn-sm" id="btn-play-reveal">▶ 播放揭晓动画</button></div>` : ''}
    </div>`).querySelector('[data-x]').addEventListener('click', (e) => e.target.closest('.modal-mask').remove());
  const pb = document.querySelector('#btn-play-reveal');
  if (pb) pb.addEventListener('click', () => playReveal(p));
}

/* ---- 对比（2–3 个） ---- */
function toggleCompare(id) {
  if (compareSet.includes(id)) {
    compareSet = compareSet.filter((x) => x !== id);
  } else if (compareSet.length >= 3) {
    toast('最多比较 3 个，请先移除一个', 'warn');
    return;
  } else {
    compareSet.push(id);
  }
  renderExploreResults();
}

function renderCompareBar() {
  const bar = $('#compare-bar');
  bar.hidden = compareSet.length === 0;
  $('#compare-bar-text').textContent = `已选 ${compareSet.length} / 3`;
  $('#compare-bar-names').innerHTML = compareSet.map((id) =>
    `<span class="cb-name">${PERSONALITY_MAP[id].name}<button data-rm="${id}" aria-label="移除">✕</button></span>`).join('');
  $$('#compare-bar-names [data-rm]').forEach((b) => b.addEventListener('click', () => {
    compareSet = compareSet.filter((x) => x !== b.dataset.rm);
    renderExploreResults();
  }));
  $('#btn-compare-start').disabled = compareSet.length < 2;
}

$('#btn-compare-clear').addEventListener('click', () => { compareSet = []; renderExploreResults(); });
$('#btn-compare-start').addEventListener('click', () => { showScreen('compare'); renderCompare(); });
$('#btn-compare-back').addEventListener('click', () => { showScreen('explore'); renderExploreResults(); });
$('#btn-filter-reset').addEventListener('click', () => { filters = {}; $('#explore-search').value = ''; renderExplore(); });
$('#btn-filter-clear-all').addEventListener('click', () => { filters = {}; $('#explore-search').value = ''; renderExplore(); });
$('#explore-search').addEventListener('input', renderExploreResults);

function renderCompare() {
  const myResultId = lastResult?.winner || lastResult?.winners?.[0];
  const rows = [
    { label: '形象', render: (p) => `<img src="${p.img}" alt="${p.name}">` },
    { label: '口头禅', render: (p) => `「${p.catchphrase}」` },
    { label: '旅行节奏', render: (p) => p.tags.pace },
    { label: '决策方式', render: (p) => p.tags.decision },
    { label: '核心技能', render: (p) => p.skills.join('、') },
    { label: '致命伤', render: (p) => p.fatalFlaw },
    { label: '适合同行', render: (p) => p.compatibleWith.map((i) => PERSONALITY_MAP[i].name).join('、') || '—' },
    { label: '建议避雷', render: (p) => p.avoidWith.map((i) => PERSONALITY_MAP[i].name).join('、') || '—' },
    { label: '适合目的地', render: (p) => p.destinations.join('、') },
    { label: '本次得分', render: (p) => {
      const t = lastFullResult?.top3.find((x) => x.id === p.id);
      return t ? `<span class="ct-score">${t.score}分</span>` : '—';
    } },
  ];
  $('#compare-body').innerHTML = `
    <table class="compare-table">
      <thead><tr><th>对比项</th>${compareSet.map((id) => `<th>${PERSONALITY_MAP[id].emoji} ${PERSONALITY_MAP[id].name}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr><th>${r.label}</th>${compareSet.map((id) => `<td>${r.render(PERSONALITY_MAP[id])}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

/* =========================================================
 * 全局
 * ========================================================= */
$('#error-close').addEventListener('click', hideError);

/* 页面隐藏时暂停场景视频 */
document.addEventListener('visibilitychange', () => {
  const v = $('#scene-video');
  if (!v) return;
  if (document.hidden) v.pause();
  else if (!$('#scene-layer').hidden && !prefs.reducedMotion) v.play().catch(() => {});
  v.muted = false;
});

/* =========================================================
 * 全屏开场动画（/intro）
 * ========================================================= */
function initIntro() {
  const v = $('#intro-video');
  const poster = $('#intro-poster');
  const enterBtn = $('#btn-intro-enter');
  const skipBtn = $('#btn-intro-skip');
  const playBtn = $('#btn-intro-play');
  const titleBox = $('#intro-title-box');

  const showEnter = () => {
    skipBtn.hidden = true;
    playBtn.hidden = true;
    titleBox.hidden = false;
    enterBtn.hidden = false;
  };
  const fallbackToPoster = () => {
    v.hidden = true;
    poster.hidden = false;
    showEnter();
  };

  v.addEventListener('ended', showEnter);
  v.addEventListener('error', fallbackToPoster);
  const loadTimer = setTimeout(() => {
    if (!v.hidden && v.readyState < 2 && v.paused) playBtn.hidden = false;
  }, 4500);

  const soundBtn = $('#btn-intro-sound');

  /* 自动播放策略：先静音起播（保证一定能播），起播后尝试解除静音自动出声。
   * 注意：部分浏览器（Chrome 系）会对「无手势解除静音」的自动播放视频强制暂停，
   * 因此解除后立即检测——若被暂停则马上恢复静音播放 + 显示声音按钮，宁可不自动出声也不卡画面。 */
  let unmuteTried = false;
  const tryUnmute = () => {
    if (unmuteTried) return;
    unmuteTried = true;
    try { v.muted = false; } catch { /* 忽略 */ }
    if (v.muted) { soundBtn.hidden = false; return; }        // 被浏览器强制回静音 → 兜底按钮
    if (v.paused) {                                          // 解除静音导致被暂停 → 恢复播放优先
      v.muted = true;
      soundBtn.hidden = false;
      v.play().catch(() => {});
    }
  };
  v.addEventListener('playing', tryUnmute);
  v.muted = true;
  const p = v.play();
  if (p && p.then) {
    p.then(tryUnmute).catch(() => {
      clearTimeout(loadTimer);
      const q = v.play();
      if (q && q.catch) q.catch(() => { playBtn.hidden = false; });
    });
  }
  soundBtn.addEventListener('click', () => {
    v.muted = false;
    soundBtn.hidden = true;
    v.play().catch(() => {});
  });

  playBtn.addEventListener('click', () => {
    playBtn.hidden = true;
    v.muted = false;
    soundBtn.hidden = true;
    v.play().catch(fallbackToPoster);
  });
  skipBtn.addEventListener('click', () => { v.pause(); showEnter(); });

  enterBtn.addEventListener('click', () => {
    const intro = $('#screen-intro');
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.classList.remove('active', 'fade-out');
      showScreen('welcome');
      const wv = $('#welcome-video');
      if (wv && !prefs.reducedMotion) wv.play().catch(() => {});
    }, 880);
  });
}

/* =========================================================
 * 启动：读取本地会话与偏好
 * ========================================================= */
function boot() {
  applyMotionPref();
  prewarmVideoPosters();   // 全站视频挂首帧背景 + 预热全部封面（场景/揭晓/开场/分析）
  const loaded = loadSession();
  if (!loaded.ok) {
    showPersistentError(`上次会话无法恢复（${loaded.detail}）。可选择重新开始。`);
  } else if (loaded.session) {
    session = loaded.session;
  }
  lastResult = loadLastResult();
  initWelcome();
  initIntro();
  showScreen('intro');
}
boot();

})();
