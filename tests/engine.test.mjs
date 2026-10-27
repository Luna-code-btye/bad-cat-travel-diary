/* =========================================================
 * engine.test.mjs — 现行引擎单元测试（Node 运行）
 * 覆盖：会话初始化与预算校验、记分流水幂等、分数边界 clamp、
 *       场景结算校验与状态变化、三倾向聚合、本地存储降级。
 * 说明：旧模拟器（三天行程/活动排程/事件/computeResult）已随
 *       V2.3 清理移除，其测试一并退役。
 * 用法：node tests/engine.test.mjs
 * ========================================================= */

import {
  PERSONA_CODES, PERSONA_INITIAL, TENDENCIES, SCENES, SCENE_ORDER,
} from '../js/prd-data.js';
import {
  createSession, setScoreEntries, hasScored, personaScores, tendencyScores,
  resolveScene, saveSession, loadSession,
} from '../js/prd-engine.js';

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { pass++; console.log(`  ✓ ${msg}`); }
  else { fail++; console.error(`  ✗ FAIL: ${msg}`); }
}
function freshSession(focusId = null) {
  return createSession({
    goalId: 'explore',
    allocation: { hotel: 1400, food: 1600, experience: 2000 },
    focusId,
  });
}

console.log('\n=== 1. 会话初始化与预算校验 ===');
{
  const s = freshSession();
  assert(s.budget.remaining === 5000 && s.phase === 'planning', '会话初始化：预算 5000，阶段 planning');
  assert(s.energy === 100 && s.mood === 75, '初始体力 100 / 心情 75');
  assert(s.sceneQueue.length === 7 && s.sceneLog.length === 0, `七个场景进入队列（${s.sceneQueue.length}）`);
  let threw = false;
  try { createSession({ goalId: 'food', allocation: { hotel: 2000, food: 2000, experience: 2000 } }); } catch { threw = true; }
  assert(threw, '分配超出总预算时拒绝创建');
  // 序列化往返（模拟 localStorage）
  const raw = JSON.stringify(s);
  assert(JSON.parse(raw).version === 3, '会话可序列化且带当前版本号（v3）');
}

console.log('\n=== 2. 记分流水：幂等覆盖与非法人格过滤 ===');
{
  const s = freshSession();
  setScoreEntries(s, 'scene:hike_rain', { A: 2, F: 1 }, '首次结算');
  const n1 = s.scoreLog.length;
  setScoreEntries(s, 'scene:hike_rain', { A: 2, F: 1, X: 9 }, '重复事件覆盖'); // X 非法人格应被过滤
  assert(s.scoreLog.length === n1, `同一 eventKey 幂等覆盖，不重复累加（流水 ${n1} 条）`);
  assert(!s.scoreLog.some((e) => e.persona === 'X'), '非法人格代码被过滤');
  assert(hasScored(s, 'scene:hike_rain') && !hasScored(s, 'scene:queue'), 'hasScored 判定准确');
  assert(s.scoreLog.every((e) => e.reason && e.t > 0), '每条流水含依据与时间戳（可追溯）');
}

console.log('\n=== 3. 分数边界：clamp 0–100 ===');
{
  const s = freshSession();
  setScoreEntries(s, 'test:overflow', Object.fromEntries(PERSONA_CODES.map((c) => [c, 200])), '超上限');
  const hi = personaScores(s);
  assert(Object.values(hi).every((v) => v === 100), `超上限后全部夹到 100（A=${hi.A}）`);
  setScoreEntries(s, 'test:overflow', Object.fromEntries(PERSONA_CODES.map((c) => [c, -500])), '超下限');
  const lo = personaScores(s);
  assert(Object.values(lo).every((v) => v === 0), `超下限后全部夹到 0（A=${lo.A}）`);
  // 相同输入序列 → 相同结果（确定性）
  const s2 = freshSession();
  setScoreEntries(s2, 'test:overflow', Object.fromEntries(PERSONA_CODES.map((c) => [c, 200])), '超上限');
  assert(JSON.stringify(personaScores(s2)) === JSON.stringify(hi), '相同流水 → 相同分数（确定性）');
}

