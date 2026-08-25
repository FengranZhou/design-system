<template>
  <!-- 该 section 在 catalog 里没有条目（设计模式 / 评判标准页）时整个不渲染 -->
  <span v-if="list.length" class="copy-to-cc">
    <!-- 单组件：直接复制，不必多点一次 -->
    <el-button v-if="list.length === 1" @click="copy(list[0])">
      {{ done === list[0].id ? '已复制' : '复制到 CC 去调用' }}
    </el-button>

    <!-- 多组件（Input 系 / Select 系…）：点开挑一个，避免复制到的不是想要的那个 -->
    <el-dropdown
      v-else
      placement="bottom-end"
      @command="copy"
      @visible-change="expanded = $event"
    >
      <el-button>
        复制到 CC 去调用
        <ChevronDown
          class="dropdown-caret"
          :class="{ 'is-expanded': expanded }"
          :size="14"
          :stroke-width="2"
        />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="c in list" :key="c.id" :command="c">
            {{ c.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </span>
</template>

<script setup lang="ts">
/**
 * 复制组件标识给下游 CC —— 每个基础 / 业务组件区块右上角的入口
 * ============================================================================
 *
 * ## 解决什么
 *
 * 设计师在下游项目的 CC 窗口里说「在标题右侧加一个筛选下拉」，下游 CC 得先猜
 * 「筛选下拉」指的是设计系统里的哪个组件——猜错了后面全错。本按钮把这一步做实：
 * 从规范展示页直接复制一段**组件标识块**，粘在自己那句话后面，CC 就精准命中。
 *
 * ## 复制出去的是什么
 *
 * 「用 xiaoya 设计系统的 X 组件」+ 可照抄骨架 + 硬约束 + 需要展开时读哪份规范。
 * 内容由 `scripts/build-prompt.mjs` 的 `buildComponentRef` 拼装，数据来自
 * `scripts/catalog.json`——**与浏览器扩展面板同一个源头**，两边口径一致。
 *
 * ## 配置项跟着走：拨到什么样，复制出去就是什么样
 *
 * demo 卡片右侧的开关是**活的**——拨开 SearchMini 的「默认收起」，页面上那个搜索框
 * 就真的变成收起态。此刻按下复制，期待的显然是收起态而不是出厂默认形态。
 * 所以每个 demo 通过 `values` 把自己那张配置卡的**实时值**传进来。
 *
 * 一个区块挂多个组件时（Input 系 / Select 系…）传的是 `{ 组件 id: 配置卡值 }` ——
 * 页面上每张配置卡本来就各属一个组件，这里只是把这层归属显式说出来。
 *
 * **只有用户真正改动过的项才写进标识块**：全默认时那一节整个不出现。否则下游 CC
 * 会把出厂值也当成"特意指定的决定"，不敢按自己的场景调整。
 *
 * ## 前提
 *
 * 下游项目必须已在其根 `CLAUDE.md` 里 `@` 引入本设计系统规范，标识块才成立——
 * 它是"定位到哪个组件"的指令，不是规范全文的替代品。
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ChevronDown } from 'lucide-vue-next'
import { componentsOf, refTextOf } from '../utils/component-ref'

const props = defineProps<{
  /** 该 demo section 的 id（= 左侧导航锚点），用它到 catalog 里取组件 */
  anchor: string
  /**
   * 配置卡的实时值。两种传法：
   *   · 区块只挂一个组件 —— 直接传该配置卡的 model（`:values="configForm"`）
   *   · 区块挂多个组件   —— 传 `{ 组件 id: 该组件的配置卡 model }`
   * 不传则复制出组件的默认形态。
   */
  values?: Record<string, unknown>
}>()

const list = componentsOf(props.anchor)

/**
 * 取某个组件此刻的配置值。
 *
 * 多组件区块传的是按 id 分装的嵌套对象，取对应那一份；单组件区块直接就是值本身。
 * 判据用「id 是不是 values 的 key」而非组件个数 —— 多组件区块也可能只传了其中
 * 一两个组件的配置卡（另几个压根没有配置项）。
 */
function valuesOf(c: (typeof list)[number]): Record<string, unknown> {
  const v = props.values
  if (!v) return {}
  const scoped = v[c.id]
  if (scoped && typeof scoped === 'object') return scoped as Record<string, unknown>
  // 嵌套形态下没有本组件那一份 → 该组件没有配置卡，给空
  if (list.length > 1 && list.some((x) => x.id in v)) return {}
  return v
}
/** 刚复制成功的组件 id，用于按钮上短暂的「已复制」反馈 */
const done = ref('')
/**
 * 下拉展开态 —— 箭头翻转所需的 .is-expanded。
 * EP 的 el-dropdown 展开时没有稳定的纯 CSS 钩子，只能由使用方用 @visible-change
 * 绑上去；翻转规则与过渡本身在源头 dropdown.scss，此处不重复定义。
 */
const expanded = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy(c: (typeof list)[number]) {
  const text = refTextOf(c, valuesOf(c))
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // 非安全上下文 / 无剪贴板权限时的兜底：临时 textarea + execCommand
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch {
      ElMessage({ message: '复制失败，请手动选中复制', type: 'error', showClose: true })
      document.body.removeChild(ta)
      return
    }
    document.body.removeChild(ta)
  }
  ElMessage({
    message: `已复制「${c.name}」的组件标识，粘到下游项目 CC 窗口即可`,
    type: 'success',
    showClose: true,
  })
  done.value = c.id
  clearTimeout(timer)
  timer = setTimeout(() => (done.value = ''), 2000)
}
</script>

<style scoped>
/* 纯本页排版留白：把入口推到标题行右端。
   .demo-section__title 是 flex 容器（全局层定义），这里只做位置分配，
   不碰按钮本身的任何外观——外观全由 el-button text 的源头给。 */
.copy-to-cc {
  margin-left: auto;
  display: inline-flex;
}
</style>
