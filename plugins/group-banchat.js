Let handler = async (m, { conn, isAdmin, isROwner }) => {
    // Solo un administrador o el dueño del bot pueden 'enviar a Santa de vacaciones'
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    
    // Prohíbe el chat: El bot se toma un descanso festivo.
    global.db.data.chats[m.chat].isBanned = true
    
    // Mensaje festivo de desactivación
    await conn.reply(m.chat, `✈️ ¡sᥲsᥙkᥱ ᑲ᥆𝗍 se fue de *Vacaciones Navideñas*! 🎁\n\nEl bot ha sido *DESACTIVADO* en este chat. ¡Volverá después de Reyes!`, m, rcanal)
    
    // Reacción que simboliza el descanso o un regalo
    await m.react('😴') // O '🎁' si prefieres un regalo.
}
handler.help = ['banearbot']
handler.tags = ['group']
handler.command = ['banearbot', 'banchat']
handler.group = true 
export default handler
