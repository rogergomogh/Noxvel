const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserLevel, getLeaderboard } = require('../../utils/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Muestra tu nivel o el de otro usuario')
    .addUserOption(o =>
      o.setName('usuario')
       .setDescription('Usuario a consultar (opcional)')
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario') ?? interaction.user;
    const data   = getUserLevel(interaction.guild.id, target.id);

    if (!data) {
      return interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription(`**${target.username}** aún no tiene XP en este servidor.`)],
        ephemeral: true,
      });
    }

    // Posición en el ranking
    const board    = getLeaderboard(interaction.guild.id, 9999);
    const position = board.findIndex(r => r.user_id === target.id) + 1;
    const medal    = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `#${position}`;

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .setTitle('📊 Perfil de nivel')
      .addFields(
        { name: '🏆 Posición',         value: medal,                                    inline: true },
        { name: '⭐ Nivel',             value: `**${data.level}**`,                      inline: true },
        { name: '✨ XP acumulado',      value: `${data.totalXp.toLocaleString()} XP`,   inline: true },
        { name: '📈 Siguiente nivel',   value: `${data.currentXp} / ${data.xpNeeded} XP`, inline: true },
        { name: '​',                    value: `\`${data.bar}\` ${data.percent}%`,       inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
