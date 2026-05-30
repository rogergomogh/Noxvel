module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot online como ${client.user.tag}`);
    client.user.setActivity('/help | discord-bot', { type: 2 }); // LISTENING
  },
};
