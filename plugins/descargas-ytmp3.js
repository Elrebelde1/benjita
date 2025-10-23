
var handler = async (m, { conn, args, usedPrefix, command}) => {
  const emoji = '🎧';
  const emoji2 = '⚠️';

  if (!args[0]) {
    return conn.reply(m.chat, `${emoji2} Debes proporcionar un enlace de YouTube.\n\nEjemplo:\n*${usedPrefix}${command} https://youtu.be/zYwGL6qOON4*`, m);
}

  const videoUrl = encodeURIComponent(args[0].trim());
  const apiKey = 'sylphy-8238wss';
  const apiUrl = `https://api.sylphy.xyz/download/ytmp3v2?url=${videoUrl}&apikey=${apiKey}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status ||!json.data ||!json.data.dl_url) {
      return conn.reply(m.chat, `${emoji2} No se pudo obtener el audio. Verifica que el enlace sea válido.`, m);
}

    const { title, dl_url, format} = json.data;

    let info = `${emoji} *Audio extraído de YouTube:*\n`;
    info += `🎵 *Título:* ${title}\n`;
    info += `📁 *Formato:* ${format.toUpperCase()}\n`;
    info += `📥 *Descargando...*`;

    await conn.sendFile(m.chat, dl_url, `${title}.${format}`, info, m);
} catch (e) {
    console.error(e);
    return conn.reply(m.chat, `${emoji2} Ocurrió un error al procesar el enlace. Intenta nuevamente más tarde.`, m);
}
};

handler.help = ['ytmp3 <enlace>'];
handler.tags = ['descargas'];
handler.command = ['ytmp3', 'mp3'];
handler.group = false;

export default handler;