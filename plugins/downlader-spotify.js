
import fetch from "node-fetch";

const handler = async (m, { conn, text, command}) => {
  if (!text ||!text.trim()) {
    return m.reply(`🎄 *Uso correcto del comando navideño* 🎄\n\n.spotify <nombre de canción o URL de Spotify>\nEjemplo:.spotify Blinding Lights\nEjemplo:.spotify https://open.spotify.com/track/2uPMsTEKx79gJ8rB3AcT0v`);
}

  await m.react("🎁"); // Emoji inicial festivo

  try {
    const isUrl = text.includes("spotify.com");
    const query = encodeURIComponent(text.trim());

    const apiUrl = isUrl
? `https://api.nekolabs.web.id/downloader/spotify/v2?url=${query}`
: `https://api.nekolabs.web.id/downloader/spotify/play/v1?q=${query}`;

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status ||!json.result?.download?.url) {
      return m.reply("❌ *Santa no encontró tu villancico en Spotify.*");
}

    const { title, artist, thumbnail, download} = json.result;
    const audioUrl = download.url;
    const format = "mp3";

    const caption = `
╭─[ Trineo Musical de Spotify ]─╮
│ 🎶 Villancico: ${title || "Desconocido"}
│ 👤 Intérprete: ${artist || "Desconocido"}
│ 🔗 Enlace: ${text.trim()}
╰────────────────────────────╯

🎅 *Santa está preparando tu pista...*
`;

    const thumbRes = await fetch(thumbnail || "https://i.imgur.com/JP52fdP.jpg");
    const thumbBuffer = await thumbRes.buffer();
    await conn.sendFile(m.chat, thumbBuffer, "spotify.jpg", caption, m);

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl},
      mimetype: "audio/mpeg",
      fileName: `${title}.${format}`
}, { quoted: m});

    await m.react("🎧"); // Emoji de éxito festivo

} catch (error) {
    console.error("🎄 Error Spotify:", error);
    m.reply("⚠️ *El duende digital tuvo problemas con tu regalo musical. Intenta de nuevo.*");
}
};

handler.help = ["spotify <texto o URL>"];
handler.tags = ["descargas", "spotify"];
handler.command = ["spotify"];

export default handler;