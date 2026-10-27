/* =========================================================
 * prd-app.js — 视图与交互层（纯场景流版本）
 * 流程：开场动画 → 主页 → 初始化（目标+预算去向）
 *       → 场景一 → 场景二 → 场景三 → 结果页
 * 原则：先校验 → 写入状态 → 保存 → 再更新 UI / 播动画。
 * ========================================================= */

import {
  PERSONALITIES, PERSONALITY_MAP, GOALS, SPEND_FOCUS, SCENARIO,
  TENDENCIES, SCENES, SCENE_ORDER, DIMENSIONS, DIM_NAMES,
} from './prd-data.js';
import {
  createSession, resolveScene, personaScores, tendencyScores, computePersonaResult,
  saveSession, loadSession, clearSession, saveLastResult, loadLastResult,
  loadPrefs, savePrefs, track,
} from './prd-engine.js';

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
