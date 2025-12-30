import fetch from "node-fetch";

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args}) => {
  const chat = global.db.data.chats[m.chat] || {};
  // 🎄 Usamos emojis de campanas o estrellas para la mención
  const emoji = '🔔'; 

  // Solo Santa y sus Elfos principales (admin/owner) pueden tocar la campana
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw new Error('Solo los Elfos Jefes o Santa tienen permiso para usar este comando.');
}

  const customMessage = args.join(' ');
  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject;

  // Banderas de países (se mantienen para indicar ubicación, pero se añade un toque festivo)
  const countryFlags = {
    '1': '🇺🇸', '44': '🇬🇧', '33': '🇫🇷', '49': '🇩🇪', '39': '🇮🇹', '81': '🇯🇵',
    '82': '🇰🇷', '86': '🇨🇳', '7': '🇷🇺', '91': '🇮🇳', '61': '🇦🇺', '64': '🇳🇿',
    '34': '🇪🇸', '55': '🇧🇷', '52': '🇲🇽', '54': '🇦🇷', '57': '🇨🇴', '51': '🇵🇪',
    '56': '🇨🇱', '58': '🇻🇪', '502': '🇬🇹', '503': '🇸🇻', '504': '🇭🇳', '505': '🇳🇮',
    '506': '🇨🇷', '507': '🇵🇦', '591': '🇧🇴', '592': '🇬🇾', '593': '🇪🇨', '595': '🇵🇾',
    '596': '🇲🇶', '597': '🇸🇷', '598': '🇺🇾', '53': '🇨🇺', '20': '🇪🇬', '972': '🇮🇱',
    '90': '🇹🇷', '63': '🇵🇭', '62': '🇮🇩', '60': '🇲🇾', '65': '🇸🇬', '66': '🇹🇭',
    '31': '🇳🇱', '32': '🇧🇪', '30': '🇬🇷', '36': '🇭🇺', '46': '🇸🇪', '47': '🇳🇴',
    '48': '🇵🇱', '421': '🇸🇰', '420': '🇨🇿', '40': '🇷🇴', '43': '🇦🇹', '373': '🇲🇩'
};

  const getCountryFlag = (id) => {
    const phoneNumber = id.split('@')[0];
    if (phoneNumber.startsWith('1')) return '🇺🇸';
    let prefix = phoneNumber.substring(0, 3);
    if (!countryFlags[prefix]) {
      prefix = phoneNumber.substring(0, 2);
}
    return countryFlags[prefix] || '🏳️‍🌈';
};

  let messageText = `*❄️ LLAMADA URGENTE DEL POLO NORTE ❄️*\n\n*GRUPO: ${groupName}*\n*AYUDANTES PRESENTES: ${participants.length}*\n\n_Mensaje de Santa: ${customMessage || '¡Es hora de preparar los regalos!'}_
┌──⭓ *¡A TRABAJAR, DUENDES!*
`;

  // Iteración navideña
  for (const mem of participants) {
    messageText += `${emoji} ${getCountryFlag(mem.id)} @${mem.id.split('@')[0]}\n`;
}
  messageText += `└───────⭓\n\n*🦌 Sasuke Bot MD - El Trineo de Santa 🎅*`;

  // Puedes cambiar la imagen y el audio a algo navideño si lo tienes
  const imageUrl = 'https://qu.ax/4j9h7'; 
  const audioUrl = 'https://cdn.russellxz.click/3fd9f7de.mp3';

  // fkontak con temática de Santa Claus / Navidad
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Navidad"
},
    message: {
      locationMessage: {
        name: "*Santa's Helper Bot 🎄*",
        jpegThumbnail: await (await fetch('https://cdn-sunflareteam.vercel.app/images/fa68a035ca.jpg')).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Santa;;;\n" +
          "FN:Santa Claus Bot\n" +
          "ORG:Polo Norte Developers\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Trineo\n" +
          "X-WA-BIZ-DESCRIPTION:🎅 Llamando a todos los Ayudantes y Duendes.\n" +
          "X-WA-BIZ-NAME:SantaBot\n" +
          "END:VCARD"
}
},
    participant: "0@s.whatsapp.net"
};

  await conn.sendMessage(m.chat, {
    image: { url: imageUrl},
    caption: messageText,
    mentions: participants.map(a => a.id)
}, { quoted: fkontak});

  await conn.sendMessage(m.chat, {
    audio: { url: audioUrl},
    mimetype: 'audio/mp4',
    ptt: true
}, { quoted: fkontak});
};

handler.help = ['todos'];
handler.tags = ['group'];
handler.command = /^(tagall|invocar|marcar|todos|invocación)$/i;
handler.admin = true; 
handler.group = true;

export default handler;
