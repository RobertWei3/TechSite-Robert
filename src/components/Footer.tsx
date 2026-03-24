import React from 'react';
import { Box, Text } from 'ink';

export default function Footer() {
  return (
    <Box
      marginTop={1}
      paddingTop={1}
      borderStyle="single"
      borderTop={true}
      borderBottom={false}
      borderLeft={false}
      borderRight={false}
      borderColor="gray"
    >
      <Box>
        <Text>
          <Text bold color="white">← / → / Tab</Text> switch tabs | <Text bold color="white">Enter</Text> open links | <Text bold color="white">Q</Text> quit
        </Text>
      </Box>
    </Box>
  );
}
