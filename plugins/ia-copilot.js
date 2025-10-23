
import fetch from 'node-fetch'

let handler = async (m, { text, command}) => {
  const apikey = "sylphy-8238wss";

  if (!text ||!text.trim()) {
    return m.reply(`📌 Ejemplo:.${command} ¿Qué opinas de Messi?`);
}

  try {
    const url = `https://api.sylphy.xyz/ai/copilot?text=${encodeURIComponent(text.trim())}&apikey=sylphy-8238wss`;
    const res = await fetch(url);
    const json = await res.json();

    if (!json.result) {
      return m.reply("❌ No se pudo obtener respuesta de la IA.");
}

    await m.reply(`🤖 *Respuesta IA:*\n\n${json.result}`);
} catch (e) {
    console.error("Error en.copilot:", e);
    m.reply("⚠️ Error al procesar la solicitud de IA.");
}
};

handler.help = ['copilot <pregunta o mensaje>'];
handler.tags = ['ai'];
handler.command = ['copilot', 'ia3'];

export default handler;