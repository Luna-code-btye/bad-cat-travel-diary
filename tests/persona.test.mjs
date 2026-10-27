/* =========================================================
 * persona.test.mjs — 八维人格积分 / 三倾向聚合 / 七场景测试
 * 计分规则：初始 50，预算分配四选一，七个场景各四选一，
 *           并列（与最高分同分）完整保留。
 * 运行：node tests/persona.test.mjs
 * ========================================================= */
import { PERSONA_INITIAL, PERSONA_META, PERSONALITIES, TENDENCIES, SCENES, SCENE_ORDER, SPEND_FOCUS, SETUP_SCORES } from '../js/prd-data.js';
import {
  createSession, resolveScene, personaScores, tendencyScores, computePersonaResult,
} from '../js/prd-engine.js';

let pass = 0, fail = 0;
function assert(cond, label) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.error(`  ✗ ${label}`); }
}
const baseAlloc = { hotel: 1400, food: 1600, experience: 2000 };

function newSession(focusId = 'balance') {
  return createSession({ goalId: 'explore', allocation: { ...baseAlloc }, focusId, reducedMotion: false });
}

console.log('=== 1. 初始分数 ===');
{
  const s = newSession();
  const ps = personaScores(s);
  assert(PERSONA_META.every((p) => ps[p.code] === PERSONA_INITIAL + (s.scoreLog.find((e) => e.persona === p.code)?.delta || 0)), '八维分数 = 50 + 流水增量');
  const t = tendencyScores(ps);
  assert(['plan', 'enjoy', 'adapt'].every((k) => typeof t[k] === 'number' && !Number.isNaN(t[k])), '三倾向均为有效数字');
}

console.log('\n=== 2. 初始预算分配计分（住得舒服 → C+2） ===');
{
  const s = newSession('stay');
  const ps = personaScores(s);
  assert(ps.C === 52, `C 从 50 → ${ps.C}`);
  const t = tendencyScores(ps);
  assert(t.enjoy === 51 && t.plan === 50 && t.adapt === 50, `三倾向：计划 ${t.plan} / 享受 ${t.enjoy} / 应变 ${t.adapt}`);
  const s2 = newSession('balance');
  const ps2 = personaScores(s2);
  assert(ps2.A === 51 && ps2.F === 52, `均衡安排 → A+1 F+2（A ${ps2.A} / F ${ps2.F}）`);
}

console.log('\n=== 3. 场景一：下雨（改路线 A+2 F+1） ===');
{
  const s = newSession('balance'); // A+1 F+2
  assert(s.sceneQueue.includes('hike_rain'), '预算分配后场景一进入队列');
  const before = personaScores(s);
  const r = resolveScene(s, 'hike_rain', 'indoor_plan'); // A+2 F+1
  assert(r.ok, '场景一可结算');
  const after = personaScores(s);
  assert(after.A === before.A + 2 && after.F === before.F + 1, `A/F 分数按表变化（A ${before.A}→${after.A}, F ${before.F}→${after.F}）`);
  assert(s.sceneLog.length === 1 && s.sceneLog[0].optionId === 'indoor_plan', '场景日志记录选项');
  const again = resolveScene(s, 'hike_rain', 'cafe_rain');
  assert(!again.ok, '同一场景重复结算被拒绝（防重复计分）');
  assert(personaScores(s).A === before.A + 2, '重复结算未改变分数');
}

console.log('\n=== 4. 场景二：排队（借位拍照 D+2 A+1） ===');
{
  const s = newSession('balance');
  const before = personaScores(s);
  const r = resolveScene(s, 'queue', 'borrow_angle'); // D+2 A+1
  assert(r.ok, '场景二可结算');
  const after = personaScores(s);
  assert(after.D === before.D + 2 && after.A === before.A + 1, `D +2 / A +1（D ${before.D}→${after.D}，A ${before.A}→${after.A}）`);
}

