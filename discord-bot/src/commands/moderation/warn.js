const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embed } = require('../../utils/embed');
const { sendLog } = require('../../utils/logger');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Gestión de advertencias')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Añade una advertencia a un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(o => o.setName('razon').setDescription('Razón').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Lista las advertencias de un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Elimina una advertencia por ID')
        .addIntegerOption(o => o.setName('id').setDescription('ID de la advertencia').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const target = interaction.options.getUser('usuario');
      const reason = interaction.options.getString('razon');

      db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)')
        .run(interaction.guild.id, target.id, interaction.user.id, reason);

      const count = db.prepare('SELECT COUNT(*) as c FROM warnings WHERE guild_id = ? AND user_id = ?')
        .get(interaction.guild.id, target.id).c;

      await interaction.reply({
        embeds: [embed('warning', '⚠️ Advertencia añadida',
          `**${target.tag}** ha recibido una advertencia.\n**Razón:** ${reason}\n**Total de advertencias:** ${count}`)],
      });

      await sendLog(interaction.guild, 'WARN', `Razón: ${reason} | Total: ${count}`, target, interaction.user);

    } else if (sub === 'list') {
      const target = interaction.options.getUser('usuario');
      const warns = db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC')
        .all(interaction.guild.id, target.id);

      if (!warns.length) {
        return interaction.reply({ embeds: [embed('info', 'Sin advertencias', `**${target.tag}** no tiene advertencias.`)], ephemeral: true });
      }

      const fields = warns.map(w => ({
        name: `ID #${w.id} — <t:${w.created_at}:R>`,
        value: `Razón: ${w.reason}\nModerador: <@${w.moderator_id}>`,
      }));

      await interaction.reply({
        embeds: [embed('warning', `⚠️ Advertencias de ${target.tag}`, `Total: **${warns.length}**`, fields)],
        ephemeral: true,
      });

    } else if (sub === 'remove') {
      const id = interaction.options.getInteger('id');
      const warn = db.prepare('SELECT * FROM warnings WHERE id = ? AND guild_id = ?').get(id, interaction.guild.id);

      if (!warn) return interaction.reply({ embeds: [embed('error', 'Error', `No existe la advertencia con ID #${id}.`)], ephemeral: true });

      db.prepare('DELETE FROM warnings WHERE id = ?').run(id);

      await interaction.reply({
        embeds: [embed('success', '✅ Advertencia eliminada', `La advertencia #${id} ha sido eliminada.`)],
        ephemeral: true,
      });
    }
  },
};
