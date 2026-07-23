---
author: myjin2
updated: 2026-04-12
---

# EP CSS 变量遮蔽审计报告

> 生成时间：2026-03-24
> EP 版本：element-plus@2.13.5
> 分析文件：`dist/index.css`（352KB 压缩单行）

## 结论摘要

| 类别 | 数量 | 说明 |
|------|------|------|
| 我们在 `:root` 覆盖的 `--el-*` 变量 | 152 个 | `var-mapping.scss` 中定义 |
| EP 组件选择器声明的独立变量（去重） | 418 个 | `.el-xxx { --el-yyy }` 形式 |
| **被遮蔽**（我们覆盖但 EP 再次在组件上定义） | **40 个** | 需要处理 |
| EP 组件选择器声明、我们完全未覆盖 | 378 个 | — |
| 其中含硬编码 px 值（需关注） | 127 个 | 见第三节 |

---

## 核心原理

CSS 层叠规则：`.el-alert { --el-alert-title-font-size: 14px }` 的特指度高于 `:root { --el-alert-title-font-size: var(...) }`。
因此，我们在 `:root` 写的覆盖值，只要 EP 在组件选择器上也声明了同名变量，就会被**遮蔽**。

---

## 第一节：被遮蔽的变量（40 条，按风险级别）

风险分级：
- **HIGH**：EP 硬编码 `px`，我们的 `iflyv-*` 引用完全无效
- **CHECK**：EP 引用了一个组件私有变量（需追溯链条）
- **OK**：EP 引用的是我们已覆盖的 `:root` 级 EP 变量，实际效果正常

### HIGH 风险（EP 硬编码 px，覆盖无效）

| 组件 | EP 选择器 | 变量 | EP 值 | 我们的值 |
|------|----------|------|-------|---------|
| Alert | `.el-alert` | `--el-alert-title-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Alert | `.el-alert` | `--el-alert-description-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Alert | `.el-alert` | `--el-alert-close-font-size` | `16px` | `var(--iflyv-font-size-16)` |
| Alert | `.el-alert` | `--el-alert-close-customed-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Alert | `.el-alert` | `--el-alert-title-with-description-font-size` | `16px` | `var(--iflyv-font-size-16)` |
| Anchor | `.el-anchor` | `--el-anchor-font-size` | `12px` | `var(--iflyv-font-size-12)` |
| Badge | `.el-badge` | `--el-badge-font-size` | `12px` | `var(--iflyv-font-size-12)` |
| Checkbox | `.el-checkbox` | `--el-checkbox-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Dialog | `.el-dialog` | `--el-dialog-content-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| InputTag | `.el-input-tag--large` | `--el-input-tag-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| InputTag | `.el-input-tag--small` | `--el-input-tag-font-size` | `12px` | `var(--iflyv-font-size-14)` |
| MessageBox | `.el-message-box` | `--el-messagebox-error-font-size` | `12px` | `var(--iflyv-font-size-12)` |
| Notification | `.el-notification` | `--el-notification-title-font-size` | `16px` | `var(--iflyv-font-size-16)` |
| Notification | `.el-notification` | `--el-notification-close-font-size` | `var(--el-message-close-size,16px)` | `var(--iflyv-font-size-16)` |
| Pagination | `.el-pagination` | `--el-pagination-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Pagination | `.el-pagination` | `--el-pagination-font-size-small` | `12px` | `var(--iflyv-font-size-12)` |
| Popover | `.el-popover` | `--el-popover-title-font-size` | `16px` | `var(--iflyv-font-size-16)` |
| Result | `.el-result` | `--el-result-title-font-size` | `20px` | `var(--iflyv-font-size-18)` |
| Select | `.el-select` | `--el-select-input-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Tag | `.el-tag` | `--el-tag-font-size` | `12px` | `var(--iflyv-font-size-12)` |
| Tour | `.el-tour` | `--el-tour-font-size` | `14px` | `var(--iflyv-font-size-14)` |
| Tour | `.el-tour` | `--el-tour-title-font-size` | `16px` | `var(--iflyv-font-size-16)` |

