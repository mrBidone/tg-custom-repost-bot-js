const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// require('dotenv').config();

// const token = process.env.TELEGRAM_BOT_TOKEN;
// const VK_ACCESS_TOKEN = process.env.VK_ACCESS_TOKEN;
// const VK_GROUP_ID = process.env.VK_GROUP_ID;
// const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
// const FB_PAGE_ID = process.env.FB_PAGE_ID;

// Вставь свой токен от BotFather
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

// Вставь свои токены и идентификаторы
const VK_ACCESS_TOKEN = '7221040223:AAEpbCjOZCxdJAnLtB3JYPNndaBP-tvDdSI';
const VK_GROUP_ID = 'YOUR_VK_GROUP_ID';
const FB_ACCESS_TOKEN = 'YOUR_FB_ACCESS_TOKEN';
const FB_PAGE_ID = 'YOUR_FB_PAGE_ID';

// Обработка новых сообщений в канале
bot.on('message', async msg => {
  if (msg.chat.type === 'channel') {
    const { text, caption, photo } = msg;

    // Отправка текста и ссылок в VK
    if (text || caption) {
      await axios.post(`https://api.vk.com/method/wall.post`, {
        owner_id: `-${VK_GROUP_ID}`,
        from_group: 1,
        message: text || caption,
        access_token: VK_ACCESS_TOKEN,
        v: '5.131',
      });
    }

    // Отправка фото в VK
    if (photo) {
      const fileId = photo[photo.length - 1].file_id; // Получаем ID фото
      const fileLink = await bot.getFileLink(fileId);

      await axios.post(`https://api.vk.com/method/wall.post`, {
        owner_id: `-${VK_GROUP_ID}`,
        from_group: 1,
        attachments: fileLink,
        access_token: VK_ACCESS_TOKEN,
        v: '5.131',
      });
    }

    // Отправка текста и фото в Facebook
    if (text || caption || photo) {
      const form = new FormData();
      form.append('access_token', FB_ACCESS_TOKEN);
      form.append('message', text || caption);

      if (photo) {
        const fileId = photo[photo.length - 1].file_id;
        const fileLink = await bot.getFileLink(fileId);
        form.append('source', fs.createReadStream(fileLink));
      }

      await axios.post(`https://graph.facebook.com/${FB_PAGE_ID}/feed`, form, {
        headers: form.getHeaders(),
      });
    }
  }
});
