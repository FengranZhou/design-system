<template>
  <section id="pagination" class="demo-section">
    <h2 class="demo-section__title">Pagination 分页
      <CopyToCC anchor="pagination" :values="configForm" />
    </h2>

    <!-- 分页：常规 / 小型 二选一，由右侧配置项切换（small 属性 + layout 精简）。
         常规=页面/弹窗等多数场景（带 sizes/jumper 完整功能）；小型=内嵌子模块等较小容器（仅翻页）。 -->
    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-desc">分页器用于分隔长列表，每次只加载一个页面。</p>
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
import CopyToCC from './CopyToCC.vue'
import { ref, computed, reactive } from 'vue'

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

// 配置卡的实时值，供标题右上角「复制到 CC 去调用」带出去
const configForm = reactive({ paginationSize })
</script>

<style scoped>

/* 本页配置卡内容宽度不定，宽度随内容自适应而非公共层的固定宽 */
.config-card {
  flex: 0 1 auto;
  width: auto;
}

/* 控件 + 释义纵向容器：使释义换行落到控件下方（与 Select demo 一致，避免覆盖 el-form-item__content） */
.config-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
