import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export default function Typewriter({ text, speed = 8, delay = 0, onComplete }: TypewriterProps) {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // 🌟 核心修复：用一个局部变量来追踪打字进度，彻底脱离 setState 的内部回调
    let currentIndex = 0; 

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        // 如果打字进度已经达到了文本长度
        if (currentIndex >= text.length) {
          clearInterval(interval); // 停止打字
          if (onComplete) onComplete(); // 通知父组件开启下一段接力赛
        } else {
          // 还没打完，索引 +1，并更新给 React 状态去渲染屏幕
          currentIndex++;
          setDisplayIndex(currentIndex);
        }
      }, speed);
    }, delay);

    // 组件被卸载时，清理掉还没执行完的定时器
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, delay]); 

  return <Text>{text.substring(0, displayIndex)}</Text>;
}