
import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command}) => {
  if (!text) {
    return m.reply(`⚠️ *Uso incorrecto.*\n📌 Ejemplo: \`${usedPrefix + command} https://www.mediafire.com/file/ejemplo/file.zip\``);
}

  if (!/^https?:\/\/(www\.)?mediafire\.com/.test(text)) {
    return m.reply(`⚠️ *Enlace no válido.*\n📌 Asegúrate de ingresar una URL de MediaFire válida.\n\nEjemplo: \`${usedPrefix + command} https://www.mediafire.com/file/ejemplo/file.zip\``);
}

  await m.react("⏳");

  try {
    const apiUrl = `https://api.neoxr.eu/api/mediafire?url=${encodeURIComponent(text)}&apikey=russellxz`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Error de la API: ${response.status} ${response.statusText}`);
}

    const data = await response.json();

    if (!data.status ||!data.data ||!data.data.url) {
      throw new Error("No se pudo obtener el enlace de descarga.");
}

    const fileInfo = data.data;
    const fileResponse = await fetch(fileInfo.url);
    if (!fileResponse.ok) {
      throw new Error("No se pudo descargar el archivo.");
}

    const fileBuffer = await fileResponse.buffer();

    const caption = `
📂 *Nombre del archivo:* ${fileInfo.title}
📦 *Tamaño:* ${fileInfo.size}
📏 *Tipo:* ${fileInfo.mime}
🔗 *Extensión:* ${fileInfo.extension}
`;

    await conn.sendMessage(m.chat, { text: caption.trim()}, { quoted: m});

    await conn.sendMessage(m.chat, {
      document: fileBuffer,
      mimetype: fileInfo.mime,
      fileName: fileInfo.title
}, { quoted: m});

    await m.react("✅");

} catch (error) {
    console.error("❌ Error en el comando mediafire:", error);
    await conn.sendMessage(m.chat, {
      text: `❌ *Ocurrió un error al procesar la solicitud:*\n_${error.message}_\n\n🔹 Inténtalo de nuevo más tarde.`
}, { quoted: m});

    await m.react("❌");
}
};

handler.help = ['mediafire <url>'];
handler.tags = ['descargas'];
handler.command = ['mediafire'];

export default handler;