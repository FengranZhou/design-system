<template>
  <section id="pagination" class="demo-section">
    <h2 class="demo-section__title">Pagination 分页</h2>

    <!-- 分页：常规 / 小型 二选一，由右侧配置项切换（small 属性 + layout 精简）。
         常规=页面/弹窗等多数场景（带 sizes/jumper 完整功能）；小型=内嵌子模块等较小容器（仅翻页）。 -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">分页</p>
        <div class="demo-row">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="80"
            :small="paginationSize === 'small'"
            :layout="paginationSize === 'small' ? 'prev, pager, next' : 'prev, pager, next, sizes, jumper'"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form label-width="auto">
          <el-form-item label="尺寸">
            <!-- 控件 + 释义包进纵向 config-field，使释义落到单选下方（与 Select demo 一致，不覆盖 el-form-item__content 容器） -->
            <div class="config-field">
              <el-radio-group v-model="paginationSize">
                <el-radio value="normal">常规</el-radio>
                <el-radio value="small">小型</el-radio>
              </el-radio-group>
              <p class="config-card__hint">{{ paginationSizeHint }}</p>
            </div>
          </el-form-item>
        </el-form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentPage = ref(1)
const pageSize = ref(20)
// 分页尺寸：常规（多数场景，带 sizes/jumper）/ 小型（较小容器，仅翻页）
const paginationSize = ref<'normal' | 'small'>('normal')
// 随所选尺寸变化的释义（与 component-interaction.md 分页尺寸选型口径一致）
const paginationSizeHint = computed(() =>
  paginationSize.value === 'small'
    ? '适用于较小的容器内部，如内嵌子模块等'
    : '适用于多数场景，如页面、弹窗等'
)
</script>

<style scoped>
/* demo 块用 bg-card 大卡片做区分（与 Select / Input 一致，本页排版走令牌）。 */
.demo-section .demo-block {
  margin-bottom: 0;
  padding: var(--iflyv-spacing-6);
  background: var(--iflyv-bg-card);
  border-radius: var(--iflyv-radius-lg);
}

/* 左示例 + 右配置卡横向布局（与 Input 配置式范式一致，纯本页排版，不含组件外观） */
.control-showcase {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--iflyv-spacing-8) + var(--iflyv-spacing-4));  /* 48 */
}
.control-showcase__main { flex: 1; min-width: 0; }

@media (max-width: 1100px) {
  .control-showcase { flex-direction: column; }
  .config-card { width: 100%; }
}

/* 配置卡：白底 + 细边框区分层次（与 Input 一致） */
.config-card {
  flex: 0 1 auto;
  width: auto;
  align-self: flex-start;
  padding: var(--iflyv-spacing-4);
  background: var(--iflyv-bg-panel);
  border: 1px solid var(--iflyv-border-subtle);
  border-radius: var(--iflyv-radius-md);
}
.config-card__title {
  margin: 0 0 var(--iflyv-spacing-4);
  color: var(--iflyv-text-1);
  font: var(--iflyv-font-title-component);
}
/* 控件 + 释义纵向容器：使释义换行落到控件下方（与 Select demo 一致，避免覆盖 el-form-item__content） */
.config-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* 释义说明：浅色小字，紧跟单选下方（上距 4px），随所选项变化（与 Select/Input demo 一致） */
.config-card__hint {
  margin: var(--iflyv-spacing-1) 0 0;
  color: var(--iflyv-text-3);
  font: var(--iflyv-font-body-sub);
}
</style>
