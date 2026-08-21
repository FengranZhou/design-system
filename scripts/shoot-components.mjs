/**
 * 给每个组件拍一张示意图 —— 扩展的组件列表要靠它认脸
 * ============================================================================
 *
 * ## 为什么需要
 *
 * 扩展里「/」唤起的组件列表原本只有文字，选组件全靠读名字。有图之后一眼
 * 就能认出「哦这个就是我要的那种按钮」，尤其是同类组件多的时候
 * （Dialog / Drawer / Popconfirm 都是"弹出来的东西"）。
 *
 * ## 图从哪来：真实 demo，不是手绘
 *
 * 手绘 SVG 画得再像，改了品牌色 / 圆角 / 字重它也不会变，很快就与设计系统
 * 对不上。这里直接拍 demo —— demo 引的就是 `el-theme` 源头，**改源头重跑
 * 一次脚本，所有图跟着变**。
 *
 * ## 怎么拍
 *
 * 用系统自带的 Chrome 跑 headless（不引入 Playwright 那 300MB 依赖），
 * 走 CDP 控制：
 *   ① 起静态服务托管 demo/dist
 *   ② Chrome 远程调试端口打开页面
 *   ③ 注入脚本：把目标 section 拎出来单独铺满视口（demo 是单页，直接滚
 *      过去会带上一堆无关内容）
 *   ④ Page.captureScreenshot 拍下来
 *
 * ⚠️ 为什么不用 `--screenshot`：那是"加载完直接拍"，中间插不进自定义脚本，
 *    拍到的永远是整页。必须走 CDP 才能先改 DOM 再拍。
 *
 * 产物写进 `scripts/component-shots.json`（base64 webp），由
 * build-catalog.mjs 合进 catalog，随现有同步机制分发 —— 扩展拉 catalog 时
 * 就一并拿到图，不用额外请求。
 *
 * ## 增量：只拍长相真的变了的
 *
 * 每张图连同一个指纹一起存（`marks`）：该组件的 demo 文件哈希 + el-theme
 * 与 design-token 全部样式的哈希。下次跑时指纹没变就跳过 —— 没动过组件时
 * 整个脚本 0.1 秒结束，所以能无脑挂在 pre-push 里。
 * 改了主题色 / 圆角这类全局样式，第二段哈希会变，34 张自动全部重拍。
 *
 * ## 用法
 *
 *   node scripts/shoot-components.mjs            # 增量重拍（pre-push 自动跑）
 *   node scripts/shoot-components.mjs button     # 指定组件，强制重拍
 *   node scripts/shoot-components.mjs --missing  # 只补还没有图的
 *
 * 跑之前 demo 要先 build（`cd demo && pnpm build`）。
 */

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import { spawn } from 'child_process'
import { createHash } from 'crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'demo/dist')
const OUT = join(ROOT, 'scripts/component-shots.json')

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 8933
const CDP_PORT = 9333

/** 取景画布（大一些拍全，之后按内容裁切） */
const W = 820
const H = 460
/** 最终出图尺寸（扩展列表里的缩略图，2x） */
const OUT_W = 260
const OUT_H = 140

/**
 * 一个组件的"长相指纹"。
 *
 * 图应该在**组件长相变了**的时候重拍，而不是每次都重拍 34 张（40 秒）。
 * 长相由两部分决定：
 *   ① 该组件的 demo 文件 —— 演示的内容变了，图自然要变
 *   ② el-theme 全部样式 —— 改了品牌色 / 圆角 / 字重，**所有**组件都要重拍
 * 第二项是全局的，所以任何 el-theme 改动都会让全部指纹失效，这正是我们要的。
 */
function themeHash() {
  const dir = join(ROOT, 'design-spec/el-theme')
  const h = createHash('sha1')
  const walk = (d) => {
    for (const name of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) {
      const p = join(d, name.name)
      if (name.isDirectory()) walk(p)
      else if (/\.(scss|css)$/.test(name.name)) h.update(readFileSync(p))
    }
  }
  try { walk(dir) } catch (_) {}
  // 令牌层也算进去：改了色板 / 间距同样会改变长相
  try {
    const td = join(ROOT, 'design-spec/design-token')
    walk(td)
  } catch (_) {}
  return h.digest('hex').slice(0, 12)
}