console.log('\n=== 5. 场景三：预算只剩 ¥300（苍蝇馆子 F+2 E+2） ===');
{
  const s = newSession('balance');
  const budget0 = s.budget.remaining;
  const before = personaScores(s);
  resolveScene(s, 'budget_short', 'cheap_yummy'); // F+2 E+2
  const after = personaScores(s);
  assert(s.budget.remaining === budget0, '预算金额不变（仅记录行为）');
  assert(after.F === before.F + 2 && after.E === before.E + 2, `F +2 / E +2（F ${before.F}→${after.F}，E ${before.E}→${after.E}）`);
}

console.log('\n=== 6. 场景结算的资源变化（预算/体力/心情） ===');
{
  const s = newSession('balance');
  const opt = SCENES.hike_rain.options.find((o) => o.id === 'cafe_rain');
  const b0 = s.budget.remaining, e0 = s.energy, m0 = s.mood;
  const r = resolveScene(s, 'hike_rain', opt.id);
  assert(r.ok, '场景可结算');
  assert(s.budget.remaining === b0 - opt.cost, `预算按选项扣减 ${opt.cost}（${b0}→${s.budget.remaining}）`);
  assert(s.energy === Math.max(0, Math.min(100, e0 + (opt.energyDelta || 0))), `体力按选项变化（${opt.energyDelta || 0}）`);
  assert(s.mood === Math.max(0, Math.min(100, m0 + (opt.moodDelta || 0))), `心情按选项变化（${opt.moodDelta || 0}）`);
}

console.log('\n=== 7. 三倾向与最终人格共存（纯场景流） ===');
{
  const s = newSession('play'); // B+1 D+2 → enjoy 侧初始偏高
  resolveScene(s, 'hike_rain', 'rain_stroll');
  resolveScene(s, 'queue', 'borrow_angle');       // D+2 A+1
  resolveScene(s, 'budget_short', 'keep_wish');   // C+1 G+1 F+1
  resolveScene(s, 'photo_spot', 'shoot_wolf');    // H+2 D+2
  resolveScene(s, 'eat_local', 'slow_diner');     // C+2 E+1
  resolveScene(s, 'climb_mountain', 'foot_stroll'); // C+2
  resolveScene(s, 'sunrise', 'wake_wolf');        // H+2 D+1
  const scores = personaScores(s);
  const tend = tendencyScores(scores);
  assert(Object.values(tend).every((v) => Number.isInteger(v) && v >= 0 && v <= 100), '三个综合分数均为 0–100 整数');
  assert(tend.enjoy > 50, `出片/体验行为拉升「享受与体验」（enjoy ${tend.enjoy}）`);
  const r = computePersonaResult(s);
  assert(r.ok, '七幕完成后结果可计算');
  assert(r.top3.length === 3 && r.top3.every((t) => !Number.isNaN(t.score)), 'Top3 分数无 NaN');
}

