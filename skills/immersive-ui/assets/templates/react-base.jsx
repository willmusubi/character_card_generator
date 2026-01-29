/**
 * 沉浸式对话UI - React基础模板
 * 包含所有核心模块的基础实现
 */

import React, { useState, useEffect } from 'react';

// ============================================
// 主题上下文
// ============================================
const ThemeContext = React.createContext('modern-minimal');

export function ThemeProvider({ theme = 'modern-minimal', children }) {
  return (
    <ThemeContext.Provider value={theme}>
      <div className={`immersive-ui theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// ============================================
// 场景头部模块
// ============================================
export function SceneHeader({ time, location, weather, atmosphere }) {
  return (
    <div className="scene-header">
      <div className="scene-header__main">
        <span className="scene-header__location">📍 {location}</span>
        <span className="scene-header__divider">·</span>
        <span className="scene-header__time">{time}</span>
      </div>
      {(weather || atmosphere) && (
        <div className="scene-header__sub">
          {weather && <span>{weather}</span>}
          {weather && atmosphere && <span> · </span>}
          {atmosphere && <span>{atmosphere}</span>}
        </div>
      )}
    </div>
  );
}

// ============================================
// 角色状态模块
// ============================================
export function CharacterStatus({ 
  character, 
  appearance, 
  action, 
  expression, 
  innerThought,
  mood,
  customFields = []
}) {
  return (
    <div className="character-status">
      <div className="character-status__header">
        {character.avatar && (
          <img 
            src={character.avatar} 
            alt={character.name}
            className="character-status__avatar"
          />
        )}
        <span className="character-status__name">{character.name}</span>
      </div>
      
      <div className="character-status__list">
        {appearance && (
          <StatusItem icon="👔" label="衣着" value={appearance} />
        )}
        {action && (
          <StatusItem icon="🎬" label="动作" value={action} />
        )}
        {expression && (
          <StatusItem icon="😊" label="表情" value={expression} />
        )}
        {customFields.map((field, i) => (
          <StatusItem 
            key={i} 
            icon={field.icon || '•'} 
            label={field.label} 
            value={field.value} 
          />
        ))}
      </div>
      
      {mood !== undefined && (
        <div className="character-status__mood">
          <MoodBar value={mood} />
        </div>
      )}
      
      {innerThought && (
        <div className="character-status__thought">
          <span className="thought-icon">💭</span>
          <span className="thought-text">({innerThought})</span>
        </div>
      )}
    </div>
  );
}

function StatusItem({ icon, label, value }) {
  return (
    <div className="status-item">
      <span className="status-item__icon">{icon}</span>
      <span className="status-item__label">{label}：</span>
      <span className="status-item__value">{value}</span>
    </div>
  );
}

function MoodBar({ value }) {
  return (
    <div className="mood-bar">
      <div 
        className="mood-bar__fill" 
        style={{ width: `${value}%` }}
      />
      <span className="mood-bar__value">{value}%</span>
    </div>
  );
}

// ============================================
// 记忆模块
// ============================================
export function MemoryLog({ entries = [], title = "记忆档案" }) {
  return (
    <div className="memory-log">
      <div className="memory-log__title">{title}</div>
      <div className="memory-log__list">
        {entries.map((entry, i) => (
          <div 
            key={i} 
            className={`memory-entry memory-entry--${entry.importance || 'normal'} ${entry.compressed ? 'memory-entry--compressed' : ''}`}
          >
            <span className="memory-entry__index">{entry.index}</span>
            <span className="memory-entry__content">{entry.content}</span>
            {entry.importance === 'critical' && (
              <span className="memory-entry__star">⭐</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 群聊模块
// ============================================
export function GroupChat({ groupName, messages = [] }) {
  return (
    <div className="group-chat">
      <div className="group-chat__header">
        <span className="group-chat__name">{groupName}</span>
      </div>
      <div className="group-chat__messages">
        {messages.map((msg, i) => (
          <GroupMessage key={i} message={msg} />
        ))}
      </div>
    </div>
  );
}

function GroupMessage({ message }) {
  if (message.type === 'system') {
    return (
      <div className="group-message group-message--system">
        {message.content}
      </div>
    );
  }
  
  return (
    <div className="group-message">
      <img 
        src={message.sender.avatar || '/default-avatar.png'} 
        alt="" 
        className="group-message__avatar"
      />
      <div className="group-message__content">
        <span 
          className="group-message__name"
          style={{ color: message.sender.color }}
        >
          {message.sender.name}
        </span>
        <div className="group-message__text">{message.content}</div>
      </div>
    </div>
  );
}

// ============================================
// 公众讨论模块
// ============================================
export function PublicReaction({ eventTitle, reactions = [] }) {
  return (
    <div className="public-reaction">
      {eventTitle && (
        <div className="public-reaction__title">
          关于「{eventTitle}」大家怎么看
        </div>
      )}
      <div className="public-reaction__list">
        {reactions.map((reaction, i) => (
          <div 
            key={i} 
            className={`reaction-item reaction-item--${reaction.sentiment}`}
          >
            <div className="reaction-item__header">
              <span className="reaction-item__author">{reaction.author}</span>
              {reaction.likes && (
                <span className="reaction-item__likes">👍 {reaction.likes}</span>
              )}
            </div>
            <div className="reaction-item__content">{reaction.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 旁白模块
// ============================================
export function Narrator({ content, style = 'omniscient', emphasis = 'normal' }) {
  return (
    <div className={`narrator narrator--${style} narrator--${emphasis}`}>
      <div className="narrator__content">{content}</div>
    </div>
  );
}

// ============================================
// 好感度模块
// ============================================
export function AffectionBar({ 
  character, 
  level, 
  currentValue, 
  maxValue, 
  relationship,
  recentChange 
}) {
  const percentage = (currentValue / maxValue) * 100;
  
  return (
    <div className="affection-bar">
      <div className="affection-bar__header">
        <span className="affection-bar__icon">💕</span>
        <span className="affection-bar__name">{character.name}</span>
        <span className="affection-bar__label">· 好感度</span>
      </div>
      <div className="affection-bar__progress">
        <div 
          className="affection-bar__fill" 
          style={{ width: `${percentage}%` }}
        />
        <span className="affection-bar__text">
          Lv.{level} ({currentValue}/{maxValue})
        </span>
      </div>
      <div className="affection-bar__footer">
        <span className="affection-bar__relationship">关系：{relationship}</span>
        {recentChange && (
          <span className={`affection-bar__change ${recentChange > 0 ? 'positive' : 'negative'}`}>
            {recentChange > 0 ? '📈' : '📉'} {recentChange > 0 ? '+' : ''}{recentChange}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// 选项分支模块
// ============================================
export function ChoiceBranch({ prompt, choices = [], timer, onSelect }) {
  const [timeLeft, setTimeLeft] = useState(timer);
  
  useEffect(() => {
    if (!timer) return;
    const interval = setInterval(() => {
      setTimeLeft(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);
  
  return (
    <div className="choice-branch">
      {prompt && <div className="choice-branch__prompt">{prompt}</div>}
      
      <div className="choice-branch__list">
        {choices.map((choice, i) => (
          <button
            key={choice.id}
            className={`choice-item ${choice.locked ? 'choice-item--locked' : ''}`}
            onClick={() => !choice.locked && onSelect?.(choice)}
            disabled={choice.locked}
          >
            <span className="choice-item__letter">
              {String.fromCharCode(65 + i)}.
            </span>
            <div className="choice-item__content">
              <span className="choice-item__text">
                {choice.locked && '🔒 '}{choice.text}
              </span>
              {choice.hint && (
                <span className="choice-item__hint">{choice.hint}</span>
              )}
              {choice.lockReason && (
                <span className="choice-item__lock-reason">{choice.lockReason}</span>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {timer && (
        <div className="choice-branch__timer">
          ⏱️ 剩余 {timeLeft} 秒
        </div>
      )}
    </div>
  );
}

// ============================================
// 物品获取模块
// ============================================
export function ItemPopup({ item, source, onClose }) {
  const rarityColors = {
    common: '#a0a0a0',
    rare: '#4a90d9',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };
  
  return (
    <div className="item-popup" onClick={onClose}>
      <div 
        className={`item-popup__card item-popup--${item.rarity}`}
        style={{ '--rarity-color': rarityColors[item.rarity] }}
      >
        <div className="item-popup__glow" />
        <div className="item-popup__icon">{item.icon || '📦'}</div>
        <div className="item-popup__name">{item.name}</div>
        <div className="item-popup__rarity">{item.rarity.toUpperCase()}</div>
        <div className="item-popup__description">{item.description}</div>
        {item.effect && (
          <div className="item-popup__effect">✨ {item.effect}</div>
        )}
        {source && (
          <div className="item-popup__source">获得来源：{source}</div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 导出所有模块
// ============================================
export default {
  ThemeProvider,
  SceneHeader,
  CharacterStatus,
  MemoryLog,
  GroupChat,
  PublicReaction,
  Narrator,
  AffectionBar,
  ChoiceBranch,
  ItemPopup
};
