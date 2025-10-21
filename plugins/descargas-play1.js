
import yts from "yt-search"
import fetch from "node-fetch"

const limit = 100 // MB

const handler = async (m, { conn, text, command}) => {
  if (!text ||!text.trim()) {
    return m.reply(`🔎 *Uso correcto:*\n.play <nombre o URL de YouTube>\n📍 Ejemplo:.play Rojo 27\n📍 Ejemplo:.play https://youtu.be/yQC7Jfxz9cY`)
}

  await m.react("🎶")

  try {
    const isUrl = text.includes("youtube.com") || text.includes("youtu.be")
    const videoUrl = isUrl? text.trim(): null

    let video
    if (!videoUrl) {
      const res = await yts(text.trim())
      if (!res ||!res.all || res.all.length === 0) {
        return m.reply("❌ *No se encontraron resultados para tu búsqueda.*")
}
      video = res.all[0]
}

    const urlToUse = videoUrl || video.url
    const title = video?.title || "Descarga de YouTube"
    const author = video?.author?.name || "Desconocido"
    const duration = video?.duration?.timestamp || "No disponible"
    const views = video?.views? video.views.toLocaleString(): "N/A"
    const thumbnail = video?.thumbnail || "https://i.imgur.com/JP52fdP.jpg"

    const caption = `
╭─[ *Sasuke YouTube* ]─╮
│ 📌 *Título:* ${title}
│ 👤 *Autor:* ${author}
│ ⏱️ *Duración:* ${duration}
│ 👁️ *Vistas:* ${views}
│ 🔗 *Enlace:* ${urlToUse}
╰──────────────────╯

📥 *Procesando tu descarga...*
`

    const thumbRes = await fetch(thumbnail)
    const thumbBuffer = await thumbRes.buffer()
    await conn.sendFile(m.chat, thumbBuffer, "thumb.jpg", caption, m)

    if (command === "play") {
      const apiRes = await fetch(`https://api.sylphy.xyz/download/ytmp3v2?url=${encodeURIComponent(urlToUse)}&apikey=sylphy-8238wss`)
      const json = await apiRes.json()
      const dl = json?.data?.dl_url

      if (!dl) return m.reply("❌ *No se pudo obtener el audio.*")

      await conn.sendFile(m.chat, dl, `${title}.mp3`, "", m, null, {
        mimetype: "audio/mpeg",
        ptt: false
})
      await m.react("✅")
}

    if (command === "play2" || command === "playvid") {
      const apiRes = await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(urlToUse)}&apikey=sylphy-8238wss`)
      const json = await apiRes.json()
      const dl = json?.res?.url || json?.dl_url

      if (!dl) return m.reply("❌ *No se pudo obtener el video.*")

      const fileRes = await fetch(dl)
      const sizeMB = parseInt(fileRes.headers.get("Content-Length") || 0) / (1024 * 1024)
      const sendAsDoc = sizeMB>= limit

      await conn.sendFile(m.chat, dl, `${title}.mp4`, "", m, null, {
        asDocument: sendAsDoc,
        mimetype: "video/mp4"
})

      await m.react("📽️")
}

} catch (error) {
    console.error("❌ Error:", error)
    m.reply("⚠️ *Ocurrió un error al procesar tu solicitud.*")
}
}

handler.help = ["play <texto o URL>", "play2", "playvid"]
handler.tags = ["descargas", "youtube"]
handler.command = ["play", "play2", "playvid"]

export default handler