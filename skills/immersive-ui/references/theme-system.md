# 主题系统完整指南

## 主题架构

主题系统基于CSS变量，支持三层定制：

1. **预设主题** - 开箱即用的完整主题
2. **变量覆盖** - 修改单个变量微调
3. **完全自定义** - 从零创建主题

## 预设主题详细规格

### cyberpunk (赛博朋克)

**视觉特征**: 霓虹紫蓝、深色背景、故障艺术效果、发光边框

```css
.theme-cyberpunk {
  /* 颜色 */
  --primary: #00f5ff;        /* 霓虹青 */
  --secondary: #ff00ff;      /* 洋红 */
  --accent: #ffff00;         /* 警告黄 */
  --background: #0a0a0f;     /* 深空背景 */
  --surface: #1a1a2e;        /* 面板背景 */
  --text: #e0e0e0;
  --text-muted: #888;
  
  /* 字体 */
  --font-display: 'Orbitron', 'Noto Sans SC', sans-serif;
  --font-body: 'Rajdhani', 'Noto Sans SC', sans-serif;
  --font-mono: 'Share Tech Mono', monospace;
  
  /* 边框 */
  --border-color: rgba(0, 245, 255, 0.3);
  --border-glow: 0 0 10px rgba(0, 245, 255, 0.5);
  
  /* 动画 */
  --animation-glitch: glitch 0.3s infinite;
}

/* 特效 */
@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
}

@keyframes neon-pulse {
  0%, 100% { box-shadow: 0 0 5px var(--primary), 0 0 10px var(--primary); }
  50% { box-shadow: 0 0 20px var(--primary), 0 0 30px var(--primary); }
}
```

**适用场景**: 科幻、未来都市、黑客、AI题材

---

### ancient-chinese (古风水墨)

**视觉特征**: 米白/宣纸底、水墨渐变、毛笔字体风格、印章装饰

```css
.theme-ancient-chinese {
  /* 颜色 */
  --primary: #8b4513;        /* 赭石 */
  --secondary: #2f4f4f;      /* 墨绿 */
  --accent: #dc143c;         /* 朱红(印章) */
  --background: #f5f5dc;     /* 宣纸米 */
  --surface: #faf0e6;        /* 亚麻白 */
  --text: #333;
  --text-muted: #666;
  
  /* 字体 */
  --font-display: 'ZCOOL XiaoWei', 'Noto Serif SC', serif;
  --font-body: 'Noto Serif SC', 'Source Han Serif CN', serif;
  
  /* 边框 */
  --border-color: rgba(139, 69, 19, 0.2);
  --border-style: double;
  
  /* 背景纹理 */
  --bg-texture: url("data:image/svg+xml,..."); /* 宣纸纹理 */
}

/* 特效 */
.ink-spread {
  animation: ink-spread 0.8s ease-out;
}

@keyframes ink-spread {
  from { opacity: 0; filter: blur(10px); }
  to { opacity: 1; filter: blur(0); }
}
```

**适用场景**: 武侠、古代言情、历史、仙侠

---

### modern-minimal (现代简约)

**视觉特征**: 黑白灰、大量留白、无衬线字体、极简边框

```css
.theme-modern-minimal {
  /* 颜色 */
  --primary: #000;
  --secondary: #666;
  --accent: #0066ff;
  --background: #fff;
  --surface: #f8f8f8;
  --text: #1a1a1a;
  --text-muted: #999;
  
  /* 字体 */
  --font-display: 'DM Sans', 'Noto Sans SC', sans-serif;
  --font-body: 'DM Sans', 'Noto Sans SC', sans-serif;
  
  /* 边框 */
  --border-color: #e0e0e0;
  --radius: 0;              /* 无圆角 */
  
  /* 间距 */
  --spacing-unit: 8px;
}
```

**适用场景**: 现代都市、职场、日常、文艺

---

### cozy-warm (温馨暖调)

**视觉特征**: 暖色调、圆角、柔和阴影、手绘感

```css
.theme-cozy-warm {
  /* 颜色 */
  --primary: #ff9966;        /* 珊瑚橙 */
  --secondary: #ffcc99;      /* 杏仁色 */
  --accent: #ff6b6b;         /* 暖红 */
  --background: #fff8f0;     /* 奶油白 */
  --surface: #fffaf5;
  --text: #5d4e4e;
  --text-muted: #a09090;
  
  /* 字体 */
  --font-display: 'Quicksand', 'Noto Sans SC', sans-serif;
  --font-body: 'Nunito', 'Noto Sans SC', sans-serif;
  
  /* 边框 */
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 32px;
  --shadow: 0 4px 20px rgba(255, 153, 102, 0.15);
}
```

**适用场景**: 治愈、恋爱、日常温馨、陪伴

---

### dark-gothic (暗黑哥特)

**视觉特征**: 深色、哥特字体、暗红装饰、神秘氛围

