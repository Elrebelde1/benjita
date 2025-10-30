
import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text || (!text.includes("youtube.com") &&!text.includes("youtu.be"))) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <enlace de YouTube>\n📍 *Ejemplo:* ${usedPrefix + command} https://youtu.be/g5nG15iTPT8`);
}

  await m.react("⏳"); // Reacción inicial

  try {
    const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(text)}&quality=360`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const json = await res.json();
    const result = json?.result;

    if (!result?.status ||!result?.download?.url) {
      return m.reply("❌ No se pudo obtener el video. Verifica el enlace o intenta con otro.");
}

    const { title} = result.metadata;
    const videoUrl = result.download.url;
    const filename = result.download.filename || `${title}.mp4`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl},
        caption: `🎬 *${title}*\n\n✅ Video descargado con éxito.`,
        fileName: filename
},
      { quoted: m}
);

    await m.react("🟢"); // Reacción final al completar
} catch (error) {
    console.error("❌ Error:", error);
    await conn.reply(m.chat, `🚨 *Error:* ${error.message || "No se pudo procesar la solicitud."}`, m);
}
};

handler.help = ["ytmp4 <enlace>"];
handler.tags = ["descargas"];
handler.command = ["ytmp4"];

export default handler;