const THEME_HASH = themeHash()

/** demo 锚点 → 该组件的 demo 文件内容哈希 */
function demoHash(anchor) {
  const ANCHOR_TO_DEMO = {
    'date-picker': 'DatePicker', 'data-display': 'DataDisplay',
    table: 'Table', 'step-bar': 'StepBar',
  }
  const key = ANCHOR_TO_DEMO[anchor] ||
    anchor.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())
  const dirs = [
    join(ROOT, 'demo/src/components'),
    join(ROOT, 'demo/src/components/biz'),
  ]
  for (const d of dirs) {
    const f = join(d, key + 'Demo.vue')
    if (existsSync(f)) {
      return createHash('sha1').update(readFileSync(f)).digest('hex').slice(0, 12)
    }
  }
  return 'nofile'
}

/** 组件当前的完整指纹（demo 内容 + 主题） */
function fingerprint(anchor) {
  return demoHash(anchor) + '.' + THEME_HASH
}

// ── demo 左侧导航 → 组件清单（与 build-catalog 同一数据源）─────────────
function navAnchors() {
  const src = readFileSync(join(ROOT, 'demo/src/App.vue'), 'utf8')
  const out = []
  for (const tab of ['component', 'business']) {
    const re = new RegExp(`currentTopTab === '${tab}'"[\\s\\S]*?</template>`, 'm')
    const block = src.match(re)
    if (!block) continue
    for (const line of block[0].split('\n')) {
      if (/^\s*<!--/.test(line)) continue
      const m = line.match(/href="#([\w-]+)"[^>]*>([^<]+)</)
      if (m && m[1] !== 'other' && m[1] !== 'data-display') {
        out.push({ anchor: m[1], name: m[2].trim(), tab })
      }
    }
  }
  return out
}

// ── 静态服务 ────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.otf': 'font/otf',
  '.ttf': 'font/ttf', '.webp': 'image/webp',
}

function serve() {
  return new Promise((resolve) => {
    const srv = createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0])
      if (p === '/') p = '/index.html'
      const file = join(DIST, p)
      if (!existsSync(file) || statSync(file).isDirectory()) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(readFileSync(join(DIST, 'index.html')))
        return
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
      res.end(readFileSync(file))
    })
    srv.listen(PORT, () => resolve(srv))
  })
}

// ── 极简 CDP 客户端（Node 原生 WebSocket，不引第三方库）──────────────
class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.waiting = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.waiting.has(msg.id)) {
        const { resolve, reject } = this.waiting.get(msg.id)
        this.waiting.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      }
    })
  }
  send(method, params) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.waiting.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params: params || {} }))
      setTimeout(() => {
        if (this.waiting.has(id)) {
          this.waiting.delete(id)
          reject(new Error(method + ' 超时'))
        }
      }, 30000)
    })
  }
  static connect(url) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url)
      ws.addEventListener('open', () => resolve(new CDP(ws)))
      ws.addEventListener('error', reject)
    })
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * 注入页面的取景脚本。
 *
 * demo 是单页 + 顶部 tab，目标 section 可能不在当前 tab 里（DOM 中不存在）。
 * 所以先把两个 tab 都点一遍让它们渲染过，再把目标 section 克隆出来铺满视口。
 */
