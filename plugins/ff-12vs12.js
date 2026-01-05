import fs from 'fs'
import path from 'path'

let handlerLista = async (m, { conn }) => {
  const listaPath = path.join('./database/lista12vs12.json')
  if (!fs.existsSync(listaPath)) throw '⚠️ No hay lista creada aún'

  const lista = JSON.parse(fs.readFileSync(listaPath, 'utf-8'))

  let texto = `╭─❍ *📋 LISTA 12 VS 12*\n│\n│❤️ *Titulares:*\n`
  lista.titulares.forEach((j, i) => {
    texto += `│ ${i+1}. ${j}\n`
  })
  texto += `│\n│👍 *Suplentes:*\n`
  lista.suplentes.forEach((j, i) => {
    texto += `│ ${i+1}. ${j}\n`
  })
  texto += `╰────────────────────❍`

  await conn.sendMessage(m.chat, { text: texto })
}

handlerLista.help = ['lista12vs12']
handlerLista.tags = ['freefire']
handlerLista.command = /^(lista12vs12)$/i
handlerLista.group = true

export default handlerLista