**修复方案**：需将这些变量的覆盖从 `:root` 移至对应的组件选择器，或在组件 `.scss` 文件中重新声明。详见第四节。

---

### CHECK 风险（EP 引用私有变量，需追溯链条）

#### `--el-fill-color-blank` 被 4 个选择器遮蔽

| EP 选择器 | EP 值 | 实际链条 | 是否有问题 |
|----------|------|---------|----------|
| `.el-color-picker-panel` | `var(--el-colorpicker-bg-color)` | → `.el-color-picker-panel { --el-colorpicker-bg-color: var(--el-bg-color-overlay) }` → 我们覆盖了 `--el-bg-color-overlay` | **OK**，最终生效 |
| `.el-date-picker` | `var(--el-datepicker-bg-color)` | → `.el-date-picker { --el-datepicker-bg-color: var(--el-bg-color-overlay) }` → 我们覆盖了 `--el-bg-color-overlay` | **OK**，最终生效 |
| `.el-popper.is-dark` | `var(--el-popper-bg-color-dark)` | → `.el-popper { --el-popper-bg-color-dark: var(--el-text-color-primary) }` → 即 dark popper 背景 = 文本色（intentional） | **OK**，是 EP 设计意图 |
| `.el-popper.is-light` | `var(--el-popper-bg-color-light)` | → `.el-popper { --el-popper-bg-color-light: var(--el-bg-color-overlay) }` → 我们覆盖了 `--el-bg-color-overlay` | **OK**，最终生效 |

#### `--el-form-label-font-size` 被 form-item 尺寸变体遮蔽

| EP 选择器 | EP 值 | 分析 |
|----------|------|------|
| `.el-form` | `var(--el-font-size-base)` | 我们覆盖了 `--el-font-size-base`，OK |
| `.el-form-item--large` | `var(--font-size)` | `--font-size` 是 scoped 私有变量，在 `.el-form-item--large` 上硬编码为 `14px`，我们的 `:root` 无法影响 |
| `.el-form-item--default` | `var(--font-size)` | 同上，`--font-size` 硬编码 `14px` |
| `.el-form-item--small` | `var(--font-size)` | `--font-size` 硬编码 `12px`，small 尺寸自动降档 |

**结论**：`--el-form-label-font-size` 在 form-item 的 large/default/small 变体上实际由 scoped `--font-size` 控制（14px/14px/12px），我们的 `:root` 覆盖对这三个选择器**完全无效**。但由于 EP 硬编码的值与我们期望的值一致（14px = `iflyv-font-size-14` 在 md 档），**当前没有视觉差异**；但一旦切换字号档位（sm/lg），我们的 `--iflyv-font-size-14` 变化但 form-item 的 px 值不变，仍然是 HIGH 风险。

---

### OK（低风险，实际效果正常）

这些变量 EP 在组件选择器上引用的是我们已经在 `:root` 覆盖过的其他 EP 变量，最终效果正确：

| 变量 | EP 引用链 | 状态 |
|------|----------|------|
| `--el-cascader-menu-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-dialog-title-font-size` | `var(--el-font-size-large)` → 我们已覆盖 | OK |
| `--el-input-focus-border-color` | `var(--el-color-primary)` → 我们已覆盖 | OK |
| `--el-input-hover-border-color` | `var(--el-border-color-hover)` → 我们已覆盖 | OK |
| `--el-input-tag-font-size`（base） | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-link-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-mention-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-messagebox-content-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-messagebox-font-size` | `var(--el-font-size-large)` → 我们已覆盖 | OK |
| `--el-notification-content-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-popover-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-radio-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-select-border-color-hover` | `var(--el-border-color-hover)` → 我们已覆盖 | OK |
| `--el-select-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |
| `--el-select-input-focus-border-color` | `var(--el-color-primary)` → 我们已覆盖 | OK |
| `--el-statistic-content-font-size` | `var(--el-font-size-extra-large)` → 我们已覆盖 | OK |
| `--el-statistic-title-font-size` | `var(--el-font-size-extra-small)` → 我们已覆盖 | OK |
| `--el-text-font-size` | `var(--el-font-size-base)` → 我们已覆盖 | OK |

