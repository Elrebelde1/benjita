
import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix}) => {
  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de canción o URL de Spotify>\n📍 *Ejemplo:* ${usedPrefix + command} lupita\n📍 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/...`);
}

  try {
    let trackUrl = text.trim();

    // Si es texto, buscar primero
    if (!trackUrl.includes("open.spotify.com/track")) {
      const searchRes = await fetch(`https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(trackUrl)}&limit=1`);
      const searchJson = await searchRes.json();

      const track = searchJson.result?.search_data?.[0];
      if (!track ||!track.song_link) {
        return m.reply("❌ No se encontraron canciones.");
}

      trackUrl = track.song_link;
}

    // Descargar desde la URL obtenida
    const downloadRes = await fetch(`https://api.vreden.my.id/api/v1/download/spotify?url=${encodeURIComponent(trackUrl)}`);
    const downloadJson = await downloadRes.json();
    const song = downloadJson.result;

    if (!song ||!song.download) {
      return m.reply("❌ No se pudo descargar el audio.");
}

    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│ 🎵 *Título:* ${song.title}
│ 👤 *Autor:* ${song.artists}
│ 💽 *Álbum:* ${song.album}
│ 📅 *Lanzamiento:* ${song.release_date}
│ ⏱️ *Duración:* ${(song.duration_ms / 60000).toFixed(2)} min
│ 🔗 *Enlace:* ${trackUrl}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`;

    await conn.sendMessage(m.chat, { image: { url: song.cover_url}, caption}, { quoted: m});
    await conn.sendMessage(m.chat, {
      audio: { url: song.download},
      mimetype: 'audio/mpeg',
      fileName: `${song.title}.mp3`
}, { quoted: m});

} catch (e) {
    console.error(e);
    m.reply("⚠️ Error al buscar o descargar la canción.");
}
};

handler.help = ['spotify <texto o URL>'];
handler.tags = ['music'];
handler.command = /^spotify$/i;

export default handler;