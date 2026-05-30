require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'src/commands');

function loadCommands(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadCommands(fullPath);
    } else if (entry.name.endsWith('.js')) {
      const command = require(fullPath);
      if (command.data) commands.push(command.data.toJSON());
    }
  }
}

loadCommands(commandsPath);

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos...`);

    // Para testing usa GUILD_ID, para producción usa Routes.applicationCommands
    const route = process.env.GUILD_ID
      ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
      : Routes.applicationCommands(process.env.CLIENT_ID);

    await rest.put(route, { body: commands });

    console.log(`✅ ${commands.length} comandos registrados correctamente.`);
    console.log('Comandos:', commands.map(c => `/${c.name}`).join(', '));
  } catch (error) {
    console.error('Error al registrar comandos:', error);
  }
})();