---

## 第二节：修复方案

### 方案 A：将覆盖迁移到组件选择器（推荐）

对于 HIGH 风险的变量，需要在组件对应的 `.scss` 文件中用更高特指度的选择器重新声明。

**修改位置**：`design-spec/el-theme/components/<组件名>.scss`

```scss
// 示例：alert.scss
.el-alert {
  --el-alert-title-font-size: var(--iflyv-font-size-14);
  --el-alert-description-font-size: var(--iflyv-font-size-14);
  --el-alert-close-font-size: var(--iflyv-font-size-16);
  --el-alert-close-customed-font-size: var(--iflyv-font-size-14);
  --el-alert-title-with-description-font-size: var(--iflyv-font-size-16);
}
```

```scss
// anchor.scss
.el-anchor {
  --el-anchor-font-size: var(--iflyv-font-size-12);
}
```

```scss
// badge.scss
.el-badge {
  --el-badge-font-size: var(--iflyv-font-size-12);
}
```

```scss
// checkbox.scss
.el-checkbox {
  --el-checkbox-font-size: var(--iflyv-font-size-14);
}
```

```scss
// dialog.scss
.el-dialog {
  --el-dialog-content-font-size: var(--iflyv-font-size-14);
}
```

```scss
// input-tag.scss
.el-input-tag {
  --el-input-tag-font-size: var(--iflyv-font-size-14);
}
.el-input-tag--large {
  --el-input-tag-font-size: var(--iflyv-font-size-14);
}
.el-input-tag--small {
  --el-input-tag-font-size: var(--iflyv-font-size-12);  // small 档降字号
}
```

```scss
// message-box.scss
.el-message-box {
  --el-messagebox-error-font-size: var(--iflyv-font-size-12);
}
```

```scss
// notification.scss
.el-notification {
  --el-notification-title-font-size: var(--iflyv-font-size-16);
  --el-notification-close-font-size: var(--iflyv-font-size-16);
}
```

```scss
// pagination.scss
.el-pagination {
  --el-pagination-font-size: var(--iflyv-font-size-14);
  --el-pagination-font-size-small: var(--iflyv-font-size-12);
}
```

```scss
// popover.scss
.el-popover {
  --el-popover-title-font-size: var(--iflyv-font-size-16);
}
```

```scss
// result.scss
.el-result {
  --el-result-title-font-size: var(--iflyv-font-size-18);
}
```

```scss
// select.scss
.el-select {
  --el-select-input-font-size: var(--iflyv-font-size-14);
}
```

```scss
// tag.scss
.el-tag {
  --el-tag-font-size: var(--iflyv-font-size-12);
}
```

```scss
// tour.scss
.el-tour {
  --el-tour-font-size: var(--iflyv-font-size-14);
  --el-tour-title-font-size: var(--iflyv-font-size-16);
}
```

```scss
// form.scss（form-item 用 scoped --font-size，需特殊处理）
.el-form-item--large {
  --font-size: var(--iflyv-font-size-14);
}
.el-form-item--default {
  --font-size: var(--iflyv-font-size-14);
}
.el-form-item--small {
  --font-size: var(--iflyv-font-size-12);
}
```

### 方案 B：同时保留 :root（用于 SSR 兼容）

如果需要在 `:root` 保留一份（作为 fallback），同时在组件选择器上再覆盖一遍，两边都写即可，无负面影响。

### 方案 C：从 var-mapping.scss 删除已无效的条目

对于确认只有 HIGH 风险、已迁移到组件 scss 的变量，可以从 `var-mapping.scss` 的 `:root` 块中删除，避免误导。

---

## 第三节：EP 组件选择器声明但我们未覆盖的 px 变量（127 个，按组件）

以下是 EP 在组件选择器上声明的尺寸类 px 变量，我们目前没有覆盖。
**如当前字号档位是 16px base，则这些 px 值可能与期望的 rem 比例不协调。**

