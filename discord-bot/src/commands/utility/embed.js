const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const { embed } = require('../../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Crea y envía un mensaje embed personalizado')
    .addStringOption(o => o.setName('titulo').setDescription('Título del embed').setRequired(true))
    .addStringOption(o => o.setName('descripcion').setDescription('Descripción del embed').setRequired(true))
    .addStringOption(o => o.setName('color').setDescription('Color en hex (ej: #ff0000)'))
    .addStringOption(o => o.setName('imagen').setDescription('URL de imagen'))
    .addStringOption(o => o.setName('thumbnail').setDescription('URL de thumbnail'))
    .addStringOption(o => o.setName('footer').setDescription('Texto del footer'))
    .addChannelOption(o => o.setName('canal').setDescription('Canal donde enviar (por defecto el actual)')
      .addChannelTypes(ChannelType.GuildText))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const title = interaction.options.getString('titulo');
    const description = interaction.options.getString('descripcion');
    const colorStr = interaction.options.getString('color') ?? '#3498db';
    const image = interaction.options.getString('imagen');
    const thumbnail = interaction.options.getString('thumbnail');
    const footer = interaction.options.getString('footer');
    const channel = interaction.options.getChannel('canal') ?? interaction.channel;

    const hexColor = /^#[0-9A-Fa-f]{6}$/.test(colorStr) ? colorStr : '#3498db';

    const customEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(hexColor)
      .setTimestamp();

    if (image) customEmbed.setImage(image);
    if (thumbnail) customEmbed.setThumbnail(thumbnail);
    if (footer) customEmbed.setFooter({ text: footer });

    await channel.send({ embeds: [customEmbed] });

    await interaction.reply({
      embeds: [embed('success', '✅ Embed enviado', `El embed fue enviado a ${channel}.`)],
      ephemeral: true,
    });
  },
};
