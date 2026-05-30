const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embed } = require('../../utils/embed');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario del servidor')
    .addUserOption(o => o.setName('usuario').setDescription('Usuario a banear').setRequired(true))
    .addStringOption(o => o.setName('razon').setDescription('Razón del baneo'))
    .addIntegerOption(o => o.setName('dias').setDescription('Días de mensajes a eliminar (0-7)').setMinValue(0).setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('razon') ?? 'Sin razón especificada';
    const days = interaction.options.getInteger('dias') ?? 0;

    if (!target) return interaction.reply({ embeds: [embed('error', 'Error', 'Usuario no encontrado.')], ephemeral: true });
    if (!target.bannable) return interaction.reply({ embeds: [embed('error', 'Error', 'No puedo banear a este usuario.')], ephemeral: true });
    if (target.id === interaction.user.id) return interaction.reply({ embeds: [embed('error', 'Error', 'No puedes banearte a ti mismo.')], ephemeral: true });

    await target.ban({ reason, deleteMessageDays: days });

    await interaction.reply({
      embeds: [embed('success', '🔨 Usuario baneado', `**${target.user.tag}** ha sido baneado.\n**Razón:** ${reason}`)],
    });

    await sendLog(interaction.guild, 'BAN', `Razón: ${reason}`, target.user, interaction.user);
  },
};
