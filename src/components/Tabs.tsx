import React from 'react';
import { Box, Text } from 'ink';

interface TabsProps {
  tabs: string[];
  activeTab: number;
  showCursor: boolean; // 🌟 新增：接收控制闪烁的属性
}

export default function Tabs({ tabs, activeTab, showCursor }: TabsProps) {
  return (
    <Box flexDirection="row" gap={4}>
      {tabs.map((tab, index) => {
        const isActive = index === activeTab;
        
        // 🌟 核心排版逻辑：
        // 1. 如果是激活项并且定时器允许显示，就显示 ' ► '
        // 2. 否则为了防止背景块大小发生跳动，必须用相等宽度的空格 '   ' 撑着
        const prefix = isActive && showCursor ? ' ► ' : '   ';

        return (
          <Text
            key={tab}
            color={isActive ? 'black' : 'gray'}
            backgroundColor={isActive ? 'cyan' : undefined}
            bold={isActive}
          >
            {/* 将前缀拼接在 tab 文字前面 */}
            {`${prefix}${tab} `}
          </Text>
        );
      })}
    </Box>
  );
}