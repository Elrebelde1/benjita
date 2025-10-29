
import fetch from 'node-fetch';

const tiktokSessions = {}; // Almacena sesiones por usuario

const handler = async (m, { conn, text, command}) => {
  if (!text) {
    return conn.reply(m.chat, '❌ ¡Necesito un enlace de TikTok! Por favor, proporciona uno después del comando.', m);
}

  if (!text.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) {
    return conn.reply(m.chat, '🤔 Parece que el enlace no es de TikTok. Por favor, asegúrate de enviar un enlace válido.', m);
}

  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result || result.code!== 0 ||!result.data ||!result.data.play) {
      let errorMessage = '❌ No pude descargar el video. Asegúrate de que el enlace sea correcto, público y esté disponible.';
      if (result && result.msg) errorMessage += `\nDetalles: ${result.msg}`;
      return conn.reply(m.chat, errorMessage, m);
}

    const author = result.data.author?.nickname || 'Desconocido';
    const description = result.data.title || 'Sin descripción';
    const duration = result.data.duration? formatDuration(result.data.duration): 'N/A';
    const sizeNormal = result.data.size? `${(result.data.size / (1024 * 1024)).toFixed(2)} MB`: 'N/A';
    const sizeHD = result.data.size_hd? `${(result.data.size_hd / (1024 * 1024)).toFixed(2)} MB`: 'N/A';

    const caption = `
🎬 *Vista previa del TikTok:*

👤 *Autor:* ${author}
📝 *Descripción:* ${description}
⏳ *Duración:* ${duration}

📥 ¿Cómo deseas descargarlo?
1️⃣ Video Normal (${sizeNormal})
2️⃣ Video HD (${sizeHD})

*Responde con:* 1 o 2
`;

    await conn.sendMessage(m.chat, {
      video: { url: result.data.play},
      caption
}, { quoted: m});

    // Guardar sesión
    tiktokSessions[m.sender] = {
      normal: result.data.play,
      hd: result.data.play_hd,
      title: description
};

} catch (error) {
    console.error('Error al descargar TikTok:', error);
    conn.reply(m.chat, '❌ ¡Oops! Algo salió mal al intentar descargar el video. Intenta de nuevo más tarde.', m);
}
};

handler.command = /^(tiktok|tt)$/i;

// Manejador global para respuestas del usuario
const messageHandler = async (m, { conn}) => {
  const session = tiktokSessions[m.sender];
  if (!session) return;

  const choice = m.text.trim();
  let videoUrl;

  if (choice === '1') {
    videoUrl = session.normal;
} else if (choice === '2') {
    videoUrl = session.hd;
} else {
    return m.reply('❌ Opción inválida. Responde con 1 para video normal o 2 para video HD.');
}

  await conn.sendMessage(m.chat, {
    video: { url: videoUrl},
    caption: `✅ *Aquí tienes tu video ${choice === '1'? 'normal': 'HD'}:* ${session.title}`
}, { quoted: m});

  delete tiktokSessions[m.sender]; // Limpiar sesión
};

export default handler;
export { messageHandler};

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10? '0': ''}${remainingSeconds}`;
}