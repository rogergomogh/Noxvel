const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información de un usuario')
    .addUserOption(o => o.setName('usuario').setDescription('Usuario (por defecto tú)')),

  async execute(interaction) {
    const member = interaction.options.getMember('usuario') ?? interaction.member;
    const user = member.user;

    const roles = member.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .slice(0, 10);

    const e = new EmbedBuilder()
      .setColor(member.displayHexColor === '#000000' ? '#3498db' : member.displayHexColor)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Apodo', value: member.nickname ?? 'Ninguno', inline: true },
        { name: 'Bot', value: user.bot ? 'Sí' : 'No', inline: true },
        { name: 'Cuenta creada', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Se unió al servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: `Roles (${roles.length})`, value: roles.length ? roles.join(', ') : 'Ninguno' },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
  },
};