console.log('\n=== 4. resolveScene：校验、状态变化与完成判定 ===');
{
  const s = freshSession();
  const r1 = resolveScene(s, 'no_such_scene', 'x');
  assert(!r1.ok && r1.reason.includes('未知场景'), `未知场景被拒绝（${r1.reason}）`);
  const r2 = resolveScene(s, 'hike_rain', 'no_such_option');
  assert(!r2.ok && r2.reason.includes('未知选项'), `未知选项被拒绝（${r2.reason}）`);
  // 预算不足：把剩余预算压到低于任何场景一选项
  s.budget.remaining = 0;
  const costly = SCENES.hike_rain.options.find((o) => o.cost > 0) || SCENES.hike_rain.options[0];
  const r3 = resolveScene(s, 'hike_rain', costly.id);
  assert(!r3.ok && r3.reason.includes('预算不足'), `预算不足被拒绝（${r3.reason}）`);
  s.budget.remaining = 5000;
  // 正常结算：资源与日志真实变化
  const opt = SCENES.hike_rain.options.find((o) => o.id !== costly.id);
  const b0 = s.budget.remaining, e0 = s.energy, m0 = s.mood;
  const r4 = resolveScene(s, 'hike_rain', opt.id);
  assert(r4.ok, '场景一可正常结算');
  assert(s.budget.remaining === b0 - opt.cost, `预算扣减 ${opt.cost}（${b0}→${s.budget.remaining}）`);
  assert(s.energy === Math.max(0, Math.min(100, e0 + (opt.energyDelta || 0))), `体力按选项变化（${opt.energyDelta || 0}）`);
  assert(s.mood === Math.max(0, Math.min(100, m0 + (opt.moodDelta || 0))), `心情按选项变化（${opt.moodDelta || 0}）`);
  assert(!s.sceneQueue.includes('hike_rain'), '已结算场景出队');
  const r5 = resolveScene(s, 'hike_rain', opt.id);
  assert(!r5.ok && r5.reason.includes('已结算'), `重复结算被拒绝（${r5.reason}）`);
  // 七幕全部结算 → phase completed
  for (const sid of SCENE_ORDER) {
    if (sid === 'hike_rain') continue;
    const o = SCENES[sid].options.find((o2) => o2.cost <= s.budget.remaining) || SCENES[sid].options[0];
    resolveScene(s, sid, o.id);
  }
  assert(s.sceneQueue.length === 0 && s.phase === 'completed', '七幕全部结算 → phase completed');
}

console.log('\n=== 5. 三倾向聚合：权重方向与边界 ===');
{
  const w = TENDENCIES.find((t) => t.key === 'enjoy').weights;
  assert(Object.keys(w).every((c) => PERSONA_CODES.includes(c)), '倾向权重均指向有效人格维度');
  const s = freshSession('stay'); // C+2
  const ps = personaScores(s);
  const t = tendencyScores(ps);
  assert(t.enjoy === 51 && t.plan === 50 && t.adapt === 50, `住得舒服仅拉升 enjoy（${t.plan}/${t.enjoy}/${t.adapt}）`);
  // 极端分数下倾向不越界
  setScoreEntries(s, 'test:overflow', Object.fromEntries(PERSONA_CODES.map((c) => [c, 200])), '超上限');
  const t2 = tendencyScores(personaScores(s));
  assert(Object.values(t2).every((v) => v >= 0 && v <= 100 && Number.isInteger(v)), '倾向聚合输出 0–100 整数');
}

console.log('\n=== 6. 本地存储优雅降级（Node 无 localStorage） ===');
{
  const sr = saveSession(freshSession());
  assert(sr.ok === false && sr.error, `saveSession 优雅降级（ok=${sr.ok}）`);
  const lr = loadSession();
  const okShape = (lr.ok === true && lr.session === null) || (lr.ok === false && lr.reason === 'corrupted');
  assert(okShape, `loadSession 优雅降级（ok=${lr.ok}, reason=${lr.reason || 'session:null'}）`);
}

console.log(`\n=== 结果: ${pass} 通过, ${fail} 失败 ===`);
process.exit(fail > 0 ? 1 : 0);
