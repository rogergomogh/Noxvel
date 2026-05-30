const { EmbedBuilder } = require('discord.js');

const Colors = {
  success: 0x2ecc71,
  error: 0xe74c3c,
  warning: 0xf39c12,
  info: 0x3498db,
  log: 0x95a5a6,
};

function embed(type, title, description, fields = []) {
  const e = new EmbedBuilder()
    .setColor(Colors[type] ?? Colors.info)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
  if (fields.length) e.addFields(fields);
  return e;
}

function logEmbed(action, details, user, moderator = null) {
  const e = new EmbedBuilder()
    .setColor(Colors.log)
    .setTitle(`📋 ${action}`)
    .setTimestamp();

  if (user) {
    e.addFields({ name: 'Usuario', value: `${user.tag} (${user.id})`, inline: true });
  }
  if (moderator) {
    e.addFields({ name: 'Moderador', value: `${moderator.tag} (${moderator.id})`, inline: true });
  }
  if (details) {
    e.addFields({ name: 'Detalles', value: details });
  }
  return e;
}

module.exports = { embed, logEmbed, Colors };
