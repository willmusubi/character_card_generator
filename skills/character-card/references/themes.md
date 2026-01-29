# 小剧场CSS主题库

本文档包含4种预设主题的完整CSS代码，用于小剧场字段。

---

## 使用方式

将选定主题的CSS代码完整复制到「小剧场」字段，格式如下：

```
<style>
[CSS代码]
</style>

[场景卡片内容]
```

---

## 主题1：古风水墨

**适用角色**：古装、仙侠、武侠、三国、古代、宫廷

**配色方案**：
- 主色：#8b7355（棕褐）
- 辅色：#d4c4a8（米黄）
- 背景：#f5f0e6（宣纸白）
- 文字：#5d4e4e（墨灰）
- 强调：#c9a86c（金棕）

### 完整CSS代码

```css
<style>
/* ═══ 古风水墨主题 ═══ */

/* 基础容器 */
.scene-card {
  background: linear-gradient(135deg, #fdfbf7 0%, #f5f0e6 100%);
  border: 1px solid #d4c4a8;
  border-radius: 4px;
  padding: 20px;
  margin: 16px 0;
  font-family: 'Noto Serif SC', 'Source Han Serif CN', serif;
  color: #5d4e4e;
  position: relative;
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.1);
}

.scene-card::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px solid #e8dcc8;
  border-radius: 2px;
  pointer-events: none;
}

/* 场景标题 */
.scene-title {
  text-align: center;
  font-size: 1.2em;
  letter-spacing: 6px;
  color: #8b7355;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #d4c4a8;
}

.scene-title::before,
.scene-title::after {
  content: '◈';
  margin: 0 12px;
  color: #c9a86c;
}

/* 场景信息行 */
.scene-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 0.9em;
  color: #8b7355;
  margin-bottom: 16px;
}

.scene-info span::before {
  content: '『';
  color: #d4c4a8;
}

.scene-info span::after {
  content: '』';
  color: #d4c4a8;
}

/* 场景描述 */
.scene-desc {
  line-height: 1.8;
  text-indent: 2em;
  color: #5d4e4e;
}

/* 装饰分隔线 */
.divider {
  text-align: center;
  margin: 16px 0;
  color: #d4c4a8;
  letter-spacing: 8px;
}

/* 角色对话 */
.dialogue {
  background: rgba(212, 196, 168, 0.2);
  border-left: 3px solid #c9a86c;
  padding: 12px 16px;
  margin: 12px 0;
  font-style: italic;
}

.dialogue .speaker {
  color: #8b7355;
  font-weight: 600;
  margin-bottom: 4px;
}

/* 诗词引用 */
.poetry {
  text-align: center;
  font-size: 1.1em;
  letter-spacing: 4px;
  color: #8b7355;
  margin: 20px 0;
  padding: 16px;
  border-top: 1px dashed #d4c4a8;
  border-bottom: 1px dashed #d4c4a8;
}

/* 结尾印章效果 */
.seal {
  text-align: right;
  margin-top: 20px;
  color: #c9a86c;
  font-size: 0.85em;
}
</style>
```

### 场景卡片示例

```html
<div class="scene-card">
  <div class="scene-title">长安月夜</div>
  <div class="scene-info">
    <span>建安十三年</span>
    <span>相国府后园</span>
    <span>月朗星稀</span>
  </div>
  <div class="scene-desc">
    园中牡丹开得正盛，月色如水般倾泻而下。一袭白衣的女子立于亭中，手持团扇，眉目间似有愁绪。
  </div>
  <div class="divider">— ◆ —</div>
  <div class="dialogue">
    <div class="speaker">貂蝉</div>
    "这长安的月，可曾照过并州的旧路？"
  </div>
</div>
```

---

## 主题2：赛博朋克

**适用角色**：科幻、未来、机械、AI、赛博、太空

**配色方案**：
- 主色：#00f5ff（霓虹青）
- 辅色：#ff00ff（霓虹紫）
- 背景：#0a0a0f（深空黑）
- 文字：#e0e0e0（冷灰白）
- 强调：#ffff00（警告黄）

### 完整CSS代码

