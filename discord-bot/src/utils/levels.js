/**
 * Sistema de niveles con curva exponencial.
 *
 * Fórmula XP necesario para pasar de nivel N a N+1:
 *   xpForLevel(n) = 5n² + 50n + 100
 *
 * Ejemplos:
 *   Nivel 0→1:   100 XP   (muy fácil al principio)
 *   Nivel 1→2:   155 XP
 *   Nivel 5→6:   475 XP
 *   Nivel 10→11: 1 100 XP
 *   Nivel 20→21: 3 100 XP
 *   Nivel 50→51: 15 100 XP
 */

const db = require('../database/db');

/** XP necesario para pasar del nivel `n` al `n+1` */
function xpForNextLevel(n) {
  return 5 * n * n + 50 * n + 100;
}

/** Calcula nivel y XP actual a partir del XP total acumulado */
function calcLevel(totalXp) {
  let level = 0;
  let remaining = totalXp;
  while (remaining >= xpForNextLevel(level)) {
    remaining -= xpForNextLevel(level);
    level++;
  }
  return { level, currentXp: remaining, xpNeeded: xpForNextLevel(level) };
}

/** Porcentaje de progreso al siguiente nivel (0-100) */
function progressPercent(totalXp) {
  const { currentXp, xpNeeded } = calcLevel(totalXp);
  return Math.floor((currentXp / xpNeeded) * 100);
}

/** Barra de progreso visual */
function progressBar(totalXp, length = 12) {
  const pct = progressPercent(totalXp);
  const filled = Math.round((pct / 100) * length);
  return '█'.repeat(filled) + '░'.repeat(length - filled);
}

/**
 * Añade XP a un usuario. Devuelve { leveledUp, oldLevel, newLevel } si subió.
 */
function addXp(guildId, userId) {
  db.prepare(`
    INSERT INTO levels (guild_id, user_id) VALUES (?, ?)
    ON CONFLICT(guild_id, user_id) DO NOTHING
  `).run(guildId, userId);

  const config = db.prepare('SELECT * FROM level_config WHERE guild_id = ?').get(guildId);
  const cooldown = config?.xp_cooldown ?? 60;
  const xpMin   = config?.xp_min ?? 15;
  const xpMax   = config?.xp_max ?? 25;

  const row = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  const now = Math.floor(Date.now() / 1000);

  // Cooldown anti-spam
  if (now - row.last_xp_at < cooldown) return null;

  const earned = Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin;
  const newTotalXp = row.xp + earned;

  const oldData = calcLevel(row.xp);
  const newData = calcLevel(newTotalXp);

  db.prepare(`
    UPDATE levels SET xp = ?, level = ?, total_messages = total_messages + 1, last_xp_at = ?
    WHERE guild_id = ? AND user_id = ?
  `).run(newTotalXp, newData.level, now, guildId, userId);

  if (newData.level > oldData.level) {
    return { leveledUp: true, oldLevel: oldData.level, newLevel: newData.level, totalXp: newTotalXp };
  }

  return { leveledUp: false };
}

/** Obtiene datos de nivel de un usuario */
function getUserLevel(guildId, userId) {
  const row = db.prepare('SELECT * FROM levels WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  if (!row) return null;
  const { level, currentXp, xpNeeded } = calcLevel(row.xp);
  return {
    level,
    currentXp,
    xpNeeded,
    totalXp: row.xp,
    totalMessages: row.total_messages,
    bar: progressBar(row.xp),
    percent: progressPercent(row.xp),
  };
}

/** Top N usuarios de un servidor */
function getLeaderboard(guildId, limit = 10) {
  return db.prepare(`
    SELECT user_id, xp, level, total_messages
    FROM levels WHERE guild_id = ?
    ORDER BY xp DESC LIMIT ?
  `).all(guildId, limit);
}

/**
 * Devuelve el nombre del rol que corresponde a un nivel dado.
 * null si el nivel es 0-0 (sin rol todavía).
 */
function getRoleNameForLevel(level) {
  if (level >= 50) return 'Nivel 50';
  if (level >= 40) return 'Nivel 40 - 49';
  if (level >= 30) return 'Nivel 30 - 39';
  if (level >= 20) return 'Nivel 20 - 29';
  if (level >= 10) return 'Nivel 10 - 19';
  if (level >= 1)  return 'Nivel 1 - 9';
  return null;
}

/**
 * Actualiza el rol de nivel de un miembro de Discord.
 * Elimina todos los roles de nivel anteriores y asigna el nuevo si corresponde.
 */
const LEVEL_ROLE_NAMES = [
  'Nivel 1 - 9',
  'Nivel 10 - 19',
  'Nivel 20 - 29',
  'Nivel 30 - 39',
  'Nivel 40 - 49',
  'Nivel 50',
];

async function updateLevelRole(member, newLevel) {
  const targetRoleName = getRoleNameForLevel(newLevel);

  const toRemove = member.roles.cache.filter(r => LEVEL_ROLE_NAMES.includes(r.name));
  if (toRemove.size > 0) {
    await member.roles.remove(toRemove).catch(() => {});
  }

  if (targetRoleName) {
    const role = member.guild.roles.cache.find(r => r.name === targetRoleName);
    if (role) await member.roles.add(role).catch(() => {});
  }
}

module.exports = { addXp, getUserLevel, getLeaderboard, calcLevel, xpForNextLevel, progressBar, getRoleNameForLevel, updateLevelRole, LEVEL_ROLE_NAMES };
