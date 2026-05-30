const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard, calcLevel } = require('../../utils/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top 10 usuarios con más nivel del servidor'),

  async execute(interaction) {
    await interaction.deferReply();

    const board = getLeaderboard(interaction.guild.id, 10);

    if (!board.length) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor(0xe74c3c)
          .setDescription('Nadie tiene XP en este servidor todavía.')],
      });
    }

    const medals = ['🥇', '🥈', '🥉'];

    const lines = await Promise.all(board.map(async (row, i) => {
      const { level } = calcLevel(row.xp);
      let username;
      try {
        const member = await interaction.guild.members.fetch(row.user_id);
        username = member.displayName;
      } catch {
        username = `Usuario (${row.user_id})`;
      }

      const pos = medals[i] ?? `**${i + 1}.**`;
      return `${pos} **${username}** — Nivel ${level} · ${row.xp.toLocaleString()} XP`;
    }));

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🏆 Top 10 — ${interaction.guild.name}`)
      .setDescription(lines.join('\n'))
      .setThumbnail(interaction.guild.iconURL())
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
