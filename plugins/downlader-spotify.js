
import fetch from 'node-fetch';
import axios from 'axios';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import yts from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTADOR_PATH = join(__dirname, '.contador_spotify.txt');

class Youtubers {
  constructor() {
    this.hex = "C5D58EF67A7584E4A29F6C35BBC4EB12";
  }

  async uint8(hex) {
    const pecahan = hex.match(/[\dA-F]{2}/gi);
    if (!pecahan) throw new Error("Formato no válido");
    return new Uint8Array(pecahan.map(h => parseInt(h, 16)));
  }

  b64Byte(b64) {
    const limpio = b64.replace(/\s/g, "");
    const binario = Buffer.from(limpio, 'base64');
    return new Uint8Array(binario);
  }

  async key() {
    const raw = await this.uint8(this.hex);
    return await crypto.webcrypto.subtle.importKey("raw", raw, { name: "AES-CBC" }, false, ["decrypt"]);
  }

  async Data(base64Encrypted) {
    const byteData = this.b64Byte(base64Encrypted);
    if (byteData.length < 16) throw new Error("Datos muy cortos");

    const iv = byteData.slice(0, 16);
    const data = byteData.slice(16);

    const kunci = await this.key();
    const resultado = await crypto.webcrypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      kunci,
      data
    );

    const texto = new TextDecoder().decode(new Uint8Array(resultado));
    return JSON.parse(texto);
  }

  async getCDN() {
    const res = await fetch("https://media.savetube.me/api/random-cdn");
    const data = await res.json();
    return data.cdn;
  }

  async infoVideo(linkYoutube) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/v2/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: linkYoutube }),
    });

    const resultado = await res.json();
    if (!resultado.status) throw new Error(resultado.message || "No se pudo obtener la información");

    const descifrado = await this.Data(resultado.data);
    return {
      judul: descifrado.title,
      durasi: descifrado.durationLabel,
      thumbnail: descifrado.thumbnail,
      key: descifrado.key
    };
  }

  async getDownloadLink(key) {
    const cdn = await this.getCDN();
    const res = await fetch(`https://${cdn}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        downloadType: "audio",
        quality: "128",
        key
      }),
    });

    const json = await res.json();
    if (!json.status) throw new Error(json.message);
    return json.data.downloadUrl;
  }
}

function contarDescarga() {
  let contador = 0;
  if (existsSync(CONTADOR_PATH)) {
    try {
      contador = parseInt(readFileSync(CONTADOR_PATH, 'utf8')) || 0;
    } catch (error) {
      console.error('Error leyendo contador:', error);
    }
  }
  contador += 1;
  try {
    writeFileSync(CONTADOR_PATH, String(contador));
  } catch (error) {
    console.error('Error escribiendo contador:', error);
  }
  return contador;
}

function isSpotifyURL(text) {
  const spotifyRegex = /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist)\/.+/i;
  return spotifyRegex.test(text);
}

async function getSpotifyTrackInfo(url) {
  try {
    const apiUrl = `https://api.delirius.store/download/spotifydl?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.status || !data.data) {
      throw new Error("No se pudo obtener información de Spotify");
    }

    return {
      title: data.data.title,
      artist: data.data.author,
      thumbnail: data.data.image,
      duration: data.data.duration
    };
  } catch (error) {
    throw new Error(`Error al obtener datos de Spotify: ${error.message}`);
  }
}

const getFileSize = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength) : 0;
  } catch (error) {
    console.error('Error obteniendo tamaño:', error);
    return 0;
  }
};

const sendAudioWithRetry = async (conn, chat, audioUrl, trackTitle, artistName, thumbnailUrl, maxRetries = 2) => {
  let attempt = 0;
  let thumbnailBuffer;

  try {
    const response = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
    thumbnailBuffer = Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('⚠️ ɴᴏ ꜱᴇ ᴘᴜᴅᴏ ᴏʙᴛᴇɴᴇʀ ᴇʟ ᴛʜᴜᴍʙɴᴀɪʟ:', error.message);
    try {
      const fallback = await axios.get('https://files.catbox.moe/bex83k.jpg', { responseType: 'arraybuffer' });
      thumbnailBuffer = Buffer.from(fallback.data, 'binary');
    } catch (e) {
      console.error('Error con thumbnail fallback:', e);
    }
  }

  const fileSize = await getFileSize(audioUrl);
  const maxSizeInBytes = 30 * 1024 * 1024;
  const sendAsDocument = fileSize > maxSizeInBytes;

  const messageOptions = {
    mimetype: 'audio/mpeg',
    contextInfo: {
      externalAdReply: {
        title: trackTitle,
        body: `${artistName} • ${sendAsDocument ? "📁 𝙏𝙝𝙚 𝙆𝙞𝙣𝙜'𝙨 𝘽𝙤𝙩 👾 - ᴅᴏᴄᴜᴍᴇɴᴛᴏ" : "🎵 Spotify"}`,
        previewType: 'PHOTO',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        sourceUrl: 'https://Sasuke.Bot.Com'
      }
    }
  };

  if (sendAsDocument) {
    messageOptions.document = { url: audioUrl };
    messageOptions.fileName = `${trackTitle} - ${artistName}.mp3`;
  } else {
    messageOptions.audio = { url: audioUrl };
    messageOptions.ptt = false;
  }

  while (attempt < maxRetries) {
    try {
      await conn.sendMessage(chat, messageOptions);
      break;
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido:`, error.message);
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error('No se pudo enviar el audio después de múltiples intentos');
      }
    }
  }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat,
      `[❗️] ᴜsᴏ: ${usedPrefix}spotify <ɴᴏᴍʙʀᴇ ᴅᴇ ʟᴀ ᴄᴀɴᴄɪóɴ ᴏ ᴜʀʟ>\n> ᴇᴊᴇᴍᴘʟᴏ: ${usedPrefix}spotify blinding lights`,
      m);
  }

  try {
    await m.react('🎵');

    const query = args.join(" ");
    let trackInfo = null;
    let searchQuery = '';

    await conn.reply(m.chat, `ʙᴜsᴄᴀɴᴅᴏ ᴇɴ sᴘᴏᴛɪғʏ...🔍`, m, {
      mentions: [m.sender]
    });

    if (isSpotifyURL(query)) {
      trackInfo = await getSpotifyTrackInfo(query);
      searchQuery = `${trackInfo.title} ${trackInfo.artist}`;
    } else {
      searchQuery = query;
      trackInfo = {
        title: query,
        artist: "Artista Desconocido",
        thumbnail: "https://files.catbox.moe/bex83k.jpg"
      };
    }

    await m.react('📥');

    const search = await yts(searchQuery);
    if (!search.videos || !search.videos.length) {
      throw new Error("ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀó ʟᴀ ᴄᴀɴᴄɪóɴ");
    }

    const videoData = search.videos[0];
    const videoUrl = videoData.url;

    await m.react('📤');

    const yt = new Youtubers();
    const info = await yt.infoVideo(videoUrl);
    const audioUrl = await yt.getDownloadLink(info.key);

    await sendAudioWithRetry(
      conn, 
      m.chat, 
      audioUrl, 
      trackInfo.title, 
      trackInfo.artist,
      trackInfo.thumbnail
    );

    const total = contarDescarga();
    await m.react('🟢');

  } catch (e) {
    console.error(e);
    await m.react('🔴');
    return m.reply(`❌ ᴇʀʀᴏʀ: ${e.message}`);
  }
};

handler.command = /^spotify$/i;
handler.help = ['spotify <query/url>'];
handler.tags = ['descargas'];
export default handler;
