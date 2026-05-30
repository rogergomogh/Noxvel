const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { embed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levelconfig')
    .setDescription('Configura el sistema de niveles')
    .addSubcommand(sub =>
      sub.setName('canal')
        .setDescription('Canal donde anunciar subidas de nivel')
        .addChannelOption(o => o.setName('canal').setDescription('Canal').setRequired(true)
          .addChannelTypes(ChannelType.GuildText))
    )
    .addSubcommand(sub =>
      sub.setName('toggle')
        .setDescription('Activar o desactivar el sistema de XP')
        .addBooleanOption(o => o.setName('activo').setDescription('Activar (true) / Desactivar (false)').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('cooldown')
        .setDescription('Segundos entre mensajes que dan XP (anti-spam)')
        .addIntegerOption(o => o.setName('segundos').setDescription('Segundos (5-300)').setRequired(true).setMinValue(5).setMaxValue(300))
    )
    .addSubcommand(sub =>
      sub.setName('xp')
        .setDescription('Rango de XP por mensaje')
        .addIntegerOption(o => o.setName('minimo').setDescription('XP mínimo').setRequired(true).setMinValue(1).setMaxValue(100))
        .addIntegerOption(o => o.setName('maximo').setDescription('XP máximo').setRequired(true).setMinValue(1).setMaxValue(100))
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('Ver configuración actual de niveles')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const gid = interaction.guild.id;

    db.prepare('INSERT OR IGNORE INTO level_config (guild_id) VALUES (?)').run(gid);

    if (sub === 'canal') {
      const ch = interaction.options.getChannel('canal');
      db.prepare('UPDATE level_config SET level_channel = ? WHERE guild_id = ?').run(ch.id, gid);
      return interaction.reply({ embeds: [embed('success', '✅ Canal configurado', `Las subidas de nivel se anunciarán en ${ch}.`)] });

    } else if (sub === 'toggle') {
      const activo = interaction.options.getBoolean('activo');
      db.prepare('UPDATE level_config SET xp_enabled = ? WHERE guild_id = ?').run(activo ? 1 : 0, gid);
      return interaction.reply({ embeds: [embed('info', `Sistema de XP ${activo ? 'activado ✅' : 'desactivado ❌'}`, '')] });

    } else if (sub === 'cooldown') {
      const secs = interaction.options.getInteger('segundos');
      db.prepare('UPDATE level_config SET xp_cooldown = ? WHERE guild_id = ?').run(secs, gid);
      return interaction.reply({ embeds: [embed('success', '✅ Cooldown actualizado', `Cooldown entre mensajes con XP: **${secs}s**`)] });

    } else if (sub === 'xp') {
      const min = interaction.options.getInteger('minimo');
      const max = interaction.options.getInteger('maximo');
      if (min > max) return interaction.reply({ embeds: [embed('error', 'Error', 'El mínimo no puede ser mayor que el máximo.')], ephemeral: true });
      db.prepare('UPDATE level_config SET xp_min = ?, xp_max = ? WHERE guild_id = ?').run(min, max, gid);
      return interaction.reply({ embeds: [embed('success', '✅ XP actualizado', `XP por mensaje: **${min} – ${max} XP**`)] });

    } else if (sub === 'view') {
      const config = db.prepare('SELECT * FROM level_config WHERE guild_id = ?').get(gid);
      const fields = [
        { name: '📡 Estado',           value: config?.xp_enabled !== 0 ? '✅ Activado' : '❌ Desactivado', inline: true },
        { name: '📢 Canal de niveles', value: config?.level_channel ? `<#${config.level_channel}>` : 'No configurado', inline: true },
        { name: '⏱️ Cooldown',         value: `${config?.xp_cooldown ?? 60}s`, inline: true },
        { name: '✨ XP por mensaje',   value: `${config?.xp_min ?? 15} – ${config?.xp_max ?? 25} XP`, inline: true },
      ];
      return interaction.reply({ embeds: [embed('info', '⚙️ Configuración de niveles', '​', fields)], ephemeral: true });
    }
  },
};
