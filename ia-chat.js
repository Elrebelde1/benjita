import fetch from "node-fetch"; // Import para hacer la petición HTTP

const timeout = 30000; // 30 segundos

const handler = async (m, { conn }) => {
    try {
        // Llamada a la API de Delirius IA
        const response = await fetch(`https://delirius-apiofc.vercel.app/ia/chatgpt?q=${encodeURIComponent(m.text)}`);
        const json = await response.json();

        if (json.status && json.data) {
            // Guardamos la respuesta en memoria con timeout
            conn.iaSession = conn.iaSession || {};
            conn.iaSession[m.chat] = {
                respuesta: json.data,
                timeout: setTimeout(() => {
                    if (conn.iaSession[m.chat]) {
                        conn.reply(m.chat, `⏳ *Tiempo agotado!*`, m);
                        delete conn.iaSession[m.chat];
                    }
                }, timeout),
            };

            // Enviamos la respuesta de la IA
            await conn.reply(m.chat, `🤖 *IA Delirius*\n\n${json.data}`, m);
        } else {
            await conn.reply(m.chat, `⚠️ No se pudo obtener respuesta de la IA.`, m);
        }
    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Error al conectar con la IA.`, m);
    }
};

// Antes de cada mensaje, verificamos si hay sesión activa
handler.before = async (m, { conn }) => {
    if (conn.iaSession && conn.iaSession[m.chat]) {
        const respuesta = conn.iaSession[m.chat].respuesta;
        clearTimeout(conn.iaSession[m.chat].timeout);
        delete conn.iaSession[m.chat];

        return conn.reply(m.chat, `✅ Respuesta recibida:\n\n${respuesta}`, m);
    }
};

// Comando para activar
handler.command = ["chatgpt"];
export default handler;