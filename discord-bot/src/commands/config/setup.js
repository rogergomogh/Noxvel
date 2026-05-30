const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { embed } = require('../../utils/embed');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura el bot para este servidor')
    .addSubcommand(sub =>
      sub.setName('log')
        .setDescription('Configura el canal de logs')
        .addChannelOption(o => o.setName('canal').setDescription('Canal de logs').setRequired(true)
          .addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(sub =>
      sub.setName('autorole')
        .setDescription('Configura el rol automático al unirse')
        .addRoleOption(o => o.setName('rol').setDescription('Rol a asignar').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('welcome')
        .setDescription('Configura el canal de bienvenida')
        .addChannelOption(o => o.setName('canal').setDescription('Canal de bienvenida').setRequired(true)
          .addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('Ver la configuración actual')
    )
    .addSubcommand(sub =>
      sub.setName('reset')
        .setDescription('Reinicia toda la configuración')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guild.id;

    db.prepare('INSERT OR IGNORE INTO guild_config (guild_id) VALUES (?)').run(gid);

    if (sub === 'log') {
      const channel = interaction.options.getChannel('canal');
      db.prepare('UPDATE guild_config SET log_channel = ? WHERE guild_id = ?').run(channel.id, gid);
      return interaction.reply({ embeds: [embed('success', '✅ Canal de logs configurado', `Los logs se enviarán a ${channel}.`)] });

    } else if (sub === 'autorole') {
      const role = interaction.options.getRole('rol');
      if (role.managed) return interaction.reply({ embeds: [embed('error', 'Error', 'No puedes usar roles gestionados por integraciones.')], ephemeral: true });
      db.prepare('UPDATE guild_config SET autorole = ? WHERE guild_id = ?').run(role.id, gid);
      return interaction.reply({ embeds: [embed('success', '✅ Autorole configurado', `Los nuevos miembros recibirán el rol ${role}.`)] });

    } else if (sub === 'welcome') {
      const channel = interaction.options.getChannel('canal');
      db.prepare('UPDATE guild_config SET welcome_channel = ? WHERE guild_id = ?').run(channel.id, gid);
      return interaction.reply({ embeds: [embed('success', '✅ Canal de bienvenida configurado', `Las bienvenidas se enviarán a ${channel}.`)] });

    } else if (sub === 'view') {
      const config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(gid);
      if (!config) return interaction.reply({ embeds: [embed('info', 'Sin configuración', 'Este servidor no tiene configuración guardada.')], ephemeral: true });

      const fields = [
        { name: '📋 Canal de logs', value: config.log_channel ? `<#${config.log_channel}>` : 'No configurado', inline: true },
        { name: '🎭 Autorole', value: config.autorole ? `<@&${config.autorole}>` : 'No configurado', inline: true },
        { name: '👋 Canal de bienvenida', value: config.welcome_channel ? `<#${config.welcome_channel}>` : 'No configurado', inline: true },
      ];

      return interaction.reply({ embeds: [embed('info', '⚙️ Configuración del servidor', '​', fields)], ephemeral: true });

    } else if (sub === 'reset') {
      db.prepare('DELETE FROM guild_config WHERE guild_id = ?').run(gid);
      return interaction.reply({ embeds: [embed('warning', '🔄 Configuración reiniciada', 'Toda la configuración ha sido eliminada.')], ephemeral: true });
    }
  },
};