console.log('\n=== 8. 七幕完成 → 人格结果（computePersonaResult） ===');
{
  // 未完成时不能出结果
  const s0 = newSession('balance');
  const r0 = computePersonaResult(s0);
  assert(!r0.ok && r0.problems.length > 0, '七幕未完成时拒绝出结果并说明原因');

  // 佛系路线：探索/随性选项 → G 应为最高
  const s1 = newSession('balance');
  resolveScene(s1, 'hike_rain', 'rain_stroll');       // G+2 D+1
  resolveScene(s1, 'queue', 'alley_treasure');        // G+2 D+1
  resolveScene(s1, 'budget_short', 'keep_wish');      // C+1 G+1 F+1
  resolveScene(s1, 'photo_spot', 'quiet_corner');     // G+2
  resolveScene(s1, 'eat_local', 'slow_diner');        // C+2 E+1
  resolveScene(s1, 'climb_mountain', 'foot_stroll');  // C+2
  resolveScene(s1, 'sunrise', 'go_with_flow');        // G+2 C+1
  const r1 = computePersonaResult(s1);
  assert(r1.ok, '七幕完成后可出结果');
  assert(r1.stats.sceneCount === 7, `结果统计场景数 = 7（实际 ${r1.stats.sceneCount}）`);
  assert(r1.top3[0].key === 'wanderer', `佛系选择 → Top1 佛系流浪汉（实际 ${r1.top3[0].name}）`);
  assert(r1.evidence.length >= 2, `结果含行为依据（${r1.evidence.length} 条）`);
  assert(!JSON.stringify(r1).includes('undefined'), '结果数据无 undefined');

  // 躺平路线：C 应为最高
  const s2 = newSession('stay'); // C+2
  resolveScene(s2, 'hike_rain', 'cafe_rain');         // C+2 E+1
  resolveScene(s2, 'queue', 'no_queue');              // H+2 G+1
  resolveScene(s2, 'budget_short', 'keep_wish');      // C+1 G+1 F+1
  resolveScene(s2, 'photo_spot', 'shoot_wolf');       // H+2 D+2
  resolveScene(s2, 'eat_local', 'slow_diner');        // C+2 E+1
  resolveScene(s2, 'climb_mountain', 'foot_stroll');  // C+2
  resolveScene(s2, 'sunrise', 'go_with_flow');        // G+2 C+1
  const r2 = computePersonaResult(s2);
  assert(r2.ok && r2.top3[0].key === 'hotel', `躺平选择 → Top1 酒店躺平王（实际 ${r2.top3[0]?.name}）`);
}

console.log('\n=== 9. 并列裁决规则（同分 → 支持集中度 Σdelta²；仍同则保留） ===');
{
  const codes = PERSONA_META.map((p) => p.code);

  /* 独立复算函数：按计分表直接算每个组合的裁决结果（与引擎实现解耦） */
  const expected = (focusId, picks) => {
    const sc = Object.fromEntries(codes.map((c) => [c, 50]));
    const conc = Object.fromEntries(codes.map((c) => [c, 0]));
    for (const [k, v] of Object.entries(SETUP_SCORES[focusId])) if (codes.includes(k)) { sc[k] += v; conc[k] += v * v; }
    SCENE_ORDER.forEach((sid, i) => {
      const opt = SCENES[sid].options.find((o) => o.id === picks[i]);
      for (const [k, v] of Object.entries(opt.scores)) { sc[k] += v; conc[k] += v * v; }
    });
    const top = Math.max(...codes.map((c) => sc[c]));
    let winners = codes.filter((c) => sc[c] === top);
    if (winners.length > 1) {
      const best = Math.max(...winners.map((c) => conc[c]));
      winners = winners.filter((c) => conc[c] === best);
    }
    return { winners: winners.sort(), rawTied: codes.filter((c) => sc[c] === top).length };
  };

  // 从全量组合中找「同分但集中度不同」的组合：验证裁决方向
  const opts = SCENE_ORDER.map((id) => SCENES[id].options);
  let foundBreak = null, foundKeep = null;
  outer:
  for (const f of SPEND_FOCUS) {
    const idx = new Array(7).fill(0);
    while (true) {
      const picks = opts.map((o, i) => o[idx[i]].id);
      const ex = expected(f.id, picks);
      if (ex.rawTied > 1 && ex.winners.length === 1 && !foundBreak) {
        foundBreak = { focusId: f.id, picks, ex };
      }
      if (ex.rawTied > 1 && ex.winners.length > 1 && !foundKeep) {
        foundKeep = { focusId: f.id, picks, ex };
      }
      if (foundBreak && foundKeep) break outer;
      let j = 6;
      while (j >= 0 && ++idx[j] === 4) { idx[j] = 0; j--; }
      if (j < 0) break;
    }
  }
  assert(!!foundBreak && !!foundKeep, '存在可裁决并列与镜像并列两类组合');
  for (const [label, found] of [['集中度裁决', foundBreak], ['镜像保留', foundKeep]]) {
    if (!found) continue;
    const s = newSession(found.focusId);
    found.picks.forEach((pid, i) => resolveScene(s, SCENE_ORDER[i], pid));
    const r = computePersonaResult(s);
    const got = (r.winners || [r.winner]).map((id) => PERSONA_META.find((m) => m.key === PERSONALITIES.find((p) => p.id === id).key).code).sort();
    assert(JSON.stringify(got) === JSON.stringify(found.ex.winners),
      `${label}：期望 ${found.ex.winners.join('=')}，实际 ${got.join('=')}`);
    if (label === '集中度裁决') console.log(`    裁决组合（同分 ${found.ex.rawTied} 人 → 单胜出）：${found.picks.join(' / ')}`);
  }

  // 非并列时 winner 唯一
  const s3 = newSession('balance');
  SCENE_ORDER.forEach((sid) => {
    const opt = SCENES[sid].options.find((o) => o.scores.G);
    resolveScene(s3, sid, opt ? opt.id : SCENES[sid].options[0].id);
  });
  const r3 = computePersonaResult(s3);
  assert(r3.type === 'single' || (r3.type === 'tie'), '结果类型有效');
}

