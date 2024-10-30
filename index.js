require("dotenv").config();

const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
  InputFile,
} = require("grammy");

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
const adminTeg = "@BishkekXadmin";
const resolver = "@beckfild";

let mbankRequisites = '504061111';
let optimaRequisites = '4169585351289654';
let bakaiRequisites = '7760611111';
let shift = 'Не выбран';

const defaultKeyboard = new Keyboard()
  .text("ПОПОЛНИТЬ")
  .text("ВЫВЕСТИ")
  .row()
  .text("КОНТАКТЫ")
  .text("ПРАВИЛА")
  .resized();

const cancelKeyboard = new Keyboard().text("Отмена").resized();

bot.command("start", async (ctx) => {
  // console.log(ctx.from)
  if (ctx.chat.type !== "group" && ctx.chat.type !== "channel") {
    clearSession(ctx.from.id);
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
        await ctx.reply("Приветствую на кассе 1Хбет", {
          reply_markup: defaultKeyboard,
        });
      } else {
        const inlineKeyboard = new InlineKeyboard().url(
            "Подписаться на канал",
            infoChannelLink
          )
        .text("Я подписался", "subscribed");

        await ctx.reply("Вы не подписаны на канал, пожалуйста, подпишитесь.", {
          reply_markup:inlineKeyboard
        });
      }
    } catch (error) {
      // Ошибка, если пользователь не найден или канал недоступен
      await ctx.reply("Не удалось проверить подписку, попробуйте позже.");
      console.error(error);
    }
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
        await ctx.reply("Приветствую на кассе 1Хбет", {
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

bot.command("edil", async (ctx) => {
  if (ctx.chat.type === "group") {
    shift = 'Эдил';
    mbankRequisites='321321321'
    optimaRequisites='321321312312'
    bakaiRequisites='321321321'
    await ctx.reply("Приветствую Эдил, переключаю на вашу смену");
  }
});

bot.command("daniyar", async (ctx) => {
  if (ctx.chat.type === "group") {
    shift = 'Данияр';
    mbankRequisites='504061111'
    optimaRequisites='4169585351289654'
    bakaiRequisites='7760611111'
    await ctx.reply("Приветствую Данияр, переключаю на вашу смену");
  }
});

// bot.command("test", async (ctx) => {
//   console.log(ctx)
// });

bot.hears("Отмена", async (ctx) => {
  if (ctx.chat.type !== "group"&& ctx.chat.type !== "channel") {
    clearSession(ctx.from.id);
    await ctx.reply("Операции отменены", {
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
    .text("MBANK", "mbank_button")
    .text("Bakai", "bakai_button")
    .text("Optima", "optima_button");

  session.isRefill = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery("mbank_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply("Вы выбрали MBANK, укажите сумму пополнения(СОМ)");
    session.isBankChosen = true;
    session.bank = 'MBANK';
    await ctx.deleteMessage();
});
bot.callbackQuery("bakai_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply("Вы выбрали Bakai, укажите сумму пополнения(СОМ)");
    session.isBankChosen = true;
    session.bank = 'Bakai';
    await ctx.deleteMessage();
});
bot.callbackQuery("optima_button", async (ctx) => {
  const session = getSession(ctx.from.id);
    await ctx.reply("Вы выбрали Optima, укажите сумму пополнения(СОМ)");
    session.isBankChosen = true;
    session.bank = 'Optima';
    await ctx.deleteMessage();
});

bot.hears("ВЫВЕСТИ", async (ctx) => {
  await ctx.reply("Укажите удобный вам способ вывод средств", {
    reply_markup: {
      keyboard: cancelKeyboard.build(),
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  });

  const inlineKeyboard = new InlineKeyboard()
    .text("MBANK", "mbank_button_output")
    .text("Bakai", "bakai_button_output")
    .text("Optima", "optima_button_output");
    const session = getSession(ctx.from.id);

    session.isOutput = true;

  await ctx.reply("Выберите банк:", {
    reply_markup: inlineKeyboard,
  });
});

bot.callbackQuery("mbank_button_output", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  session.isBankChosen = true;
  session.bank = 'MBANK';
});
bot.callbackQuery("bakai_button_output", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  session.isBankChosen = true;
  session.bank = 'Bakai';
});
bot.callbackQuery("optima_button_output", async (ctx) => {
  const session = getSession(ctx.from.id);
  await ctx.reply("Введите реквизиты для выбранного вами банка:");
  session.isBankChosen = true;
  session.bank = 'Optima';
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

bot.hears("ПРАВИЛА", async (ctx) => {
  await ctx.reply(`Правил пока нет`, {
    // reply_markup: {
    //   keyboard: cancelKeyboard.build(),
    //   one_time_keyboard: true,
    //   resize_keyboard: true,
    // },
  });
});

// bot.callbackQuery("accept", async (ctx) => {
//     const session = getSession(ctx.from.id);
//     console.log(session);
//     if(session.isRefill && session.waitAnswer && session.userId){
//     bot.api.sendMessage(session.userId, "Транзакция прошла✅");
//     session.isRefill = false;
//     session.waitAnswer = false;
//     clearSession(session.userId);
//     console.log(session);
//   }
// });
// bot.callbackQuery("reject", async (ctx) => {
//   const session = getSession(ctx.from.id);
//   if(session.isRefill && session.waitAnswer && session.userId){
//   bot.api.sendMessage(session.userId, "Транзакция отклонена❌");
//   session.isRefill = false;
//   session.waitAnswer = false;
//   clearSession(ctx.from.id);
// }
// });

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
      if (textToNumber >= 10 && textToNumber <= 10000) {
        session.isBankChosen = false;
        session.isCashWritten = true;
        session.sumMany = textToNumber;
        await ctx.reply("Введите ваш ID(номер счета от 1XBET)");
        return await ctx.replyWithPhoto(new InputFile("img/example.jpg"));
      } else {
        await ctx.reply(
          "Сумма депозита указана некорректна, попробуйте снова \n\nМинимум: 10 сом\nМаксимум: 10000 сом"
        );
      }
    } else {
      await ctx.reply("Введите сумму цифрами");
    }
  }

  if (session.isCashWritten&&session.isRefill) {
    if (typeof textToNumber === "number") {
      // console.log("text is number");
      if (text.length === 9) {
        // console.log(text.length, "кол-во символов");
        session.isCashWritten = false;
        session.xbetIdGlobal = text;
          if (session.bank === "MBANK") {
            await ctx.reply(
              `Пополните средства на MBANK по нижеуказанному реквизиту👇\nMBANK: ${mbankRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          if (session.bank === "Bakai") {
            await ctx.reply(
              `Пополните средства на Bakai по нижеуказанному реквизиту👇\nBakai: ${bakaiRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          if (session.bank === "Optima") {
            await ctx.reply(
              `Пополните средства на Optima по нижеуказанному реквизиту👇\nOptima: ${optimaRequisites}\nСумма: ${session.sumMany}\n\nОтправьте скриншот чека`
            );
          }
          return (session.waitCheck = true);
      } else {
        await ctx.reply("Кол-во цифр должно равняться 9");
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
      if (textToNumber >= 10 && textToNumber <= 10000) {
        session.isRequisitesWritten = false;
        session.isXbetKeyWritten = true;
        session.sumMany = textToNumber;
        await ctx.reply("Введите ваш ID(номер счета от 1XBET)");
        return await ctx.replyWithPhoto(new InputFile("img/example.jpg"));
      } else {
        await ctx.reply(
          "Сумма вывода указана некорректна, попробуйте снова \n\nМинимум: 10 сом\nМаксимум: 10000 сом"
        );
      }
    } else {
      await ctx.reply("Введите сумму цифрами");
    }
  }

  if (session.isOutput && session.isXbetKeyWritten) {
    if (typeof textToNumber === "number") {
      if(text.length === 9){
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
        await ctx.reply("Кол-во цифр должно равняться 9");
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