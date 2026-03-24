import React, { useState } from 'react';
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

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }

    if (input === '[' || (key.tab && key.shift)) {
      setActiveTab((prev) => (prev > 0 ? prev - 1 : TABS.length - 1));
    }

    if (input === ']' || (key.tab && !key.shift)) {
      setActiveTab((prev) => (prev < TABS.length - 1 ? prev + 1 : 0));
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
          <Tabs tabs={TABS} activeTab={activeTab} />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