### Alert
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-alert-padding` | `.el-alert` | `8px 16px` |
| `--el-alert-icon-size` | `.el-alert` | `16px` |
| `--el-alert-icon-large-size` | `.el-alert` | `28px` |

### Anchor
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-anchor-line-height` | `.el-anchor` | `22px` |
| `--el-anchor-padding-indent` | `.el-anchor` | `14px` |

### Avatar
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-avatar-size` | `.el-avatar` | `40px` |
| `--el-avatar-size` | `.el-avatar--large` | `56px` |
| `--el-avatar-size` | `.el-avatar--small` | `24px` |
| `--el-avatar-size-large` | `.el-avatar` | `56px` |
| `--el-avatar-size-small` | `.el-avatar` | `24px` |
| `--el-avatar-icon-size` | `.el-avatar` | `18px` |
| `--el-avatar-text-size` | `.el-avatar` | `14px` |
| `--el-avatar-group-item-gap` | `.el-avatar-group` | `-8px` |
| `--el-avatar-group-collapse-item-gap` | `.el-avatar-group` | `4px` |

### Badge
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-badge-size` | `.el-badge` | `18px` |
| `--el-badge-padding` | `.el-badge` | `6px` |
| `--el-badge-radius` | `.el-badge` | `10px` |

### Button
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-button-size` | `.el-button--large` | `40px` |
| `--el-button-size` | `.el-button--small` | `24px` |

### Calendar
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-calendar-cell-width` | `.el-calendar` | `85px` |

### Card
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-card-border-radius` | `.el-card` | `4px` |
| `--el-card-padding` | `.el-card` | `20px` |

### Carousel
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-carousel-arrow-size` | `.el-carousel` | `36px` |
| `--el-carousel-arrow-font-size` | `.el-carousel` | `12px` |
| `--el-carousel-indicator-height` | `.el-carousel` | `2px` |
| `--el-carousel-indicator-width` | `.el-carousel` | `30px` |
| `--el-carousel-indicator-padding-horizontal` | `.el-carousel` | `4px` |
| `--el-carousel-indicator-padding-vertical` | `.el-carousel` | `12px` |

### Checkbox
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-checkbox-input-height` | `.el-checkbox` | `14px` |
| `--el-checkbox-input-width` | `.el-checkbox` | `14px` |

### Collapse
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-collapse-header-height` | `.el-collapse` | `48px` |
| `--el-collapse-header-font-size` | `.el-collapse` | `13px` |
| `--el-collapse-content-font-size` | `.el-collapse` | `13px` |

### DatePicker
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-date-editor-width` | `.el-date-editor` | `220px` |
| `--el-date-editor-daterange-width` | `.el-date-editor` | `350px` |
| `--el-date-editor-datetimerange-width` | `.el-date-editor` | `400px` |
| `--el-date-editor-monthrange-width` | `.el-date-editor` | `300px` |

### Dialog
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-dialog-padding-primary` | `.el-dialog` | `16px` |

### Drawer
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-drawer-padding-primary` | `.el-drawer` | `var(--el-dialog-padding-primary,20px)` |
| `--el-drawer-dragger-size` | `.el-drawer` | `8px` |

### Empty
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-empty-padding` | `.el-empty` | `40px 0` |
| `--el-empty-image-width` | `.el-empty` | `160px` |
| `--el-empty-description-margin-top` | `.el-empty` | `20px` |
| `--el-empty-bottom-margin-top` | `.el-empty` | `20px` |

