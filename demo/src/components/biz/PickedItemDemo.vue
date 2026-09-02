<template>
  <section id="picked-item" class="demo-section">
    <h2 class="demo-section__title">PickedItem 已选项
      <CopyToCC anchor="picked-item" />
    </h2>

    <div class="demo-block">
      <p class="demo-desc">表单里「已经选中的一个值」——从别处挑进来、可逐个删掉、跟着表单一起提交。典型场景：知识点、出题范围、参与人、适用班级。</p>
      <div class="demo-row">
        <PickedItem
          v-for="k in points"
          :key="k"
          :label="k"
          @remove="remove(k)"
        />
        <!-- 增加入口不由组件渲染，由调用方自己放。这里与 PickedItem 并排，
             统一带边框才协调，故用次按钮（判据见 PickedItem.vue 顶部速查注释） -->
        <el-button @click="add">
          <template #icon>
            <CirclePlus :size="16" :stroke-width="2" />
          </template>
          增加
        </el-button>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CirclePlus } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import CopyToCC from '../CopyToCC.vue'
import { PickedItem } from '../../../../design-spec/components'

const POOL = ['人工智能', '机器学习', '神经网络', '深度学习', '知识图谱']
const points = ref(['人工智能', '机器学习'])

const remove = (k: string) => {
  points.value = points.value.filter((p) => p !== k)
}
const add = () => {
  const next = POOL.find((p) => !points.value.includes(p))
  if (next) points.value.push(next)
  else ElMessage({ message: '演示数据已全部添加', showClose: true })
}
</script>

<style scoped>
/* 纯本页排版：已选项与增加入口同排，间距走「列表项内子元素·横向」 */
.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--iflyv-spacing-2);
}
</style>
