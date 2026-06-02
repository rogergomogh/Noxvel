const { addXp, getUserLevel, updateLevelRole, getRoleNameForLevel } = require('../utils/levels');
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

    // Actualizar rol de nivel si cruzó un umbral de 10 en 10
    const oldTier = Math.floor(result.oldLevel / 10);
    const newTier = Math.floor(result.newLevel / 10);
    const roleChanged = newTier !== oldTier || (result.oldLevel === 0 && result.newLevel >= 1);
    let newRoleName = null;
    if (roleChanged) {
      const member = await message.guild.members.fetch(message.author.id).catch(() => null);
      if (member) {
        await updateLevelRole(member, result.newLevel);
        newRoleName = getRoleNameForLevel(result.newLevel);
      }
    }

    const roleText = newRoleName ? ` ¡Has obtenido el rol **${newRoleName}**!` : '';

    const targetChannel =
      message.guild.channels.cache.get('1508968426859794503') ?? message.channel;

    await targetChannel.send(
      `🎉 ¡Felicidades, ${message.author}! Has subido al **nivel ${result.newLevel}**.${roleText}`
    ).catch(() => {});
  },
};