console.log('\n=== 10. 全量 65,536 种组合分布验证（按引擎裁决口径） ===');
{
  const codes = PERSONA_META.map((p) => p.code);
  const win = Object.fromEntries(codes.map((c) => [c, 0]));
  let total = 0, tieCombos = 0, shownTieCombos = 0, maxTie = 0;
  for (const f of SPEND_FOCUS) {
    const base = Object.fromEntries(codes.map((c) => [c, 50]));
    const conc0 = Object.fromEntries(codes.map((c) => [c, 0]));
    for (const [k, v] of Object.entries(SETUP_SCORES[f.id])) if (codes.includes(k)) { base[k] += v; conc0[k] += v * v; }
    const opts = SCENE_ORDER.map((id) => SCENES[id].options);
    const idx = new Array(7).fill(0);
    while (true) {
      const sc = { ...base }, conc = { ...conc0 };
      for (let i = 0; i < 7; i++) {
        for (const [k, v] of Object.entries(opts[i][idx[i]].scores)) { sc[k] += v; conc[k] += v * v; }
      }
      const top = Math.max(...codes.map((c) => sc[c]));
      let winners = codes.filter((c) => sc[c] === top);
      total++;
      if (winners.length > 1) {
        tieCombos++;
        maxTie = Math.max(maxTie, winners.length);
        const best = Math.max(...winners.map((c) => conc[c]));
        winners = winners.filter((c) => conc[c] === best);
      }
      if (winners.length > 1) shownTieCombos++;
      for (const w of winners) win[w]++;
      let j = 6;
      while (j >= 0 && ++idx[j] === 4) { idx[j] = 0; j--; }
      if (j < 0) break;
    }
  }
  assert(total === 4 * 4 ** 7, `总组合数 = 65,536（实际 ${total}）`);
  const rates = codes.map((c) => win[c] / total);
  const lo = Math.min(...rates), hi = Math.max(...rates);
  assert(codes.every((c) => win[c] > 0), '无死胡同人格（八维全部可达 Top1）');
  assert(lo >= 0.08 && hi <= 0.30, `裁决后胜出率收敛在合理区间（${(lo * 100).toFixed(1)}% ~ ${(hi * 100).toFixed(1)}%）`);
  assert(shownTieCombos / total <= 0.15, `裁决后展示并列率 ≤ 15%（实际 ${(shownTieCombos / total * 100).toFixed(1)}%）`);
  console.log(`    原始同分并列 ${tieCombos} 个（${(tieCombos / total * 100).toFixed(1)}%）→ 集中度裁决后展示并列 ${shownTieCombos} 个（${(shownTieCombos / total * 100).toFixed(1)}%），最大并列 ${maxTie} 项`);
  console.log(`    裁决后胜出率：${codes.map((c) => `${c} ${(win[c] / total * 100).toFixed(1)}%`).join(' ')}`);
}

console.log(`\n=== 结果: ${pass} 通过, ${fail} 失败 ===`);
if (fail) process.exitCode = 1;
