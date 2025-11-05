const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// 尝试加载配置文件
let s3Config = null;
try {
  s3Config = require('./s3-config.js');
} catch (e) {
  // 如果配置文件不存在，使用示例配置
  console.log('S3 配置文件不存在，使用本地文件存储');
}

// 如果没有启用 S3，或配置不存在，返回 null
const useS3 = s3Config && s3Config.enabled === true;

// 本地文件作为后备
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// 初始化 S3 客户端
let s3Client = null;
if (useS3) {
  const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : s3Config.credentials;

  s3Client = new S3Client({
    region: s3Config.region,
    credentials: credentials,
  });
  
  console.log(`S3 存储已启用: ${s3Config.bucket}/${s3Config.key}`);
} else {
  console.log('使用本地文件存储: data/db.json');
}

// 确保本地文件存在（用于后备）
function ensureLocalFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = { categories: [], links: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

// 从 S3 读取数据
async function readFromS3() {
  if (!useS3 || !s3Client) {
    throw new Error('S3 未启用');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Config.key,
    });
    
    const response = await s3Client.send(command);
    const body = await response.Body.transformToString();
    return JSON.parse(body);
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      // 文件不存在，返回初始数据
      console.log('S3 中不存在数据文件，返回初始数据');
      return { categories: [], links: [] };
    }
    throw error;
  }
}

// 写入数据到 S3
async function writeToS3(data) {
  if (!useS3 || !s3Client) {
    throw new Error('S3 未启用');
  }

  const command = new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: s3Config.key,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
  });

  await s3Client.send(command);
  console.log('数据已同步到 S3');
}

// 统一读取接口（优先 S3，失败则使用本地）
async function readDb() {
  if (useS3 && s3Client) {
    try {
      return await readFromS3();
    } catch (error) {
      console.error('从 S3 读取失败，使用本地文件:', error.message);
      ensureLocalFile();
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } else {
    ensureLocalFile();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  }
}

// 统一写入接口（优先 S3，同时写入本地作为备份）
async function writeDb(db) {
  // 总是写入本地作为备份
  ensureLocalFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');

  // 如果启用了 S3，也写入 S3
  if (useS3 && s3Client) {
    try {
      await writeToS3(db);
    } catch (error) {
      console.error('写入 S3 失败，数据已保存到本地:', error.message);
    }
  }
}

// 同步函数版本（用于兼容旧代码）
function readDbSync() {
  ensureLocalFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeDbSync(db) {
  ensureLocalFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

module.exports = {
  readDb,
  writeDb,
  readDbSync,
  writeDbSync,
  useS3,
  s3Config,
};


