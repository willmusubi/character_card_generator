import { ThemeType } from '../types/character-card';

// 完整的小剧场 CSS 主题
export const THEME_CSS: Record<ThemeType, string> = {
  ancient: `/* ═══ 古风水墨主题 ═══ */

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
  top: 8px; left: 8px; right: 8px; bottom: 8px;
  border: 1px solid #e8dcc8;
  border-radius: 2px;
  pointer-events: none;
}

.scene-title {
  text-align: center;
  font-size: 1.2em;
  letter-spacing: 6px;
  color: #8b7355;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #d4c4a8;
}

.scene-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 0.9em;
  color: #8b7355;
  margin-bottom: 16px;
}

.scene-desc {
  line-height: 1.8;
  text-indent: 2em;
  color: #5d4e4e;
}

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
}`,

  cyberpunk: `/* ═══ 赛博朋克主题 ═══ */

.scene-card {
  background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
  border: 1px solid #00f5ff;
  padding: 20px;
  margin: 16px 0;
  font-family: 'Orbitron', monospace;
  color: #e0e0e0;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
}

.scene-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #00f5ff, transparent);
  animation: scan 2s infinite;
}

@keyframes scan {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.scene-title {
  color: #00f5ff;
  font-size: 1.2em;
  letter-spacing: 4px;
  text-shadow: 0 0 10px #00f5ff;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 245, 255, 0.3);
}

.scene-info {
  display: flex;
  gap: 20px;
  font-size: 0.85em;
  color: #00f5ff;
  margin-bottom: 16px;
}

.scene-desc {
  line-height: 1.6;
  color: #e0e0e0;
}

.dialogue {
  background: rgba(0, 245, 255, 0.1);
  border-left: 3px solid #ff00ff;
  padding: 12px 16px;
  margin: 12px 0;
}

.dialogue .speaker {
  color: #ff00ff;
  text-shadow: 0 0 5px #ff00ff;
}`,

  modern: `/* ═══ 现代简约主题 ═══ */

.scene-card {
  background: #fafafa;
  border-left: 3px solid #1a1a1a;
  padding: 24px;
  margin: 16px 0;
  font-family: 'DM Sans', 'Inter', sans-serif;
  color: #1a1a1a;
}

.scene-title {
  font-size: 0.75em;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.scene-info {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 16px;
}

.scene-desc {
  line-height: 1.8;
  color: #1a1a1a;
}

.dialogue {
  padding: 16px 0;
  margin: 12px 0;
  border-top: 1px solid #e8e8e8;
}

.dialogue .speaker {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}`,

  cozy: `/* ═══ 暖系可爱主题 ═══ */

.scene-card {
  background: linear-gradient(135deg, #fff5f5 0%, #fecfef20 100%);
  border: 2px solid #fecfef;
  border-radius: 20px;
  padding: 24px;
  margin: 16px 0;
  font-family: 'Nunito', sans-serif;
  color: #5d4e4e;
  box-shadow: 0 4px 20px rgba(255, 154, 158, 0.15);
}

.scene-title {
  text-align: center;
  font-size: 1.1em;
  color: #ff9a9e;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px dashed #fecfef;
}

.scene-info {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 0.9em;
  color: #ff9a9e;
  margin-bottom: 16px;
}

.scene-desc {
  line-height: 1.9;
  color: #5d4e4e;
}

.dialogue {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(255, 154, 158, 0.1);
}

.dialogue .speaker {
  color: #ff9a9e;
  font-weight: 600;
  margin-bottom: 8px;
}`,

  custom: `/* ═══ AI 智能生成主题 ═══ */
/* 自定义主题的样式由 AI 动态生成，嵌入在模板的 inline style 中 */

.scene-card {
  padding: 20px;
  margin: 16px 0;
  font-family: sans-serif;
}

.scene-title {
  margin-bottom: 16px;
}

.scene-desc {
  line-height: 1.8;
}

.dialogue {
  padding: 12px;
  margin: 12px 0;
}`
};
