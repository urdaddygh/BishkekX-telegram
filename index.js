require("dotenv").config();

const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
  InputFile,
} = require("grammy");
const texts = require('./texts');

const bot = new Bot(process.env.BOT_API_KEY);
const sessions = new Map();

bot.api.setMyCommands([
  {
    command: "start",
    description: "Запуск бота",
  },
]);

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      isBankChosen: false,
      isCashWritten: false,
      isOutput: false,
      isRefill: false,
      waitCheck: false,
      isRequisitesWritten: false,
      isXbetKeyWritten: false,
      isAccepted: false,
      isRejected: false,
      waitAnswer:false,
      requisites: '',
      sumMany: '',
      bank: '',
      xbetIdGlobal: '',
      xbetKey: '',
      userId : null,
    });
  }
  return sessions.get(userId);
}

function clearSession(userId) {
  sessions.delete(userId);
}

const outputGroupId = "-4562169457";
const reffilGroupId = "-4598841007";
const infoChannelId = "-1002413010153";
const infoChannelLink = "https://t.me/+GdLPdk4h6oFlOGUy";
const adminTeg = "@BishkeX_BETMEN";
const resolver = "@BishkekX_Kolyan";
const minSumReffill = 35;
const minSumOutput = 150;
const maxSum = 1000000;
const maxRequiredXbetIdCount = 12;
const minRequiredXbetIdCount = 9;
const firstBankName = 'oDengi';
const secondBankName = 'Bakai';
const thirdBankName = 'Optima';

let mbankRequisites = '0500229666';
let optimaRequisites = '4169585353587065';
let bakaiRequisites = '(0500) 047-902';
let oDengiRequisites = '(0706) 425-145';
let shift = 'Не выбран';

const defaultKeyboard = new Keyboard()
  .text("ПОПОЛНИТЬ")
  .text("ВЫВЕСТИ")
  .row()
  .text("КОНТАКТЫ")
  // .text("ПРАВИЛА")
  // .row()
  .text("БОНУСЫ")
  .resized();

const cancelKeyboard = new Keyboard().text("Отмена").resized();

// bot.command("start", async (ctx) => {
//   // console.log(ctx.from)
//   if (ctx.chat.type !== "group" && ctx.chat.type !== "channel") {
//     clearSession(ctx.from.id);
//     const userId = ctx.from.id;
//     try {
//       // Получаем информацию о пользователе в канале
//       const memberInfo = await ctx.api.getChatMember(infoChannelId, userId);

//       // Проверяем статус подписки
//       if (
//         memberInfo.status === "member" ||
//         memberInfo.status === "administrator" ||
//         memberInfo.status === "creator"
//       ) {
//         await ctx.reply(texts.WELCOME, {
//           reply_markup: defaultKeyboard,
          
//         });
//       } else {
//         const inlineKeyboard = new InlineKeyboard().url(
//             "Подписаться на канал",
//             infoChannelLink
//           )
//         .text("Я подписался", "subscribed");

//         await ctx.reply("Вы не подписаны на канал, пожалуйста, подпишитесь.", {
//           reply_markup:inlineKeyboard
//         });
//       }
//     } catch (error) {
//       // Ошибка, если пользователь не найден или канал недоступен
//       await ctx.reply("Не удалось проверить подписку, попробуйте позже.");
//       console.error(error);
//     }
//   }
// });

bot.command("start", async (ctx) => {
  // console.log(ctx.from)
  if (ctx.chat.type !== "group" && ctx.chat.type !== "channel") {
    clearSession(ctx.from.id);
    const userId = ctx.from.id;
        await ctx.reply(texts.WELCOME, {
          reply_markup: defaultKeyboard,
          
        });
  }
});

bot.callbackQuery("subscribed", async (ctx) => {
  clearSession(ctx.from.id);
  if (ctx.chat.type !== "group") {
    const userId = ctx.from.id;
    try {
      // Получаем информацию о пользователе в канале
      const memberInfo = await ctx.api.getChatMember(infoChannelId, userId);

      // Проверяем статус подписки
      if (
        memberInfo.status === "member" ||
        memberInfo.status === "administrator" ||
        memberInfo.status === "creator"
      ) {
        await ctx.reply(texts.WELCOME, {
          reply_markup: defaultKeyboard,
        });
        await ctx.deleteMessage();
      } else {
        const inlineKeyboard = new InlineKeyboard()
          .url("Подписаться на канал", infoChannelLink)
          .text("Я подписался", "subscribed");

        await ctx.reply("Вы не подписаны на канал, пожалуйста, подпишитесь.", {
          reply_markup: inlineKeyboard,
        });
      }
    } catch (error) {
      // Ошибка, если пользователь не найден или канал недоступен
      await ctx.reply("Не удалось проверить подписку, попробуйте позже.");
      console.error(error);
    }
  }
});

