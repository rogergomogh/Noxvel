const db = require('../database/db');
const { logEmbed } = require('./embed');

async function sendLog(guild, action, details, user = null, moderator = null) {
  const config = db.prepare('SELECT log_channel FROM guild_config WHERE guild_id = ?').get(guild.id);
  if (!config?.log_channel) return;

  const channel = guild.channels.cache.get(config.log_channel);
  if (!channel) return;

  await channel.send({ embeds: [logEmbed(action, details, user, moderator)] }).catch(() => {});
}

module.exports = { sendLog };
