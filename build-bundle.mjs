/* =========================================================
 * build-bundle.mjs — 把 ES Module 源码打包成单文件经典脚本
 * 目的：支持 file:// 双击直接打开（浏览器禁止 file:// 加载模块）。
 * 用法：node build-bundle.mjs
 * 顺序：prd-data → prd-engine → prd-app（依赖顺序）
 * 处理：删除 import 语句、去掉 export 前缀，合并后共享同一作用域。
 * 注意：修改了 js/ 源码后必须重新运行本脚本。
 * ========================================================= */
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = ['js/prd-data.js', 'js/prd-engine.js', 'js/prd-app.js'];

function stripModule(src) {
  return src
    // 多行具名导入：import { a, b,\n c } from './x.js';
    .replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?/gs, '')
    // 默认/裸导入：import x from '...';
    .replace(/import\s+[^;{]+from\s*['"][^'"]+['"];?/g, '')
    // 导出去掉 export 前缀（函数/常量声明保留为普通声明）
    .replace(/^export\s+(?=(function|const|let|var|class))/gm, '');
}

let out = '/* 自动生成：node build-bundle.mjs —— 请勿手编，源码在 js/prd-*.js */\n(function(){\n"use strict";\n';
for (const f of FILES) {
  out += `\n/* ======== ${f} ======== */\n` + stripModule(readFileSync(f, 'utf8')) + '\n';
}
out += '})();\n';
writeFileSync('js/app.bundle.js', out);
console.log('bundle written:', 'js/app.bundle.js', out.length, 'bytes');
