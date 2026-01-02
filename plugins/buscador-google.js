
import fetch from 'node-fetch'

let handler = async (m, { text, usedPrefix, args}) => {
  if (!text) {
    return m.reply(`🔍 Por favor, dime qué deseas buscar en *Google*.\n\n📌 Ejemplo: ${usedPrefix}google Messi Inter Miami`)
}

  const query = encodeURIComponent(text.trim())
  const maxResults = Math.min(Number(args[1]) || 7, 10)
  const apiUrl = `https://delirius-apiofc.vercel.app/search/googlesearch?query=${query}`

  try {
    await m.react('🕒')
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!Array.isArray(json.data) || json.data.length === 0) {
      await m.react('❌')
      return m.reply('😕 No se encontraron resultados para tu búsqueda.')
}

    let reply = `🔎 *Resultados de búsqueda para:* _${text}_\n\n`
    json.data.slice(0, maxResults).forEach((item, i) => {
      reply += `✨ *${i + 1}. ${item.title || 'Sin título'}*\n`
      reply += `📝 ${item.description || '_Sin descripción disponible_'}\n`
      reply += `🔗 ${item.url || '_Sin enlace disponible_'}\n\n`
})

    await m.reply(reply.trim())
    await m.react('✅')
} catch (err) {
    await m.react('⚠️')
    m.reply(`🚨 Ocurrió un error al realizar la búsqueda.\n> Usa *${usedPrefix}report* para informarlo.\n\n🧾 Detalle: ${err.message}`)
}
}

handler.help = ['google']
handler.command = ['google']
handler.tags = ['internet']
handler.group = false

export default handler