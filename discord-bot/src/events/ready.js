module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot online como ${client.user.tag}`);
    client.user.setActivity('/help | discord-bot', { type: 2 }); // LISTENING

    // Cachear invitaciones de todos los servidores al arrancar
    client.inviteCache = new Map();
    for (const guild of client.guilds.cache.values()) {
      try {
        const invites = await guild.invites.fetch();
        client.inviteCache.set(guild.id, new Map(invites.map(i => [i.code, i.uses])));
      } catch {
        // Sin permisos para ver invitaciones en este servidor
      }
    }
    console.log('📨 Caché de invitaciones cargada');
  },
};
