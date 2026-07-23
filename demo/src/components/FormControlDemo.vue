<template>
  <section id="form-control" class="demo-section">
    <h2 class="demo-section__title">FormControl 表单控件</h2>

    <div class="demo-block">
      <p class="demo-label">Radio 尺寸对比</p>
      <div class="demo-row">
        <el-radio-group size="large" v-model="radioLarge">
          <el-radio value="1">Large A</el-radio>
          <el-radio value="2">Large B</el-radio>
        </el-radio-group>
        <el-radio-group v-model="radioDefault">
          <el-radio value="1">Default A</el-radio>
          <el-radio value="2">Default B</el-radio>
        </el-radio-group>
        <el-radio-group size="small" v-model="radioSmall">
          <el-radio value="1">Small A</el-radio>
          <el-radio value="2">Small B</el-radio>
        </el-radio-group>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">RadioButton 尺寸对比</p>
      <div class="demo-row">
        <el-radio-group size="large" v-model="radioBtnLarge">
          <el-radio-button value="1">Large A</el-radio-button>
          <el-radio-button value="2">Large B</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="radioBtnDefault">
          <el-radio-button value="1">Default A</el-radio-button>
          <el-radio-button value="2">Default B</el-radio-button>
        </el-radio-group>
        <el-radio-group size="small" v-model="radioBtnSmall">
          <el-radio-button value="1">Small A</el-radio-button>
          <el-radio-button value="2">Small B</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Checkbox 尺寸对比</p>
      <div class="demo-row">
        <el-checkbox-group size="large" v-model="checkLarge">
          <el-checkbox value="A">Large A</el-checkbox>
          <el-checkbox value="B">Large B</el-checkbox>
        </el-checkbox-group>
        <el-checkbox-group v-model="checkDefault">
          <el-checkbox value="A">Default A</el-checkbox>
          <el-checkbox value="B">Default B</el-checkbox>
        </el-checkbox-group>
        <el-checkbox-group size="small" v-model="checkSmall">
          <el-checkbox value="A">Small A</el-checkbox>
          <el-checkbox value="B">Small B</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Switch 尺寸对比</p>
      <div class="demo-row">
        <el-switch size="large" v-model="switchLarge" />
        <el-switch v-model="switchDefault" />
        <el-switch size="small" v-model="switchSmall" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Radio 单选</p>
      <div class="demo-row" style="gap: 30px">
        <el-radio-group v-model="radioValue">
          <el-radio value="1">选项一</el-radio>
          <el-radio value="2">选项二</el-radio>
        </el-radio-group>
        <el-radio-group :model-value="'on'">
          <el-radio value="off" disabled>禁用</el-radio>
          <el-radio value="on" disabled>选中禁用</el-radio>
        </el-radio-group>
      </div>
      <div class="demo-row" style="gap: 30px">
        <el-radio-group v-model="radioButtonValue">
          <el-radio-button value="left">左对齐</el-radio-button>
          <el-radio-button value="center">居中</el-radio-button>
          <el-radio-button value="right">右对齐</el-radio-button>
        </el-radio-group>
        <el-radio-group :model-value="'on'">
          <el-radio-button value="off" disabled>禁用</el-radio-button>
          <el-radio-button value="off2" disabled>禁用</el-radio-button>
          <el-radio-button value="on" disabled>选中禁用</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Checkbox 多选</p>
      <div class="demo-row">
        <el-checkbox-group v-model="checkboxValue">
          <el-checkbox label="Vue" value="vue" />
          <el-checkbox label="React" value="react" />
          <el-checkbox label="Angular" value="angular" disabled />
          <el-checkbox label="选中禁用" value="svelte" disabled />
        </el-checkbox-group>
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Switch 开关</p>
      <div class="demo-row">
        <el-switch v-model="switchValue1" />
        <el-switch v-model="switchValue2" active-text="开启" inactive-text="关闭" />
        <el-switch disabled :model-value="false" />
        <el-switch disabled :model-value="true" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Slider 滑块</p>
      <div style="width: 400px">
        <el-slider v-model="sliderValue" />
      </div>
    </div>

    <div class="demo-block">
      <p class="demo-label">Rate 评分</p>
      <div class="demo-row">
        <el-rate v-model="rateValue" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const radioLarge = ref('1')
const radioDefault = ref('1')
const radioSmall = ref('1')
const radioBtnLarge = ref('1')
const radioBtnDefault = ref('1')
const radioBtnSmall = ref('1')
const checkLarge = ref(['A'])
const checkDefault = ref(['A'])
const checkSmall = ref(['A'])
const switchLarge = ref(true)
const switchDefault = ref(true)
const switchSmall = ref(true)
const radioValue = ref('1')
const radioButtonValue = ref('center')
const checkboxValue = ref(['vue', 'svelte'])
const switchValue1 = ref(true)
const switchValue2 = ref(false)
const sliderValue = ref(30)
const rateValue = ref(3)
</script>
