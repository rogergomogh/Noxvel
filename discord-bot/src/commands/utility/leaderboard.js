const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard, calcLevel } = require('../../utils/levels');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Muestra el top 5 de usuarios con más nivel del servidor'),

  async execute(interaction) {
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    const all   = getLeaderboard(guildId, 9999);
    const top5  = all.slice(0, 5);

    if (!top5.length) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription('Nadie tiene XP en este servidor todavía.')],
      });
    }

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    const lines = await Promise.all(top5.map(async (row, i) => {
      const { level } = calcLevel(row.xp);
      let username;
      try {
        const member = await interaction.guild.members.fetch(row.user_id);
        username = member.displayName;
      } catch {
        username = `Usuario (${row.user_id})`;
      }
      return `${medals[i]} **${username}** — Nivel ${level} · ${row.xp.toLocaleString()} XP`;
    }));

    // Posición del autor
    const authorIndex = all.findIndex(r => r.user_id === interaction.user.id);
    let authorLine;
    if (authorIndex === -1) {
      authorLine = 'No tienes XP todavía.';
    } else {
      const { level } = calcLevel(all[authorIndex].xp);
      const pos = authorIndex + 1;
      const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;
      authorLine = `${medal} **Tú** — Nivel ${level} · ${all[authorIndex].xp.toLocaleString()} XP`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🏆 Top 5 — ${interaction.guild.name}`)
      .setDescription(lines.join('\n'))
      .addFields({ name: '📍 Tu posición', value: authorLine })
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
