Aquí tienes un comando `.spotify` funcional para tu bot. Este código permite:

- Buscar canciones por texto (como “Rojo 27”)
- Descargar una canción desde una URL de Spotify

---

*✅ Código `.spotify` para búsqueda y descarga*

```js
import fetch from 'node-fetch'

let handler = async (m, { conn, args, command, text}) => {
  const apikey = 'sylphy-8238wss'

  if (!text) return m.reply(`📌 Usa:\n.spotifys <texto>\n.spotifyd <url>`)

  if (command === 'spotifys') {
    const res = await fetch(`https://api.sylphy.xyz/search/spotify?q=${encodeURIComponent(text)}&apikey=${apikey}`)
    const json = await res.json()

    if (!json ||!json.status ||!json.data || json.data.length === 0) {
      return m.reply('❌ No se encontraron resultados.')
}

    let msg = `🎧 *Resultados de búsqueda para:* "${text}"\n\n`
    for (let track of json.data.slice(0, 5)) {
      msg += `🎵 *${track.title}*\n👤 ${track.artist}\n⏱ ${track.duration}\n🔗 ${track.url}\n\n`
}

    return m.reply(msg.trim())
}

  if (command === 'spotifyd') {
    if (!text.includes('spotify.com/track')) return m.reply('❌ URL inválida. Debe ser un enlace de canción de Spotify.')

    const res = await fetch(`https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(text)}&apikey=${apikey}`)
    const json = await res.json()

    if (!json ||!json.status ||!json.data ||!json.data.dl_url) {
      return m.reply('❌ No se pudo descargar la canción.')
}

    const { title, image, dl_url} = json.data

    await conn.sendMessage(m.chat, {
      audio: { url: dl_url},
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
}, { quoted: m})
}
}

handler.help = ['spotify]
handler.tags = ['music']
handler.command = /^spotify$/i

export default handler