### Footer / Header / Main（Layout）
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-footer-height` | `.el-footer` | `60px` |
| `--el-footer-padding` | `.el-footer` | `0 20px` |
| `--el-header-height` | `.el-header` | `60px` |
| `--el-header-padding` | `.el-header` | `0 20px` |
| `--el-main-padding` | `.el-main` | `20px` |

### Input
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-input-inner-height` | `.el-input` | `calc(var(--el-input-height,32px) - 2px)` |
| `--el-input-inner-height` | `.el-input--large` | `calc(var(--el-input-height,40px) - 2px)` |
| `--el-input-inner-height` | `.el-input--small` | `calc(var(--el-input-height,24px) - 2px)` |
| `--el-input-number-controls-height` | controls-right | `15px` / `19px` / `11px` |
| `--el-input-tag-gap` | `.el-input-tag` | `6px` |
| `--el-input-tag-inner-padding` | `.el-input-tag` | `8px` |
| `--el-input-tag-line-height` | `.el-input-tag` | `24px` |
| `--el-input-tag-line-height` | `.el-input-tag--small` | `20px` |
| `--el-input-tag-padding` | `.el-input-tag` | `4px` |
| `--el-input-tag-padding-left` | `.el-input-tag--large` | `8px` |
| `--el-input-tag-padding-left` | `.el-input-tag--small` | `6px` |

### Mention
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-mention-max-height` | `.el-mention-dropdown` | `174px` |
| `--el-mention-option-height` | `.el-mention-dropdown` | `34px` |
| `--el-mention-option-min-width` | `.el-mention-dropdown` | `100px` |
| `--el-mention-padding` | `.el-mention-dropdown` | `6px 0` |
| `--el-mention-header-padding` | `.el-mention-dropdown` | `10px` |
| `--el-mention-footer-padding` | `.el-mention-dropdown` | `10px` |

### MessageBox
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-messagebox-width` | `.el-message-box` | `420px` |
| `--el-messagebox-padding-primary` | `.el-message-box` | `12px` |
| `--el-messagebox-border-radius` | `.el-message-box` | `4px` |

### Notification
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-notification-width` | `.el-notification` | `330px` |
| `--el-notification-padding` | `.el-notification` | `14px 26px 14px 13px` |
| `--el-notification-radius` | `.el-notification` | `8px` |
| `--el-notification-icon-size` | `.el-notification` | `24px` |
| `--el-notification-group-margin-left` | `.el-notification` | `13px` |
| `--el-notification-group-margin-right` | `.el-notification` | `8px` |

### Pagination
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-pagination-button-width` | `.el-pagination` | `32px` |
| `--el-pagination-button-height` | `.el-pagination` | `32px` |
| `--el-pagination-button-width-large` | `.el-pagination` | `40px` |
| `--el-pagination-button-height-large` | `.el-pagination` | `40px` |
| `--el-pagination-button-width-small` | `.el-pagination` | `24px` |
| `--el-pagination-button-height-small` | `.el-pagination` | `24px` |
| `--el-pagination-border-radius` | `.el-pagination` | `2px` |
| `--el-pagination-item-gap` | `.el-pagination` | `16px` |

### Popover / Popper
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-popover-border-radius` | `.el-popover` | `4px` |
| `--el-popover-padding` | `.el-popover` | `12px` |
| `--el-popover-padding-large` | `.el-popover` | `18px 20px` |
| `--el-popper-border-radius` | `.el-popper` | `var(--el-popover-border-radius,4px)` |

### Radio
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-radio-input-height` | `.el-radio` | `14px` |
| `--el-radio-input-width` | `.el-radio` | `14px` |

### Rate
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-rate-icon-size` | `.el-rate` | `18px` |
| `--el-rate-icon-margin` | `.el-rate` | `6px` |
| `--el-rate-height` | `.el-rate` | `20px` |

### Result
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-result-padding` | `.el-result` | `40px 30px` |
| `--el-result-icon-font-size` | `.el-result` | `64px` |
| `--el-result-title-margin-top` | `.el-result` | `20px` |
| `--el-result-subtitle-margin-top` | `.el-result` | `10px` |
| `--el-result-extra-margin-top` | `.el-result` | `30px` |

### Segmented
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-segmented-padding` | `.el-segmented` | `2px` |

### Slider
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-slider-height` | `.el-slider` | `6px` |
| `--el-slider-border-radius` | `.el-slider` | `3px` |
| `--el-slider-button-size` | `.el-slider` | `20px` |
| `--el-slider-button-wrapper-size` | `.el-slider` | `36px` |
| `--el-slider-button-wrapper-offset` | `.el-slider` | `-15px` |

