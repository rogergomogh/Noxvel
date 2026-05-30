const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const SEPARATOR = '─────────────────────';

const rules = [
  {
    number: '0 1',
    title: '꒰ RESPETO Y CONVIVENCIA ꒱',
    content: `Este es un espacio seguro y acogedor para todos.\nNo se toleran conductas discriminatorias de ningún tipo: racismo, sexismo, homofobia, transfobia, capacitismo, o cualquier insulto basado en género, orientación sexual, religión, nacionalidad o identidad.\nTrata a todos con respeto, incluso en desacuerdos. Las discusiones sanas son bienvenidas, pero sin ataques personales.\nEvita el acoso, el bullying y cualquier forma de intimidación. Resuelve conflictos de manera privada o con ayuda del staff\nDicho esto, el humor entre amigos y los chistes de humor negro tienen cabida aquí, siempre dentro de un límite razonable. El staff se reserva el derecho de intervenir cuando lo considere necesario.`,
  },
  {
    number: '0 2',
    title: '꒰ PUBLICIDAD Y SPAM ꒱',
    content: `No se permite publicidad, spam, flood de mensajes o enlaces no solicitados.\nLos enlaces personales, servidores, redes sociales o promociones requieren aprobación explícita del staff.\nNo hagas spam de reacciones, emojis, menciones masivas o mensajes duplicados.\nLa violación de esta regla será sancionada.`,
  },
  {
    number: '0 3',
    title: '꒰ SPOILERS Y CONTENIDO SENSIBLE ꒱',
    content: `No reveles información importante de películas, series, libros, videojuegos o eventos sin aviso previo.\nUsa la función de spoiler (||contenido||) cuando sea necesario.\nAvisa siempre que vayas a comentar sobre eventos actuales importantes, contenido sensible o temas delicados.`,
  },
  {
    number: '0 4',
    title: '꒰ CONTENIDO NSFW ꒱',
    content: `Cualquier contenido NSFW (sexual, violencia gráfica, gore) está completamente prohibido.\nEsto incluye imágenes, videos y enlaces.\nAunque el servidor esté enfocado para mayores de edad, recuerda que usuarios menores pueden seguir entrando`,
  },
  {
    number: '0 5',
    title: '꒰ LEGALIDAD Y TÉRMINOS DE DISCORD ꒱',
    content: `Es obligatorio cumplir con los Términos de Servicio y Política de Privacidad de Discord.\nNo se permite distribución de contenido ilegal, malware o estafas`,
  },
  {
    number: '0 6',
    title: '꒰ ORDEN Y LEGIBILIDAD DEL CHAT ꒱',
    content: `No hagas flood (enviar muchos mensajes en poco tiempo).\nLos ghost pings están prohibidos. No menciones a gente solo para borrarlo después.\nUsa los canales de forma correcta según su propósito.`
  },
  {
    number: '0 7',
    title: '꒰ TEMAS SENSIBLES Y POLÍTICA ꒱',
    content: `Se pueden mencionar temas políticos, pero no deben convertise en debates acalorados o insultos.\nAsuntos sensibles (religión, suicidio, adicciones, traumas) deben tratarse con respeto y cuidado.\nEvita chistes, memes o burlas sobre estos temas. Si alguien está pasando por algo difícil, sé empático.`
  },
  {
    number: '0 8',
    title: '꒰ SUPLANTACIÓN Y PRIVACIDAD ꒱',
    content: `No te hagas pasar por otro usuario, staff u otra persona.\nRespeta la privacidad de otros. No compartas datos personales sin consentimiento.\nLos nombres de usuario que imiten a moderadores u otros miembros pueden ser cambiados por el staff.`
  },
  {
    number: '0 9',
    title: '꒰ AUTORIDAD DEL STAFF ꒱',
    content: `Respeta y sigue las indicaciones del staff. Nos esforzamos por mantener un ambiente positivo para todos.\nSi necesitas ayuda, usa los canales correspondientes o menciona a un rol de staff cuando sea necesario.\nNo abuses de pings, minusvalía, buscar vacíos legales o desacreditar decisiones del staff públicamente.`
  }
];

const sanctionsEmbed = new EmbedBuilder()
  .setColor(0xdedbce)
  .setTitle('꩜  ·  LEYENDA DE SANCIONES  ·  ꩜')
  .setDescription(
    `${SEPARATOR}\n\n` +
    `**꒰ 🚫 BAN ꒱**\n` +
    `Eres baneado permanentemente del servidor. No podrás volver a unirte.\n` +
    `Se usa para infrcciones graves o tras múltiples violaciones de las reglas.\n` +
    `Puedes enviar una apelación al staff si consideras que fue un error.\n\n` +
    `${SEPARATOR}\n\n` +
    `**꒰ ⚠️ WARN ꒱**\n` +
    `Primera infracción leve. Recibirás una advertencia y un mensaje del staff.\nAcumular warns puede llevar a sanciones más graves.\n\n` +
    `${SEPARATOR}\n\n` +
    `**꒰ 🔇 MUTE ꒱**\n` +
    `Se te silencia temporalmente. No podrás escribir en canales de texto ni hablar en canales de voz.\n` +
    `Puedes solicitar apelación a trabés de un canal privado con el staff.\n\n` +
    `${SEPARATOR}\n\n` +
    `**꒰ 🔨 KICK ꒱**\n` +
    `Eres expulsado del servidor. Puedes volver a unirte más tarde si el enlace está disponible.\n` +
    `Se usa para infracciones moderadas o repetidas\n\n` +
    `${SEPARATOR}`
  );

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Envía las reglas del servidor')
    .addChannelOption(o =>
      o.setName('canal')
        .setDescription('Canal donde enviar las reglas (por defecto el actual)')
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channel = interaction.options.getChannel('canal') ?? interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    // Header
    const headerEmbed = new EmbedBuilder()
      .setColor(0xdedbce)
      .setTitle('₊ ⊹ Reglas del Servidor')
      .setDescription(`${SEPARATOR}\nLee y respeta todas las normas para poder participar en la comunidad.\n${SEPARATOR}`)
      .setThumbnail(interaction.guild.iconURL({ size: 256 }));

    await channel.send({ embeds: [headerEmbed] });

    // Reglas (agrupadas de 3 en 3 para no exceder el límite de 10 embeds por mensaje)
    const chunkSize = 3;
    for (let i = 0; i < rules.length; i += chunkSize) {
      const chunk = rules.slice(i, i + chunkSize);
      const embeds = chunk.map(rule =>
        new EmbedBuilder()
          .setColor(0xdedbce)
          .setDescription(
            `${SEPARATOR}\n\n` +
            `**꩜  · # ${rule.number}  ·  ꩜**\n` +
            `**${rule.title}**\n\n` +
            rule.content.split('\n').map(l => `┊ ${l}`).join('\n') +
            `\n\n${SEPARATOR}`
          )
      );
      await channel.send({ embeds });
    }

    // Sanciones
    await channel.send({ embeds: [sanctionsEmbed] });

    await interaction.editReply({ content: `✅ Reglas enviadas en ${channel}.` });
  },
};
