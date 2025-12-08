
import { sticker} from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png} from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command}) => {
  let stiker = false
  const emoji = '🔥'

  try {
    let q = m.quoted? m.quoted: m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds> 15) {
        return m.reply(`📽️ *Demasiado largo...*\nTu video excede los 15 segundos. Usa uno más corto para crear el sticker de Sasuke.`)
}

      let img = await q.download?.()
      if (!img) {
        return conn.reply(m.chat,
`╭─〔 🔥 *STICKER DE SASUKE* 🔥 〕─╮
│
│ 🖼️ *Envía una imagen o video corto*
│     para generar tu sticker de Sasuke.
│
│ ⏱️ *Máx. duración de video:* 15 segundos
│
│ 🌐 También puedes usar un enlace:
│     *.sasuke https://ejemplo.com
╰──────────────────────────────╯`)
}

      stiker = await sticker(img, false, emoji + ' Sasuke Style ✨', 'By Uchiha Dev')
}
} catch (e) {
    console.error(e)
}

  if (stiker) return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
}

 handler.command = ["s"];
export default handler