```css
<style>
/* ═══ 赛博朋克主题 ═══ */

/* 基础容器 */
.scene-card {
  background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
  border: 1px solid #00f5ff;
  border-radius: 0;
  padding: 20px;
  margin: 16px 0;
  font-family: 'Orbitron', 'Rajdhani', monospace;
  color: #e0e0e0;
  position: relative;
  box-shadow:
    0 0 10px rgba(0, 245, 255, 0.3),
    inset 0 0 20px rgba(0, 245, 255, 0.05);
}

.scene-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00f5ff, #ff00ff, transparent);
}

.scene-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff00ff, #00f5ff, transparent);
}

/* 场景标题 */
.scene-title {
  text-align: center;
  font-size: 1.3em;
  letter-spacing: 4px;
  color: #00f5ff;
  margin-bottom: 16px;
  text-transform: uppercase;
  text-shadow: 0 0 10px #00f5ff;
}

.scene-title::before {
  content: '[ ';
  color: #ff00ff;
}

.scene-title::after {
  content: ' ]';
  color: #ff00ff;
}

/* 场景信息行 */
.scene-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #888;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: rgba(0, 245, 255, 0.05);
  border-left: 2px solid #00f5ff;
}

.scene-info span {
  font-family: monospace;
}

.scene-info .label {
  color: #00f5ff;
  margin-right: 8px;
}

/* 场景描述 */
.scene-desc {
  line-height: 1.7;
  color: #c0c0c0;
  padding-left: 12px;
  border-left: 1px solid #333;
}

/* 系统提示 */
.system-alert {
  background: rgba(255, 0, 255, 0.1);
  border: 1px solid #ff00ff;
  padding: 10px 16px;
  margin: 12px 0;
  font-size: 0.9em;
  color: #ff00ff;
}

.system-alert::before {
  content: '⚠ SYSTEM: ';
  color: #ffff00;
}

/* 角色对话 */
.dialogue {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #00f5ff;
  padding: 12px 16px;
  margin: 12px 0;
}

.dialogue .speaker {
  color: #00f5ff;
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 6px;
}

.dialogue .speaker::before {
  content: '◉ ';
  color: #ff00ff;
}

/* 数据流效果 */
.data-stream {
  font-family: monospace;
  font-size: 0.8em;
  color: #00ff00;
  opacity: 0.6;
  margin: 8px 0;
  overflow: hidden;
}

/* 故障效果文字 */
.glitch {
  color: #ff00ff;
  text-shadow:
    2px 0 #00f5ff,
    -2px 0 #ff00ff;
  animation: glitch 0.3s infinite;
}

@keyframes glitch {
  0%, 100% { text-shadow: 2px 0 #00f5ff, -2px 0 #ff00ff; }
  50% { text-shadow: -2px 0 #00f5ff, 2px 0 #ff00ff; }
}

/* 扫描线效果 */
.scanline {
  position: relative;
}

.scanline::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
}
</style>
```

### 场景卡片示例

```html
<div class="scene-card">
  <div class="scene-title">新东京 · 下城区</div>
  <div class="scene-info">
    <span><span class="label">TIME:</span>2087.03.15 23:47:22</span>
    <span><span class="label">LOC:</span>SECTOR-7G</span>
    <span><span class="label">THREAT:</span>MODERATE</span>
  </div>
  <div class="scene-desc">
    霓虹灯在雨幕中模糊成一片光斑，全息广告牌循环播放着义体改造的宣传语。街角的自动贩卖机闪烁着故障的光芒。
  </div>
  <div class="system-alert">检测到未授权神经接入尝试</div>
  <div class="dialogue">
    <div class="speaker">ARIA-7</div>
    "你的生物特征已被记录。建议在72小时内完成身份验证。"
  </div>
</div>
```

---

## 主题3：现代简约

**适用角色**：现代、都市、职场、校园、日常

**配色方案**：
- 主色：#1a1a1a（纯黑）
- 辅色：#666666（中灰）
- 背景：#ffffff（纯白）
- 文字：#1a1a1a（纯黑）
- 强调：#007aff（苹果蓝）

### 完整CSS代码

```css
<style>
/* ═══ 现代简约主题 ═══ */

/* 基础容器 */
.scene-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 场景标题 */
.scene-title {
  font-size: 1.25em;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* 场景信息行 */
.scene-info {
  display: flex;
  gap: 16px;
  font-size: 0.875em;
  color: #666666;
  margin-bottom: 16px;
}

.scene-info span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scene-info .icon {
  font-size: 1em;
}

/* 场景描述 */
.scene-desc {
  line-height: 1.75;
  color: #333333;
}

/* 分隔线 */
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 20px 0;
}

/* 角色对话 */
.dialogue {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
}

.dialogue .speaker {
  font-weight: 500;
  color: #007aff;
  font-size: 0.875em;
  margin-bottom: 8px;
}

.dialogue .content {
  color: #1a1a1a;
  line-height: 1.6;
}

/* 提示卡片 */
.tip-card {
  background: #f0f7ff;
  border-left: 3px solid #007aff;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  margin: 12px 0;
  font-size: 0.9em;
  color: #333;
}

/* 标签 */
.tag {
  display: inline-block;
  background: #f0f0f0;
  color: #666;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.8em;
  margin-right: 8px;
}

.tag.primary {
  background: #007aff;
  color: white;
}

/* 时间戳 */
.timestamp {
  font-size: 0.8em;
  color: #999;
  text-align: right;
  margin-top: 12px;
}
</style>
```

### 场景卡片示例

```html
<div class="scene-card">
  <div class="scene-title">星巴克 · 国贸店</div>
  <div class="scene-info">
    <span><span class="icon">🕐</span>周五 下午3:30</span>
    <span><span class="icon">📍</span>CBD商圈</span>
    <span><span class="icon">☀️</span>晴朗</span>
  </div>
  <div class="scene-desc">
    午后的咖啡厅里飘着浓郁的咖啡香气。落地窗外，城市的车流有序穿行。她坐在靠窗的位置，手指轻轻敲打着笔记本电脑。
  </div>
  <div class="divider"></div>
  <div class="dialogue">
    <div class="speaker">林晚</div>
    <div class="content">"这份报告下周一之前要交，我们今天把框架定下来吧。"</div>
  </div>
  <div class="timestamp">3:32 PM</div>
</div>
```

