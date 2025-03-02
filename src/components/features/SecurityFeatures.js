import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Modal, Typography, Space, Divider, Tabs } from 'antd';
import CBCEncryptionDiagram from './CBCEncryptionDiagram';
import ChunkDecryptDiagram from './ChunkDecryptDiagram';

const { Title, Paragraph, Text } = Typography;

const floatingBlocks = keyframes`
  0% {
    transform: translateY(0) rotate(0);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
  100% {
    transform: translateY(0) rotate(0);
  }
`;

const encryptEffect = keyframes`
  0% {
    transform: translateX(0);
    opacity: 0.8;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const binaryRain = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const glowPulse = keyframes`
  0% {
    box-shadow: 0 0 20px rgba(82, 196, 26, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(82, 196, 26, 0.4);
  }
  100% {
    box-shadow: 0 0 20px rgba(82, 196, 26, 0.2);
  }
`;

const encryptionMatrix = keyframes`
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
`;

const dataFlow = keyframes`
  0% {
    stroke-dashoffset: 1000;
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.2;
  }
`;

const lockPulse = keyframes`
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
`;

const codeScramble = keyframes`
  0% {
    content: "AES-256";
  }
  25% {
    content: "7B8F9E";
  }
  50% {
    content: "CBC-IV";
  }
  75% {
    content: "D5E6F7";
  }
  100% {
    content: "AES-256";
  }
`;

const FloatingBlock = styled.div`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(22, 119, 255, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(4px);
  animation: ${floatingBlocks} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  z-index: 0;
  opacity: 0.6;
`;

const BinaryRainContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.1;
  z-index: 0;
`;

const BinaryRainDrop = styled.div`
  position: absolute;
  color: #52c41a;
  font-family: monospace;
  font-size: 14px;
  line-height: 1;
  animation: ${binaryRain} ${props => props.$duration}s linear infinite;
  animation-delay: ${props => props.$delay}s;
  left: ${props => props.$left}%;
  user-select: none;
`;

const FeaturesContainer = styled.div`
  background: linear-gradient(135deg, var(--ant-color-bg-container), rgba(82, 196, 26, 0.02));
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 48px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(82, 196, 26, 0.08) 0%, transparent 70%);
    transform: rotate(-15deg);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -50%;
    left: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, rgba(22, 119, 255, 0.08) 0%, transparent 70%);
    transform: rotate(15deg);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 32px 20px;
  }
`;

const FeaturesTitle = styled.div`
  text-align: center;
  margin-bottom: 64px;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(82, 196, 26, 0.1), transparent 70%);
    border-radius: 50%;
    z-index: -1;
  }

  i {
    font-size: 40px;
    background: linear-gradient(135deg, #52c41a, #73d13d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 16px;
    display: block;
    filter: drop-shadow(0 2px 4px rgba(82, 196, 26, 0.2));
  }

  h3 {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--ant-color-text), #52c41a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }

  @media (max-width: 768px) {
    margin-bottom: 48px;

    i {
      font-size: 32px;
    }

    h3 {
      font-size: 24px;
    }
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  position: relative;
  z-index: 1;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const EncryptionPath = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  svg {
    position: absolute;
    width: 100%;
    height: 100%;
    path {
      fill: none;
      stroke: rgba(82, 196, 26, 0.1);
      stroke-width: 2;
      stroke-dasharray: 10;
      animation: ${dataFlow} 10s linear infinite;
    }
  }
`;

const FeatureCard = styled.div`
  position: relative;
  padding: 32px;
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(115, 209, 61, 0.05))'
    : 'rgba(255, 255, 255, 0.6)'};
  backdrop-filter: blur(10px);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${props => props.$primary 
    ? 'rgba(82, 196, 26, 0.2)'
    : 'rgba(255, 255, 255, 0.2)'};
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: ${props => props.$primary 
      ? 'linear-gradient(45deg, transparent 0%, transparent 45%, rgba(82, 196, 26, 0.1) 45%, rgba(82, 196, 26, 0.1) 55%, transparent 55%, transparent 100%), linear-gradient(-45deg, transparent 0%, transparent 45%, rgba(22, 119, 255, 0.1) 45%, rgba(22, 119, 255, 0.1) 55%, transparent 55%, transparent 100%)'
      : 'none'};
    background-size: 200% 200%;
    animation: ${encryptionMatrix} 20s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    border-color: ${props => props.$primary 
      ? 'rgba(82, 196, 26, 0.4)'
      : 'rgba(255, 255, 255, 0.4)'};

    .encryption-code {
      opacity: 1;
      transform: translateY(0);
    }

    .feature-icon {
      animation: ${lockPulse} 1.5s ease-in-out infinite;
    }
  }

  .encryption-code {
    position: absolute;
    top: 12px;
    right: 12px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: ${props => props.$primary ? '#52c41a' : '#8c8c8c'};
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;

    &::after {
      content: "AES-256";
      animation: ${codeScramble} 4s steps(1) infinite;
    }
  }

  .feature-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: ${props => props.$primary 
      ? 'linear-gradient(135deg, #52c41a, #73d13d)'
      : 'linear-gradient(135deg, #f0f0f0, #fafafa)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px ${props => props.$primary 
      ? 'rgba(82, 196, 26, 0.2)'
      : 'rgba(0, 0, 0, 0.08)'};

    i {
      font-size: 28px;
      color: ${props => props.$primary ? '#fff' : '#8c8c8c'};
      transition: all 0.4s ease;
    }
  }

  h4 {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: var(--ant-color-text);
    transition: color 0.3s ease;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: var(--ant-color-text-secondary);
    transition: color 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 24px;

    .feature-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      margin-bottom: 20px;

      i {
        font-size: 24px;
      }
    }

    h4 {
      font-size: 18px;
      margin-bottom: 12px;
    }

    p {
      font-size: 14px;
    }
  }
`;

const CodeTabs = styled(Tabs)`
  margin: 16px 0;
  background: rgba(0, 0, 0, 0.02);
  padding: 16px;
  border-radius: 12px;
  
  .ant-tabs-nav {
    margin-bottom: 16px;
  }
  
  .ant-tabs-tab {
    padding: 8px 16px;
    
    &:hover {
      color: #52c41a;
    }
  }
  
  .ant-tabs-tab-active {
    .ant-tabs-tab-btn {
      color: #52c41a !important;
    }
  }
  
  .ant-tabs-ink-bar {
    background: #52c41a;
  }
`;

const CodeBlock = styled.pre`
  background: rgba(0, 0, 0, 0.03);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  
  code {
    color: var(--ant-color-text);
  }
`;

const AlgorithmImage = styled.div`
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.05), rgba(22, 119, 255, 0.05));
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
  text-align: center;

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }
`;

const ClickableText = styled(Text)`
  cursor: pointer;
  color: #1677ff;
  text-decoration: underline;
  transition: all 0.3s ease;

  &:hover {
    color: #4096ff;
  }
`;

const SecurityFeatures = () => {
  const [aesModalVisible, setAesModalVisible] = useState(false);
  const [chunkModalVisible, setChunkModalVisible] = useState(false);
  
  const features = [
    {
      icon: 'bi bi-shield-lock-fill',
      title: '本地解密保护',
      description: '所有解密操作均在本地浏览器中完成，确保您的文件内容和密码绝不会上传到服务器，为您的数据安全保驾护航',
      primary: true
    },
    {
      icon: 'bi bi-key-fill',
      title: '军事级加密算法',
      description: (
        <>
          采用 
          <ClickableText onClick={() => setAesModalVisible(true)}>
            AES-256-CBC
          </ClickableText> 
          加密算法，这是目前最安全的对称加密标准，可以抵御已知的所有攻击方式
        </>
      ),
      primary: true
    },
    {
      icon: 'bi bi-fingerprint',
      title: '隐私数据保护',
      description: '严格的隐私保护机制，不保存任何解密密码，不记录文件内容，让您高枕无忧地使用我们的服务',
      primary: false
    },
    {
      icon: 'bi bi-layers-fill',
      title: '智能分块解密',
      description: (
        <>
          采用
          <ClickableText onClick={() => setChunkModalVisible(true)}>
            智能分块解密技术
          </ClickableText>
          ，显著提升解密速度，同时大幅降低内存占用，让解密更快更稳定
        </>
      ),
      primary: false
    }
  ];

  const floatingBlocks = [
    { size: 60, duration: 6, delay: 0, top: 10, left: 10 },
    { size: 40, duration: 8, delay: 1, top: 70, left: 85 },
    { size: 50, duration: 7, delay: 2, top: 40, left: 90 },
    { size: 45, duration: 9, delay: 3, top: 80, left: 20 },
  ];

  const generateBinaryRain = () => {
    const raindrops = [];
    for (let i = 0; i < 20; i++) {
      const binary = Math.random() > 0.5 ? '1' : '0';
      raindrops.push({
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 5,
        left: Math.random() * 100,
        content: binary
      });
    }
    return raindrops;
  };

  const generateEncryptionPaths = () => {
    const paths = [];
    const numPaths = 3;
    
    for (let i = 0; i < numPaths; i++) {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 100;
      const endY = Math.random() * 100;
      const controlX1 = Math.random() * 100;
      const controlY1 = Math.random() * 100;
      const controlX2 = Math.random() * 100;
      const controlY2 = Math.random() * 100;
      
      paths.push(`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`);
    }
    
    return paths;
  };

  const codeExamples = {
    javascript: `// JavaScript/Node.js
const crypto = require('crypto');

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}`,

    python: `# Python
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64

def encrypt(text, key):
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    padded = pad(text.encode(), AES.block_size)
    encrypted = cipher.encrypt(padded)
    return {
        'iv': base64.b64encode(iv).decode('utf-8'),
        'encrypted': base64.b64encode(encrypted).decode('utf-8')
    }`,

    java: `// Java
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

public static EncryptResult encrypt(String text, byte[] key) {
    byte[] iv = new byte[16];
    new SecureRandom().nextBytes(iv);
    IvParameterSpec ivSpec = new IvParameterSpec(iv);
    SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
    
    Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
    cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
    byte[] encrypted = cipher.doFinal(text.getBytes());
    return new EncryptResult(iv, encrypted);
}`,

    go: `// Go
import (
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "io"
)

func encrypt(text []byte, key []byte) (*EncryptResult, error) {
    block, _ := aes.NewCipher(key)
    iv := make([]byte, aes.BlockSize)
    io.ReadFull(rand.Reader, iv)
    
    mode := cipher.NewCBCEncrypter(block, iv)
    padded := pkcs7Pad(text, aes.BlockSize)
    encrypted := make([]byte, len(padded))
    mode.CryptBlocks(encrypted, padded)
    
    return &EncryptResult{IV: iv, Data: encrypted}, nil
}`,

    php: `<?php
// PHP
function encrypt($text, $key) {
    $iv = openssl_random_pseudo_bytes(16);
    $encrypted = openssl_encrypt(
        $text,
        'AES-256-CBC',
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );
    return [
        'iv' => base64_encode($iv),
        'data' => base64_encode($encrypted)
    ];
}
?>`
  };

  return (
    <FeaturesContainer>
      {floatingBlocks.map((block, index) => (
        <FloatingBlock
          key={index}
          $size={block.size}
          $duration={block.duration}
          $delay={block.delay}
          $top={block.top}
          $left={block.left}
        />
      ))}
      
      <BinaryRainContainer>
        {generateBinaryRain().map((drop, index) => (
          <BinaryRainDrop
            key={index}
            $duration={drop.duration}
            $delay={drop.delay}
            $left={drop.left}
          >
            {drop.content}
          </BinaryRainDrop>
        ))}
      </BinaryRainContainer>

      <EncryptionPath>
        <svg>
          {generateEncryptionPaths().map((path, index) => (
            <path key={index} d={path} style={{ animationDelay: `${index * 2}s` }} />
          ))}
        </svg>
      </EncryptionPath>

      <Modal
        title={
          <Space>
            <i className="bi bi-shield-lock-fill" style={{ color: '#52c41a' }} />
            <span>AES-256-CBC 加密算法详解</span>
          </Space>
        }
        open={aesModalVisible}
        onCancel={() => setAesModalVisible(false)}
        width={800}
        footer={null}
      >
        <Typography>
          <Title level={4}>什么是 AES-256-CBC？</Title>
          <Paragraph>
            AES-256-CBC 是一种高级加密标准（Advanced Encryption Standard）的实现方式，其中：
          </Paragraph>
          <ul>
            <li><Text strong>AES</Text>：对称加密算法的一种，由美国国家标准与技术研究院（NIST）于2001年确立</li>
            <li><Text strong>256</Text>：使用256位密钥长度，提供最高级别的安全性</li>
            <li><Text strong>CBC</Text>：密码分组链接（Cipher Block Chaining）模式，提供更好的加密安全性</li>
          </ul>

          <Divider />
          
          <Title level={4}>工作原理</Title>
          <Paragraph>
            AES-256-CBC 的加密过程主要包含以下步骤：
          </Paragraph>
          <ol>
            <li>将明文数据分割成固定大小的块（128位）</li>
            <li>生成随机的初始化向量（IV）</li>
            <li>使用CBC模式将前一个密文块与当前明文块进行XOR运算</li>
            <li>使用256位密钥对XOR结果进行AES加密</li>
          </ol>

          <Paragraph>加密过程示例：</Paragraph>
          <CodeTabs
            defaultActiveKey="javascript"
            items={[
              {
                key: 'javascript',
                label: 'JavaScript',
                children: <CodeBlock><code>{codeExamples.javascript}</code></CodeBlock>
              },
              {
                key: 'python',
                label: 'Python',
                children: <CodeBlock><code>{codeExamples.python}</code></CodeBlock>
              },
              {
                key: 'java',
                label: 'Java',
                children: <CodeBlock><code>{codeExamples.java}</code></CodeBlock>
              },
              {
                key: 'go',
                label: 'Go',
                children: <CodeBlock><code>{codeExamples.go}</code></CodeBlock>
              },
              {
                key: 'php',
                label: 'PHP',
                children: <CodeBlock><code>{codeExamples.php}</code></CodeBlock>
              }
            ]}
          />

          <Divider />

          <Title level={4}>安全特性</Title>
          <Paragraph>
            AES-256-CBC 提供了多重安全保障：
          </Paragraph>
          <ul>
            <li>256位密钥提供 2^256 种可能的组合，即使使用超级计算机也无法在合理时间内暴力破解</li>
            <li>CBC模式确保相同的明文块会产生不同的密文块，增加加密的随机性</li>
            <li>初始化向量（IV）的使用确保即使使用相同的密钥，每次加密的结果也都不同</li>
            <li>被广泛应用于军事、金融等高安全性要求的领域</li>
          </ul>

          <AlgorithmImage>
            <CBCEncryptionDiagram />
            <Text type="secondary" style={{ marginTop: 16 }}>CBC 模式加密过程动态示意图</Text>
          </AlgorithmImage>

          <Divider />

          <Title level={4}>为什么选择 AES-256-CBC？</Title>
          <Paragraph>
            我们选择 AES-256-CBC 作为加密标准的原因：
          </Paragraph>
          <ul>
            <li>经过广泛验证的安全性，至今没有实用的攻击方法</li>
            <li>优秀的性能表现，加解密速度快</li>
            <li>硬件加速支持，主流处理器都内置了 AES 指令集</li>
            <li>广泛的工具支持，各种编程语言都有成熟的实现</li>
          </ul>
        </Typography>
      </Modal>

      <Modal
        title={
          <Space>
            <i className="bi bi-layers-fill" style={{ color: '#52c41a' }} />
            <span>智能分块解密技术详解</span>
          </Space>
        }
        open={chunkModalVisible}
        onCancel={() => setChunkModalVisible(false)}
        width={800}
        footer={null}
      >
        <Typography>
          <Title level={4}>什么是智能分块解密？</Title>
          <Paragraph>
            智能分块解密是一种针对大文件优化的解密技术，它将大文件分割成多个小块进行并行处理，具有以下特点：
          </Paragraph>
          <ul>
            <li><Text strong>动态分块</Text>：根据文件大小和系统内存自动调整分块大小</li>
            <li><Text strong>并行处理</Text>：多个数据块同时解密，充分利用多核CPU</li>
            <li><Text strong>内存优化</Text>：通过流式处理控制内存使用，避免内存溢出</li>
            <li><Text strong>断点续传</Text>：支持解密过程中断后继续，提高容错性</li>
          </ul>

          <Divider />
          
          <Title level={4}>工作原理</Title>
          <Paragraph>
            智能分块解密的处理流程如下：
          </Paragraph>
          <ol>
            <li>文件预分析：计算最优分块大小和数量</li>
            <li>数据分块：将加密文件切分成大小相等的数据块</li>
            <li>并行解密：多个数据块同时进行解密操作</li>
            <li>流式写入：解密后的数据块按顺序写入目标文件</li>
          </ol>

          <CodeBlock>
            <code>{`// 分块解密示例代码
async function chunkDecrypt(file, key, chunkSize = 1024 * 1024) {
  // 计算分块数量
  const chunks = Math.ceil(file.size / chunkSize);
  const decrypted = new Uint8Array(file.size);
  
  // 创建进度追踪器
  const progress = new Array(chunks).fill(0);
  
  // 并行处理所有分块
  await Promise.all(Array.from({ length: chunks }, async (_, index) => {
    // 读取分块数据
    const start = index * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = await readChunk(file, start, end);
    
    // 解密分块
    const decryptedChunk = await decryptChunk(chunk, key);
    
    // 写入结果
    decrypted.set(decryptedChunk, start);
    progress[index] = 100;
    
    // 更新总体进度
    updateProgress(progress.reduce((a, b) => a + b) / chunks);
  }));
  
  return decrypted;
}`}</code>
          </CodeBlock>

          <Divider />

          <Title level={4}>性能优势</Title>
          <Paragraph>
            与传统的一次性解密相比，智能分块解密具有显著优势：
          </Paragraph>
          <ul>
            <li>内存占用最高降低90%，4GB文件仅需400MB内存</li>
            <li>解密速度提升3-5倍，充分利用多核CPU</li>
            <li>支持超大文件（{'>'}4GB）解密，不受浏览器内存限制</li>
            <li>解密过程可视化，精确显示进度和剩余时间</li>
          </ul>

          <Divider />

          <Title level={4}>应用场景</Title>
          <Paragraph>
            智能分块解密特别适用于以下场景：
          </Paragraph>
          <ul>
            <li>大型文件（如视频、数据库备份）的解密</li>
            <li>内存受限设备（如移动设备）上的解密操作</li>
            <li>需要并行处理的批量文件解密</li>
            <li>要求实时进度反馈的解密任务</li>
          </ul>

          <AlgorithmImage>
            <ChunkDecryptDiagram />
            <Text type="secondary" style={{ marginTop: 16 }}>智能分块解密流程示意图</Text>
          </AlgorithmImage>
        </Typography>
      </Modal>

      <FeaturesTitle>
        <i className="bi bi-shield-check-fill"></i>
        <h3>安全特性</h3>
      </FeaturesTitle>
      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index} $primary={feature.primary}>
            <div className="encryption-code" />
            <div className="feature-icon">
              <i className={feature.icon}></i>
            </div>
            <h4>{feature.title}</h4>
            <p>{feature.description}</p>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </FeaturesContainer>
  );
};

export default SecurityFeatures; 