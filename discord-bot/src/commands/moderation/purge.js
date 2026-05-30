const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embed } = require('../../utils/embed');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Elimina mensajes del canal')
    .addIntegerOption(o => o.setName('cantidad').setDescription('Número de mensajes a eliminar (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption(o => o.setName('usuario').setDescription('Filtrar por usuario (opcional)'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('cantidad');
    const targetUser = interaction.options.getUser('usuario');

    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    let toDelete = [...messages.values()].filter(m => {
      const notOld = Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000;
      const matchUser = targetUser ? m.author.id === targetUser.id : true;
      return notOld && matchUser;
    }).slice(0, amount);

    if (!toDelete.length) {
      return interaction.editReply({ embeds: [embed('error', 'Error', 'No hay mensajes elegibles para eliminar.')] });
    }

    const deleted = await interaction.channel.bulkDelete(toDelete, true);

    await interaction.editReply({
      embeds: [embed('success', '🗑️ Mensajes eliminados', `Se eliminaron **${deleted.size}** mensajes.`)],
    });

    await sendLog(interaction.guild, 'PURGE',
      `Canal: ${interaction.channel.name} | Mensajes: ${deleted.size}${targetUser ? ` | Usuario: ${targetUser.tag}` : ''}`,
      null, interaction.user);
  },
};