function framingScript(anchor) {
  return `
    (function () {
      var old = document.getElementById('__shot_host');
      if (old) old.remove();
      var s = document.getElementById(${JSON.stringify(anchor)});
      if (!s) return JSON.stringify({ ok: false });
      var host = document.createElement('div');
      host.id = '__shot_host';
      host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;' +
        'padding:20px;box-sizing:border-box;overflow:hidden;';
      var clone = s.cloneNode(true);
      // 下面这些都不是"组件长什么样"，一律剥掉：
      //   demo-section__title  区块大标题（列表里已有组件名）
      //   config-card          配置项卡片（demo 的演示脚手架）
      //   demo-label/demo-desc 说明文字（拍进去就看不见组件了）
      var t = clone.querySelector('.demo-section__title');
      if (t) t.remove();
      clone.querySelectorAll('.config-card,.demo-label,.demo-desc,.demo-note')
        .forEach(function (c) { c.remove(); });
      // 只取第一个有实际内容的展示块 —— 一个 section 常有好几块
      // （Dialog 有"操作弹窗/提示弹窗/警示弹窗"三块），列表缩略图取头一个够了
      var blocks = clone.querySelectorAll('.demo-block');
      if (blocks.length > 1) {
        for (var i = blocks.length - 1; i >= 1; i--) blocks[i].remove();
      }
      clone.style.cssText = 'margin:0;padding:0;width:100%;';
      host.appendChild(clone);
      document.body.appendChild(host);
      // 返回内容实际占的范围，交给 CDP 按 clip 精确裁切 ——
      // 固定尺寸拍会留一大片白，缩略图里组件就变得很小
      var r = clone.getBoundingClientRect();
      return JSON.stringify({
        ok: true,
        x: Math.max(0, r.left - 12),
        y: Math.max(0, r.top - 12),
        w: Math.min(${W} - 8, r.width + 24),
        h: Math.min(${H} - 8, r.height + 24),
      });
    })();
  `
}

// ── main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const only = args.filter((a) => !a.startsWith('--'))
const missingOnly = args.includes('--missing')

if (!existsSync(DIST)) {
  console.error('✗ demo/dist 不存在 —— 先跑：cd demo && pnpm build')
  process.exit(1)
}

const items = navAnchors().filter((x) => !only.length || only.includes(x.anchor))
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const shots = prev.shots || {}
const marks = prev.marks || {}      // anchor → 拍那张图时的指纹

// 算出哪些真的需要重拍：指纹没变的直接跳过。
// 这样 pre-push 里挂着跑也不心疼 —— 没动过组件时是零成本。
const todo = []
const skipped = []
for (const it of items) {
  if (missingOnly && shots[it.anchor]) { skipped.push(it); continue }
  const fp = fingerprint(it.anchor)
  if (shots[it.anchor] && marks[it.anchor] === fp && !only.includes(it.anchor)) {
    skipped.push(it)
    continue
  }
  it._fp = fp
  todo.push(it)
}

if (!todo.length) {
  console.log(`✓ 全部 ${items.length} 个组件的图都是最新的，无需重拍`)
  process.exit(0)
}

const srv = await serve()
console.log(`▸ 静态服务 :${PORT}`)

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  `--remote-debugging-port=${CDP_PORT}`,
  '--user-data-dir=/tmp/liaison-shot-profile',
  'about:blank',
], { stdio: 'ignore', detached: false })

