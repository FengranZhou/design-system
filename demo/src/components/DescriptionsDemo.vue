<template>
  <section id="descriptions" class="demo-section">
    <h2 class="demo-section__title">Descriptions 描述列表
      <CopyToCC anchor="descriptions" :values="configForm" />
    </h2>

    <div class="demo-block descriptions-showcase">
      <div class="descriptions-showcase__main">
        <!-- :column = 每行组数（y 列）；条目数 = descRows × descCols，多余/不足由 descItems 动态裁剪 -->
        <el-descriptions :column="descCols" border>
          <el-descriptions-item
            v-for="item in descItems"
            :key="item.label"
            :label="item.label"
          >
            <el-tag v-if="item.tag" type="success">{{ item.value }}</el-tag>
            <template v-else>{{ item.value }}</template>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="行">
            <el-input-number v-model="descRows" :min="1" :max="6" />
          </el-form-item>
          <el-form-item label="列">
            <!-- 列 = 每行组数（label+值对），1~6 自由取值 -->
            <el-input-number v-model="descCols" :min="1" :max="6" />
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import CopyToCC from './CopyToCC.vue'
import { ref, computed, reactive } from 'vue'
// 时间展示走文案规范唯一实现；「入职日期」无时分语义，用 'day' 精度（见 copywriting/time.md）
import { formatTime } from '../../../design-spec/utils/format-time'

// 描述列表配置项：行 × 列（列 = 每行组数，label+值对）。条目按 行×列 动态生成
const descRows = ref(2)
const descCols = ref(3)

// 条目池：按需取前 N 个填入描述列表（label + value，个别带 tag 标签）
const descPool = [
  { label: '姓名', value: '张三' },
  { label: '部门', value: '设计部' },
  { label: '职级', value: 'P6' },
  { label: '邮箱', value: 'zhangsan@example.com' },
  { label: '入职日期', value: formatTime('2024-03-15', 'day') },
  { label: '状态', value: '在职', tag: true },
  { label: '工号', value: 'D2024001' },
  { label: '手机', value: '138 0000 0000' },
  { label: '直属上级', value: '李四' },
  { label: '办公地点', value: '北京·中关村' },
  { label: '合同类型', value: '全职' },
  { label: '试用期', value: '已转正' },
]

// 需要 行×列 个条目；池不够时循环复用，保证网格填满
const descItems = computed(() => {
  const count = descRows.value * descCols.value
  return Array.from({ length: count }, (_, i) => {
    const base = descPool[i % descPool.length]
    // 循环复用时给 key 去重（label 作 key，需唯一）
    return i < descPool.length ? base : { ...base, label: `${base.label} ${Math.floor(i / descPool.length) + 1}` }
  })
})

// 配置卡的实时值，供标题右上角「复制到 CC 去调用」带出去
const configForm = reactive({ descRows, descCols })
</script>

<style scoped>

/* 描述列表块：左内容 + 右配置卡，配置卡顶与标题顶齐平 */
.descriptions-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.descriptions-showcase__main { flex: 1; min-width: 0; }

</style>
