#!/bin/bash
# guard-reinvent-components.sh
# PreToolUse hook：在 Write/Edit/MultiEdit 真正修改文件前，检测是否在「手撸一个组件库已有的东西」。
# 命中任一高置信度信号 → permissionDecision=ask，强制弹确认（auto mode 下也拦得住）。
#
# 为什么需要它：设计系统的规则（component-interaction.md 826 行 + CLAUDE.md 触发表）写得再全，
# 也挡不住「看到形态就直接挑底层组件自己拼」——规则齐备但根本没去读，是反复翻车的真实原因。
# 唯一被验证真正管用的机制是 hook 硬拦（参考 guard-global-styles.sh）。本 hook 补上这一环：
# 在「自造轮子」落盘前逼停一次，先回答「组件库里这东西叫什么」。
#
# 设计原则（与 guard-global-styles.sh 一致）：
#   - 只拦高置信度特征（明确在重造已有组件），宁可漏网也不频繁打断；
#   - 只看「本次新增内容」，不扫全文件（改一行不该被历史代码连坐）；
#   - shell 层只收集 ASCII key，中文文案交给 jq，免疫 C locale 坏字节。
#
# 命中规则：
#   floating_panel  自写浮层面板（position:absolute|fixed + z-index/浮层语义 class）
#   custom_menu     自写下拉/菜单条目（.xxx-menu-item / .xxx-dropdown-item / role="menu"）
#   custom_overlay  自写遮罩层（.mask / .overlay / .backdrop + position）
#   custom_widget   自写已有组件的等价物（自定义 class 命中 tooltip/popover/modal/dialog/
#                   drawer/steps/breadcrumb/tabs/pagination/collapse/tree/upload 等）
#   teleport_panel  Teleport to body 自建面板（EP 组件自己会处理，自己写通常=在造轮子）

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 只汇总本次「新写入/新增」的内容（Write=content / Edit=new_string / MultiEdit=edits[].new_string）
CONTENT=$(echo "$INPUT" | jq -r '
  ( .tool_input.content // empty ),
  ( .tool_input.new_string // empty ),
  ( .tool_input.edits // [] | map(.new_string // empty) | join("\n") )
' 2>/dev/null)

# 只关心可能承载 UI 结构的文件
case "$FILE_PATH" in
  *.vue|*.jsx|*.tsx|*.html) : ;;
  *) exit 0 ;;
esac

# 设计系统「源头层」豁免：组件库本体就是定义这些东西的地方，拦它没有意义。
# 判据：路径落在 el-theme/（EP 皮肤覆盖层）里。
# 注意：业务组件层（design-spec/components/）**不豁免**——业务组件同样必须复用基础组件、
# 不得自己拼等价物（见 design-spec/components/CLAUDE.md 铁律 1）。
# 下游项目一般不含 el-theme/（它在被引用的设计系统包里），这条对下游自然不生效。
case "$FILE_PATH" in
  */el-theme/*|*/node_modules/*|*/dist/*) exit 0 ;;
esac

KEYS=""
add_key() {
  case " $KEYS " in *" $1 "*) : ;; *) KEYS="${KEYS} $1" ;; esac
}

# ── 规则 1：自写浮层面板 ────────────────────────────────────────
# 高置信度组合：绝对/固定定位 + (z-index 或浮层语义 class)。单独出现不算（正常布局也用 absolute）。
if echo "$CONTENT" | grep -qiE 'position:\s*(absolute|fixed)'; then
  if echo "$CONTENT" | grep -qiE 'z-index'; then
    if echo "$CONTENT" | grep -qiE '(popup|popper|flyout|float|panel|menu|dropdown|tooltip|popover)'; then
      add_key floating_panel
    fi
  fi
fi

# ── 规则 2：自写下拉/菜单/浮层的「条目行」 ──────────────────────
# 典型自造轮子长相：一个自定义 class 以 -item 结尾，且 class 名里带浮层/菜单语义词。
# 覆盖 flyout-item / dropdown-item / menu-item / panel-item / popup-item 等一整类。
echo "$CONTENT" | grep -qiE 'class="[^"]*(dropdown|menu|flyout|popup|popover|panel|option|select)[a-z_-]*-item' && add_key custom_menu
echo "$CONTENT" | grep -qiE 'role="(menu|menuitem|listbox|option)"' && add_key custom_menu

# ── 规则 3：自写遮罩层 ──────────────────────────────────────────
if echo "$CONTENT" | grep -qiE 'class="[^"]*(mask|overlay|backdrop)'; then
  echo "$CONTENT" | grep -qiE 'position:\s*(absolute|fixed)' && add_key custom_overlay
fi

# ── 规则 4：自写已有组件的等价物 ────────────────────────────────
# 只在「自定义 class 名里出现组件语义词」时命中；el-xxx / a-xxx 等库前缀本身不算。
# 逐词匹配，避免把 el-tooltip 这类正规用法误判。
for w in tooltip popover modal dialog drawer stepper breadcrumb pagination accordion carousel datepicker timepicker autocomplete cascader; do
  # 先摘出所有含该语义词的 class 串，再逐个判断是不是组件库自带前缀（el-/ant-/arco-…）。
  # 不能用「整段内容里有无 el-xxx」来排除——同一次改动里既正规用了 el-tooltip、
  # 又自写了 my-tooltip 时，前者会把后者掩盖掉。
  HITS=$(echo "$CONTENT" | grep -oiE '[a-z0-9_-]*'"$w"'[a-z0-9_-]*' | sort -u)
  [ -z "$HITS" ] && continue
  for h in $HITS; do
    case "$h" in
      el-*|ant-*|arco-*|a-*|n-*|t-*|v-*|van-*) continue ;;
    esac
    # 该词单独出现（如属性名 tooltip="x"）不算；必须是自定义 class 的一部分（带连字符/下划线）
    if echo "$CONTENT" | grep -qiE 'class="[^"]*'"$h"; then
      add_key custom_widget
      break 2
    fi
  done
done

# ── 规则 5：Teleport to body 自建面板 ───────────────────────────
echo "$CONTENT" | grep -qiE '<(Teleport|teleport)[^>]*to="body"' && add_key teleport_panel

# ── 规则 6：拿 el-tag closable 当表单已选值（「形似冒充」类，非手撸）─────
# 前 5 条拦的都是「自己手撸组件库已有之物」；这条相反——用了真实存在的组件，
# 但让它承担了不该承担的职责。hook 看到 <el-tag> 只会觉得"用了标准组件"，
# 所以必须单独判。closable 是关键信号：Tag 是只读状态/分类标识，
# 只读的东西不需要「可关闭」——一旦可删，它多半是表单里的已选值（应为 PickedItem）。
echo "$CONTENT" | grep -qiE '<el-tag[^>]*\bclosable' && add_key tag_as_form_value

KEYS=$(echo "$KEYS" | sed 's/^ *//;s/ *$//')

[ -z "$KEYS" ] && exit 0

# ── 决策输出 ──────────────────────────────────────────────────
# 同 guard-global-styles.sh：reason 先打 stderr（给人看），再走 JSON stdout（驱动弹窗）。
REASON=$(jq -rn --arg keys "$KEYS" --arg fp "$FILE_PATH" '
  {
    floating_panel: "自写浮层面板（absolute/fixed + z-index + 浮层语义 class）",
    custom_menu:    "自写下拉/菜单条目（*-menu-item / *-dropdown-item / role=menu）",
    custom_overlay: "自写遮罩层（mask / overlay / backdrop + 定位）",
    custom_widget:  "自定义 class 里出现了已有组件的语义词（tooltip/modal/drawer/steps/breadcrumb...）",
    teleport_panel: "用 Teleport to body 自建浮层面板",
    tag_as_form_value: "用 <el-tag closable> 当表单已选值（Tag 是只读状态/分类标识，可增删的已选值用业务组件 PickedItem）"
  } as $map
  | ($keys | split(" ") | map($map[.]) | map("\n  • " + .) | join("")) as $bullets
  | ("检测到疑似「在手撸组件库已有的东西」，已暂停：" + $bullets
     + "\n\n文件：" + $fp
     + "\n\n先回答这三个问题，再决定是否继续："
     + "\n  1. 这个形态在组件库里叫什么？（浮出选项面板=Dropdown、就地气泡确认=Popconfirm、"
     + "\n     侧边浮层=Drawer、悬浮说明=Tooltip、分步流程=StepBar、路径导航=Breadcrumb…）"
     + "\n  2. 读过设计系统 references/component-interaction.md 的对应段了吗？"
     + "\n     （本仓库在 design-spec/；下游项目在所引用的设计系统包内，"
     + "\n      路径见你项目根 CLAUDE.md 里那行 @…/design-spec/CLAUDE.md）"
     + "\n     **尤其是「反例」段——反例常常直接写着你正要犯的错。**"
     + "\n  3. 确实没有现成组件、必须自己写吗？"
     + "\n\n若组件库有对应物 → 放弃自写，改用该组件（样式/交互/无障碍都在源头，改一次处处同步）。"
     + "\n确属组件库空白 → 放行，但应先与用户确认是否该新增到组件库。")
')

printf '%s\n' "════════ 自造轮子拦截 ════════" "$REASON" "════════════════════════════" >&2

jq -n --arg reason "$REASON" '
  {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: $reason
    }
  }
'
exit 0
