
import fetch from 'node-fetch'

const handler = async (m, { conn, text, command, usedPrefix}) => {
  const apikey = "sylphy-8238wss"

  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <nombre de canción o URL de Spotify>\n📍 *Ejemplo:* ${usedPrefix + command} lupita\n📍 *Ejemplo:* ${usedPrefix + command} https://open.spotify.com/track/...`)
}

  // Si es una URL directa de Spotify
  if (text.includes("open.spotify.com/track")) {
    try {
      const res = await fetch(`https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(text)}&apikey=${apikey}`)
      const json = await res.json()

      if (!json.status ||!json.data ||!json.data.dl_url) {
        return m.reply("❌ No se pudo descargar la canción.")
}

      const { title, author, duration, image, dl_url} = json.data

      const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│
│ 🎵 *Título:* ${title}
│ 👤 *Autor:* ${author || 'Desconocido'}
│ ⏱️ *Duración:* ${duration || 'No disponible'}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`

      await conn.sendMessage(m.chat, { image: { url: image}, caption}, { quoted: m})
      await conn.sendMessage(m.chat, {
        audio: { url: dl_url},
        mimetype: 'audio/mpeg', // Compatible con iPhone y Android
        fileName: `${title}.mp3`
}, { quoted: m})

} catch (e) {
      console.error(e)
      m.reply("⚠️ Error al descargar la canción.")
}
    return
}

  // Si es texto, buscar y descargar automáticamente el primer resultado
  try {
    const res = await fetch(`https://api.sylphy.xyz/search/spotify?q=${encodeURIComponent(text)}&apikey=${apikey}`)
    const json = await res.json()

    if (!json.status ||!Array.isArray(json.data) || json.data.length === 0) {
      return m.reply("❌ No se encontraron canciones.")
}

    const track = json.data[0] // Primer resultado
    const downloadRes = await fetch(`https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(track.url)}&apikey=${apikey}`)
    const downloadJson = await downloadRes.json()

    if (!downloadJson.status ||!downloadJson.data ||!downloadJson.data.dl_url) {
      return m.reply("❌ No se pudo descargar el audio.")
}

    const { title, author, duration, image, dl_url} = downloadJson.data

    const caption = `
╭─🎶 *Spotify Downloader* 🎶─╮
│
│ 🎵 *Título:* ${title}
│ 👤 *Autor:* ${author || 'Desconocido'}
│ ⏱️ *Duración:* ${duration || 'No disponible'}
│ 🔗 *Enlace:* ${track.url}
│ 📥 *Descargando audio...*
╰────────────────────────────╯
`

    await conn.sendMessage(m.chat, { image: { url: image}, caption}, { quoted: m})
    await conn.sendMessage(m.chat, {
      audio: { url: dl_url},
      mimetype: 'audio/mpeg', // Compatible con iPhone y Android
      fileName: `${title}.mp3`
}, { quoted: m})

} catch (e) {
    console.error(e)
    m.reply("⚠️ Error al buscar o descargar la canción.")
}
}

handler.help = ['spotify <texto o URL>']
handler.tags = ['music']
handler.command = /^spotify$/i

export default handler