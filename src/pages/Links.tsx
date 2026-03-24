import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { exec } from 'child_process';

const openURL = (url: string) => {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${command} "${url}"`);
};

interface LinkData {
  label: string;
  display: string;
  url: string;
}

const LINKS: LinkData[] = [
  { label: 'GitHub', display: '@RobertWei3', url: 'https://github.com/RobertWei3' },
  { label: 'LinkedIn', display: '/in/yufan-wei', url: 'https://www.linkedin.com/in/yufan-wei/' },
  { label: 'Email', display: 'robertwei3@outlook.com', url: 'mailto:robertwei3@outlook.com' },
  { label: 'Website', display: 'robertwei.dev', url: 'https://robertwei.dev' }
];

const GridItem = ({ link, isActive }: { link: LinkData, isActive: boolean }) => {
  return (
    <Box flexDirection="row">
      <Box width={3}>
        <Text color="cyan" bold>{isActive ? ' ❯ ' : '   '}</Text>
      </Box>
      <Box flexDirection="column">
        <Text bold color={isActive ? 'white' : 'gray'}>
          {link.label}
        </Text>
        <Text color={isActive ? 'cyanBright' : 'gray'}>
          {link.display}
        </Text>
      </Box>
    </Box>
  );
};

export default function Links() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // useInput only listens when this component is mounted (i.e., when on this tab)
  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev >= 2 ? prev - 2 : prev)); // Move up a row
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => (prev <= 1 ? prev + 2 : prev)); // Move down a row
    }
    if (key.leftArrow) {
      setSelectedIndex((prev) => (prev % 2 === 1 ? prev - 1 : prev)); // Move left a column
    }
    if (key.rightArrow) {
      setSelectedIndex((prev) => (prev % 2 === 0 ? prev + 1 : prev)); // Move right a column
    }
    if (key.return) {
      openURL(LINKS[selectedIndex].url);
    }
  });

  return (
    <Box flexDirection="column" paddingY={1} width="100%">
      <Box marginBottom={2} marginLeft={3}>
        <Text color="cyan" bold>Links</Text>
      </Box>
      
      <Box flexDirection="column" gap={2}>
        {/* Row 1 */}
        <Box flexDirection="row">
          <Box width="50%">
            <GridItem link={LINKS[0]} isActive={selectedIndex === 0} />
          </Box>
          <Box width="50%">
            <GridItem link={LINKS[1]} isActive={selectedIndex === 1} />
          </Box>
        </Box>
        
        {/* Row 2 */}
        <Box flexDirection="row">
          <Box width="50%">
            <GridItem link={LINKS[2]} isActive={selectedIndex === 2} />
          </Box>
          <Box width="50%">
            <GridItem link={LINKS[3]} isActive={selectedIndex === 3} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
