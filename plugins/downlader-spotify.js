
import fetch from 'node-fetch';
import axios from 'axios';

const handler = async (m, { conn, command, args, text, usedPrefix}) => {
    if (!text) throw `_*[ ⚠️ ] Agrega lo que quieres buscar*_\n\n_Ejemplo:_\n${usedPrefix}${command} Jomblo Happy`;

    try {
        const searchUrl = `https://api.vreden.my.id/api/v1/search/spotify?query=${encodeURIComponent(text)}&limit=1`;
        const { data} = await axios.get(searchUrl);

        if (!data ||!data.data || data.data.length === 0) {
            throw `_*[ ⚠️ ] No se encontraron resultados para "${text}" en Spotify.*_`;
}

        const track = data.data[0];
        const { title, artist, duration, url, image} = track;

        const info = `⧁ 𝙏𝙄𝙏𝙐𝙇𝙊
» ${title}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝗗𝗨𝗥𝗔𝗖𝗜𝗢𝗡
» ${duration}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁  𝘼𝙍𝙏𝙄𝙎𝙏𝘼
» ${artist}
﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘﹘
⧁ 𝙐𝙍𝙇
» ${url}

_*🎶 Enviando música...*_`.trim();

        await conn.sendFile(m.chat, image, 'spotify.jpg', info, m);

        const downloadUrl = `https://api.vreden.my.id/api/v1/download/spotify?url=${encodeURIComponent(url)}`;
        const response = await fetch(downloadUrl);
        const result = await response.json();

        if (result && result.data && result.data.url) {
            const audioUrl = result.data.url;
            const filename = `${title || 'audio'}.mp3`;

            await conn.sendMessage(m.chat, {
                audio: { url: audioUrl},
                fileName: filename,
                mimetype: 'audio/mpeg',
                caption: `╭━❰  *Spotify*  ❱━⬣\n${filename}\n╰━❰ *${botname}* ❱━⬣`,
                quoted: m
});
} else {
            throw new Error('_*[ ❌ ] Ocurrió un error al descargar el archivo mp3*_');
}

} catch (e) {
        await conn.reply(m.chat, `❌ _*Comando Spotify Falló. Intenta nuevamente.*_`, m);
        console.error('❌ Spotify Error:', e);
}
};

handler.tags = ['downloader'];
handler.command = ['spotify'];
export default handler;