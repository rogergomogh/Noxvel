const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    await sendLog(newMessage.guild, 'MENSAJE EDITADO',
      `**Canal:** ${newMessage.channel}\n**Autor:** ${newMessage.author?.tag}\n**Antes:** ${oldMessage.content?.slice(0, 300) || '*(no cacheado)*'}\n**Después:** ${newMessage.content?.slice(0, 300)}`,
      newMessage.author);
  },
};
