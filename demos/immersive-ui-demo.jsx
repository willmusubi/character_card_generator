import React, { useState, useEffect } from 'react';

// 主题配置
const themes = {
  cyberpunk: {
    name: '赛博朋克',
    primary: '#00f5ff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    background: '#0a0a0f',
    surface: '#1a1a2e',
    text: '#e0e0e0',
    textMuted: '#888',
    border: 'rgba(0, 245, 255, 0.3)',
    fontDisplay: "'Orbitron', sans-serif",
    fontBody: "'Rajdhani', sans-serif",
  },
  ancient: {
    name: '古风水墨',
    primary: '#5d4e4e',
    secondary: '#8b7355',
    accent: '#c41e3a',
    background: '#f5f0e6',
    surface: '#faf6ed',
    text: '#333',
    textMuted: '#666',
    border: 'rgba(93, 78, 78, 0.2)',
    fontDisplay: "'Noto Serif SC', serif",
    fontBody: "'Noto Serif SC', serif",
  },
  modern: {
    name: '现代简约',
    primary: '#000',
    secondary: '#666',
    accent: '#0066ff',
    background: '#fff',
    surface: '#fafafa',
    text: '#1a1a1a',
    textMuted: '#999',
    border: '#e8e8e8',
    fontDisplay: "'DM Sans', sans-serif",
    fontBody: "'DM Sans', sans-serif",
  }
};

