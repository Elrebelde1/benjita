import yts from "yt-search";
import fetch from "node-fetch";

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text || !text.trim()) {
    return m.reply(`🦅 *¿Qᴜᴇ ʙᴜsᴄᴀs ᴇɴ ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ?*\n\nUsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:\n${usedPrefix + command} <ɴᴏᴍʙʀᴇ ᴏ URL>\n\nEx: ${usedPrefix + command} Ace of Base Happy Nation`);
  }

  await m.react("👁️");

  try {
    const search = await yts(text);
    const video = search.videos[0];

    if (!video) {
      await m.react("❌");
      return m.reply("🌑 *Mis ojos no ven nada con ese nombre. Intenta de nuevo.*");
    }

    const urlToUse = video.url;
    const { title, author, timestamp, views, thumbnail } = video;

    const caption = `
╭─〔 ♆ *Uᴄʜɪʜᴀ Pʟᴀʏᴇʀ* ♆ 〕─╮
│
│ 🗡️ *Tɪᴛᴜʟᴏ:* ${title}
│ 👤 *Aᴜᴛᴏʀ:* ${author.name}
│ ⏳ *Dᴜʀᴀᴄɪᴏɴ:* ${timestamp}
│ 👁️ *Vɪsᴛᴀs:* ${views.toLocaleString()}
│ 🔗 *Lɪɴᴋ:* ${urlToUse}
│
╰─────────────────────╯

🌑 *Eʟ ᴘᴏᴅᴇʀ sᴇ ᴇsᴛᴀ ᴄᴀɴᴀʟɪᴢᴀɴᴅᴏ...*`.trim();

    await conn.sendFile(m.chat, thumbnail, "thumb.jpg", caption, m);

    const isVideo = /play2|playvid/i.test(command);
    const type = isVideo ? "video" : "audio";
    const quality = isVideo ? "360" : "128";
    const apiUrl = `https://api.vreden.my.id/api/v1/download/youtube/${type}?url=${encodeURIComponent(urlToUse)}&quality=${quality}`;
    
    const apiRes = await fetch(apiUrl);
    const json = await apiRes.json();

    if (!json.status || !json.result?.download?.status) {
      const errorMsg = json.result?.download?.message || json.message || "Error de conversión";
      throw new Error(errorMsg);
    }

    const dlUrl = json.result.download.url;

    if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: { url: dlUrl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `⚡ *Aquí tienes tu destino.*`
      }, { quoted: m });
      await m.react("🦅");
    } else {
      await conn.sendMessage(m.chat, {
        audio: { url: dlUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });
      await m.react("🎧");
    }

  } catch (error) {
    console.error(error);
    await m.react("❌");
    m.reply(`⚠️ *💢 Mɪs ᴏᴊᴏs ʜᴀɴ sɪᴅᴏ ʙʟᴏϙᴜᴇᴀᴅᴏs.*\n\n*Detalle:* ${error.message}`);
  }
};

handler.help = ["play", "play2", "playvid"];
handler.tags = ["descargas"];
handler.command = /^(play|play2|playvid)$/i;

export default handler;
