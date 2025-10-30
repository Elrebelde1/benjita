
import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix}) => {
  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de canción o URL de Spotify>\n📍 *Ejemplo:* ${usedPrefix + command} phonk\n📍 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/6UR5tB1wVm7qvH4xfsHr8m`);
}

  try {
    let url = text.trim();

    // Si es texto, buscar primero
    if (!url.includes("open.spotify.com/track")) {
      const searchRes = await fetch(`https://api.dorratz.com/spotifysearch?query=${encodeURIComponent(url)}`);
      const searchJson = await searchRes.json();
      const track = searchJson?.data?.[0];

      if (!track ||!track.url) {
        return m.reply("❌ No se encontraron canciones.");
}

      url = track.url;
}

    // Descargar desde la URL obtenida o proporcionada
    const downloadRes = await fetch(`https://api.dorratz.com/spotifydl?url=${encodeURIComponent(url)}`);
    const downloadJson = await downloadRes.json();
    const song = JSON.parse(downloadJson.objects?.[0]?.content || "{}");

    if (!song.download_url) {
      return m.reply("❌ No se pudo descargar el audio.");
}

    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│ 🎵 *Título:* ${song.name}
│ 👤 *Autor:* ${song.artists}
│ 🕒 *Duración:* ${(song.duration_ms / 60000).toFixed(2)} min
│ 🔗 *Enlace:* ${url}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`;

    await conn.sendMessage(m.chat, { image: { url: song.image}, caption}, { quoted: m});
    await conn.sendMessage(m.chat, {
      audio: { url: song.download_url},
      mimetype: 'audio/mpeg',
      fileName: `${song.name}.mp3`
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