// bot.command("edil", async (ctx) => {
//   if (ctx.chat.type === "group") {
//     shift = 'Эдил';
//     mbankRequisites='0500229666';
//     optimaRequisites='4169585355144709';
//     oDengi = '+996 (504) 061-111';
//     bakaiRequisites='0500229666';
//     await ctx.reply("Приветствую Эдил, переключаю на вашу смену");
//   }
// });

// bot.command("daniyar", async (ctx) => {
//   if (ctx.chat.type === "group") {
//     shift = 'Данияр';
//     mbankRequisites='0504061111';
//     optimaRequisites='4169585351289654';
//     oDengi = '-';
//     bakaiRequisites='7760611111';
//     await ctx.reply("Приветствую Данияр, переключаю на вашу смену");
//   }
// });

// bot.command("test", async (ctx) => {
//   console.log(ctx)
// });

bot.hears("Отмена", async (ctx) => {
  if (ctx.chat.type !== "group"&& ctx.chat.type !== "channel") {
    clearSession(ctx.from.id);
    await ctx.reply(texts.WELCOME, {
      reply_markup: defaultKeyboard,
    });
  }
});

bot.hears("ПОПОЛНИТЬ", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Укажите удобный вам способ пополнения счета", {
    reply_markup: {
      keyboard: cancelKeyboard.build(),
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });
  // console.log("after", session);
  const inlineKeyboard = new InlineKeyboard()
    // .text("MBANK", "mbank_button")
    .text(texts.ODENGI, "first_reffil_button")
    .text(texts.BAKAI, "second_reffil_button")
    .text(texts.OPTIMA, "third_reffil_button");

  session.isRefill = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery("first_reffil_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply(`Вы выбрали ${texts.ODENGI}, укажите сумму пополнения(СОМ)`);
    session.isBankChosen = true;
    session.bank = firstBankName;
    await ctx.deleteMessage();
});
bot.callbackQuery("second_reffil_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply(`Вы выбрали ${texts.BAKAI}, укажите сумму пополнения(СОМ)`);
    session.isBankChosen = true;
    session.bank = secondBankName;
    await ctx.deleteMessage();
});
bot.callbackQuery("third_reffil_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply(`Вы выбрали ${texts.OPTIMA}, укажите сумму пополнения(СОМ)`);
    session.isBankChosen = true;
    session.bank = thirdBankName;
    await ctx.deleteMessage();
});

bot.hears("ВЫВЕСТИ", async (ctx) => {
  await ctx.reply("Укажите удобный вам способ вывода средств", {
    reply_markup: {
      keyboard: cancelKeyboard.build(),
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });

  const inlineKeyboard = new InlineKeyboard()
    .text(texts.ODENGI, "first_output_button")
    .text(texts.BAKAI, "second_output_button")
    .text(texts.OPTIMA, "third_output_button");
    const session = getSession(ctx.from.id);

    session.isOutput = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery("first_output_button", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply(texts.ENTER_REQUISITES_BY_BANK);
  session.isBankChosen = true;
  session.bank = firstBankName;
});
bot.callbackQuery("second_output_button", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply(texts.ENTER_REQUISITES_BY_BANK);
  session.isBankChosen = true;
  session.bank = secondBankName;
});
bot.callbackQuery("third_output_button", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply(texts.ENTER_REQUISITES_BY_BANK);
  session.isBankChosen = true;
  session.bank = thirdBankName;
  // console.log(session);
});

bot.hears("КОНТАКТЫ", async (ctx) => {
  await ctx.reply(`Вы можете обратиться к одному из этих контактов:\nАдмин: ${adminTeg}\nРешала: ${resolver}`, {
    // reply_markup: {
    //   keyboard: cancelKeyboard.build(),
    //   one_time_keyboard: true,
    //   resize_keyboard: true,
    // },
  });
});

