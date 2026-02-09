import { ThemeType } from '../types/character-card';

// 场景信息模块模板
export const SCENE_INFO_TEMPLATES: Record<ThemeType, string> = {
  ancient: `<div style="background:linear-gradient(90deg,transparent,#f5f0e6 10%,#f5f0e6 90%,transparent);padding:10px 20px;margin:12px 0;text-align:center;border-top:1px dashed #d4c4a8;border-bottom:1px dashed #d4c4a8;font-family:'Noto Serif SC',serif;">
  <span style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin:0 12px;">◷ [时辰]</span>
  <span style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin:0 12px;">◈ [地点]</span>
  <span style="color:#8b7355;font-size:0.85em;letter-spacing:2px;margin:0 12px;">❋ [氛围]</span>
</div>`,
  cyberpunk: `<div style="background:linear-gradient(90deg,transparent,rgba(0,245,255,0.1) 10%,rgba(0,245,255,0.1) 90%,transparent);padding:10px 20px;margin:12px 0;text-align:center;border-top:1px solid rgba(0,245,255,0.3);border-bottom:1px solid rgba(0,245,255,0.3);font-family:monospace;">
  <span style="color:#00f5ff;font-size:0.85em;letter-spacing:2px;margin:0 12px;text-shadow:0 0 10px #00f5ff;">◷ [时间]</span>
  <span style="color:#00f5ff;font-size:0.85em;letter-spacing:2px;margin:0 12px;text-shadow:0 0 10px #00f5ff;">◈ [地点]</span>
  <span style="color:#ff00ff;font-size:0.85em;letter-spacing:2px;margin:0 12px;text-shadow:0 0 10px #ff00ff;">❋ [氛围]</span>
</div>`,
  modern: `<div style="padding:16px 0;margin:12px 0;text-align:left;border-bottom:1px solid #e8e8e8;font-family:sans-serif;">
  <span style="color:#999;font-size:0.75em;letter-spacing:3px;text-transform:uppercase;">[时间] · [地点]</span>
</div>`,
  cozy: `<div style="background:linear-gradient(90deg,transparent,#fff5f5 10%,#fff5f5 90%,transparent);padding:12px 20px;margin:12px 0;text-align:center;border-radius:20px;font-family:sans-serif;">
  <span style="color:#ff9a9e;font-size:0.9em;margin:0 8px;">🕐 [时间]</span>
  <span style="color:#ff9a9e;font-size:0.9em;margin:0 8px;">📍 [地点]</span>
  <span style="color:#fecfef;font-size:0.9em;margin:0 8px;">✨ [氛围]</span>
</div>`
};

// 正文内容模块模板
export const MAIN_CONTENT_TEMPLATES: Record<ThemeType, string> = {
  ancient: `<div style="background:#fdfbf7;border-left:3px solid #c4b49a;padding:16px 20px;margin:12px 0;color:#5d4e4e;line-height:2;font-family:'Noto Serif SC',serif;">
[正文内容，包含对话与 *动作描写*]
</div>`,
  cyberpunk: `<div style="background:rgba(26,26,46,0.8);border-left:3px solid #00f5ff;padding:16px 20px;margin:12px 0;color:#e0e0e0;line-height:1.8;font-family:monospace;">
[正文内容]
</div>`,
  modern: `<div style="padding:16px 0;margin:12px 0;color:#1a1a1a;line-height:1.8;font-family:sans-serif;">
[正文内容]
</div>`,
  cozy: `<div style="background:#fff;border-radius:16px;padding:16px 20px;margin:12px 0;color:#5d4e4e;line-height:1.9;font-family:sans-serif;box-shadow:0 2px 8px rgba(255,154,158,0.1);">
[正文内容]
</div>`
};

