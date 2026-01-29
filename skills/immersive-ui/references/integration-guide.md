# 与 frontend-design 高级集成指南

## 何时需要集成

本Skill提供功能完整的模块骨架和预设主题，满足大多数场景。在以下情况考虑集成frontend-design：

1. **用户要求独特/非预设的视觉风格**
2. **需要更精致的动效和微交互**
3. **要求"专业级"/"作品集级"的设计质量**
4. **特定艺术风格（art deco、brutalist等）**

## 集成工作流

### 步骤1: 用本Skill生成功能骨架

```jsx
// 先生成结构完整的模块
<CharacterStatus 
  character={character}
  appearance="..."
  action="..."
  innerThought="..."
/>
```

### 步骤2: 读取frontend-design指南

```
读取 /mnt/skills/public/frontend-design/SKILL.md
```

提取关键美学原则：
- **Typography**: 独特字体选择，避免Inter/Arial
- **Color & Theme**: 大胆的主色配锐利的强调色
- **Motion**: CSS动画优先，关键时刻的编排
- **Spatial Composition**: 非对称、重叠、对角流动
- **Backgrounds**: 渐变网格、噪点纹理、几何图案

### 步骤3: 美学增强应用

将frontend-design原则应用到模块上：

**字体增强**:
```css
/* Before: 普通 */
--font-display: 'Noto Sans SC', sans-serif;

/* After: 独特 */
--font-display: 'Playfair Display', 'ZCOOL QingKe HuangYou', serif;
```

**色彩增强**:
```css
/* Before: 安全 */
--primary: #6366f1;
--background: #ffffff;

/* After: 大胆 */
--primary: #ff3366;
--background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
--accent: #00ff88;
```

**动效增强**:
```css
/* Before: 基础 */
transition: all 0.3s ease;

/* After: 精致 */
@keyframes status-reveal {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95);
    filter: blur(10px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.status-item {
  animation: status-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: backwards;
}

.status-item:nth-child(1) { animation-delay: 0.1s; }
.status-item:nth-child(2) { animation-delay: 0.2s; }
.status-item:nth-child(3) { animation-delay: 0.3s; }
```

**空间增强**:
```css
/* Before: 规整 */
.module-container {
  padding: 16px;
  border-radius: 8px;
}

/* After: 独特 */
.module-container {
  padding: 24px 32px;
  border-radius: 0 24px 0 24px;      /* 不对称圆角 */
  position: relative;
  overflow: hidden;
}

.module-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255,51,102,0.1) 0%, transparent 70%);
  pointer-events: none;
}
```

### 步骤4: 整合输出

将增强后的样式合并到模块组件中，确保：
- 保持模块功能完整性
- 样式与主题系统兼容
- 动画性能优化（使用transform/opacity）
- 响应式适配

---

## 美学增强模板

### 高级霓虹效果 (用于cyberpunk增强)

```css
.neon-text {
  color: var(--primary);
  text-shadow: 
    0 0 5px var(--primary),
    0 0 10px var(--primary),
    0 0 20px var(--primary),
    0 0 40px var(--primary);
  animation: neon-flicker 1.5s infinite alternate;
}

@keyframes neon-flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% {
    text-shadow: 
      0 0 5px var(--primary),
      0 0 10px var(--primary),
      0 0 20px var(--primary),
      0 0 40px var(--primary);
  }
  20%, 24%, 55% {
    text-shadow: none;
  }
}
```

### 水墨扩散效果 (用于ancient-chinese增强)

```css
.ink-reveal {
  position: relative;
}

.ink-reveal::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent 0%, var(--background) 100%);
  animation: ink-dissolve 1.5s ease-out forwards;
}

@keyframes ink-dissolve {
  from { 
    transform: scale(0);
    opacity: 1;
  }
  to { 
    transform: scale(3);
    opacity: 0;
  }
}
```

### 玻璃拟态效果 (通用高级感)

```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 打字机效果 (用于内心独白)

```css
.typewriter {
  overflow: hidden;
  border-right: 2px solid var(--primary);
  white-space: nowrap;
  animation: 
    typing 3s steps(40, end),
    blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes blink-caret {
  from, to { border-color: transparent }
  50% { border-color: var(--primary) }
}
```

---

## 完整集成示例

用户请求: "帮我做一个人物状态模块，要非常精致的赛博朋克风格"

### 原始骨架 (本Skill输出)

```jsx
function CharacterStatus({ character, appearance, action, innerThought }) {
  return (
    <div className="character-status theme-cyberpunk">
      <div className="header">
        <img src={character.avatar} alt="" className="avatar" />
        <span className="name">{character.name}</span>
      </div>
      <div className="status-list">
        <div className="status-item">👔 {appearance}</div>
        <div className="status-item">🎬 {action}</div>
      </div>
      <div className="inner-thought">💭 {innerThought}</div>
    </div>
  );
}
```

### 增强后 (集成frontend-design)

```jsx
function CharacterStatus({ character, appearance, action, innerThought }) {
  return (
    <div className="relative overflow-hidden bg-[#0a0a0f] border border-cyan-500/30 
                    shadow-[0_0_30px_rgba(0,245,255,0.2)] p-6"
         style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
      
      {/* 扫描线背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
           style={{
             background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.1) 2px, rgba(0,245,255,0.1) 4px)'
           }} />
      
      {/* 角落装饰 */}
      <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
      
      {/* 头部 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img src={character.avatar} 
               className="w-16 h-16 rounded-sm border-2 border-cyan-400 
                          shadow-[0_0_15px_rgba(0,245,255,0.5)]" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 
                          rounded-full border-2 border-[#0a0a0f] animate-pulse" />
        </div>
        <div>
          <h3 className="font-['Orbitron'] text-xl text-cyan-300 tracking-wider
                         drop-shadow-[0_0_10px_rgba(0,245,255,0.8)]">
            {character.name}
          </h3>
          <div className="text-xs text-cyan-500/60 font-mono">STATUS: ONLINE</div>
        </div>
      </div>
      
      {/* 状态列表 */}
      <div className="space-y-2 font-['Rajdhani'] text-gray-300">
        {[
          { icon: '▸', label: 'OUTFIT', value: appearance },
          { icon: '▸', label: 'ACTION', value: action }
        ].map((item, i) => (
          <div key={i} 
               className="flex items-start gap-2 opacity-0 animate-[slideIn_0.4s_ease-out_forwards]"
               style={{ animationDelay: `${i * 0.15}s` }}>
            <span className="text-cyan-400">{item.icon}</span>
            <span className="text-cyan-500/70 text-sm w-16">{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
      
      {/* 内心独白 */}
      {innerThought && (
        <div className="mt-4 pt-4 border-t border-cyan-500/20">
          <div className="relative">
            <div className="absolute -left-2 top-0 text-cyan-500/30 text-2xl">"</div>
            <p className="text-cyan-200/80 italic pl-4 font-['Share_Tech_Mono'] text-sm
                          overflow-hidden border-r-2 border-cyan-400
                          animate-[typing_2s_steps(40)_forwards]">
              {innerThought}
            </p>
            <div className="absolute -right-2 bottom-0 text-cyan-500/30 text-2xl">"</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 注意事项

1. **性能优先**: 复杂动画使用CSS transform/opacity，避免触发重排
2. **渐进增强**: 确保基础功能在不支持高级特性时仍可用
3. **主题兼容**: 增强样式应使用CSS变量，保持可切换
4. **适度原则**: 不是所有模块都需要最高级的美化，根据场景决定
