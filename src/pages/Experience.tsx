import React from 'react';
import { Box, Text } from 'ink';

export default function Experience() {
  return (
    <Box flexDirection="column" paddingX={2} width="100%">
      <Box marginBottom={2}>
        <Text color="magenta" bold>Featured Experience & Work</Text>
      </Box>

      <Box flexDirection="column" gap={2}>
        <Box flexDirection="column">
          <Text color="cyan" bold>► Carbon Emission Factor Recommendation</Text>
          <Box paddingLeft={2}>
            <Text color="gray">RAG-based pipeline matching best-fit emission factors to optimize efficiency.</Text>
          </Box>
        </Box>

        <Box flexDirection="column">
          <Text color="cyan" bold>► Cybersecurity Vulnerability Agent</Text>
          <Box paddingLeft={2}>
            <Text color="gray">Autonomous workflow for vulnerability retrieval, prioritization, and reporting.</Text>
          </Box>
        </Box>

        <Box flexDirection="column">
          <Text color="cyan" bold>► Culinari.ai</Text>
          <Box paddingLeft={2}>
            <Text color="gray">AI-powered recommendation and search experience driving practical product value.</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