```css
.theme-dark-gothic {
  /* 颜色 */
  --primary: #8b0000;        /* 暗红 */
  --secondary: #4a0000;
  --accent: #ffd700;         /* 金色点缀 */
  --background: #0d0d0d;
  --surface: #1a1a1a;
  --text: #c0c0c0;
  --text-muted: #666;
  
  /* 字体 */
  --font-display: 'Cinzel Decorative', serif;
  --font-body: 'Crimson Text', 'Noto Serif SC', serif;
  
  /* 边框 */
  --border-color: rgba(139, 0, 0, 0.5);
}
```

**适用场景**: 悬疑、恐怖、吸血鬼、黑暗幻想

---

### pastel-cute (粉彩可爱)

**视觉特征**: 粉彩色、超圆角、可爱图标、活泼动画

```css
.theme-pastel-cute {
  /* 颜色 */
  --primary: #ffb3ba;        /* 粉红 */
  --secondary: #bae1ff;      /* 天蓝 */
  --accent: #ffffba;         /* 柠檬黄 */
  --background: #fff5f5;
  --surface: #fff;
  --text: #5a5a5a;
  --text-muted: #999;
  
  /* 字体 */
  --font-display: 'Fredoka One', 'Noto Sans SC', sans-serif;
  --font-body: 'Varela Round', 'Noto Sans SC', sans-serif;
  
  /* 边框 */
  --radius-sm: 16px;
  --radius-md: 24px;
  --radius-lg: 9999px;       /* 胶囊形 */
  --shadow: 0 8px 30px rgba(255, 179, 186, 0.3);
}

/* 特效 */
.bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**适用场景**: 偶像、少女、可爱、轻松

---

## 主题变量完整列表

### 颜色变量

```css
--primary          /* 主色调 */
--secondary        /* 次要色 */
--accent           /* 强调色 */
--background       /* 页面背景 */
--surface          /* 卡片/面板背景 */
--text             /* 主文本色 */
--text-muted       /* 次要文本 */
--text-inverse     /* 反色文本 */
--success          /* 成功/正面 */
--warning          /* 警告 */
--error            /* 错误/负面 */
--border-color     /* 边框颜色 */
```

### 字体变量

```css
--font-display     /* 标题/装饰字体 */
--font-body        /* 正文字体 */
--font-mono        /* 等宽字体 */
--font-size-xs     /* 12px */
--font-size-sm     /* 14px */
--font-size-md     /* 16px */
--font-size-lg     /* 20px */
--font-size-xl     /* 24px */
--font-size-2xl    /* 32px */
--line-height      /* 1.6 */
```

### 间距变量

```css
--spacing-xs       /* 4px */
--spacing-sm       /* 8px */
--spacing-md       /* 16px */
--spacing-lg       /* 24px */
--spacing-xl       /* 32px */
--spacing-2xl      /* 48px */
```

### 圆角变量

```css
--radius-sm        /* 小圆角 */
--radius-md        /* 中圆角 */
--radius-lg        /* 大圆角 */
--radius-full      /* 9999px 完全圆 */
```

### 阴影变量

```css
--shadow-sm        /* 轻微阴影 */
--shadow-md        /* 中等阴影 */
--shadow-lg        /* 明显阴影 */
--shadow-glow      /* 发光效果 */
```

### 动画变量

```css
--transition-fast    /* 0.15s */
--transition-normal  /* 0.3s */
--transition-slow    /* 0.5s */
--easing-default     /* ease */
--easing-bounce      /* cubic-bezier(0.68, -0.55, 0.265, 1.55) */
```

---

## 主题应用方式

### React 组件中使用

```jsx
// 方式1: className
<div className="theme-cyberpunk">
  <ModuleComponent />
</div>

// 方式2: CSS变量内联
<div style={{ '--primary': '#00f5ff', '--background': '#0a0a0f' }}>
  <ModuleComponent />
</div>

// 方式3: ThemeProvider (推荐)
const ThemeContext = React.createContext('modern-minimal');

function App() {
  const [theme, setTheme] = useState('cyberpunk');
  return (
    <ThemeContext.Provider value={theme}>
      <div className={`theme-${theme}`}>
        <ModuleComponent />
      </div>
    </ThemeContext.Provider>
  );
}
```

### HTML 中使用

```html
<html class="theme-ancient-chinese">
  <!-- 或者 -->
  <body style="
    --primary: #8b4513;
    --background: #f5f5dc;
  ">
</html>
```

---

## 主题与模块配合

不同模块在不同主题下有特殊处理：

| 模块 | cyberpunk特殊效果 | ancient-chinese特殊效果 |
|------|-------------------|------------------------|
| scene-header | 扫描线动画 | 水墨渐显 |
| character-status | 霓虹边框脉冲 | 卷轴展开 |
| chat-bubble | 故障文字效果 | 毛笔书写感 |
| memory-log | 数据流背景 | 竹简样式 |
| choice-branch | 赛博按钮动画 | 印章盖下效果 |
