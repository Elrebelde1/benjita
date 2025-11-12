import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix}) => {
  // 1. Validación de Entrada
  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de canción>\n📍 *Ejemplo:* ${usedPrefix + command} phonk`);
}

  await m.react("🎧"); // Reacción de espera

  try {
    const query = encodeURIComponent(text.trim());
    
    // Nueva URL de la API de Nekolabs (solo para búsqueda y descarga por nombre/query)
    const apiUrl = `https://api.nekolabs.web.id/downloader/spotify/play/v1?q=${query}`;
    
    const downloadRes = await fetch(apiUrl);
    const downloadJson = await downloadRes.json();
    
    // Verificación de la respuesta de la API
    const song = downloadJson?.result;

    if (!song ||!song.url_download) {
      return m.reply("❌ No se pudo encontrar o descargar el audio de esa canción. Asegúrate de escribir el nombre correctamente.");
}

    // Extracción de datos
    const title = song.title || 'Desconocido';
    const artists = song.artist || 'Desconocido';
    const duration = song.duration || 'N/A';
    const image = song.thumbnail || 'https://i.imgur.com/3pQ0I.png'; // Imagen por defecto

    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│ 🎵 *Título:* ${title}
│ 👤 *Autor:* ${artists}
│ 🕒 *Duración:* ${duration}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`;

    // 2. Envío de la Portada y Detalles
    await conn.sendMessage(m.chat, { image: { url: image}, caption}, { quoted: m});
    
    // 3. Envío del Audio
    await conn.sendMessage(m.chat, {
      audio: { url: song.url_download},
      mimetype: 'audio/mpeg',
      fileName: `${title} - ${artists}.mp3`
}, { quoted: m});

    await m.react("✅"); // Reacción de éxito

} catch (e) {
    console.error("Error al procesar la descarga de Spotify:", e);
    m.reply("⚠️ *Ocurrió un error al intentar conectarse con la API de descarga.*");
}
};

handler.help = ['spotify <nombre>'];
handler.tags = ['music'];
handler.command = /^spotify$/i;

export default handler;
