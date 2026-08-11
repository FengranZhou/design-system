#!/bin/bash
# guard-control-selection.sh
# PreToolUse hook：在 Write/Edit/MultiEdit 落盘前，检测「用了标准组件、但可能选错了哪一个」。
#
# 与 guard-reinvent-components.sh 的分工（两者互补，不重叠）：
#   guard-reinvent  拦「手撸组件库已有之物」——写法本身就违规（自拼浮层、自造菜单条目…）
#   guard-control   拦「用了合法组件、但在几个合法组件之间选错」——写法完全合规，错在选型
#
# 为什么需要它：真实翻车——给一个「二选一」配置项直接抓了 el-select，而
# select-pattern.md 明写「≤5 且需并排比较 → Radio」。事后复盘：不是没读懂规则，是
# **根本没触发去读**——心理过程直接从「要个二选一」跳到「el-select」，中间没有停顿。
# 这类错误 guard-reinvent 永远拦不住：el-select 是标准组件、写法合规、没有任何自造轮子特征。
# 规则写得再全也挡不住「没去读」，唯一验证有效的机制是 hook 硬拦。
#
# 设计原则（与另两个 guard 一致）：
#   - 只拦「规则真的限定了选择」的场景，宁可漏网也不频繁打断；
#   - 只看本次新增内容，不扫全文件；
#   - shell 只收集 ASCII key，中文文案交给 jq，免疫 C locale 坏字节。
#
# 命中规则：
#   select_count    el-select 且能数出选项数 ≤5（规则：≤5 且需并排比较应优先 Radio）
#   switch_textpos  给 el-switch 配文字标签（active-text/inactive-text 的左右取舍有硬规则）
#   icon_only_btn   纯图标按钮（无文案）——必须配 tooltip 且传 show-after=300
#   dialog_width    el-dialog 自定义宽度（只有 400/640/800 三档合法）

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 只汇总本次「新写入/新增」的内容
CONTENT=$(echo "$INPUT" | jq -r '
  ( .tool_input.content // empty ),
  ( .tool_input.new_string // empty ),
  ( .tool_input.edits // [] | map(.new_string // empty) | join("\n") )
' 2>/dev/null)

case "$FILE_PATH" in
  *.vue|*.jsx|*.tsx|*.html) : ;;
  *) exit 0 ;;
esac

# 源头层豁免：组件库本体定义这些东西，拦它没意义
case "$FILE_PATH" in
  */el-theme/*|*/node_modules/*|*/dist/*) exit 0 ;;
esac

KEYS=""
add_key() {
  case " $KEYS " in *" $1 "*) : ;; *) KEYS="${KEYS} $1" ;; esac
}

# ── 规则 1：el-select 但选项很少 ────────────────────────────────
# 只在「能直接数出静态 el-option 个数」时判断——v-for 动态渲染的选项数运行时才知道，
# 数不出来就不拦（宁可漏网，不误打断）。
if echo "$CONTENT" | grep -qiE '<el-select'; then
  # v-for 渲染的选项：个数未知，跳过
  if ! echo "$CONTENT" | grep -qiE '<el-option[^>]*v-for'; then
    # ⚠️ 必须用 grep -o | wc -l 数「出现次数」，不能用 grep -c——后者数的是「匹配行数」，
    # 选项写在同一行时会得到 1，导致该拦的漏掉（写成多行才拦得住＝时灵时不灵）。
    OPT_COUNT=$(echo "$CONTENT" | grep -oiE '<el-option' | wc -l | tr -d ' ')
    # 1 个通常是写了一半；2..5 个是规则明确覆盖的区间
    if [ "$OPT_COUNT" -ge 2 ] && [ "$OPT_COUNT" -le 5 ]; then
      add_key select_count
    fi
  fi
fi

# ── 规则 2：给 Switch 配文字标签 ────────────────────────────────
# active-text（右，默认）与 inactive-text（左，窄条件例外）的取舍有硬规则，且两者互斥。
echo "$CONTENT" | grep -qiE '<el-switch' \
  && echo "$CONTENT" | grep -qiE '(active-text|inactive-text)' \
  && add_key switch_textpos

# ── 规则 3：纯图标按钮 ──────────────────────────────────────────
# 特征：el-button 内只有 #icon 插槽、没有文案。必须配 tooltip 给全称 + show-after=300。
# 只在「本次内容里既有纯图标按钮特征、又没出现 el-tooltip」时命中。
# ⚠️ 必须确认「真的没有文案」再报——只看有没有 #icon 插槽会把
# `<el-button><template #icon>…</template>添加组</el-button>` 这种带文案的正常按钮误判。
# 误报会训练出「无脑点放行」的习惯，比不拦更糟。
# 判据：把 </template> 与 </el-button> 之间的内容取出，若去掉标签/空白后为空 → 纯图标。
if echo "$CONTENT" | grep -qiE '<el-button' && echo "$CONTENT" | grep -qiE '<template[^>]*#icon'; then
  # 逐个 el-button 块检查（tr 把换行压成空格，便于跨行匹配）
  BTN_BODIES=$(echo "$CONTENT" | tr '\n' ' ' | grep -oiE '</template>[^<]*</el-button>')
  # 只要存在「</template> 后直接跟 </el-button>（中间只有空白）」的按钮，就是纯图标按钮
  if echo "$BTN_BODIES" | grep -qiE '</template>[[:space:]]*</el-button>'; then
    if ! echo "$CONTENT" | grep -qiE '<el-tooltip'; then
      add_key icon_only_btn
    elif ! echo "$CONTENT" | grep -qiE 'show-after'; then
      add_key icon_only_btn
    fi
  fi
fi

# ── 规则 4：Dialog 非档位宽度 ───────────────────────────────────
# 合法只有 400 / 640 / 800 三档；出现其它数值即越界。
if echo "$CONTENT" | grep -qiE '<el-dialog'; then
  WIDTHS=$(echo "$CONTENT" | grep -oiE 'width="[0-9]+' | grep -oE '[0-9]+')
  for w in $WIDTHS; do
    case "$w" in
      400|640|800) : ;;
      *) add_key dialog_width ;;
    esac
  done
fi

KEYS=$(echo "$KEYS" | sed 's/^ *//;s/ *$//')

[ -z "$KEYS" ] && exit 0

# ── 决策输出 ──────────────────────────────────────────────────
REASON=$(jq -rn --arg keys "$KEYS" --arg fp "$FILE_PATH" '
  {
    select_count: "用了 el-select，但静态选项只有 2~5 个。\n      规则（patterns/select-pattern.md）：**>5 才不建议 Radio；≤5 且需并排比较时 Radio 更好**\n      ——下拉要点开才知道有什么，平铺的 Radio 一眼可比、少一次交互。\n      本仓库 demo 的配置项默认用基础 el-radio。",
    switch_textpos: "给 el-switch 配了文字标签，位置有硬规则（component-interaction.md Switch 段）：\n      **默认 active-text 落右侧**；仅当「开关左侧无内容、且右侧存在其他内容」时\n      才改用 inactive-text 置左（否则文字夹在开关与右侧内容之间、归属不清）。\n      两者互斥，一个开关只配一个标签。",
    icon_only_btn: "疑似纯图标按钮（有 #icon 插槽），但本次内容里没有配套的 el-tooltip / show-after。\n      规则（component-interaction.md Tooltip 段）：**纯图标入口必须配 tooltip 给全称**\n      （否则语义靠猜），且 **每个 tooltip 必传 :show-after=\"300\"**——\n      这是 JS prop，源头 scss 兜不住，漏传即漏。",
    dialog_width: "el-dialog 用了非档位宽度。规则（component-interaction.md Dialog 段）：\n      宽度**只有三档**——确认/单字段=400、常规表单=640、复杂/双列=800。\n      其它数值（如 480）越界。"
  } as $map
  | ($keys | split(" ") | map($map[.]) | map("\n  • " + .) | join("")) as $bullets
  | ("检测到疑似「组件选型 / 用法」与设计规范不符，已暂停：" + $bullets
     + "\n\n文件：" + $fp
     + "\n\n这不是「写法违规」——你用的是标准组件，问题在**选了哪一个 / 怎么配**。"
     + "\n先做这两件事，再决定是否继续："
     + "\n  1. 读设计系统 references 的对应段（本仓库在 design-spec/；下游项目在所引用的"
     + "\n     设计系统包内，路径见你项目根 CLAUDE.md 里那行 @…/design-spec/CLAUDE.md）。"
     + "\n     入口是 CLAUDE.md 的「任务 → 必读细则」触发表。"
     + "\n  2. 确认你的选择符合规则；若规则确实没覆盖你的场景，先与用户确认，不要就地拍板。"
     + "\n\n若判断有误（如选项数会动态增长、宽度确有特殊约定）→ 放行即可。")
')

printf '%s\n' "════════ 组件选型拦截 ════════" "$REASON" "════════════════════════════" >&2

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
