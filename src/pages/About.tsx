import React from 'react';
import { Box, Text } from 'ink';
import { portrait, portraitWidth } from '../assets/portrait.js';

const nameSignature = `
 ____   ___  ____  _____ ____ _____ 
|  _ \\ / _ \\|  _ \\| ____|  _ \\_   _|
| |_) | | | | |_) |  _| | |_) || |  
|  _ <| |_| |  _ <| |___|  _ < | |  
|_| \\_\\\\___/|_| \\_\\_____|_| \\_\\|_|  
`.replace(/^\n/, '').trimEnd();

export default function About() {
  return (
    <Box flexDirection="row" gap={6} alignItems="flex-start" width="100%">
      <Box flexDirection="column" width={portraitWidth}>
        <Text color="gray">{portrait}</Text>
      </Box>

      <Box flexDirection="column" width={72}>
        <Box marginBottom={3}>
          <Text dimColor>{nameSignature}</Text>
        </Box>

        <Box marginBottom={2}>
          <Text color="green" bold>
            AI Engineer · Applied ML | Biostatistics @ Emory
          </Text>
        </Box>

        <Box marginBottom={2}>
          <Text>
            I'm an AI engineer focused on building practical systems
            that bridge strong analytical foundations with usable,
            production-ready applications. My core interests lie in
            retrieval systems, agentic workflows, and applied ML.
          </Text>
        </Box>

        <Box marginBottom={2}>
          <Text>
            Currently completing my Master's in Biostatistics at Emory
            University. My recent work spans recommendation pipelines,
            autonomous AI agents, and intelligent tools built to solve
            real workflow inefficiencies.
          </Text>
        </Box>

        <Box marginBottom={3}>
          <Text>
            I'm most excited by the intersection of applied AI,
            product thinking, and real-world usability.
          </Text>
        </Box>

        <Text dimColor italic>
          Feel free to look around—use your arrow keys or [Tab] to explore further.
        </Text>
      </Box>
    </Box>
  );
}