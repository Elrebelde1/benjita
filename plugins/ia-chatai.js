
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <tema o personaje>\n📍 *Ejemplo:* ${usedPrefix + command} Messi`);
}

  try {
    const res = await fetch(`https://api.starlights.uk/api/ai/venice?text=${encodeURIComponent(text)}`);
    const json = await res.json();
    const raw = json?.objects?.[0]?.content;

    if (!raw) {
      return m.reply("❌ No se pudo obtener información.");
}

    const parsed = JSON.parse(raw);
    const info = parsed.result;

    const mensaje = `
📚 *Información sobre ${text}:*

${info.replace(/\\n/g, '\n')}

🧠 *Fuente:* Generado por IA - Starlights.uk
`;

    await conn.sendMessage(m.chat, { text: mensaje.trim()}, { quoted: m});

} catch (error) {
    console.error(error);
    m.reply("⚠️ Ocurrió un error al obtener la información.");
}
};

handler.help = ['ia2 <tema>'];
handler.tags = ['herramientas', 'información'];
handler.command = ['ia2', 'chatgpt2'];

export default handler;