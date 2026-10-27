/* =========================================================
 * prd-engine.js — 会话状态与规则引擎（纯逻辑，无 DOM）
 *
 * PRD 核心原则落地：
 * - 交互必须改变系统状态（每个操作先校验、后写入、再由 UI 播动画）
 * - 八维人格积分以流水（scoreLog）为唯一事实来源，可追溯、可复算
 * - 结果由七幕场景积分直接排名计算，可解释；同分按支持集中度裁决，
 *   镜像并列保留（V2.1/V2.2）
 * ========================================================= */

import {
  SESSION_VERSION, SCENARIO, PERSONA_INITIAL, PERSONA_META, PERSONA_CODES,
  PERSONALITIES, TENDENCIES, SETUP_SCORES, SCENES, SCENE_ORDER,
} from './prd-data.js';

/* ---------- 创建会话 ---------- */
export function createSession({ goalId, allocation, reducedMotion, focusId }) {
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
export function setScoreEntries(session, eventKey, deltas, reason, optionId = '', day = session.currentDay) {
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
export function personaScores(session) {
  const scores = Object.fromEntries(PERSONA_CODES.map((c) => [c, PERSONA_INITIAL]));
  for (const e of session.scoreLog || []) {
    if (e.persona in scores) scores[e.persona] = clamp(scores[e.persona] + e.delta, 0, 100);
  }
  return scores;
}

/* 三个展示倾向：组内加权平均（权重集中配置在 TENDENCIES） */
export function tendencyScores(personaMap) {
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
export function hasScored(session, eventKey) {
  return (session.scoreLog || []).some((e) => e.eventKey === eventKey);
}

/* 结算剧情场景：同一场景只能生效一个选项（幂等）。
 * 纯场景流：只改预算/体力/心情与八维积分，不再联动活动排程。 */
export function resolveScene(session, sceneId, optionId) {
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
export function computePersonaResult(session) {
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
export function saveSession(session) {
  try {
    localStorage.setItem('tap_journey_session_v1', JSON.stringify(session));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export function loadSession() {
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

export function clearSession() {
  try {
    localStorage.removeItem('tap_journey_session_v1');
    localStorage.removeItem('tap_last_result_v1');
    return { ok: true };
  } catch (e) { return { ok: false, error: e }; }
}

export function saveLastResult(result) {
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

export function loadLastResult() {
  try {
    const raw = localStorage.getItem('tap_last_result_v1');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ---------- 偏好（减少动画） ---------- */
export function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem('tap_preferences_v1') || '{}');
  } catch { return {}; }
}
export function savePrefs(prefs) {
  try { localStorage.setItem('tap_preferences_v1', JSON.stringify(prefs)); } catch { /* 忽略 */ }
}

/* ---------- 埋点适配层（PRD 14：未接分析服务时仅本地记录） ---------- */
export function track(event, payload = {}) {
  if (typeof console !== 'undefined' && console.debug) {
    console.debug(`[track] ${event}`, payload);
  }
}