// 场景头部模块
function SceneHeader({ time, location, weather, atmosphere, theme }) {
  const t = themes[theme];
  return (
    <div style={{
      background: theme === 'cyberpunk' 
        ? `linear-gradient(135deg, ${t.surface} 0%, transparent 100%)` 
        : theme === 'ancient' 
          ? `linear-gradient(180deg, ${t.surface} 0%, transparent 100%)`
          : t.surface,
      border: `1px solid ${t.border}`,
      borderLeft: theme === 'cyberpunk' ? `3px solid ${t.primary}` : undefined,
      padding: theme === 'modern' ? '24px 0' : '12px 16px',
      textAlign: theme === 'ancient' ? 'center' : 'left',
      fontFamily: t.fontDisplay,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {theme === 'cyberpunk' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
          background: `linear-gradient(90deg, ${t.primary}, transparent)`,
          animation: 'scan 2s linear infinite',
        }} />
      )}
      <div style={{
        color: theme === 'cyberpunk' ? t.primary : t.textMuted,
        textTransform: theme !== 'ancient' ? 'uppercase' : 'none',
        letterSpacing: theme === 'modern' ? '3px' : '2px',
        fontSize: theme === 'modern' ? '0.75em' : '1em',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        justifyContent: theme === 'ancient' ? 'center' : 'flex-start',
        textShadow: theme === 'cyberpunk' ? `0 0 10px ${t.primary}` : 'none',
      }}>
        <span>📍 {location}</span>
        <span style={{ 
          width: theme === 'modern' ? '24px' : 'auto',
          height: theme === 'modern' ? '1px' : 'auto',
          background: theme === 'modern' ? t.border : 'transparent',
        }}>{theme !== 'modern' && '·'}</span>
        <span>{time}</span>
      </div>
      {(weather || atmosphere) && (
        <div style={{
          marginTop: '8px',
          fontSize: '0.85em',
          color: t.textMuted,
          fontStyle: theme === 'ancient' ? 'italic' : 'normal',
        }}>
          {weather && <span>{theme === 'cyberpunk' ? '🌧️ ' : ''}{weather}</span>}
          {weather && atmosphere && ' · '}
          {atmosphere && <span>{atmosphere}</span>}
        </div>
      )}
      <style>{`
        @keyframes scan {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// 角色状态模块
function CharacterStatus({ character, appearance, action, expression, innerThought, theme }) {
  const t = themes[theme];
  
  const statusItems = [
    { icon: '👔', label: '衣着', value: appearance },
    { icon: '🎬', label: '动作', value: action },
    expression && { icon: '😊', label: '表情', value: expression },
  ].filter(Boolean);

  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      padding: theme === 'modern' ? '32px' : '16px',
      position: 'relative',
      clipPath: theme === 'cyberpunk' ? 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' : 'none',
      boxShadow: theme === 'ancient' ? '0 2px 10px rgba(0, 0, 0, 0.05)' : 'none',
    }}>
      {/* 古风卷轴装饰 */}
      {theme === 'ancient' && (
        <>
          <div style={{
            position: 'absolute', top: '-8px', left: 0, right: 0, height: '8px',
            background: 'linear-gradient(90deg, #8b7355 0%, #a08060 20%, #c0a080 50%, #a08060 80%, #8b7355 100%)',
            borderRadius: '4px 4px 0 0',
          }} />
          <div style={{
            position: 'absolute', bottom: '-8px', left: 0, right: 0, height: '8px',
            background: 'linear-gradient(90deg, #8b7355 0%, #a08060 20%, #c0a080 50%, #a08060 80%, #8b7355 100%)',
            borderRadius: '0 0 4px 4px',
          }} />
        </>
      )}
      
      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme === 'modern' ? '20px' : '12px',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: `1px ${theme === 'ancient' ? 'dashed' : 'solid'} ${t.border}`,
      }}>
        <div style={{
          width: theme === 'ancient' ? '64px' : theme === 'modern' ? '48px' : '56px',
          height: theme === 'ancient' ? '64px' : theme === 'modern' ? '48px' : '56px',
          background: theme === 'cyberpunk' ? `url(${character.avatar || 'https://via.placeholder.com/56'})` : t.primary,
          backgroundSize: 'cover',
          border: theme === 'cyberpunk' ? `2px solid ${t.primary}` : theme === 'ancient' ? `3px double ${t.secondary}` : 'none',
          boxShadow: theme === 'cyberpunk' ? `0 0 15px ${t.primary}80` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5em',
          color: theme === 'modern' ? '#fff' : t.text,
        }}>
          {!character.avatar && character.name[0]}
        </div>
        <span style={{
          fontFamily: t.fontDisplay,
          fontSize: theme === 'ancient' ? '1.5em' : '1.25em',
          color: theme === 'cyberpunk' ? t.primary : t.text,
          letterSpacing: theme === 'ancient' ? '2px' : '-0.02em',
          fontWeight: theme === 'modern' ? '600' : 'normal',
          textShadow: theme === 'cyberpunk' ? `0 0 10px ${t.primary}80` : 'none',
        }}>
          {character.name}
        </span>
      </div>
      
      {/* 状态列表 */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {statusItems.map((item, i) => (
          <div key={i} style={{
            display: theme === 'modern' ? 'grid' : 'flex',
            gridTemplateColumns: theme === 'modern' ? '80px 1fr' : undefined,
            gap: theme === 'modern' ? '16px' : '8px',
            padding: '6px 0',
            fontFamily: t.fontBody,
            animation: theme === 'cyberpunk' ? `slideIn 0.4s ease-out ${i * 0.15}s backwards` : 
                       theme === 'ancient' ? `inkFadeIn 0.8s ease ${i * 0.2}s backwards` : 'none',
          }}>
            {theme !== 'modern' && <span style={{ color: t.primary }}>{item.icon}</span>}
            <span style={{
              color: t.textMuted,
              minWidth: theme !== 'modern' ? '50px' : 'auto',
              fontSize: theme === 'modern' ? '0.85em' : '1em',
              textTransform: theme === 'modern' ? 'uppercase' : 'none',
              letterSpacing: theme === 'modern' ? '1px' : 'normal',
            }}>{item.label}{theme !== 'modern' && '：'}</span>
            <span style={{ color: t.text }}>{item.value}</span>
          </div>
        ))}
      </div>
      
      {/* 内心独白 */}
      {innerThought && (
        <div style={{
          marginTop: '16px',
          padding: theme === 'modern' ? '20px' : '12px',
          background: theme === 'cyberpunk' ? `${t.secondary}15` : 
                      theme === 'ancient' ? `${t.primary}10` : t.background,
          borderLeft: theme === 'cyberpunk' ? `2px solid ${t.secondary}` :
                      theme === 'ancient' ? `3px solid ${t.secondary}` :
                      `2px solid ${t.text}`,
          fontStyle: 'italic',
          color: theme === 'cyberpunk' ? `${t.secondary}e0` : t.secondary,
          position: 'relative',
        }}>
          {theme === 'ancient' && (
            <>
              <span style={{ position: 'absolute', left: '8px', top: '8px', fontSize: '1.5em', color: t.textMuted, opacity: 0.5 }}>「</span>
              <span style={{ position: 'absolute', right: '8px', bottom: '8px', fontSize: '1.5em', color: t.textMuted, opacity: 0.5 }}>」</span>
            </>
          )}
          <span>{theme !== 'modern' && '💭 '}({innerThought})</span>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes inkFadeIn {
          from { opacity: 0; filter: blur(4px); }
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

// 好感度模块
function AffectionBar({ character, level, currentValue, maxValue, relationship, recentChange, theme }) {
  const t = themes[theme];
  const percentage = (currentValue / maxValue) * 100;
  
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      padding: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontFamily: t.fontDisplay,
      }}>
        <span style={{ animation: 'heartBeat 1s ease-in-out infinite' }}>💕</span>
        <span style={{ color: theme === 'cyberpunk' ? t.primary : t.text }}>{character.name}</span>
        <span style={{ color: t.textMuted }}>· 好感度</span>
      </div>
      
      <div style={{
        height: theme === 'modern' ? '4px' : '24px',
        background: theme === 'cyberpunk' ? `${t.primary}20` : t.border,
        border: theme !== 'modern' ? `1px solid ${t.border}` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: theme === 'cyberpunk' ? `linear-gradient(90deg, ${t.secondary}, ${t.primary})` :
                      theme === 'ancient' ? `linear-gradient(90deg, ${t.secondary}, ${t.accent})` :
                      t.text,
          transition: 'width 0.5s ease',
          boxShadow: theme === 'cyberpunk' ? `0 0 10px ${t.secondary}80` : 'none',
        }} />
        {theme !== 'modern' && (
          <span style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.85em',
            color: t.text,
          }}>
            Lv.{level} ({currentValue}/{maxValue})
          </span>
        )}
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme === 'modern' ? '16px' : '8px',
        fontSize: '0.9em',
      }}>
        <span style={{ color: t.textMuted }}>关系：{relationship}</span>
        {recentChange && (
          <span style={{
            color: recentChange > 0 ? (theme === 'ancient' ? t.accent : '#00ff88') : '#ff3366',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {recentChange > 0 ? '📈' : '📉'} {recentChange > 0 ? '+' : ''}{recentChange}
          </span>
        )}
      </div>
      
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// 选项分支模块
function ChoiceBranch({ prompt, choices, theme }) {
  const t = themes[theme];
  const [hoveredId, setHoveredId] = useState(null);
  
  return (
    <div style={{ padding: theme === 'modern' ? '32px' : '16px' }}>
      {prompt && (
        <div style={{
          fontFamily: t.fontDisplay,
          textAlign: theme === 'modern' ? 'left' : 'center',
          marginBottom: theme === 'modern' ? '24px' : '16px',
          color: theme === 'cyberpunk' ? '#fff' : t.text,
          letterSpacing: theme === 'ancient' ? '2px' : 'normal',
          fontWeight: theme === 'modern' ? '500' : 'normal',
        }}>
          {prompt}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {choices.map((choice, i) => {
          const isHovered = hoveredId === choice.id;
          return (
            <button
              key={choice.id}
              onMouseEnter={() => setHoveredId(choice.id)}
              onMouseLeave={() => setHoveredId(null)}
              disabled={choice.locked}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: theme === 'modern' ? '16px' : '12px',
                width: '100%',
                padding: theme === 'modern' ? '20px 24px' : '16px',
                background: isHovered && !choice.locked 
                  ? (theme === 'ancient' ? `${t.primary}10` : t.surface) 
                  : t.surface,
                border: `1px solid ${isHovered && !choice.locked ? (theme === 'modern' ? t.text : t.primary) : t.border}`,
                color: t.text,
                cursor: choice.locked ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                transform: isHovered && !choice.locked && theme !== 'modern' ? 'translateX(4px)' : 'none',
                boxShadow: isHovered && !choice.locked && theme === 'cyberpunk' ? `0 0 20px ${t.primary}30` : 'none',
                opacity: choice.locked ? 0.4 : 1,
                fontFamily: t.fontBody,
                position: 'relative',
              }}
            >
              <span style={{
                fontFamily: theme === 'cyberpunk' ? t.fontDisplay : "'JetBrains Mono', monospace",
                color: theme === 'cyberpunk' ? t.primary : t.textMuted,
                fontSize: theme === 'cyberpunk' ? '1.2em' : '0.85em',
              }}>
                {String.fromCharCode(65 + i)}.
              </span>
              <div>
                <span>{choice.locked && '🔒 '}{choice.text}</span>
                {choice.hint && (
                  <span style={{
                    display: 'block',
                    fontSize: '0.85em',
                    color: theme === 'cyberpunk' ? t.accent : theme === 'ancient' ? t.secondary : t.textMuted,
                    marginTop: '4px',
                    fontStyle: theme === 'ancient' ? 'italic' : 'normal',
                  }}>
                    {choice.hint}
                  </span>
                )}
              </div>
              
              {/* 古风印章效果 */}
              {theme === 'ancient' && isHovered && !choice.locked && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%) rotate(-10deg)',
                  width: '28px',
                  height: '28px',
                  background: t.accent,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '2px',
                  fontSize: '0.75em',
                  animation: 'stamp 0.3s ease',
                }}>
                  选
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      <style>{`
        @keyframes stamp {
          from { opacity: 0; transform: translateY(-50%) rotate(-10deg) scale(1.5); }
          to { opacity: 1; transform: translateY(-50%) rotate(-10deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

// 旁白模块
function Narrator({ content, theme, emphasis = 'normal' }) {
  const t = themes[theme];
  
  return (
    <div style={{
      padding: theme === 'modern' ? '48px 32px' : '24px',
      textAlign: 'center',
      position: 'relative',
      background: theme === 'ancient' 
        ? `linear-gradient(180deg, transparent, ${t.primary}10, transparent)` 
        : 'transparent',
    }}>
      {theme === 'cyberpunk' && (
        <>
          <div style={{
            position: 'absolute', left: '10%', right: '10%', top: 0, height: '1px',
            background: `linear-gradient(90deg, transparent, ${t.primary}, transparent)`,
          }} />
          <div style={{
            position: 'absolute', left: '10%', right: '10%', bottom: 0, height: '1px',
            background: `linear-gradient(90deg, transparent, ${t.primary}, transparent)`,
          }} />
        </>
      )}
      
      {theme === 'ancient' && <div style={{ color: t.textMuted, letterSpacing: '8px' }}>～～～</div>}
      
      <div style={{
        fontFamily: t.fontBody,
        fontStyle: 'italic',
        lineHeight: theme === 'ancient' ? '2' : '1.8',
        color: emphasis === 'dramatic' 
          ? (theme === 'cyberpunk' ? t.primary : t.text)
          : t.textMuted,
        margin: theme === 'ancient' ? '16px 0' : '0',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        textShadow: emphasis === 'dramatic' && theme === 'cyberpunk' 
          ? `0 0 20px ${t.primary}80` 
          : 'none',
        fontWeight: emphasis === 'dramatic' && theme === 'modern' ? '500' : 'normal',
      }}>
        {content}
      </div>
      
      {theme === 'ancient' && <div style={{ color: t.textMuted, letterSpacing: '8px' }}>～～～</div>}
    </div>
  );
}

// 主演示组件
export default function ImmersiveUIDemo() {
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');
  const t = themes[currentTheme];
  
  // 示例数据
  const character = { name: '苏晚', avatar: null };
  const sceneData = {
    time: '深夜 23:47',
    location: '咖啡馆二楼',
    weather: '小雨',
    atmosphere: '安静而略显压抑',
  };
  const statusData = {
    appearance: '白色衬衫，黑色长裤，略显疲惫',
    action: '倚靠在窗边，望向窗外',
    expression: '若有所思',
    innerThought: '他在想什么呢...今天的天气真的很适合发呆',
  };
  const affectionData = {
    level: 7,
    currentValue: 68,
    maxValue: 100,
    relationship: '挚友',
    recentChange: 5,
  };
  const choices = [
    { id: '1', text: '"我一直都在这里"', hint: '💕 可能增加好感度' },
    { id: '2', text: '"你想多了"', hint: '⚠️ 可能引起误会' },
    { id: '3', text: '沉默', hint: '需要「冷静」技能 Lv.3', locked: true },
  ];
  const narratorText = '雨滴敲打着玻璃窗，像是某种预兆。在这个城市的某个角落，两个陌生人的命运即将产生交集。';

  return (
    <div style={{
      minHeight: '100vh',
      background: t.background,
      color: t.text,
      fontFamily: t.fontBody,
      padding: '20px',
      transition: 'all 0.3s ease',
    }}>
      {/* 主题选择器 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setCurrentTheme(key)}
            style={{
              padding: '10px 20px',
              background: currentTheme === key ? t.primary : 'transparent',
              color: currentTheme === key ? (key === 'modern' ? '#fff' : t.background) : t.text,
              border: `2px solid ${currentTheme === key ? t.primary : t.border}`,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {theme.name}
          </button>
        ))}
      </div>

      {/* 模块演示 */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontFamily: t.fontDisplay,
          color: currentTheme === 'cyberpunk' ? t.primary : t.text,
          marginBottom: '8px',
        }}>
          沉浸式对话UI模块演示
        </h2>
        
        <SceneHeader {...sceneData} theme={currentTheme} />
        
        <CharacterStatus character={character} {...statusData} theme={currentTheme} />
        
        <AffectionBar character={character} {...affectionData} theme={currentTheme} />
        
        <Narrator content={narratorText} theme={currentTheme} emphasis="dramatic" />
        
        <ChoiceBranch 
          prompt="你要怎么回应？" 
          choices={choices} 
          theme={currentTheme} 
        />
      </div>
      
      {/* 赛博朋克扫描线效果 */}
      {currentTheme === 'cyberpunk' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.03) 2px, rgba(0, 245, 255, 0.03) 4px)',
          pointerEvents: 'none',
          zIndex: 9999,
        }} />
      )}
    </div>
  );
}
