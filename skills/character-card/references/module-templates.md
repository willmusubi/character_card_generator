# Mufy 角色卡模块模板

## 目录

### Part A: 角色卡内容模块（8大模块）
1. [角色信息](#1-角色信息)
2. [人设](#2-人设)
3. [逆境处理](#3-逆境处理)
4. [情节设定](#4-情节设定)
5. [输出设定](#5-输出设定)
6. [样例对话](#6-样例对话)
7. [小剧场](#7-小剧场)
8. [开场设计](#8-开场设计)

### Part B: 输出模块HTML模板（内联样式）
9. [场景信息模块](#9-场景信息模块)
10. [正文内容模块](#10-正文内容模块)
11. [角色状态栏模块](#11-角色状态栏模块)
12. [记忆模块](#12-记忆模块)
13. [好感度模块](#13-好感度模块)
14. [群聊模块](#14-群聊模块)
15. [小剧场场景卡片](#15-小剧场场景卡片)

---

# Part A: 角色卡内容模块

---

## 1. 角色信息

**Mufy字段**: 角色简介/角色信息
**字数**: 100-200字

### 模板

```
角色名称：[名字]
角色性别：[男/女/其他]
角色年龄：[年龄或年龄段]
角色定位：[一句话定位]

与用户的关系：[恋人/朋友/同事/陌生人等]
核心价值：[这个角色能给用户带来什么]
使用场景：[日常聊天/深夜陪伴/学习辅导等]
```

---

## 2. 人设

**Mufy字段**: 人设
**字数**: 400-600字

### 模板

```
### {{char}}设定

**身份**：[完整身份背景]

**外貌**：[详细外貌描述]

**音色**：[声音特点描述]

**穿衣习惯**：[日常穿着风格]

**饮食偏好**：[喜欢/讨厌的食物]

**兴趣爱好**：[3-5个具体爱好]

**性格**：
- [性格1]：[说明]
- [性格2]：[说明]
- [性格3]：[说明]

**对{{user}}的情感**：[感情定位和态度]

**简介**：[2-3句话的角色简介]

**角色经历**：[重要背景故事]

### 扮演风格

**语言风格**：[具体描述]
- 日常：「示例台词」
- 开心时：「示例台词」
- 生气时：「示例台词」
- 撒娇时：「示例台词」

**对{{user}}的态度**：[具体描述]

**台词要求**：[风格要求]

### 行为边界

**永远不会做的事**：
- [边界1]
- [边界2]
- [边界3]
```

---

## 3. 逆境处理

**Mufy字段**: 逆境处理
**字数**: 150-250字

### 模板

```
**[违规内容请求]**
当{{user}}请求不适当内容时：
「[角色风格的婉拒台词]」
→ [处理方式]

**[信息不足]**
当信息不够做出回应时：
「[角色风格的追问台词]」
→ [处理方式]

**[情绪激动/攻击性]**
当{{user}}情绪激动或言语攻击时：
「[角色风格的安抚台词]」
→ [处理方式]

**[超出能力范围]**
当被问及无法回答的问题时：
「[角色风格的坦诚台词]」
→ [处理方式]
```

---

## 4. 情节设定

**Mufy字段**: 情节设定
**字数**: 200-400字

### 模板

```
**[世界背景]**
[描述时代、地点、社会结构等]

**[已发生的事实]**（不可推翻）
- [事实1]
- [事实2]
- [事实3]

**[永远不变的规则]**
- [规则1]
- [规则2]
- [规则3]

**[当前阶段]**
[描述角色目前所处的关系/剧情阶段]
```

---

## 5. 输出设定

**Mufy字段**: 输出设定
**特殊要求**: 必须包含完整的输出模块HTML模板（内联样式）

### 模板结构

```
### 回复结构

每次回复按以下顺序输出：
1. 场景信息（仅场景变化时显示）
2. 正文内容（对话与叙述）
3. 角色状态栏（每次必须，放在最后）
4. [其他模块，如有]

### 格式规范

- 回复长度：200-400字
- 语言风格：[风格描述]
- 人称视角：[第一人称/第三人称]
- 动作描写：使用 *动作* 格式

### 输出模块模板

**场景信息**（场景变化时显示）：
[此处插入场景信息模块HTML，见Part B第9节]

**正文内容**：
[此处插入正文内容模块HTML，见Part B第10节]

**角色状态栏**（每次回复最后必须输出）：
[此处插入状态栏模块HTML，见Part B第11节]

### 模块填写规则

| 字段 | 说明 | 示例 |
|------|------|------|
| 时辰/时间 | 当前时间 | 戌时 / 深夜23:00 |
| 地点 | 具体场景 | 王允府·后花园 |
| 氛围 | 环境描述 | 月朗星稀 |
| 衣着 | 当前穿着 | 月白广袖长裙 |
| 动作 | 当前动作 | 倚窗望月 |
| 神态 | 表情状态 | 若有所思 |
| 内心 | 内心独白 | 他为何会在此... |
```

---

## 6. 样例对话

**Mufy字段**: 样例对话/对话示例
**字数**: 300-500字
**要求**: 使用完整输出模块格式

### 模板

```
**[对话1：日常互动]**
用户：[用户消息示例]
角色：
[使用完整输出模块格式的回复，包含场景信息（如需）、正文、状态栏]

**[对话2：情感场景]**
用户：[用户消息示例]
角色：
[使用完整输出模块格式的回复]

---
**文风说明**：
- 句式特点：[描述]
- 口癖/特色用语：[如有]
- 情感表达方式：[描述]
```

---

## 7. 小剧场

**Mufy字段**: 小剧场
**特殊要求**: 必须包含 `<style>` 标签的CSS代码 + 场景卡片HTML

### 模板结构

```html
<style>
/* ===== [主题名称] 美化CSS ===== */
[完整的CSS代码，见 references/themes.md]
</style>

<!-- 小剧场场景 -->
[3-5个场景卡片HTML，使用内联样式，见Part B第15节]
```

---

## 8. 开场设计

**Mufy字段**: 开场白/Greeting
**字数**: 300-500字
**要求**: 使用完整输出模块格式

### 模板

```html
[场景信息模块 HTML]

[正文内容模块 HTML，包含场景描述和第一句对话]

[角色状态栏模块 HTML]
```

---

# Part B: 输出模块HTML模板（内联样式）

> **重要**: 以下所有模块使用内联样式，确保在Mufy平台正确渲染。
> 根据角色类型选择对应主题的模板。

---

## 9. 场景信息模块

**用途**: 显示当前场景的时间、地点、氛围
**显示条件**: 仅在场景变化时显示

### 古风水墨主题

```html
<div style="background:linear-gradient(90deg,transparent,#f5f0e6 10%,#f5f0e6 90%,transparent);padding:10px 20px;margin:12px 0;text-align:center;border-top:1px dashed #d4c4a8;border-bottom:1px dashed #d4c4a8;font-family:'Noto Serif SC',serif;">
  <span style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin:0 12px;">◷ [时辰]</span>
  <span style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin:0 12px;">◈ [地点]</span>
  <span style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin:0 12px;">❋ [氛围]</span>
</div>
```

### 赛博朋克主题

```html
<div style="background:linear-gradient(90deg,transparent,rgba(0,245,255,0.1) 10%,rgba(0,245,255,0.1) 90%,transparent);padding:10px 20px;margin:12px 0;text-align:center;border-top:1px solid rgba(0,245,255,0.3);border-bottom:1px solid rgba(0,245,255,0.3);font-family:monospace;">
  <span style="color:#00f5ff;font-size:0.85em;letter-spacing:2px;margin:0 12px;text-shadow:0 0 10px #00f5ff;">◷ [时间]</span>
  <span style="color:#00f5ff;font-size:0.85em;letter-spacing:2px;margin:0 12px;text-shadow:0 0 10px #00f5ff;">◈ [地点]</span>
  <span style="color:#ff00ff;font-size:0.85em;letter-spacing:2px;margin:0 12px;text-shadow:0 0 10px #ff00ff;">❋ [氛围]</span>
</div>
```

### 现代简约主题

```html
<div style="padding:16px 0;margin:12px 0;text-align:left;border-bottom:1px solid #e8e8e8;font-family:sans-serif;">
  <span style="color:#999;font-size:0.75em;letter-spacing:3px;text-transform:uppercase;">[时间] · [地点]</span>
</div>
```

### 暖系可爱主题

```html
<div style="background:linear-gradient(90deg,transparent,#fff5f5 10%,#fff5f5 90%,transparent);padding:12px 20px;margin:12px 0;text-align:center;border-radius:20px;font-family:sans-serif;">
  <span style="color:#ff9a9e;font-size:0.9em;margin:0 8px;">🕐 [时间]</span>
  <span style="color:#ff9a9e;font-size:0.9em;margin:0 8px;">📍 [地点]</span>
  <span style="color:#fecfef;font-size:0.9em;margin:0 8px;">✨ [氛围]</span>
</div>
```

---

## 10. 正文内容模块

**用途**: 包裹对话和叙述内容

### 古风水墨主题

```html
<div style="background:#fdfbf7;border-left:3px solid #c4b49a;padding:16px 20px;margin:12px 0;color:#5d4e4e;line-height:2;font-family:'Noto Serif SC',serif;">
[正文内容，包含对话与 *动作描写*]
</div>
```

### 赛博朋克主题

```html
<div style="background:rgba(26,26,46,0.8);border-left:3px solid #00f5ff;padding:16px 20px;margin:12px 0;color:#e0e0e0;line-height:1.8;font-family:monospace;">
[正文内容]
</div>
```

### 现代简约主题

```html
<div style="padding:16px 0;margin:12px 0;color:#1a1a1a;line-height:1.8;font-family:sans-serif;">
[正文内容]
</div>
```

### 暖系可爱主题

```html
<div style="background:#fff;border-radius:16px;padding:16px 20px;margin:12px 0;color:#5d4e4e;line-height:1.9;font-family:sans-serif;box-shadow:0 2px 8px rgba(255,154,158,0.1);">
[正文内容]
</div>
```

---

## 11. 角色状态栏模块

**用途**: 显示角色当前状态
**显示位置**: 每次回复的**最后**

### 古风水墨主题

```html
<div style="background:linear-gradient(135deg,#fdfbf7,#f5f0e6);border:1px solid #d4c4a8;border-radius:8px;padding:16px;margin:12px 0;font-family:'Noto Serif SC',serif;">
  <div style="text-align:center;color:#5d4e4e;font-size:1.1em;letter-spacing:4px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e8dcc8;">◈ [角色名] ◈</div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#8b7355;min-width:48px;">衣着</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#5d4e4e;">[衣着描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#8b7355;min-width:48px;">动作</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#5d4e4e;">[动作描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#8b7355;min-width:48px;">神态</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#5d4e4e;">[神态描述]</span></div>
  <div style="display:flex;padding:10px 12px;font-size:0.9em;background:linear-gradient(90deg,transparent,rgba(139,115,85,0.08),transparent);border-radius:4px;margin-top:8px;"><span style="color:#8b7355;min-width:48px;">内心</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#8b7355;font-style:italic;">（[内心独白]）</span></div>
</div>
```

### 赛博朋克主题

```html
<div style="background:linear-gradient(135deg,#1a1a2e,#0a0a0f);border:1px solid rgba(0,245,255,0.3);border-left:3px solid #00f5ff;padding:16px;margin:12px 0;font-family:monospace;">
  <div style="color:#00f5ff;font-size:1em;letter-spacing:2px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(0,245,255,0.2);text-shadow:0 0 10px #00f5ff;">▸ [角色名] :: STATUS</div>
  <div style="display:flex;padding:4px 0;font-size:0.9em;"><span style="color:#00f5ff;min-width:60px;">OUTFIT</span><span style="color:#e0e0e0;">[衣着描述]</span></div>
  <div style="display:flex;padding:4px 0;font-size:0.9em;"><span style="color:#00f5ff;min-width:60px;">ACTION</span><span style="color:#e0e0e0;">[动作描述]</span></div>
  <div style="display:flex;padding:4px 0;font-size:0.9em;"><span style="color:#00f5ff;min-width:60px;">MOOD</span><span style="color:#e0e0e0;">[神态描述]</span></div>
  <div style="display:flex;padding:8px 12px;font-size:0.9em;background:rgba(255,0,255,0.1);border-left:2px solid #ff00ff;margin-top:8px;"><span style="color:#ff00ff;min-width:60px;">MIND</span><span style="color:#ff00ff;font-style:italic;">[内心独白]</span></div>
</div>
```

### 现代简约主题

```html
<div style="background:#fafafa;border-left:2px solid #1a1a1a;padding:20px;margin:16px 0;font-family:sans-serif;">
  <div style="font-size:0.75em;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">[角色名] · STATUS</div>
  <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;font-size:0.9em;">
    <span style="color:#999;">Outfit</span><span style="color:#1a1a1a;">[衣着描述]</span>
    <span style="color:#999;">Action</span><span style="color:#1a1a1a;">[动作描述]</span>
    <span style="color:#999;">Mood</span><span style="color:#1a1a1a;">[神态描述]</span>
  </div>
  <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e8e8e8;font-style:italic;color:#666;font-size:0.9em;">[内心独白]</div>
</div>
```

### 暖系可爱主题

```html
<div style="background:linear-gradient(135deg,#fff5f5,#fecfef20);border:2px solid #fecfef;border-radius:16px;padding:16px;margin:12px 0;font-family:sans-serif;">
  <div style="text-align:center;color:#ff9a9e;font-size:1em;margin-bottom:12px;padding-bottom:10px;border-bottom:2px dashed #fecfef;">💕 [角色名] 💕</div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#ff9a9e;min-width:60px;">👗 衣着</span><span style="color:#5d4e4e;">[衣着描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#ff9a9e;min-width:60px;">✨ 动作</span><span style="color:#5d4e4e;">[动作描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#ff9a9e;min-width:60px;">😊 神态</span><span style="color:#5d4e4e;">[神态描述]</span></div>
  <div style="background:#fff5f5;border-radius:12px;padding:10px 12px;margin-top:8px;font-size:0.9em;"><span style="color:#ff9a9e;">💭</span><span style="color:#ff9a9e;font-style:italic;margin-left:8px;">（[内心独白]）</span></div>
</div>
```

---

## 12. 记忆模块

**用途**: 有序记录重要记忆
**显示条件**: 用户指定时添加

### 古风水墨主题

```html
<div style="background:linear-gradient(135deg,#fdfbf7,#f5f0e6);border:1px dashed #d4c4a8;border-radius:4px;padding:12px 16px;margin:12px 0;font-family:'Noto Serif SC',serif;">
  <div style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin-bottom:8px;border-bottom:1px solid #e8dcc8;padding-bottom:6px;">◈ 记忆札记 ◈</div>
  <div style="color:#5d4e4e;font-size:0.9em;line-height:1.8;">
    <div style="padding:4px 0;"><span style="color:#8b7355;">〈01〉</span> [记忆内容1]</div>
    <div style="padding:4px 0;"><span style="color:#8b7355;">〈02〉</span> [记忆内容2]</div>
  </div>
</div>
```

### 赛博朋克主题

```html
<div style="background:rgba(26,26,46,0.9);border:1px solid rgba(0,245,255,0.3);padding:12px 16px;margin:12px 0;font-family:monospace;">
  <div style="color:#00f5ff;font-size:0.85em;letter-spacing:2px;margin-bottom:8px;text-shadow:0 0 5px #00f5ff;">▸ MEMORY_LOG</div>
  <div style="color:#e0e0e0;font-size:0.9em;line-height:1.6;">
    <div style="padding:4px 0;"><span style="color:#00f5ff;">[01]</span> [记忆内容1]</div>
    <div style="padding:4px 0;"><span style="color:#00f5ff;">[02]</span> [记忆内容2]</div>
  </div>
</div>
```

---

## 13. 好感度模块

**用途**: 显示与角色的关系等级/进度
**显示条件**: 用户指定时添加

### 古风水墨主题

```html
<div style="background:linear-gradient(135deg,#fdfbf7,#f5f0e6);border:1px solid #d4c4a8;border-radius:8px;padding:12px 16px;margin:12px 0;font-family:'Noto Serif SC',serif;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
    <span style="color:#c41e3a;">♥</span>
    <span style="color:#5d4e4e;">[角色名]</span>
    <span style="color:#8b7355;font-size:0.85em;">· 好感度</span>
  </div>
  <div style="height:8px;background:#e8dcc8;border-radius:4px;overflow:hidden;">
    <div style="height:100%;width:[百分比]%;background:linear-gradient(90deg,#c41e3a,#ff6b6b);border-radius:4px;"></div>
  </div>
  <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:0.85em;">
    <span style="color:#8b7355;">关系：[关系描述]</span>
    <span style="color:#c41e3a;">Lv.[等级] ([当前]/[最大])</span>
  </div>
</div>
```

---

## 14. 群聊模块

**用途**: 微信风格的多人群聊
**显示条件**: 用户指定时添加

### 古风水墨主题

```html
<div style="background:#f5f0e6;border:1px solid #d4c4a8;border-radius:8px;padding:12px;margin:12px 0;font-family:'Noto Serif SC',serif;">
  <div style="color:#8b7355;font-size:0.85em;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px dashed #d4c4a8;">[群名称]</div>

  <!-- 单条消息 -->
  <div style="display:flex;gap:8px;margin-bottom:12px;">
    <div style="width:32px;height:32px;background:#d4c4a8;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#5d4e4e;font-size:0.8em;flex-shrink:0;">[名]</div>
    <div>
      <div style="color:#8b7355;font-size:0.75em;margin-bottom:2px;">[发言人名字]</div>
      <div style="background:#fdfbf7;padding:8px 12px;border-radius:0 8px 8px 8px;color:#5d4e4e;font-size:0.9em;display:inline-block;">[发言内容]</div>
    </div>
  </div>
</div>
```

---

## 15. 小剧场场景卡片

**用途**: 小剧场中的沉浸感短场景

### 古风水墨主题

```html
<div style="background:linear-gradient(135deg,#faf6ed,#f0e6d3);border:1px solid #d4c4a8;border-radius:8px;padding:20px;margin:12px 0;box-shadow:0 2px 12px rgba(139,115,85,0.15);font-family:'Noto Serif SC',serif;">
  <div style="font-size:0.85em;color:#8b7355;letter-spacing:4px;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #d4c4a8;">[场景图标] [场景标题]</div>
  <div style="color:#5d4e4e;line-height:1.8;text-align:center;">「[对话内容]」</div>
  <div style="color:#8b7355;font-style:italic;font-size:0.9em;text-align:center;margin-top:8px;">*[动作描写]*</div>
</div>
```

### 赛博朋克主题

```html
<div style="background:linear-gradient(135deg,#1a1a2e,#0a0a0f);border:1px solid rgba(0,245,255,0.3);padding:20px;margin:12px 0;font-family:monospace;">
  <div style="font-size:0.85em;color:#00f5ff;letter-spacing:2px;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(0,245,255,0.2);text-shadow:0 0 10px #00f5ff;">[场景图标] [场景标题]</div>
  <div style="color:#e0e0e0;line-height:1.8;text-align:center;">"[对话内容]"</div>
  <div style="color:#ff00ff;font-style:italic;font-size:0.9em;text-align:center;margin-top:8px;">*[动作描写]*</div>
</div>
```

### 现代简约主题

```html
<div style="background:#fafafa;border-left:2px solid #1a1a1a;padding:20px;margin:12px 0;font-family:sans-serif;">
  <div style="font-size:0.75em;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">[场景标题]</div>
  <div style="color:#1a1a1a;line-height:1.8;">"[对话内容]"</div>
  <div style="color:#666;font-style:italic;font-size:0.9em;margin-top:8px;">*[动作描写]*</div>
</div>
```

### 暖系可爱主题

```html
<div style="background:linear-gradient(135deg,#fff5f5,#fecfef20);border:2px solid #fecfef;border-radius:16px;padding:20px;margin:12px 0;font-family:sans-serif;">
  <div style="font-size:0.9em;color:#ff9a9e;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:2px dashed #fecfef;">[场景图标] [场景标题]</div>
  <div style="color:#5d4e4e;line-height:1.8;text-align:center;">"[对话内容]"</div>
  <div style="color:#ff9a9e;font-style:italic;font-size:0.9em;text-align:center;margin-top:8px;">*[动作描写]*</div>
</div>
```

---

## 风格参考

### 温柔治愈型
```
语言风格：温和、包容、细腻
「没关系的，慢慢来就好。」
「累了的话，就休息一下吧。」
```

### 傲娇毒舌型
```
语言风格：表面嫌弃、实则关心
「谁、谁要关心你啊！只是顺便问一下而已！」
「哼，算你还有点良心。」
```

### 冷静专业型
```
语言风格：理性、简洁、有条理
「让我分析一下情况。」
「根据目前的信息，我的建议是……」
```

### 活泼开朗型
```
语言风格：元气、热情、爱用语气词
「哇！真的吗真的吗？」
「走走走，我们去看看！」
```
