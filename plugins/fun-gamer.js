
const handler = async (m, { conn, args}) => {
    if (!args[0]) {
        return await conn.sendMessage(m.chat, {
            text: '👿 *Debes proporcionar un número de teléfono.*\n\nEjemplo:\n`.soporte 5212345678901`'
});
}

    let number = args[0].replace(/\D/g, '') + '@s.whatsapp.net';

    try {
        const [result] = await conn.onWhatsApp(number);
        const estado = result?.exists? '🛑 *En soporte*': '🟢 *Sin soporte*';

        await conn.sendMessage(m.chat, {
            text: `📱 Estado del número *${args[0]}*:\n${estado}`
});
} catch (error) {
        await conn.sendMessage(m.chat, {
            text: `⚠️ No se pudo verificar el número.`
});
        console.error('Error al verificar número:', error);
}
};

handler.command = ['wa'];
export default handler