// 等 CDP 就绪
let wsUrl = ''
for (let i = 0; i < 40; i++) {
  await sleep(250)
  try {
    const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`)
    const d = await r.json()
    wsUrl = d.webSocketDebuggerUrl
    if (wsUrl) break
  } catch (_) {}
}
if (!wsUrl) { console.error('✗ Chrome CDP 未就绪'); srv.close(); chrome.kill(); process.exit(1) }

const browser = await CDP.connect(wsUrl)
const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true })

// flatten 模式下所有消息走同一连接，用 sessionId 路由
const page = {
  send: (method, params) =>
    browser.send(method, params).catch(() => null),
}
// 直接用带 sessionId 的裸调用
function pcall(method, params) {
  const id = ++browser.id
  return new Promise((resolve, reject) => {
    browser.waiting.set(id, { resolve, reject })
    browser.ws.send(JSON.stringify({ id, sessionId, method, params: params || {} }))
    setTimeout(() => {
      if (browser.waiting.has(id)) { browser.waiting.delete(id); reject(new Error(method + ' 超时')) }
    }, 30000)
  })
}

await pcall('Page.enable')
await pcall('Runtime.enable')
await pcall('Emulation.setDeviceMetricsOverride', {
  width: W, height: H, deviceScaleFactor: 2, mobile: false,
})

console.log(`▸ 需要重拍 ${todo.length} 个` +
  (skipped.length ? `（${skipped.length} 个未变动，跳过）` : '') + '\n')

let ok = 0
const fail = []

// 先加载一次页面，把两个顶部 tab 都点过，让所有 section 进 DOM
await pcall('Page.navigate', { url: `http://127.0.0.1:${PORT}/` })
await sleep(2500)
await pcall('Runtime.evaluate', {
  expression: `
    (function(){
      var tabs = document.querySelectorAll('.app-topbar__tab');
      for (var i=0;i<tabs.length;i++) tabs[i].click();
      return tabs.length;
    })()`,
  returnByValue: true,
})
await sleep(1200)

for (const it of todo) {
  process.stdout.write(`  ${it.name.padEnd(22)} `)

  // 切到该组件所在的 tab
  await pcall('Runtime.evaluate', {
    expression: `
      (function(){
        var tabs = document.querySelectorAll('.app-topbar__tab');
        var want = ${JSON.stringify(it.tab === 'business' ? '业务组件' : '基础组件')};
        for (var i=0;i<tabs.length;i++) {
          if ((tabs[i].textContent||'').indexOf(want) >= 0) { tabs[i].click(); break; }
        }
      })()`,
    returnByValue: true,
  })
  await sleep(500)

  const r = await pcall('Runtime.evaluate', {
    expression: framingScript(it.anchor),
    returnByValue: true,
  })
  let box = null
  try { box = JSON.parse(r?.result?.value || '{}') } catch (_) {}
  if (!box || !box.ok) { console.log('✗ 找不到区块'); fail.push(it.name); continue }

  await sleep(450)   // 等字体与过渡稳定

  // 统一裁成缩略图的比例，避免每张高矮不一（列表里会参差不齐）。
  // 内容比目标比例扁就按宽取、高就按高取，多余部分裁掉而不是压扁。
  const ratio = OUT_W / OUT_H
  let cw = box.w
  let ch = box.h
  if (cw / ch > ratio) cw = ch * ratio   // 太宽 → 裁两边
  else ch = cw / ratio                    // 太高 → 裁下半（组件通常在上部）

  // scale 是 CSS 像素 → 输出像素的倍率。deviceScaleFactor 已是 2，
  // 这里再按目标宽度折算，最终得到 OUT_W*2 宽的高清图。
  const scale = (OUT_W * 2) / cw / 2

  const shot = await pcall('Page.captureScreenshot', {
    format: 'webp',
    quality: 82,
    captureBeyondViewport: true,
    clip: { x: box.x, y: box.y, width: cw, height: ch, scale: scale },
  })
  if (!shot || !shot.data) { console.log('✗ 截图失败'); fail.push(it.name); continue }

  shots[it.anchor] = 'data:image/webp;base64,' + shot.data
  marks[it.anchor] = it._fp
  const kb = Math.round(shot.data.length * 0.75 / 1024)
  console.log(`✓ ${kb}KB`)
  ok++
}

writeFileSync(OUT, JSON.stringify({
  note: '由 scripts/shoot-components.mjs 生成，勿手改；改了 demo 或 el-theme 后重跑',
  size: { w: OUT_W, h: OUT_H },
  // marks 是每张图对应的源码指纹（demo 文件 + 主题）——下次跑时用它判断
  // 谁需要重拍。没有它就只能全量重拍，40 秒 × 每次推送。
  marks,
  shots,
}, null, 2) + '\n')

srv.close()
try { await browser.send('Browser.close') } catch (_) {}
chrome.kill()

const total = JSON.stringify(shots).length
console.log(`\n✓ ${ok} 张已写入 scripts/component-shots.json（合计 ${Math.round(total / 1024)}KB）`)
if (fail.length) console.log(`✗ ${fail.length} 个失败：${fail.join('、')}`)
console.log('\n下一步：node scripts/build-catalog.mjs  # 把图合进 catalog')
process.exit(0)
