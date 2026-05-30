require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands = new Collection();

// Cargar comandos
function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommands(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`  ✓ Comando cargado: /${command.data.name}`);
      }
    }
  }
}

// Cargar eventos
function loadEvents(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const event = require(path.join(dir, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`  ✓ Evento cargado: ${event.name}`);
  }
}

console.log('\n📦 Cargando comandos...');
loadCommands(path.join(__dirname, 'src/commands'));

console.log('\n📡 Cargando eventos...');
loadEvents(path.join(__dirname, 'src/events'));

// Manejo de errores global
process.on('unhandledRejection', error => {
  console.error('Unhandled rejection:', error);
});

client.login(process.env.TOKEN).then(() => {
  console.log('\n🚀 Bot iniciando...');
});
