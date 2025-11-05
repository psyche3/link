const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const { readDb, writeDb } = require('./s3-storage');

const app = express();
// CORS 配置 - 允许前端域名访问
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如移动应用或 Postman）
    if (!origin) return callback(null, true);
    // 生产环境允许所有来源（也可以根据需要进行限制）
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    // 开发环境检查允许列表
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // 开发环境也允许所有来源
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// 统一错误处理
const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({ error: message });
};

// 通用响应处理
const sendResponse = (res, data, status = 200) => {
  res.status(status).json(data);
};

// Root & Health
app.get('/', (req, res) => {
  res.type('text/plain').send('Local API server is running. Try GET /api/health or /api/state');
});

app.get('/api/health', (req, res) => sendResponse(res, { ok: true }));

// State endpoints
app.get('/api/state', async (req, res) => {
  try {
    const db = await readDb();
    sendResponse(res, db);
  } catch (error) {
    handleError(res, error, '读取数据失败');
  }
});

app.put('/api/state', async (req, res) => {
  try {
    const { categories, links } = req.body || {};
    if (!Array.isArray(categories) || !Array.isArray(links)) {
      return sendResponse(res, { error: 'Invalid state payload' }, 400);
    }
    await writeDb({ categories, links });
    sendResponse(res, { ok: true });
  } catch (error) {
    handleError(res, error, '保存数据失败');
  }
});

// 通用 CRUD 处理函数
const createCrudRoutes = (resourceName, requiredFields = {}, onDelete = null) => {
  const collection = resourceName === 'categories' ? 'categories' : 'links';

  // GET /api/:resource
  app.get(`/api/${resourceName}`, async (req, res) => {
    try {
      const db = await readDb();
      let items = db[collection];
      
      // 支持查询过滤
      if (req.query.categoryId && collection === 'links') {
        items = items.filter(item => item.categoryId === req.query.categoryId);
      }
      
      sendResponse(res, items);
    } catch (error) {
      handleError(res, error, `读取${resourceName}失败`);
    }
  });

  // POST /api/:resource
  app.post(`/api/${resourceName}`, async (req, res) => {
    try {
      const data = req.body || {};
      
      // 验证必填字段
      for (const [field, message] of Object.entries(requiredFields)) {
        if (!data[field] || typeof data[field] !== 'string') {
          return sendResponse(res, { error: message }, 400);
        }
      }

      const db = await readDb();
      const newItem = {
        id: randomUUID(),
        ...data,
        ...(collection === 'links' && !data.iconType ? { iconType: 'Link' } : {})
      };
      
      db[collection].push(newItem);
      await writeDb(db);
      sendResponse(res, newItem, 201);
    } catch (error) {
      handleError(res, error, `创建${resourceName}失败`);
    }
  });

  // PUT /api/:resource/:id
  app.put(`/api/${resourceName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body || {};
      const db = await readDb();
      const idx = db[collection].findIndex(item => item.id === id);
      
      if (idx === -1) return sendResponse(res, { error: 'Not found' }, 404);

      // 更新字段
      Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string' && data[key].length > 0) {
          db[collection][idx][key] = data[key];
        }
      });

      await writeDb(db);
      sendResponse(res, db[collection][idx]);
    } catch (error) {
      handleError(res, error, `更新${resourceName}失败`);
    }
  });

  // DELETE /api/:resource/:id
  app.delete(`/api/${resourceName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();
      const before = db[collection].length;
      
      db[collection] = db[collection].filter(item => item.id !== id);
      
      if (db[collection].length === before) {
        return sendResponse(res, { error: 'Not found' }, 404);
      }

      // 执行删除后的回调（如删除分类时同时删除链接）
      if (onDelete) {
        await onDelete(db, id);
      }

      await writeDb(db);
      sendResponse(res, { ok: true });
    } catch (error) {
      handleError(res, error, `删除${resourceName}失败`);
    }
  });
};

// 注册 CRUD 路由
createCrudRoutes('categories', { name: 'name is required' }, async (db, id) => {
  // 删除分类时同时删除该分类下的所有链接
  db.links = db.links.filter(link => link.categoryId !== id);
});
createCrudRoutes('links', 
  { name: 'name is required', url: 'url is required', categoryId: 'categoryId is required' }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Local API server listening on http://localhost:${PORT}`);
});