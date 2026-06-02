const { EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const { sendLog } = require('../utils/logger');

const INVITE_LOG_CHANNEL  = '1511420257737375904';
const WELCOME_CHANNEL     = '1511425831090782380';
const CHANNEL_RULES       = '<#1505975041790050326>';
const CHANNEL_ROLES       = '<#1508968307238113382>';
const CHANNEL_PRESENTACION = '<#1508969781011808377>';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const client = member.client;
    const guild  = member.guild;
    const config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guild.id);

    // ── Roles iniciales ──────────────────────────────────────────────
    const initialRoles = ['1511387570242719895', '1511410249381449810'];
    for (const id of initialRoles) {
      const role = guild.roles.cache.get(id);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // ── Mensaje de bienvenida ────────────────────────────────────────
    const welcomeChannel = guild.channels.cache.get(WELCOME_CHANNEL);
    if (welcomeChannel) {
      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL({ size: 256 }),
        })
        .setDescription(
          `Se acaba de unir ${member.user.id}\nദ്ദി ≽^⎚˕⎚^≼ .ᐟ\n\n` +
          `Disfruta y diviértete con esta Comunidad. Estamos contentos de tenerte.\n\n` +
          `**¡Recuerda visitar estos canales!**\n` +
          `• ${CHANNEL_RULES}\n` +
          `• ${CHANNEL_ROLES}\n` +
          `• ${CHANNEL_PRESENTACION}`
        )
        .setFooter({ text: `${guild.memberCount} miembros` })
        .setTimestamp();

      await welcomeChannel.send({ embeds: [embed] }).catch(() => {});
    }

    // ── Autorole ─────────────────────────────────────────────────────
    if (config?.autorole) {
      const role = guild.roles.cache.get(config.autorole);
      if (role) await member.roles.add(role).catch(() => {});
    }

    // ── Bienvenida ───────────────────────────────────────────────────
    if (config?.welcome_channel) {
      const channel = guild.channels.cache.get(config.welcome_channel);
      if (channel) {
        const e = new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('👋 ¡Bienvenido!')
          .setDescription(`¡Bienvenido/a a **${guild.name}**, ${member}!\nYa somos **${guild.memberCount}** miembros.`)
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();
        await channel.send({ embeds: [e] }).catch(() => {});
      }
    }

    // ── Rastreo de invitaciones ──────────────────────────────────────
    const logChannel = guild.channels.cache.get(INVITE_LOG_CHANNEL);
    if (logChannel) {
      try {
        const cachedInvites = client.inviteCache.get(guild.id) ?? new Map();
        const currentInvites = await guild.invites.fetch();

        // Buscar la invitación cuyo uso aumentó
        const usedInvite = currentInvites.find(inv => {
          const cachedUses = cachedInvites.get(inv.code) ?? 0;
          return inv.uses > cachedUses;
        });

        // Actualizar caché
        client.inviteCache.set(guild.id, new Map(currentInvites.map(i => [i.code, i.uses])));

        const inviter     = usedInvite?.inviter ?? null;
        const inviterName = inviter ? `**${inviter.username}**` : '*Desconocido*';
        const totalInvites = inviter
          ? currentInvites.filter(i => i.inviter?.id === inviter.id).reduce((sum, i) => sum + i.uses, 0)
          : null;

        const lines = [
          `🎉 ¡Bienvenido/a a **${guild.name}**, ${member}!`,
          `Fue invitado por ${inviterName} 🫂`,
          totalInvites !== null
            ? `🔗 Ahora tiene **${totalInvites}** invitación${totalInvites !== 1 ? 'es' : ''} acumulada${totalInvites !== 1 ? 's' : ''}.`
            : '',
          `¡Disfruta tu estancia en este servidor!`,
        ].filter(Boolean).join('\n');

        await logChannel.send(lines).catch(() => {});
      } catch (e) {
        console.error('Error rastreando invitación:', e);
      }
    }

    // ── Log de moderación ────────────────────────────────────────────
    await sendLog(guild, 'MEMBER JOIN',
      `Se unió: ${member.user.tag} (${member.user.id})\nCuenta creada: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
      member.user);
  },
};
