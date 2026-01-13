import yts from "yt-search";
import fetch from "node-fetch";

const limit = 100; // MB

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text || !text.trim()) {
    return m.reply(`🦅 *¿Qᴜᴇ ʙᴜsᴄᴀs ᴇɴ ʟᴀ ᴏsᴄᴜʀɪᴅᴀᴅ?*\n\nUsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:\n${usedPrefix + command} <ɴᴏᴍʙʀᴇ ᴏ URL>\n\nEx: ${usedPrefix + command} Sᴀsᴜᴋᴇ vs Iᴛᴀᴄʜɪ`);
  }

  await m.react("👁️"); // Sharingan inicial

  try {
    const isUrl = text.includes("youtube.com") || text.includes("youtu.be");
    let video;
    
    if (isUrl) {
      const res = await yts(text.trim());
      video = res.videos[0];
    } else {
      const res = await yts(text.trim());
      if (!res || !res.all || res.all.length === 0) {
        return m.reply("🌑 *Mis ojos no ven nada con ese nombre. Intenta de nuevo.*");
      }
      video = res.all[0];
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

🌑 *Eʟ ᴘᴏᴅᴇʀ sᴇ ᴇsᴛᴀ ᴄᴀɴᴀʟɪᴢᴀɴᴅᴏ...*
`.trim();

    await conn.sendFile(m.chat, thumbnail, "thumb.jpg", caption, m);

    // LÓGICA PARA AUDIO (PLAY)
    if (command === "play") {
      const apiRes = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(urlToUse)}&quality=128`);
      const json = await apiRes.json();
      
      // Verificamos el estado según la estructura de tu API
      if (!json.status || !json.result.download.url) {
        return m.reply("💢 *Fᴀʟʟᴏ ᴇʟ Jᴜᴛsᴜ ᴅᴇ Aᴜᴅɪᴏ. Lᴀ API ɴᴏ ʀᴇsᴘᴏɴᴅɪᴏ.*");
      }

      const dl = json.result.download.url;

      await conn.sendMessage(m.chat, {
        audio: { url: dl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: m });

      await m.react("🎧");
    }

    // LÓGICA PARA VIDEO (PLAY2 / PLAYVID)
    if (command === "play2" || command === "playvid") {
      // Usando la misma lógica de API para video
      const apiRes = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(urlToUse)}&quality=720`);
      const json = await apiRes.json();

      if (!json.status || !json.result.download.url) {
        return m.reply("💢 *Lᴀ ᴏsᴄᴜʀɪᴅᴀᴅ ɴᴏ ᴘᴜᴅᴏ ᴍᴏsᴛʀᴀʀ ᴇʟ ᴠɪᴅᴇᴏ.*");
      }

      const dl = json.result.download.url;

      await conn.sendMessage(m.chat, {
        video: { url: dl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `⚡ *Aϙᴜɪ ᴛɪᴇɴᴇs ᴛᴜ ᴅᴇsᴛɪɴᴏ.*`
      }, { quoted: m });

      await m.react("🦅");
    }

  } catch (error) {
    console.error("❌ Error:", error);
    m.reply("⚠️ *💢 Mɪs ᴏᴊᴏs ʜᴀɴ sɪᴅᴏ ʙʟᴏϙᴜᴇᴀᴅᴏs. Oᴄᴜʀʀɪᴏ ᴜɴ ᴇʀʀᴏʀ ᴇɴ ᴇʟ Jᴜᴛsᴜ.*");
  }
};

handler.help = ["play", "play2", "playvid"];
handler.tags = ["descargas", "youtube"];
handler.command = ["play", "play2", "playvid"];

export default handler;
