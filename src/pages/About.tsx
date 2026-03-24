import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { portrait, portraitWidth } from '../assets/portrait.js';
import Typewriter from '../components/Typewriter.js';

// 🌟 核心修复 1：在组件外部定义变量，它的值在组件切换时不会丢失
let hasPlayedAnimation = false;

const nameSignature = `
 ____   ___  ____  _____ ____ _____ 
|  _ \\ / _ \\|  _ \\| ____|  _ \\_   _|
| |_) | | | | |_) |  _| | |_) || |  
|  _ <| |_| |  _ <| |___|  _ < | |  
|_| \\_\\\\___/|_| \\_\\_____|_| \\_\\|_|  
`.replace(/^\n/, '').trimEnd();

export default function About() {
  // 🌟 核心修复 2：初始化时检查全局变量，如果播放过了，直接跳到最后一步(4)
  const [step, setStep] = useState(hasPlayedAnimation ? 4 : 1);
  
  const FAST_SPEED = 6; 

  const bioPara1 = 
    "I'm an AI engineer focused on building practical systems that bridge\n" +
    "strong analytical foundations with usable, production-ready\n" +
    "applications. My core interests lie in retrieval systems, agentic\n" +
    "workflows, and applied ML.";

  const bioPara2 = 
    "Currently completing my Master's in Biostatistics at Emory University.\n" +
    "My recent work spans recommendation pipelines, autonomous AI agents,\n" +
    "and intelligent tools built to solve real workflow inefficiencies.";

  const bioPara3 = 
    "I'm most excited by the intersection of applied AI, product thinking,\n" +
    "and real-world usability.";

  // 🌟 核心修复 3：当接力赛跑到最后一步（打字全部完成）时，把全局变量设为 true
  useEffect(() => {
    if (step >= 4) {
      hasPlayedAnimation = true;
    }
  }, [step]);

  return (
    <Box flexDirection="row" gap={6} alignItems="flex-start" width="100%">
      <Box flexDirection="column" width={portraitWidth}>
        <Text color="white">{portrait}</Text>
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

        {/* 🌟 核心修复 4：根据是否播放过，决定渲染普通文本还是打字机组件 */}
        <Box marginBottom={2}>
          {hasPlayedAnimation ? (
            <Text>{bioPara1}</Text>
          ) : (
            step >= 1 && <Typewriter text={bioPara1} speed={FAST_SPEED} onComplete={() => setStep(2)} />
          )}
        </Box>

        <Box marginBottom={2}>
          {hasPlayedAnimation ? (
            <Text>{bioPara2}</Text>
          ) : (
            step >= 2 && <Typewriter text={bioPara2} speed={FAST_SPEED} onComplete={() => setStep(3)} />
          )}
        </Box>

        <Box marginBottom={3}>
          {hasPlayedAnimation ? (
            <Text>{bioPara3}</Text>
          ) : (
            step >= 3 && <Typewriter text={bioPara3} speed={FAST_SPEED} onComplete={() => setStep(4)} />
          )}
        </Box>

        {step >= 4 && (
          <Text dimColor italic>
            Feel free to look around—use your arrow keys or [Tab] to explore further.
          </Text>
        )}
      </Box>
    </Box>
  );
}