// bot.hears("ПРАВИЛА", async (ctx) => {
//   await ctx.reply(`Правил пока нет`, {
//     // reply_markup: {
//     //   keyboard: cancelKeyboard.build(),
//     //   one_time_keyboard: true,
//     //   resize_keyboard: true,
//     // },
//   });
// });
bot.hears("БОНУСЫ", async (ctx) => {
  await ctx.replyWithVideo(new InputFile("video/bonus.mp4"), {
    caption: "Введите при регистрации наш промокод: 🎁\nBISHKEKX\nИ получите бонус х2 к первому депозиту 🎁\n\n500 * 2 = 1000 сом\n2000 * 2 = 4000 coм"
  });
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const [action, userId] = callbackData.split("_");  // Разделяем действие и ID пользователя
  let userIdToNumber;
  // console.log(session);
  if (!isNaN(Number(userId))) {
    userIdToNumber = parseInt(userId);
    // console.log("parse to int = ", typeof textToNumber);
  }
  const session = getSession(userIdToNumber);
  // console.log(userIdToNumber);
  // console.log(session);
  if (typeof userIdToNumber === "number"){
    if(session.isRefill && session.waitAnswer){
      if (action === "accept") {
        await bot.api.sendMessage(userId, "Транзакция прошла✅");
      } else if (action === "reject") {
        await bot.api.sendMessage(userId, "Транзакция отклонена❌");
      }
      await ctx.editMessageReplyMarkup({
        reply_markup: null,  // Очищаем клавиатуру
      });
      session.isRefill = false;
      session.waitAnswer = false;
      clearSession(userIdToNumber);
    }
  }else{
    console.log('userId is not number = ', userIdToNumber)
  }
});

bot.on(":photo", async (ctx) => {
  const session = getSession(ctx.from.id);
  const userInfo = ctx.from;
  // const userId = userInfo.id;
  const photos = ctx.message.photo;
  // Выбираем наивысшего качества (последний элемент в массиве)

  const highestQualityPhoto = photos[photos.length - 1];
  if (session.waitCheck && session.isRefill) {
    const caption = `Чек от пользователя:\nИмя: ${
      userInfo?.first_name ?? "Отсутствует"
    }\nЛогин: ${userInfo?.username ?? "Отсутствует"}\nЧат ID: ${
      ctx.from.id
    }\n\n1XBET ID: ${session.xbetIdGlobal}\nСпособ: ${
      session.bank
    }\nСумма пополнения: ${session.sumMany}\n\nСмена: ${shift}`;
    // Отправляем фотографию в другую группу

    const acceptRejectKeyboard = new InlineKeyboard()
      .text("Принять", `accept_${ctx.from.id}`)
      .text("Отклонить", `reject_${ctx.from.id}`);

      session.waitCheck = false;
      session.waitAnswer = true;
      session.userId = ctx.from.id; 

    await bot.api.sendPhoto(reffilGroupId, highestQualityPhoto.file_id, {
      caption: caption,
      reply_markup: acceptRejectKeyboard,
    });
    // console.log(ctx.from.id);
    // console.log(session);
    return await ctx.reply("Отлично! Средства поступят после проверки чека", {
      reply_markup:{remove_keyboard:true}
    });
  }
});

