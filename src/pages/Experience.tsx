import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

const experiences = [
  {
    title: 'Carbon Emission Factor Recommendation',
    description: 'RAG-based pipeline matching best-fit emission factors to optimize efficiency.',
  },
  {
    title: 'Cybersecurity Vulnerability Agent',
    description: 'Autonomous workflow for vulnerability retrieval, prioritization, and reporting.',
  },
  {
    title: 'Culinari.ai',
    description: 'AI-powered recommendation and search experience driving practical product value.',
  },
  {
    title: 'DealTrace',
    description: 'AI-powered price intelligence system.',
  }
];

export default function Experience() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // 🌟 新增状态：控制光标是否显示（用于实现闪烁）
  const [showCursor, setShowCursor] = useState(true);

  // 🌟 新增：全局光标闪烁定时器
  useEffect(() => {
    // 每 400 毫秒切换一次光标的可见状态
    const blinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 400);

    return () => clearInterval(blinkInterval);
  }, []);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      // 按键时强制显示光标，提升操作反馈的跟手感
      setShowCursor(true); 
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(experiences.length - 1, prev + 1));
      setShowCursor(true);
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} width="100%">
      <Box marginBottom={2}>
        <Text color="magenta" bold>Featured Experience & Work</Text>
      </Box>

      <Box flexDirection="column" gap={2}>
        {experiences.map((exp, index) => {
          const isSelected = index === selectedIndex;
          
          // 🌟 核心逻辑：如果是当前选中项，并且 showCursor 为 true，才显示 ►
          const cursorString = isSelected && showCursor ? '► ' : '  ';

          return (
            <Box key={index} flexDirection="column">
              <Box>
                {/* 标题部分 */}
                <Text color={isSelected ? 'cyanBright' : 'gray'} bold={isSelected}>
                  {cursorString}
                  {exp.title}
                </Text>
              </Box>
              
              {/* 简介部分 */}
              <Box paddingLeft={2}>
                <Text color={isSelected ? 'white' : 'gray'}>
                  {exp.description}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}