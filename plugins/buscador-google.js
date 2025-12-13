
import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) {
    return m.reply(`📌 *Uso correcto:*\n${usedPrefix + command} <término de búsqueda>\n📍 *Ejemplo:* ${usedPrefix + command} Vreden Bot`);
}

  await m.react("🔍");

  try {
    const query = encodeURIComponent(text.trim());
    const apiUrl = `https://api.vreden.my.id/api/v1/search/google?query=${query}&count=10`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
}

    const json = await res.json();
    const results = json?.result?.data;

    if (!Array.isArray(results) || results.length === 0) {
      return m.reply("❌ No se encontraron resultados para tu búsqueda.");
}

    let message = `🔎 *Resultados para:* "${text}"\n\n`;
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      message += `*${i + 1}. ${item.title || "Sin título"}*\n${item.link || "Sin enlace"}\n\n`;
}

    await conn.reply(m.chat, message.trim(), m);
    await m.react("✅");
} catch (error) {
    console.error("❌ Error:", error);
    await conn.reply(m.chat, `🚨 *Error:* ${error.message || "No se pudo realizar la búsqueda."}`, m);
}
};

handler.help = ["buscar <término>"];
handler.tags = ["internet"];
handler.command = ["buscar", "google", "search"];

export default handler;