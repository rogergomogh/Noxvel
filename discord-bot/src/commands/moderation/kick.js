const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embed } = require('../../utils/embed');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un usuario del servidor')
    .addUserOption(o => o.setName('usuario').setDescription('Usuario a expulsar').setRequired(true))
    .addStringOption(o => o.setName('razon').setDescription('Razón de la expulsión'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';

    if (!target) return interaction.reply({ embeds: [embed('error', 'Error', 'Usuario no encontrado.')], ephemeral: true });
    if (!target.kickable) return interaction.reply({ embeds: [embed('error', 'Error', 'No puedo expulsar a este usuario.')], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [embed('error', 'Error', 'No puedes expulsarte a ti mismo.')], ephemeral: true });

    await target.kick(reason);

    await interaction.reply({
      embeds: [embed('success', '👢 Usuario expulsado', `**${target.user.tag}** ha sido expulsado.\n**Razón:** ${reason}`)],
    });

    await sendLog(interaction.guild, 'KICK', `Razón: ${reason}`, target.user, interaction.user);
  },
};
