const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embed } = require('../../utils/embed');
const { sendLog } = require('../../utils/logger');

const timeUnits = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

function parseDuration(str) {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  return parseInt(match[1]) * timeUnits[match[2]];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia o dessilencia a un usuario (timeout)')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Silencia a un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
        .addStringOption(o => o.setName('duracion').setDescription('Duración (ej: 10m, 2h, 1d)').setRequired(true))
        .addStringOption(o => o.setName('razon').setDescription('Razón'))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Quita el silencio a un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario').setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const target = interaction.options.getMember('usuario');

    if (!target) return interaction.reply({ embeds: [embed('error', 'Error', 'Usuario no encontrado.')], ephemeral: true });
    if (!target.moderatable) return interaction.reply({ embeds: [embed('error', 'Error', 'No puedo moderar a este usuario.')], ephemeral: true });

    if (sub === 'add') {
      const durationStr = interaction.options.getString('duracion');
      const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';
      const ms = parseDuration(durationStr);

      if (!ms) return interaction.reply({ embeds: [embed('error', 'Error', 'Formato de duración inválido. Usa: 10m, 2h, 1d')], ephemeral: true });
      if (ms > 28 * 24 * 3600000) return interaction.reply({ embeds: [embed('error', 'Error', 'El máximo es 28 días.')], ephemeral: true });

      await target.timeout(ms, reason);

      await interaction.reply({
        embeds: [embed('warning', '🔇 Usuario silenciado',
          `**${target.user.tag}** silenciado por **${durationStr}**.\n**Razón:** ${reason}`)],
      });

      await sendLog(interaction.guild, 'MUTE', `Duración: ${durationStr} | Razón: ${reason}`, target.user, interaction.user);

    } else if (sub === 'remove') {
      await target.timeout(null);

      await interaction.reply({
        embeds: [embed('success', '🔊 Silencio retirado', `**${target.user.tag}** ya puede hablar de nuevo.`)],
      });

      await sendLog(interaction.guild, 'UNMUTE', null, target.user, interaction.user);
    }
  },
};
