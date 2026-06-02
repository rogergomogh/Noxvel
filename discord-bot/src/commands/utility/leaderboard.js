const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard, calcLevel } = require('../../utils/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Muestra el top 5 de usuarios con más nivel del servidor'),

  async execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const all  = getLeaderboard(guildId, 9999);
    const top5 = all.slice(0, 5);

    if (!top5.length) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription('Nadie tiene XP en este servidor todavía.')],
      });
    }

    const medals  = ['🥇', '🥈', '🥉', '🏅', '🏅'];
    const numbers = ['**`1`**', '**`2`**', '**`3`**', '**`4`**', '**`5`**'];

    const lines = await Promise.all(top5.map(async (row, i) => {
      const { level } = calcLevel(row.xp);
      let username;
      try {
        const member = await interaction.guild.members.fetch(row.user_id);
        username = member.displayName;
      } catch {
        username = `Usuario (${row.user_id})`;
      }
      return `${medals[i]} ${numbers[i]} **${username}**\n> Nivel **${level}** · ${row.xp.toLocaleString()} XP\n`;
    }));

    // Posición del autor
    const authorIndex = all.findIndex(r => r.user_id === interaction.user.id);
    let authorLine;
    if (authorIndex === -1) {
      authorLine = '*Aún no tienes XP en el servidor.*';
    } else {
      const { level } = calcLevel(all[authorIndex].xp);
      const pos   = authorIndex + 1;
      const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : '🏅';
      authorLine  = `${medal} Estás en la posición **#${pos}** · Nivel **${level}** · ${all[authorIndex].xp.toLocaleString()} XP`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🏆  Tabla de clasificación — ${interaction.guild.name}`)
      .setDescription(lines.join('\n'))
      .addFields({
        name:  '─────────────────\n📍  Tu posición',
        value: authorLine,
      })
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
