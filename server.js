import http from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// For any other routes, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        bio TEXT,
        avatar TEXT,
        location TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS userSkills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        skillId INTEGER NOT NULL,
        proficiencyLevel TEXT CHECK(proficiencyLevel IN ('beginner', 'intermediate', 'advanced', 'expert')),
        wantToLearn INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE(userId, skillId)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        initiatorId INTEGER NOT NULL,
        recipientId INTEGER NOT NULL,
        initiatorSkillId INTEGER NOT NULL,
        recipientSkillId INTEGER NOT NULL,
        status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
        sessionDate DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (initiatorId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (initiatorSkillId) REFERENCES skills(id),
        FOREIGN KEY (recipientSkillId) REFERENCES skills(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fromUserId INTEGER NOT NULL,
        toUserId INTEGER NOT NULL,
        connectionId INTEGER,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (connectionId) REFERENCES connections(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fromUserId INTEGER NOT NULL,
        toUserId INTEGER NOT NULL,
        content TEXT NOT NULL,
        isRead INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        badgeName TEXT NOT NULL,
        badgeIcon TEXT,
        earnedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized');
  });
};

initDatabase();

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function verifyToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType = 'text/html') {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  try {
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const { username, email, password, firstName, lastName } = body;

      if (!username || !email || !password) {
        return sendJSON(res, 400, { error: 'Missing required fields' });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const result = await dbRun(
        'INSERT INTO users (username, email, password, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, firstName || '', lastName || '']
      );

      const token = jwt.sign({ id: result.id, username }, JWT_SECRET);
      return sendJSON(res, 201, { token, userId: result.id, message: 'User registered successfully' });
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const { email, password } = body;

      if (!email || !password) {
        return sendJSON(res, 400, { error: 'Missing email or password' });
      }

      const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        return sendJSON(res, 401, { error: 'Invalid credentials' });
      }

      const validPassword = await bcryptjs.compare(password, user.password);
      if (!validPassword) {
        return sendJSON(res, 401, { error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      return sendJSON(res, 200, { token, userId: user.id, user: { id: user.id, username: user.username, email: user.email } });
    }

    const userMatch = pathname.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && req.method === 'GET') {
      const userId = userMatch[1];
      const user = await dbGet('SELECT id, username, firstName, lastName, bio, avatar, location FROM users WHERE id = ?', [userId]);
      if (!user) return sendJSON(res, 404, { error: 'User not found' });

      const skills = await dbAll(`
        SELECT s.id, s.name, s.description, us.proficiencyLevel, us.wantToLearn
        FROM userSkills us
        JOIN skills s ON us.skillId = s.id
        WHERE us.userId = ?
      `, [userId]);

      const reviews = await dbAll(`
        SELECT r.*, u.username FROM reviews r
        JOIN users u ON r.fromUserId = u.id
        WHERE r.toUserId = ?
        ORDER BY r.createdAt DESC
      `, [userId]);

      return sendJSON(res, 200, { ...user, skills, reviews });
    }

    if (userMatch && req.method === 'PUT') {
      const userId = userMatch[1];
      const user = verifyToken(req.headers.authorization);
      if (!user || user.id != userId) {
        return sendJSON(res, 403, { error: 'Unauthorized' });
      }

      const body = await parseBody(req);
      const { firstName, lastName, bio, location, avatar } = body;
      await dbRun(
        'UPDATE users SET firstName = ?, lastName = ?, bio = ?, location = ?, avatar = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [firstName, lastName, bio, location, avatar, userId]
      );

      return sendJSON(res, 200, { message: 'Profile updated successfully' });
    }

    if (pathname === '/api/skills' && req.method === 'GET') {
      const skills = await dbAll('SELECT * FROM skills ORDER BY category, name');
      return sendJSON(res, 200, skills);
    }

    const userSkillMatch = pathname.match(/^\/api\/users\/(\d+)\/skills$/);
    if (userSkillMatch && req.method === 'POST') {
      const userId = userSkillMatch[1];
      const user = verifyToken(req.headers.authorization);
      if (!user || user.id != userId) {
        return sendJSON(res, 403, { error: 'Unauthorized' });
      }

      const body = await parseBody(req);
      const { skillId, proficiencyLevel, wantToLearn } = body;

      await dbRun(
        'INSERT OR REPLACE INTO userSkills (userId, skillId, proficiencyLevel, wantToLearn) VALUES (?, ?, ?, ?)',
        [userId, skillId, proficiencyLevel, wantToLearn ? 1 : 0]
      );

      return sendJSON(res, 201, { message: 'Skill added successfully' });
    }

    const matchesMatch = pathname.match(/^\/api\/matches\/(\d+)$/);
    if (matchesMatch && req.method === 'GET') {
      const userId = matchesMatch[1];
      const learnSkills = await dbAll(`
        SELECT skillId FROM userSkills WHERE userId = ? AND wantToLearn = 1
      `, [userId]);

      if (learnSkills.length === 0) {
        return sendJSON(res, 200, []);
      }

      const skillIds = learnSkills.map(s => s.skillId);
      const placeholders = skillIds.map(() => '?').join(',');

      const matches = await dbAll(`
        SELECT DISTINCT u.id, u.username, u.firstName, u.lastName, u.bio, u.avatar, u.location,
               GROUP_CONCAT(s.name) as teachingSkills,
               COUNT(r.id) as reviewCount,
               AVG(r.rating) as averageRating
        FROM users u
        JOIN userSkills us ON u.id = us.userId
        JOIN skills s ON us.skillId = s.id
        LEFT JOIN reviews r ON u.id = r.toUserId
        WHERE us.skillId IN (${placeholders})
          AND us.proficiencyLevel IN ('intermediate', 'advanced', 'expert')
          AND u.id != ?
        GROUP BY u.id
        ORDER BY averageRating DESC, reviewCount DESC
        LIMIT 10
      `, [...skillIds, userId]);

      return sendJSON(res, 200, matches);
    }

    if (pathname === '/api/connections' && req.method === 'POST') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

      const body = await parseBody(req);
      const { recipientId, initiatorSkillId, recipientSkillId, sessionDate } = body;

      const result = await dbRun(
        `INSERT INTO connections (initiatorId, recipientId, initiatorSkillId, recipientSkillId, sessionDate)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, recipientId, initiatorSkillId, recipientSkillId, sessionDate]
      );

      return sendJSON(res, 201, { id: result.id, message: 'Connection request sent' });
    }

    const userConnectionsMatch = pathname.match(/^\/api\/users\/(\d+)\/connections$/);
    if (userConnectionsMatch && req.method === 'GET') {
      const userId = userConnectionsMatch[1];
      const connections = await dbAll(`
        SELECT c.*, 
               u1.username as initiatorName, u1.avatar as initiatorAvatar,
               u2.username as recipientName, u2.avatar as recipientAvatar,
               s1.name as initiatorSkillName, s2.name as recipientSkillName
        FROM connections c
        JOIN users u1 ON c.initiatorId = u1.id
        JOIN users u2 ON c.recipientId = u2.id
        JOIN skills s1 ON c.initiatorSkillId = s1.id
        JOIN skills s2 ON c.recipientSkillId = s2.id
        WHERE c.initiatorId = ? OR c.recipientId = ?
        ORDER BY c.createdAt DESC
      `, [userId, userId]);

      return sendJSON(res, 200, connections);
    }

    const connectionMatch = pathname.match(/^\/api\/connections\/(\d+)$/);
    if (connectionMatch && req.method === 'PUT') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

      const connectionId = connectionMatch[1];
      const body = await parseBody(req);
      const { status } = body;

      const connection = await dbGet('SELECT * FROM connections WHERE id = ?', [connectionId]);
      if (!connection) return sendJSON(res, 404, { error: 'Connection not found' });
      if (connection.recipientId != user.id) {
        return sendJSON(res, 403, { error: 'Unauthorized' });
      }

      await dbRun('UPDATE connections SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, connectionId]);
      return sendJSON(res, 200, { message: 'Connection updated successfully' });
    }

    if (pathname === '/api/messages' && req.method === 'POST') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

      const body = await parseBody(req);
      const { toUserId, content } = body;

      const result = await dbRun(
        'INSERT INTO messages (fromUserId, toUserId, content) VALUES (?, ?, ?)',
        [user.id, toUserId, content]
      );

      return sendJSON(res, 201, { id: result.id, message: 'Message sent' });
    }

    const userMessagesMatch = pathname.match(/^\/api\/users\/(\d+)\/messages$/);
    if (userMessagesMatch && req.method === 'GET') {
      const userId = userMessagesMatch[1];
      const messages = await dbAll(`
        SELECT m.*, u.username, u.avatar FROM messages m
        JOIN users u ON m.fromUserId = u.id
        WHERE m.toUserId = ?
        ORDER BY m.createdAt DESC
        LIMIT 50
      `, [userId]);

      return sendJSON(res, 200, messages);
    }

    if (pathname === '/api/reviews' && req.method === 'POST') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return sendJSON(res, 401, { error: 'Unauthorized' });

      const body = await parseBody(req);
      const { toUserId, connectionId, rating, comment } = body;

      const result = await dbRun(
        'INSERT INTO reviews (fromUserId, toUserId, connectionId, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [user.id, toUserId, connectionId || null, rating, comment]
      );

      return sendJSON(res, 201, { id: result.id, message: 'Review submitted' });
    }

    if (pathname === '/api/search' && req.method === 'GET') {
      const searchQuery = query.query || '';
      const category = query.category || '';

      let sql = `
        SELECT DISTINCT u.id, u.username, u.firstName, u.lastName, u.bio, u.avatar,
               GROUP_CONCAT(s.name) as skills
        FROM users u
        LEFT JOIN userSkills us ON u.id = us.userId
        LEFT JOIN skills s ON us.skillId = s.id
        WHERE 1=1
      `;
      let params = [];

      if (searchQuery) {
        sql += ` AND (u.username LIKE ? OR u.firstName LIKE ? OR u.lastName LIKE ? OR s.name LIKE ?)`;
        const searchTerm = `%${searchQuery}%`;
        params = [searchTerm, searchTerm, searchTerm, searchTerm];
      }

      if (category) {
        sql += ` AND s.category LIKE ?`;
        params.push(`%${category}%`);
      }

      sql += ` GROUP BY u.id LIMIT 20`;

      const results = await dbAll(sql, params);
      return sendJSON(res, 200, results);
    }

    if (pathname === '/api/seed' && req.method === 'GET') {
      await dbRun('DELETE FROM badges');
      await dbRun('DELETE FROM reviews');
      await dbRun('DELETE FROM messages');
      await dbRun('DELETE FROM connections');
      await dbRun('DELETE FROM userSkills');
      await dbRun('DELETE FROM skills');
      await dbRun('DELETE FROM users');

      const skillsData = [
        { name: 'JavaScript', description: 'Web programming language', category: 'Programming' },
        { name: 'Python', description: 'General purpose programming', category: 'Programming' },
        { name: 'React', description: 'Frontend library', category: 'Web Development' },
        { name: 'Guitar', description: 'Musical instrument', category: 'Music' },
        { name: 'Spanish', description: 'Language learning', category: 'Languages' },
        { name: 'Yoga', description: 'Physical wellness', category: 'Fitness' },
        { name: 'Photography', description: 'Digital photography', category: 'Creative' },
        { name: 'Cooking', description: 'Culinary skills', category: 'Lifestyle' }
      ];

      for (const skill of skillsData) {
        await dbRun('INSERT INTO skills (name, description, category) VALUES (?, ?, ?)', [skill.name, skill.description, skill.category]);
      }

      const pass = await bcryptjs.hash('password123', 10);
      const users = [
        { username: 'alice', email: 'alice@example.com', password: pass, firstName: 'Alice', lastName: 'Johnson', bio: 'Love teaching JavaScript' },
        { username: 'bob', email: 'bob@example.com', password: pass, firstName: 'Bob', lastName: 'Smith', bio: 'Python enthusiast' },
        { username: 'carol', email: 'carol@example.com', password: pass, firstName: 'Carol', lastName: 'Davis', bio: 'Guitar teacher' }
      ];

      for (const user of users) {
        await dbRun('INSERT INTO users (username, email, password, firstName, lastName, bio) VALUES (?, ?, ?, ?, ?, ?)',
          [user.username, user.email, user.password, user.firstName, user.lastName, user.bio]);
      }

      return sendJSON(res, 200, { message: 'Database seeded successfully' });
    }

    if (pathname === '/') {
      return sendFile(res, path.join(__dirname, 'client/public/index.html'), 'text/html');
    }

    const staticPath = path.join(__dirname, 'client/public', pathname);
    if (fs.existsSync(staticPath)) {
      const ext = path.extname(pathname).toLowerCase();
      const contentTypes = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
      return sendFile(res, staticPath, contentTypes[ext] || 'text/plain');
    }

    return sendFile(res, path.join(__dirname, 'client/public/index.html'), 'text/html');

  } catch (err) {
    console.error('Server error:', err);
    sendJSON(res, 500, { error: err.message || 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Database: SQLite');
  console.log('API ready at http://localhost:' + PORT + '/api/');
  console.log('Frontend at http://localhost:' + PORT);
});
