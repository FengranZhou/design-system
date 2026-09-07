<template>
  <section id="tag" class="demo-section">
    <h2 class="demo-section__title">Tag 标签
      <CopyToCC anchor="tag" :values="configForm" />
    </h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">尽量避免在实际使用过程中，3 个以上的标签一同出现</p>
        <div class="demo-row">
          <!-- 图标是正交配置项：开关叠加到每枚标签，图标按语义配（图文间距在源头） -->
          <el-tag v-for="t in tags" :key="t.label" :type="t.type" :class="t.cls">
            <component :is="t.icon" v-if="showIcon" :size="12" :stroke-width="2" />{{ t.label }}
          </el-tag>
          <!-- AI 标识不参与图标配置：渐变文字靠 background-clip + 文字透明实现，
               currentColor 图标会跟着透明不可见（源头 clip 机制限制） -->
          <el-tag class="el-tag--ai">AI互动课堂</el-tag>
        </div>
      </div>

      <!-- 右侧：配置项卡片（同 ButtonDemo 范式），控制左侧标签的图标叠加 -->
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="图标">
            <el-switch v-model="showIcon" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, reactive } from 'vue'
import { Check, Clock, X, Ban, Archive, Info } from 'lucide-vue-next'

// 图标为正交配置项，默认关（默认形态不带图标）
const showIcon = ref(false)
const configForm = reactive({ showIcon })

// 类型 × 语义图标（图标仅在开关开启时叠加）
const tags = [
  { label: '已完成', type: 'success', icon: Check },
  { label: '待审核', type: 'warning', icon: Clock },
  { label: '已驳回', type: 'danger', icon: X },
  { label: '已关闭', type: 'info', icon: Ban },
  { label: '已归档', type: undefined, cls: 'el-tag--gray', icon: Archive },
  { label: '来源', type: undefined, cls: 'el-tag--outline', icon: Info },
]
</script>
