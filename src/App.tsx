import React, { useState, useEffect } from 'react'; // 🌟 新增 useEffect
import { Box, useInput, useApp } from 'ink';
import Tabs from './components/Tabs.js';
import Footer from './components/Footer.js';
import About from './pages/About.js';
import Experience from './pages/Experience.js';
import Links from './pages/Links.js';

const TABS = ['About', 'Experience', 'Links'];

export default function App() {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState(0);
  
  // 🌟 新增：控制底部导航栏的光标闪烁
  const [showTabCursor, setShowTabCursor] = useState(true);

  // 🌟 新增：全局闪烁定时器 (每 400ms 切换一次)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowTabCursor((prev) => !prev);
    }, 400);
    return () => clearInterval(blinkInterval);
  }, []);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }

    if (input === '[' || (key.tab && key.shift)) {
      setActiveTab((prev) => (prev > 0 ? prev - 1 : TABS.length - 1));
      setShowTabCursor(true); // 🌟 每次按键立刻强制显示光标，保证跟手感
    }

    if (input === ']' || (key.tab && !key.shift)) {
      setActiveTab((prev) => (prev < TABS.length - 1 ? prev + 1 : 0));
      setShowTabCursor(true); // 🌟 每次按键立刻强制显示光标
    }
  });

  return (
    <Box width="100%" justifyContent="center" alignItems="center">
      <Box
        width={128}
        height={44}
        flexDirection="column"
        padding={1}
        borderStyle="round"
        borderColor="cyan"
      >
        <Box flexGrow={1} flexDirection="column" paddingX={4} paddingTop={2} paddingBottom={1}>
          {activeTab === 0 && <About />}
          {activeTab === 1 && <Experience />}
          {activeTab === 2 && <Links />}
        </Box>

        <Box
          width="100%"
          justifyContent="center"
          marginTop={1}
          paddingTop={1}
          paddingBottom={1}
          borderStyle="single"
          borderTop={true}
          borderBottom={false}
          borderLeft={false}
          borderRight={false}
          borderColor="gray"
        >
          {/* 🌟 修改点：把 showTabCursor 作为 props 传给 Tabs 组件 */}
          <Tabs tabs={TABS} activeTab={activeTab} showCursor={showTabCursor} />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}