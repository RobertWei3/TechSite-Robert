import React from 'react';
import { Box, Text } from 'ink';

interface TabsProps {
  tabs: string[];
  activeTab: number;
}

export default function Tabs({ tabs, activeTab }: TabsProps) {
  return (
    <Box flexDirection="row" gap={4}>
      {tabs.map((tab, index) => {
        const isActive = index === activeTab;
        return (
          <Text
            key={tab}
            color={isActive ? 'black' : 'gray'}
            backgroundColor={isActive ? 'cyan' : undefined}
            bold={isActive}
          >
            {isActive ? ` ► ${tab} ` : `   ${tab} `}
          </Text>
        );
      })}
    </Box>
  );
}
