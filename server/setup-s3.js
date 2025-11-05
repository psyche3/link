// 快速配置 S3 的交互式脚本
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('=== AWS S3 配置向导 ===\n');
  
  const configPath = path.join(__dirname, 's3-config.js');
  if (fs.existsSync(configPath)) {
    const overwrite = await question('配置文件已存在，是否覆盖？(y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('已取消');
      rl.close();
      return;
    }
  }

  console.log('\n提示：如果不知道如何获取凭证，请查看 AWS_CREDENTIALS_GUIDE.md\n');

  const enabled = await question('是否启用 S3 存储？(y/n，默认 n): ');
  const bucket = await question('S3 存储桶名称（默认: ceshi19484781）: ') || 'ceshi19484781';
  const region = await question('AWS 区域（默认: ap-east-1）: ') || 'ap-east-1';
  const key = await question('S3 中的文件名（默认: db.json）: ') || 'db.json';
  
  let accessKeyId = '';
  let secretAccessKey = '';
  
  if (enabled.toLowerCase() === 'y') {
    accessKeyId = await question('访问密钥 ID (Access Key ID): ');
    secretAccessKey = await question('私有访问密钥 (Secret Access Key): ');
    
    if (!accessKeyId || !secretAccessKey) {
      console.log('\n⚠️  警告：未提供凭证，将使用环境变量（如果已设置）');
    }
  }

  const config = `// AWS S3 配置
// 自动生成，请勿手动编辑（或小心编辑）

module.exports = {
  enabled: ${enabled.toLowerCase() === 'y'},
  bucket: '${bucket}',
  region: '${region}',
  key: '${key}',
  credentials: {
    accessKeyId: '${accessKeyId}',
    secretAccessKey: '${secretAccessKey}',
  },
};
`;

  fs.writeFileSync(configPath, config, 'utf-8');
  console.log(`\n✅ 配置已保存到: ${configPath}`);
  
  if (enabled.toLowerCase() === 'y') {
    console.log('\n提示：');
    console.log('- 建议使用环境变量存储凭证，更安全');
    console.log('- 设置环境变量后，配置文件中的 credentials 会被忽略');
    console.log('- Windows PowerShell: $env:AWS_ACCESS_KEY_ID="你的密钥"');
  }
  
  rl.close();
}

setup().catch(console.error);



