const { EmbedBuilder } = require('discord.js');
const { addXp, getUserLevel } = require('../utils/levels');
const db = require('../database/db');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    if (message.content.length < 3) return; // Ignora mensajes muy cortos

    const guildId = message.guild.id;

    // Comprobar si XP está activado para este servidor
    const config = db.prepare('SELECT * FROM level_config WHERE guild_id = ?').get(guildId);
    if (config && config.xp_enabled === 0) return;

    const result = addXp(guildId, message.author.id);
    if (!result || !result.leveledUp) return;

    // --- Subida de nivel ---
    const data = getUserLevel(guildId, message.author.id);

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setAuthor({
        name: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setTitle('⬆️  ¡Subiste de nivel!')
      .setDescription(
        `**${message.author}** ha alcanzado el **nivel ${result.newLevel}** 🎉\n\n` +
        `\`${data.bar}\` ${data.percent}%\n` +
        `XP total: **${data.totalXp.toLocaleString()}**`
      )
      .setTimestamp();

    // Enviar al canal de nivel si está configurado, si no al canal actual
    let targetChannel = message.channel;
    if (config?.level_channel) {
      const ch = message.guild.channels.cache.get(config.level_channel);
      if (ch) targetChannel = ch;
    }

    await targetChannel.send({ embeds: [embed] }).catch(() => {});
  },
};
