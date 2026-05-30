const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    await sendLog(member.guild, 'MEMBER LEAVE',
      `Salió: ${member.user.tag} (${member.user.id})\nEstuvo desde: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
      member.user);
  },
};
