const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { sendLog } = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(member.guild.id);

    // Roles iniciales
    const initialRoles = ['1511387570242719895', '1511410249381449810'];
    for (const id of initialRoles) {
      const role = member.guild.roles.cache.get(id);
      if (role) await member.roles.add(role).catch(() => {});
    }


    // Autorole
    if (config?.autorole) {
      const role = member.guild.roles.cache.get(config.autorole);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // Bienvenida
    if (config?.welcome_channel) {
      const channel = member.guild.channels.cache.get(config.welcome_channel);
      if (channel) {
        const e = new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('👋 ¡Bienvenido!')
          .setDescription(`¡Bienvenido/a a **${member.guild.name}**, ${member}!\nYa somos **${member.guild.memberCount}** miembros.`)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();
        await channel.send({ embeds: [e] }).catch(() => {});
      }
    }

    // Log
    await sendLog(member.guild, 'MEMBER JOIN',
      `Se unió: ${member.user.tag} (${member.user.id})\nCuenta creada: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
      member.user);
  },
};