// 角色状态栏模块模板
export const STATUS_BAR_TEMPLATES: Record<ThemeType, string> = {
  ancient: `<div style="background:linear-gradient(135deg,#fdfbf7,#f5f0e6);border:1px solid #d4c4a8;border-radius:8px;padding:16px;margin:12px 0;font-family:'Noto Serif SC',serif;">
  <div style="text-align:center;color:#5d4e4e;font-size:1.1em;letter-spacing:4px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #e8dcc8;">◈ [角色名] ◈</div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#8b7355;min-width:48px;">衣着</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#5d4e4e;">[衣着描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#8b7355;min-width:48px;">动作</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#5d4e4e;">[动作描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#8b7355;min-width:48px;">神态</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#5d4e4e;">[神态描述]</span></div>
  <div style="display:flex;padding:10px 12px;font-size:0.9em;background:linear-gradient(90deg,transparent,rgba(139,115,85,0.08),transparent);border-radius:4px;margin-top:8px;"><span style="color:#8b7355;min-width:48px;">内心</span><span style="color:#d4c4a8;margin:0 8px;">｜</span><span style="color:#8b7355;font-style:italic;">（[内心独白]）</span></div>
</div>`,
  cyberpunk: `<div style="background:linear-gradient(135deg,#1a1a2e,#0a0a0f);border:1px solid rgba(0,245,255,0.3);border-left:3px solid #00f5ff;padding:16px;margin:12px 0;font-family:monospace;">
  <div style="color:#00f5ff;font-size:1em;letter-spacing:2px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(0,245,255,0.2);text-shadow:0 0 10px #00f5ff;">▸ [角色名] :: STATUS</div>
  <div style="display:flex;padding:4px 0;font-size:0.9em;"><span style="color:#00f5ff;min-width:60px;">OUTFIT</span><span style="color:#e0e0e0;">[衣着描述]</span></div>
  <div style="display:flex;padding:4px 0;font-size:0.9em;"><span style="color:#00f5ff;min-width:60px;">ACTION</span><span style="color:#e0e0e0;">[动作描述]</span></div>
  <div style="display:flex;padding:4px 0;font-size:0.9em;"><span style="color:#00f5ff;min-width:60px;">MOOD</span><span style="color:#e0e0e0;">[神态描述]</span></div>
  <div style="display:flex;padding:8px 12px;font-size:0.9em;background:rgba(255,0,255,0.1);border-left:2px solid #ff00ff;margin-top:8px;"><span style="color:#ff00ff;min-width:60px;">MIND</span><span style="color:#ff00ff;font-style:italic;">[内心独白]</span></div>
</div>`,
  modern: `<div style="background:#fafafa;border-left:2px solid #1a1a1a;padding:20px;margin:16px 0;font-family:sans-serif;">
  <div style="font-size:0.75em;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">[角色名] · STATUS</div>
  <div style="display:grid;grid-template-columns:80px 1fr;gap:8px;font-size:0.9em;">
    <span style="color:#999;">Outfit</span><span style="color:#1a1a1a;">[衣着描述]</span>
    <span style="color:#999;">Action</span><span style="color:#1a1a1a;">[动作描述]</span>
    <span style="color:#999;">Mood</span><span style="color:#1a1a1a;">[神态描述]</span>
  </div>
  <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e8e8e8;font-style:italic;color:#666;font-size:0.9em;">[内心独白]</div>
</div>`,
  cozy: `<div style="background:linear-gradient(135deg,#fff5f5,#fecfef20);border:2px solid #fecfef;border-radius:16px;padding:16px;margin:12px 0;font-family:sans-serif;">
  <div style="text-align:center;color:#ff9a9e;font-size:1em;margin-bottom:12px;padding-bottom:10px;border-bottom:2px dashed #fecfef;">💕 [角色名] 💕</div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#ff9a9e;min-width:60px;">👗 衣着</span><span style="color:#5d4e4e;">[衣着描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#ff9a9e;min-width:60px;">✨ 动作</span><span style="color:#5d4e4e;">[动作描述]</span></div>
  <div style="display:flex;padding:6px 12px;font-size:0.9em;"><span style="color:#ff9a9e;min-width:60px;">😊 神态</span><span style="color:#5d4e4e;">[神态描述]</span></div>
  <div style="background:#fff5f5;border-radius:12px;padding:10px 12px;margin-top:8px;font-size:0.9em;"><span style="color:#ff9a9e;">💭</span><span style="color:#ff9a9e;font-style:italic;margin-left:8px;">（[内心独白]）</span></div>
</div>`
};

// 小剧场场景卡片模板
export const SCENE_CARD_TEMPLATES: Record<ThemeType, string> = {
  ancient: `<div style="background:linear-gradient(135deg,#faf6ed,#f0e6d3);border:1px solid #d4c4a8;border-radius:8px;padding:20px;margin:12px 0;box-shadow:0 2px 12px rgba(139,115,85,0.15);font-family:'Noto Serif SC',serif;">
  <div style="font-size:0.85em;color:#8b7355;letter-spacing:4px;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #d4c4a8;">[场景图标] [场景标题]</div>
  <div style="color:#5d4e4e;line-height:1.8;text-align:center;">「[对话内容]」</div>
  <div style="color:#8b7355;font-style:italic;font-size:0.9em;text-align:center;margin-top:8px;">*[动作描写]*</div>
</div>`,
  cyberpunk: `<div style="background:linear-gradient(135deg,#1a1a2e,#0a0a0f);border:1px solid rgba(0,245,255,0.3);padding:20px;margin:12px 0;font-family:monospace;">
  <div style="font-size:0.85em;color:#00f5ff;letter-spacing:2px;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid rgba(0,245,255,0.2);text-shadow:0 0 10px #00f5ff;">[场景图标] [场景标题]</div>
  <div style="color:#e0e0e0;line-height:1.8;text-align:center;">"[对话内容]"</div>
  <div style="color:#ff00ff;font-style:italic;font-size:0.9em;text-align:center;margin-top:8px;">*[动作描写]*</div>
</div>`,
  modern: `<div style="background:#fafafa;border-left:2px solid #1a1a1a;padding:20px;margin:12px 0;font-family:sans-serif;">
  <div style="font-size:0.75em;color:#999;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">[场景标题]</div>
  <div style="color:#1a1a1a;line-height:1.8;">"[对话内容]"</div>
  <div style="color:#666;font-style:italic;font-size:0.9em;margin-top:8px;">*[动作描写]*</div>
</div>`,
  cozy: `<div style="background:linear-gradient(135deg,#fff5f5,#fecfef20);border:2px solid #fecfef;border-radius:16px;padding:20px;margin:12px 0;font-family:sans-serif;">
  <div style="font-size:0.9em;color:#ff9a9e;text-align:center;margin-bottom:12px;padding-bottom:8px;border-bottom:2px dashed #fecfef;">[场景图标] [场景标题]</div>
  <div style="color:#5d4e4e;line-height:1.8;text-align:center;">"[对话内容]"</div>
  <div style="color:#ff9a9e;font-style:italic;font-size:0.9em;text-align:center;margin-top:8px;">*[动作描写]*</div>
</div>`
};
