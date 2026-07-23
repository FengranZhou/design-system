import { ref, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * Token 演示组件共享逻辑：
 * - 实时把 CSS 变量解析成显示值（rawValues：圆角/间距/字重/动效等；swatchValues：色板 hex）
 * - 监听 html 上的 data-theme / data-brand / data-font-size 变化后自动刷新
 * - copyToken：点击复制 var(--xxx)
 *
 * 每个组件按需传入自己关心的 raw token 名清单；色板反查来源（green-6 等）默认开启，
 * 无 [data-swatch] 元素时自动为空，不影响非色板组件。
 */

const paletteFamilies = ['gray', 'green', 'red', 'orange', 'blue', 'geekblue', 'yellow', 'cyan', 'purple', 'magenta']

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/)
  if (!m) return rgb
  const hex = [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, '0').toUpperCase()).join('')
  if (m[4] !== undefined && +m[4] < 1) return `#${hex} ${Math.round(+m[4] * 100)}%`
  return `#${hex}`
}

export function copyToken(name: string) {
  navigator.clipboard.writeText(`var(${name})`).then(() => {
    ElMessage.success(`已复制 var(${name})`)
  })
}

/**
 * @param rootEl       组件根元素 ref（用于 querySelector [data-swatch]）
 * @param rawTokenNames 需要解析原始值的 token 名列表（圆角/间距/字重/动效）
 */
export function useTokenValues(rootEl: Ref<HTMLElement | null>, rawTokenNames: string[] = []) {
  const swatchValues = ref<Record<string, string>>({})
  const rawValues = ref<Record<string, string>>({})
  const sourceLabels = ref<Record<string, string>>({})

  function refresh() {
    const rootStyle = getComputedStyle(document.documentElement)

    const raw: Record<string, string> = {}
    for (const name of rawTokenNames) {
      raw[name] = rootStyle.getPropertyValue(name).trim()
    }
    rawValues.value = raw

    const sw: Record<string, string> = {}
    rootEl.value?.querySelectorAll<HTMLElement>('[data-swatch]').forEach((el) => {
      const name = el.dataset.swatch!
      const cs = getComputedStyle(el)
      sw[name] = cs.backgroundImage !== 'none' ? '渐变' : rgbToHex(cs.backgroundColor)
    })
    swatchValues.value = sw

    /* hex → 色板色阶名（gray 为 0-10，其余 1-10），供语义色反查来源 */
    const stepByHex: Record<string, string> = {}
    for (const family of paletteFamilies) {
      for (let i = family === 'gray' ? 0 : 1; i <= 10; i++) {
        const hex = rootStyle.getPropertyValue(`--iflyv-${family}-${i}`).trim().toUpperCase()
        if (hex && !(hex in stepByHex)) stepByHex[hex] = `${family}-${i}`
      }
    }
    const src: Record<string, string> = {}
    for (const [name, hex] of Object.entries(sw)) {
      const step = stepByHex[hex]
      if (step) src[name] = step
    }
    sourceLabels.value = src
  }

  let attrObserver: MutationObserver | null = null

  onMounted(() => {
    refresh()
    attrObserver = new MutationObserver(() => nextTick(refresh))
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-brand', 'data-font-size'],
    })
  })

  onBeforeUnmount(() => {
    attrObserver?.disconnect()
  })

  return { swatchValues, rawValues, sourceLabels, refresh }
}
