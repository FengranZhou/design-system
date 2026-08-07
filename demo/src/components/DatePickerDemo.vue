<template>
  <section id="date-picker" class="demo-section">
    <h2 class="demo-section__title">Picker 时间/日期选择器</h2>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">日期选择</p>
        <div class="demo-row">
          <!-- 「时间」开关切换 type：关=date（只到日）、开=datetime（精确到时分秒，EP 原生能力）。
               宽度/占位随之切换；与「日期范围」块同一配置式范式（带不带时间是同一物料的一个差异）。 -->
          <el-date-picker
            v-model="dateValue"
            :type="withDateTime ? 'datetime' : 'date'"
            :placeholder="withDateTime ? '选择日期时间' : '选择日期'"
            :style="{ width: withDateTime ? '280px' : '240px' }"
          />
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="dateConfigForm" label-width="auto">
          <el-form-item label="时间">
            <el-switch v-model="withDateTime" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block control-showcase">
      <div class="control-showcase__main">
        <p class="demo-label">日期范围</p>
        <div class="demo-row">
          <div :style="{ width: withTime ? '460px' : '360px' }">
            <!-- 「时间」开关切换 type：关=daterange（只到日）、开=datetimerange（起止精确到时分秒，EP 原生能力）。
                 range-separator/占位随之切换。 -->
            <el-date-picker
              v-model="dateRange"
              :type="withTime ? 'datetimerange' : 'daterange'"
              range-separator="至"
              :start-placeholder="withTime ? '开始时间' : '开始日期'"
              :end-placeholder="withTime ? '结束时间' : '结束日期'"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
      <aside class="config-card">
        <p class="config-card__title">配置项</p>
        <el-form :model="rangeConfigForm" label-width="auto">
          <el-form-item label="时间">
            <el-switch v-model="withTime" />
          </el-form-item>
        </el-form>
      </aside>
    </div>

    <div class="demo-block">
      <p class="demo-label">时间选择</p>
      <div class="demo-row">
        <el-time-picker v-model="timeValue" placeholder="选择时间" style="width: 200px" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

const dateValue = ref('')
const dateRange = ref([])
const timeValue = ref('')
// 日期选择配置项：有无时间。开=datetime（精确到时分秒）、关=date（只到日）；
// 切换 type 时清空已选值，避免旧格式残留导致回显异常。
const withDateTime = ref(false)
const dateConfigForm = reactive({ withDateTime })
watch(withDateTime, () => { dateValue.value = '' })
// 日期范围配置项：有无时间。开=datetimerange（精确到时分秒）、关=daterange（只到日）；
// 切换 type 时清空已选值，避免旧格式残留导致回显异常。
const withTime = ref(false)
const rangeConfigForm = reactive({ withTime })
watch(withTime, () => { dateRange.value = [] })
</script>
