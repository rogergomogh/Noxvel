const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'messageDelete',
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    await sendLog(message.guild, 'MENSAJE ELIMINADO',
      `**Canal:** ${message.channel}\n**Autor:** ${message.author?.tag ?? 'Desconocido'}\n**Contenido:** ${message.content?.slice(0, 500) || '*(sin contenido de texto)*'}`,
      message.author);
  },
};