### Table
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-table-fixed-left-column` | `.el-table` | `inset 10px 0 10px -10px #00000026` |
| `--el-table-fixed-right-column` | `.el-table` | `inset -10px 0 10px -10px #00000026` |

### Tabs
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-tabs-header-height` | `.el-tabs` | `40px` |

### Tag
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-tag-border-radius` | `.el-tag` | `4px` |
| `--el-tag-border-radius-rounded` | `.el-tag` | `9999px` |
| `--el-icon-size` | `.el-tag` | `14px` |
| `--el-icon-size` | `.el-tag--small` | `12px` |
| `--el-icon-size` | `.el-tag--large` | `16px` |

### Timeline
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-timeline-node-size-normal` | `.el-timeline` | `12px` |
| `--el-timeline-node-size-large` | `.el-timeline` | `14px` |

### Tour
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-tour-width` | `.el-tour` | `520px` |
| `--el-tour-padding-primary` | `.el-tour` | `12px` |
| `--el-tour-border-radius` | `.el-tour` | `4px` |

### Transfer
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-transfer-panel-width` | `.el-transfer` | `200px` |
| `--el-transfer-panel-header-height` | `.el-transfer` | `40px` |
| `--el-transfer-panel-footer-height` | `.el-transfer` | `40px` |
| `--el-transfer-panel-body-height` | `.el-transfer` | `278px` |
| `--el-transfer-item-height` | `.el-transfer` | `30px` |
| `--el-transfer-filter-height` | `.el-transfer` | `32px` |

### Tree
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-tree-node-content-height` | `.el-tree` | `26px` |
| `--el-tree-node-content-height` | `.el-tree-select` | `26px` |

### Upload
| 变量 | 选择器 | EP 值 |
|------|-------|-------|
| `--el-upload-picture-card-size` | `.el-upload` | `148px` |
| `--el-upload-dragger-padding-horizontal` | `.el-upload` | `10px` |
| `--el-upload-dragger-padding-vertical` | `.el-upload` | `40px` |

---

## 第四节：操作清单

### 立即处理（HIGH 风险，字号覆盖无效）

将以下内容追加或补充到对应的 `components/*.scss` 文件：

| 文件 | 需要添加的内容 |
|------|--------------|
| `components/alert.scss` | `.el-alert` 选择器内声明 5 个字号变量 |
| `components/anchor.scss` | `.el-anchor` 内声明 `--el-anchor-font-size` |
| `components/badge.scss` | `.el-badge` 内声明 `--el-badge-font-size` |
| `components/checkbox.scss` | `.el-checkbox` 内声明 `--el-checkbox-font-size` |
| `components/dialog.scss` | `.el-dialog` 内声明 `--el-dialog-content-font-size` |
| `components/input.scss` | `.el-input-tag--large/--small` 内声明 `--el-input-tag-font-size` |
| `components/message-box.scss` | `.el-message-box` 内声明 `--el-messagebox-error-font-size` |
| `components/notification.scss` | `.el-notification` 内声明 title/close 字号 |
| `components/pagination.scss` | `.el-pagination` 内声明 2 个字号变量 |
| `components/popover.scss` | `.el-popover` 内声明 `--el-popover-title-font-size` |
| `components/result.scss` | `.el-result` 内声明 `--el-result-title-font-size` |
| `components/select.scss` | `.el-select` 内声明 `--el-select-input-font-size` |
| `components/tag.scss` | `.el-tag` 内声明 `--el-tag-font-size` |
| `components/tour.scss` | `.el-tour` 内声明 2 个字号变量 |
| `components/form.scss` | `.el-form-item--large/--default/--small` 内声明 `--font-size` |

### 清理（可选）

处理完上述迁移后，可以从 `var-mapping.scss` 的 `:root` 块中删除已迁移到组件 scss 的变量条目，避免混淆。

### 暂不处理（尺寸类 px 变量）

第三节中的 127 个尺寸 px 变量（padding、height、width 等）在固定字号情况下通常视觉正常，如需缩放可在各自的组件 scss 中按需覆盖。
