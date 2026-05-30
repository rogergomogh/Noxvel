const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../data.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT PRIMARY KEY,
    log_channel TEXT,
    autorole TEXT,
    welcome_channel TEXT,
    prefix TEXT DEFAULT '!'
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS mutes (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    expires_at INTEGER,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS levels (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    last_xp_at INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS level_config (
    guild_id TEXT PRIMARY KEY,
    level_channel TEXT,
    xp_enabled INTEGER DEFAULT 1,
    xp_cooldown INTEGER DEFAULT 60,
    xp_min INTEGER DEFAULT 15,
    xp_max INTEGER DEFAULT 25
  );
`);

module.exports = db;
