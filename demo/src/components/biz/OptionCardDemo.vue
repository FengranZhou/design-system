<template>
  <section id="option-card" class="demo-section">
    <h2 class="demo-section__title">OptionCard 卡片单选
      <CopyToCC anchor="option-card" :values="configForm" />
    </h2>

    <div class="demo-block control-showcase">
      <!-- 左侧：卡片组预览，列数与图标由右侧配置卡控制 -->
      <div class="control-showcase__main">
        <p class="demo-desc">从一组选项里选一个，每个选项是一块带图标的卡片，可并排比较。适合选项自带图形标识的场景，如题型、模板、场景选择。</p>
        <OptionCard v-model="picked" :options="options" :columns="configForm.columns" />
      </div>

      <!-- 右侧：配置项卡片，用「表单布局模式」实现（el-form + el-form-item），
           与 Empty / Button 等配置卡一致 -->
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="configForm" label-width="auto">
          <el-form-item label="列数">
            <el-radio-group v-model="configForm.columns">
              <el-radio :value="2">2</el-radio>
              <el-radio :value="3">3</el-radio>
              <el-radio :value="4">4</el-radio>
              <el-radio :value="5">5</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图标">
            <el-switch v-model="configForm.withIcon" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import CopyToCC from '../CopyToCC.vue'
import { OptionCard, type OptionCardItem } from '../../../../design-spec/components'
import iconSingle from '../../assets/pages/ai-quiz/single.png'
import iconMulti from '../../assets/pages/ai-quiz/multi.png'
import iconJudge from '../../assets/pages/ai-quiz/judge.png'
import iconBlank from '../../assets/pages/ai-quiz/blank.png'
import iconEssay from '../../assets/pages/ai-quiz/essay.png'
import iconMatch from '../../assets/pages/ai-quiz/match.png'

const BASE: OptionCardItem[] = [
  { value: 'single', label: '单选题', icon: iconSingle },
  { value: 'multi', label: '多选题', icon: iconMulti },
  { value: 'judge', label: '判断题', icon: iconJudge },
  { value: 'blank', label: '填空题', icon: iconBlank },
  { value: 'essay', label: '简答题', icon: iconEssay },
  { value: 'match', label: '匹配题', icon: iconMatch },
]

const picked = ref<string | number>('single')
const configForm = reactive({ columns: 3, withIcon: true })

// 「判断题」常驻为禁用项：禁用态是组件的固有状态之一，看一眼知道长什么样即可，
// 不做成配置开关（开关是给「这次插入的实例怎么配」用的，禁用与否由选项数据自己带）
const options = computed<OptionCardItem[]>(() =>
  BASE.map((o) => ({
    ...o,
    icon: configForm.withIcon ? o.icon : undefined,
    disabled: o.value === 'judge',
  })),
)
</script>

<style scoped>
/* 左示例 + 右配置卡布局走公共脚手架 control-showcase / config-card（global.scss），
   这里只写与默认不同的那一行：列数有 4 个选项要单行放下，配置卡比默认 220 宽一档。 */
.config-card {
  width: 300px;
}
</style>
