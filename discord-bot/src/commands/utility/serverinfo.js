const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información del servidor'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch();

    const e = new EmbedBuilder()
      .setColor('#3498db')
      .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Dueño', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Creado', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
        { name: 'Canales', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Nivel de boost', value: `${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
        { name: 'Verificación', value: guild.verificationLevel.toString(), inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [e] });
  },
};
