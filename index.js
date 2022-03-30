const makeWaSocket = require('@adiwajshing/baileys').default
const { delay, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const P = require('pino')
const { unlink, existsSync, mkdirSync, readFileSync } = require('fs')
const ZDGPath = './ZDGSessions/'
const ZDGAuth = 'ZDG_auth_info.json'

const ZDGGroupCheck = (jid) => {
   const regexp = new RegExp(/^\d{18}@g.us$/)
   return regexp.test(jid)
}

const ZDGUpdate = (ZDGsock) => {
   ZDGsock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr){
         console.log('© BOT-ZDG - Qrcode: ', qr);
      };
      if (connection === 'close') {
         const ZDGReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
         if (ZDGReconnect) ZDGConnection()
         console.log(`© BOT-ZDG - CONEXÃO FECHADA! RAZÃO: ` + DisconnectReason.loggedOut.toString());
         if (ZDGReconnect === false) {
            const removeAuth = ZDGPath + ZDGAuth
            unlink(removeAuth, err => {
               if (err) throw err
            })
         }
      }
      if (connection === 'open'){
         console.log('© BOT-ZDG - CONECTADO')
      }
   })
}

const ZDGConnection = async () => {
   const { version } = await fetchLatestBaileysVersion()
   if (!existsSync(ZDGPath)) {
      mkdirSync(ZDGPath, { recursive: true });
   }
   const { saveState, state } = useSingleFileAuthState(ZDGPath + ZDGAuth)
   const config = {
      auth: state,
      logger: P({ level: 'error' }),
      printQRInTerminal: true,
      version,
      connectTimeoutMs: 60000,
      async getMessage(key) {
         return { conversation: 'botzg' };
      },
   }
   const ZDGsock = makeWaSocket(config);
   ZDGUpdate(ZDGsock.ev);
   ZDGsock.ev.on('creds.update', saveState);

   const ZDGSendMessage = async (jid, msg) => {
      await ZDGsock.presenceSubscribe(jid)
      await delay(1500)
      await ZDGsock.sendPresenceUpdate('composing', jid)
      await delay(1000)
      await ZDGsock.sendPresenceUpdate('paused', jid)
      return await ZDGsock.sendMessage(jid, msg)
   }

   ZDGsock.ev.on('messages.upsert', async ({ messages, type }) => {
   const msg = messages[0]
   const jid = msg.key.remoteJid
   const ZDGUser = msg.pushName;

      if (!ZDGGroupCheck(jid) && !msg.key.fromMe && jid !== 'status@broadcast') {
         console.log("© BOT-ZDG - MENSAGEM : ", msg)
         ZDGsock.sendReadReceipt(jid, msg.key.participant, [msg.key.id])

         if (msg.message.conversation.toLowerCase() === 'linkzdg') {
            ZDGSendMessage(jid, {
               forward: {
                  key: { fromMe: true },
                  message: {
                     extendedTextMessage: {
                        text:'*' + ZDGUser + '*, conheça a *COMUNIDADE ZDG* clicando no link: \n\n👉 https://zapdasgalaxias.com.br/',
                        matchedText: 'https://zapdasgalaxias.com.br/',
                        canonicalUrl: 'https://zapdasgalaxias.com.br/',
                        title: 'Comunidade ZDG - ZAP das Galáxias',
                        description: '© Pedrinho da NASA',
                        jpegThumbnail: readFileSync('./assets/icone.png')
                     }
                  }
               }
            })
               .then(result => console.log('ZDG Resultado: ', result))
               .catch(err => console.log('ZDG Erro: ', err))
         }
      }
   })
}

ZDGConnection()