bot.on("msg:text", async (ctx) => {
  const session = getSession(ctx.from.id);
  const userInfo = ctx.update.message.from;
  const text = ctx.update.message.text;
  let textToNumber;
  // console.log(session);
  if (!isNaN(Number(text))) {
    textToNumber = parseInt(text);
    // console.log("parse to int = ", typeof textToNumber);
  }
  // console.log(ctx);
  
  if (session.isBankChosen && session.isRefill) {
    if (typeof textToNumber === "number") {
      //   console.log("text is number");
      if (textToNumber >= minSumReffill && textToNumber <= maxSum) {
        session.isBankChosen = false;
        session.isCashWritten = true;
        session.sumMany = textToNumber;
        await ctx.reply(texts.ENTER_XBET_ID);
        return await ctx.replyWithPhoto(new InputFile("img/example.jpg"));
      } else {
        await ctx.reply(
          `Сумма депозита указана некорректна, попробуйте снова \n\nМинимум: ${minSumReffill} сом\nМаксимум: ${maxSum} сом`
        );
      }
    } else {
      await ctx.reply("Введите сумму цифрами");
    }
  }

  if (session.isCashWritten&&session.isRefill) {
    if (typeof textToNumber === "number") {
      // console.log("text is number");
      if (text.length >= minRequiredXbetIdCount && text.length<=maxRequiredXbetIdCount) {
        // console.log(text.length, "кол-во символов");
        session.isCashWritten = false;
        session.xbetIdGlobal = text;
          if (session.bank === firstBankName) {
            // await ctx.reply(
            //   `Пополните средства на MBANK по нижеуказанному реквизиту👇\nMBANK: ${mbankRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            // );
            await ctx.reply(
              `Пополните средства на ${texts.ODENGI} по нижеуказанному реквизиту👇\n${texts.ODENGI}: ${oDengiRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          if (session.bank === secondBankName) {
            await ctx.reply(
              `Пополните средства на Bakai по нижеуказанному реквизиту👇\nBakai: ${bakaiRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          if (session.bank === thirdBankName) {
            await ctx.reply(
              `Пополните средства на Optima по нижеуказанному реквизиту👇\nOptima: ${optimaRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          return (session.waitCheck = true);
      } else {
        await ctx.reply(`Кол-во цифр должно быть больше или равно ${minRequiredXbetIdCount} или меньше или равно ${maxRequiredXbetIdCount}`);
      }
    } else {
      await ctx.reply("Нужно ввести только цифры");
    }
  }

  if (session.isOutput&&session.isCashWritten) {
    session.xbetKey = text;
    await bot.api.sendMessage(
      outputGroupId,
      `Новый пользователь хочет вывести средства.\nИмя: ${
        userInfo?.first_name ?? "Отсуствует"
      }\nЛогин: ${
        userInfo?.username ?? "Отсуствует"
      }\n\n1XBET ID: ${session.xbetIdGlobal}\n1XBET код: ${session.xbetKey}\nСпособ: ${session.bank}\nРеквизиты: ${session.requisites}\nСумма вывода: ${session.sumMany}\n\n\nСмена: ${shift}`
    );
    return await ctx.reply(
      "Супер✅! Ожидайте.",
      {
        reply_markup: {remove_keyboard:true},
      }
    );
  }

  if(session.isRefill && session.waitCheck){
    return await ctx.reply(
      `Нужно отправить скриншот чека!`
    );
  }

  if (session.isOutput && session.isRequisitesWritten) {
    if (typeof textToNumber === "number") {
      //   console.log("text is number");
      if (textToNumber >= minSumOutput && textToNumber <= maxSum) {
        session.isRequisitesWritten = false;
        session.isXbetKeyWritten = true;
        session.sumMany = textToNumber;
        await ctx.reply(texts.ENTER_XBET_ID);
        return await ctx.replyWithPhoto(new InputFile("img/example.jpg"));
      } else {
        await ctx.reply(
          `Сумма депозита указана некорректна, попробуйте снова \n\nМинимум: ${minSumOutput} сом\nМаксимум: ${maxSum} сом`
        );
      }
    } else {
      await ctx.reply("Введите сумму цифрами");
    }
  }

  if (session.isOutput && session.isXbetKeyWritten) {
    if (typeof textToNumber === "number") {
      if(text.length >= minRequiredXbetIdCount && text.length<=maxRequiredXbetIdCount){
        session.isXbetKeyWritten = false;
        session.isCashWritten = true;
        session.xbetIdGlobal = text;
        await ctx.api.sendMediaGroup(ctx.chat.id, [
          {
            type: "photo",
            media: new InputFile("img/output_first.jpg"),
            caption: "Выберите в 1XBET способ вывода наличными, потом выберите терминал: BishkekX (24/7)",
          },
          {
            type: "photo",
            media: new InputFile("img/output_second.jpg"),
          },
        ]);
        // await ctx.replyWithPhoto(new InputFile("img/example.jpg"), {
        //   caption:""
        // });
        return await ctx.reply("Введите код который вам дал 1XBET");
      }else{
        await ctx.reply(`Кол-во цифр должно быть больше или равно ${minRequiredXbetIdCount} или меньше или равно ${maxRequiredXbetIdCount}`);
      }
    } else {
      await ctx.reply("Введите сумму цифрами");
    }
  }

  if (session.isOutput && session.isBankChosen) {
    session.isRequisitesWritten = true;
    session.isBankChosen = false;
    session.requisites = text;
    return await ctx.reply("Введите сумму вывода средств(СОМ)");
  }
  
  if(session.waitAnswer&&session.isRefill){
    return await ctx.reply("Проверяем чек...");
  }
});

bot.on("msg", async (ctx)=>{
  const session = getSession(ctx.from.id);
  // console.log('че там', session.waitAnswer)
  if(session.waitAnswer&&session.isRefill){
    return await ctx.reply("Проверяем чек...");
  }
})

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();