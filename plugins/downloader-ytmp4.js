import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command}) => {
  try {
    if (!text.trim()) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre del video a descargar.`, m)
    await m.react('🕒')
    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
    const query = videoMatch? 'https://youtu.be/' + videoMatch[1]: text
    const search = await yts(query)
    const result = videoMatch? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0]: search.all[0]
    if (!result) throw 'ꕥ No se encontraron resultados.'
    const { title, thumbnail, timestamp, views, ago, url, author, seconds} = result
    if (seconds> 1800) throw '⚠ El contenido supera el límite de duración (10 minutos).'
    const vistas = formatViews(views)
    const info = `「✦」Descargando *<${title}>*\n\n> ❑ Canal » *${author.name}*\n> ♡ Vistas » *${vistas}*\n> ✧︎ Duración » *${timestamp}*\n> ☁︎ Publicado » *${ago}*\n> ➪ Link » ${url}`
    const thumb = (await conn.getFile(thumbnail)).data
    await conn.sendMessage(m.chat, { image: thumb, caption: info}, { quoted: m})

    // Solo permite ytmp4
    if (command === 'ytmp4') {
      const video = await getVid(url)
      if (!video?.url) throw '⚠ No se pudo obtener el video.'
      m.reply(`> ❀ *Vídeo procesado. Servidor:* \`${video.api}\``)
      await conn.sendFile(m.chat, video.url, `${title}.mp4`, `> ❀ ${title}`, m)
      await m.react('✔️')
} else {
      throw '⚠ Este comando solo permite descargar videos con *ytmp4*.'
}
} catch (e) {
    await m.react('✖️')
    return conn.reply(m.chat, typeof e === 'string'? e: '⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + e.message, m)
}
}

handler.command = handler.help = ['ytmp4']
handler.tags = ['descargas']

export default handler