---

## 主题4：暖系可爱

**适用角色**：治愈、温馨、可爱、萌系、日系

**配色方案**：
- 主色：#ff9a9e（樱花粉）
- 辅色：#fecfef（浅粉）
- 背景：#fff5f5（奶白粉）
- 文字：#5d4e4e（温暖灰）
- 强调：#ffb6c1（浅玫红）

### 完整CSS代码

```css
<style>
/* ═══ 暖系可爱主题 ═══ */

/* 基础容器 */
.scene-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f5 100%);
  border: 2px solid #fecfef;
  border-radius: 20px;
  padding: 20px;
  margin: 16px 0;
  font-family: 'Noto Sans SC', sans-serif;
  color: #5d4e4e;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.15);
}

.scene-card::before {
  content: '✿';
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 20px;
  color: #ff9a9e;
  background: #fff5f5;
  padding: 0 8px;
}

/* 场景标题 */
.scene-title {
  text-align: center;
  font-size: 1.15em;
  font-weight: 500;
  color: #ff9a9e;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px dashed #fecfef;
}

.scene-title::before {
  content: '♡ ';
}

.scene-title::after {
  content: ' ♡';
}

/* 场景信息行 */
.scene-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 0.9em;
  color: #888;
  margin-bottom: 14px;
}

.scene-info span {
  background: rgba(255, 182, 193, 0.2);
  padding: 4px 12px;
  border-radius: 100px;
}

/* 场景描述 */
.scene-desc {
  line-height: 1.8;
  color: #5d4e4e;
  text-align: center;
}

/* 可爱分隔线 */
.divider {
  text-align: center;
  margin: 16px 0;
  color: #fecfef;
  letter-spacing: 8px;
  font-size: 0.8em;
}

/* 角色对话 */
.dialogue {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #fecfef;
  border-radius: 16px;
  padding: 14px 18px;
  margin: 12px 0;
  position: relative;
}

.dialogue::before {
  content: '💭';
  position: absolute;
  top: -8px;
  right: 16px;
  font-size: 16px;
}

.dialogue .speaker {
  color: #ff9a9e;
  font-weight: 500;
  font-size: 0.9em;
  margin-bottom: 6px;
}

.dialogue .content {
  color: #5d4e4e;
  line-height: 1.6;
}

/* 表情气泡 */
.emotion-bubble {
  display: inline-block;
  background: #fff;
  border: 1px solid #fecfef;
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 0.85em;
  color: #ff9a9e;
  margin: 4px;
}

/* 心情标签 */
.mood-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: white;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.8em;
}

/* 装饰角标 */
.corner-deco {
  position: absolute;
  font-size: 24px;
  opacity: 0.6;
}

.corner-deco.top-right {
  top: 8px;
  right: 12px;
}

.corner-deco.bottom-left {
  bottom: 8px;
  left: 12px;
}
</style>
```

### 场景卡片示例

```html
<div class="scene-card">
  <div class="scene-title">樱花公园</div>
  <div class="scene-info">
    <span>🌸 春日午后</span>
    <span>📍 公园长椅</span>
    <span>☁️ 微风和煦</span>
  </div>
  <div class="scene-desc">
    粉白色的花瓣随风飘落，在阳光下闪闪发光。小猫蜷缩在长椅的一角，发出轻柔的呼噜声~
  </div>
  <div class="divider">✿ ✿ ✿</div>
  <div class="dialogue">
    <div class="speaker">小绵</div>
    <div class="content">"今天的天气真好呀～要不要一起去买草莓蛋糕？"</div>
  </div>
  <span class="corner-deco top-right">🌸</span>
  <span class="corner-deco bottom-left">🎀</span>
</div>
```

---

## 快速选择指南

| 角色关键词 | 推荐主题 | 氛围 |
|-----------|---------|------|
| 古装、仙侠、武侠、三国、宫廷 | 古风水墨 | 典雅、诗意、内敛 |
| 科幻、未来、AI、机械、赛博 | 赛博朋克 | 冷峻、科技、危险 |
| 现代、都市、职场、校园、日常 | 现代简约 | 干净、专业、理性 |
| 治愈、温馨、可爱、萌系、恋爱 | 暖系可爱 | 甜蜜、温暖、轻松 |

---

## 自定义提示

如需混合风格或自定义配色，可基于以上模板修改以下关键变量：

```css
/* 核心颜色 */
--primary: #xxx;      /* 主题色 */
--secondary: #xxx;    /* 辅助色 */
--background: #xxx;   /* 背景色 */
--text: #xxx;         /* 文字色 */
--accent: #xxx;       /* 强调色 */

/* 圆角 */
--radius: 8px;        /* 0=方正 20px+=圆润 */

/* 字体 */
font-family: 'xxx';   /* 衬线=古典 无衬线=现代 */
```
