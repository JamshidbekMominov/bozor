const { Telegraf, Markup, Scenes } = require("telegraf");
const session = require("telegraf-session-local");

const bot = new Telegraf("8131737610:AAGr9OfDwS0cq5eXvxq_FMyz4zDW7thwL-c");

// Kanal ID
const CHANNEL_ID = "-1002758493531";

// Lokal session middleware-ni sozlash
const localSession = new session({
  database: "session.json",
});
bot.use(localSession.middleware());

// const fs = require("fs");
// const path = require("path");
// const { LocalSession } = require("telegraf-session-local");
// const { Telegraf, Markup, Scenes } = require("telegraf");

// const bot = new Telegraf("TOKEN");

// const localSession = new LocalSession();
// bot.use(localSession.middleware());

// bot.start((ctx) => ctx.reply("Salom"));
// bot.launch();

// Start komandasi: Til tanlash
bot.start((ctx) => {
  ctx.reply(
    "Tilni tanlang:",
    Markup.keyboard([["🇺🇿 Uzbekcha", "🇷🇺 Русский"]]).resize()
  );
});

// Til tanlash va asosiy menyu
bot.hears(["🇺🇿 Uzbekcha", "🇷🇺 Русский"], (ctx) => {
  ctx.session.language = ctx.message.text === "🇺🇿 Uzbekcha" ? "uz" : "ru";
  bot.hears(/.*/, (ctx) => {
    console.log("👉 Bosilgan tugma texti:", ctx.message.text);
  });
  ctx.reply(
    ctx.session.language === "uz"
      ? "Menyudan birini tanlang:"
      : "Выберите из меню:",
    Markup.keyboard([
      ["1️⃣ Biz haqimizda", "2️⃣ Ish o‘rinlari"],
      ["3️⃣ Ish o‘rinlari haqida ma’lumot"],
    ]).resize()
  );
});

// 1> Biz haqimizda
bot.hears("1️⃣ Biz haqimizda", (ctx) => {
  const message =
    ctx.session.language === "uz"
      ? ` <b> "Fayz-baraka Trade Group " </b> 1995-yilda tashkil etilgan bo'lib O'zbekiston Respublikasi Samarqand viloyatidagi oilaviy korxona bo'lib, chakana savdosini  optom market shaklida faoliyat yuritishni boshlagan ilk tarmoqlardan biri sanaladi. 2000-yilga kelib talab kuchaygani sababli Fayz-baraka tarmog'i tashkil etilgan va shu nom ostida faoliyat olib borgan. 2025-yil bahorida Bazarlyk brendiga rebrending qilib, hozirgi kunda shu nom ostida ishlab kelmoqda... Har kuni do'konimizga o'n minglab xaridorlar tashrif buyirishadi. Bu esa yana va yana yangi mijozlarni jalb etish yo'lida tinimsiz izlanishimizga turtki beradi.`
      : `<b> " Торговая группа Файз-барака" </b> была основана в 1995 году как семейное предприятие в Самаркандской области Республики Узбекистан и считается одной из первых сетей, начавших работу в формате оптового рынка. К 2000 году, в связи с возросшим спросом, сеть «Файз-барака» была основана и функционирует под этим названием. Весной 2025 года она была переименована в бренд «Базарлык» и по сей день работает под этим названием... Десятки тысяч покупателей посещают наш магазин ежедневно. Это мотивирует нас постоянно стремиться к привлечению новых клиентов.`;
  ctx.reply(message, {
    parse_mode: "HTML",
    reply_markup: Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize(),
  });
});

// 2> Ish o‘rinlari
bot.hears("2️⃣ Ish o‘rinlari", (ctx) => {
  const message =
    ctx.session.language === "uz"
      ? "Keling, anketangizni yaratamiz.\nIshlamoqchi bo‘lgan hududni tanlang:"
      : "Давайте создадим вашу анкету.\nВыберите область, в которой вы хотите работать:";
  ctx.reply(
    message,
    Markup.keyboard([
      ["Mitan shahri", "Ishtixon tumani"],
      ["Kattaqo'rg'on shahri", "Chelak shahri"],
      ["⬅️ Orqaga", "🏠 Bosh sahifa"],
    ]).resize()
  );
});

// Lokalizatsiya va Google Maps lokatsiyasi
bot.hears(
  ["Mitan shahri", "Ishtixon tumani", "Kattaqo'rg'on shahri", "Chelak shahri"],
  (ctx) => {
    ctx.session.filial = ctx.message.text;

    // Lokatsiyalarni to‘liq manzil + mo‘ljal bilan beramiz
    const locations = {
      "Mitan shahri": {
        lat: 40.0081026689143,
        lon: 66.5489255793072,
        address: "Mitan shaharchasi, Namuna MFY, Amir Temur ko'chasi, 12-uy",
        landmark: "Mitan shahar dehqon bozori yonida",
      },
      "Ishtixon tumani": {
        lat: 39.96547438587122,
        lon: 66.48605461535415,
        address: "Ishtixon tumani, Alisher Navoiy ko‘chasi, 26",
        landmark: "Ishtixon tuman markazida",
      },
      "Kattaqo'rg'on shahri": {
        lat: 39.892333200330526,
        lon: 66.26725155133246,
        address:
          "Kattaqo'rg'on shahri, O'rikzor mahallasi, Ulug'bek Barnoyev shoh ko'chasi, 54-uy",
        landmark: "Kirpichniy chorraxasida",
      },
      "Chelak shahri": {
        lat: 39.9132549934573,
        lon: 66.8610867919285,
        address: "Chelak shahri, Xo’jaobod MFY, Mashrab ko’chasi, 66A",
        landmark: '"Fayz Osh" markazi yonida',
      },
    };

    const selectedLocation = locations[ctx.session.filial];
    ctx.session.location = selectedLocation;

    const message =
      ctx.session.language === "uz"
        ? `📍 *Manzil:* ${selectedLocation.address}\n🔍 *Mo'ljal:* ${selectedLocation.landmark}`
        : `📍 *Адрес:* ${selectedLocation.address}\n🔍 *Ориентир:* ${selectedLocation.landmark}`;

    // Avval matn yuboramiz
    ctx.replyWithMarkdown(message).then(() => {
      // Keyin location yuboramiz
      ctx
        .replyWithLocation(selectedLocation.lat, selectedLocation.lon)
        .then(() => {
          // Keyin lavozim so'raymiz
          ctx.reply(
            ctx.session.language === "uz"
              ? "Qaysi lavozimda ishlamoqchisiz?"
              : "Какую должность вы хотите занять?",
            Markup.keyboard([
              ["Sotuvchi kassir", "Rasta sotuvchisi"],
              ["Ombor mudiri", "Tozalash xodimasi"],
              ["Novvoy yordamchisi", "Oshpaz"],
              ["⬅️ Orqaga", "🏠 Bosh sahifa"],
            ]).resize()
          );
        });
    });
  }
);

// Anketa yig‘ish uchun WizardScene
const anketaScene = new Scenes.WizardScene(
  "ANKETA_SCENE",
  (ctx) => {
    ctx.wizard.state.data = {
      vakansiya: ctx.message.text,
      filial: ctx.session.filial,
      location: ctx.session.location,
    };

    ctx.reply(
      ctx.session.language === "uz"
        ? "F.I.Sh kiriting:\n<i> masalan: Mo'minov Jamshidbek Ergashaliyevich</i>"
        : "Введите Ф.И.О:\n<i>например: Муминов Джамшидбек Эргашалиевич</i>",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [["⬅️ Orqaga", "🏠 Bosh sahifa"]],
          resize_keyboard: true,
          one_time_keyboard: true, // 👉 bu yer orqali eski tugmalarni o‘chiramiz
        },
      }
    );

    // F.I.Sh majburiy qilish uchun shart
    if (!ctx.message || !ctx.message.text || ctx.message.text.trim() === "") {
      ctx.reply(
        ctx.session.language === "uz"
          ? "Iltimos, F.I.Sh ni to‘ldiring! Bu majburiy maydon."
          : "Пожалуйста, заполните Ф.И.О! Это обязательное поле.",
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [["⬅️ Orqaga", "🏠 Bosh sahifa"]],
            resize_keyboard: true,
            one_time_keyboard: true, // 👉 bu yer orqali eski tugmalarni o‘chiramiz
          },
        }
      );
      return;
    }

    ctx.wizard.state.data.fish = ctx.message.text;
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    if (!ctx.message || !ctx.message.text) {
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.fish = ctx.message.text;

    ctx.reply(
      ctx.session.language === "uz"
        ? "Telefon raqamini yuboring:\n<i>Sizga aloqaga chiqishimiz uchun muhim</i>"
        : "Отправьте номер телефона:",
      Markup.keyboard([
        [Markup.button.contactRequest("📞 Telefon raqamini yuborish")],
        ["⬅️ Orqaga", "🏠 Bosh sahifa"],
      ]).resize()
    );
    return ctx.wizard.next();
  },
  // Qolgan bosqichlar o'zgarmaydi...
  (ctx) => {
    ctx.wizard.state.data === ctx.wizard.state.data || {};
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    // Avval .data obyektini yaratamiz, agar mavjud bo'lmasa
    if (!ctx.wizard.state.data) {
      ctx.wizard.state.data = {};
    }

    // Keyin kontakt bor-yo‘qligini tekshiramiz
    if (ctx.message.contact) {
      ctx.wizard.state.data.phone = ctx.message.contact.phone_number;
    } else {
      ctx.wizard.state.data.phone = "Ma'lumot yo'q";
    }

    ctx.reply(
      ctx.session.language === "uz"
        ? `Telefon: ${ctx.wizard.state.data.phone}\nTug'ilgan sana:`
        : `Телефон: ${ctx.wizard.state.data.phone}\nДата рождения:`,
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.data === ctx.wizard.state.data || {};
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.birthDate = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Yashash manzili to'liq:"
        : "Адрес проживания:",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.data === ctx.wizard.state.data || {};

    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    if (!ctx.wizard.state.data) {
      ctx.wizard.state.data = {};
    }
    //
    ctx.wizard.state.data.address = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Otangizning F.I.Sh va ish joyi:"
        : "Ф.И.О отца и место работы:",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  // 🔁 REPLACE shu stepni to‘liq shuni bilan
  (ctx) => {
    // 🔒 ctx.message bo'lmasa ham yiqilmasin
    const text = ctx.message && ctx.message.text ? ctx.message.text : null;

    // ⬅️ Navigatsiya
    if (text === "⬅️ Orqaga" || text === "🏠 Bosh sahifa") {
      handleNavigation(ctx);
      return;
    }

    // ✅ .data doim mavjud bo'lsin
    ctx.wizard.state.data = ctx.wizard.state.data || {};

    // 🧾 Faqat matn qabul qilamiz; bo'lmasa shu stepda qolamiz
    if (!text || !text.trim()) {
      ctx.reply(
        ctx.session.language === "uz"
          ? "Iltimos, otangizning F.I.Sh va ish joyini matn ko‘rinishida yuboring."
          : "Пожалуйста, отправьте Ф.И.О и место работы отца текстом.",
        Markup.keyboard([["⬅️ Orqaga", "🏠 Бош саҳифа"]]).resize()
      );
      return; // ❗️ shu stepda qoladi, next GA O'TMAYDI
    }

    // ✍️ Qiymatni yozamiz
    ctx.wizard.state.data.fatherInfo = text.trim();

    // ➡️ Keyingi savol
    ctx.reply(
      ctx.session.language === "uz"
        ? "Onangizning F.I.Sh va ish joyi:"
        : "Ф.И.О матери и место работы:",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );

    return ctx.wizard.next();
  },

  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.motherInfo = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz" ? "Jinsi:" : "Пол:",
      Markup.keyboard([
        ["Erkak", "Ayol"],
        ["⬅️ Orqaga", "🏠 Bosh sahifa"],
      ]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.gender = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Qaysi tillarni bilasiz? (yozma shaklda):"
        : "Какие языки вы знаете? (в письменной форме):",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.languages = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Oilaviy holatingiz?"
        : "Семейное положение?",
      Markup.keyboard([
        ["Uylangan", "Turmush qurgan"],
        ["Uylanmagan", "Turmush qurmagan"],
        ["⬅️ Orqaga", "🏠 Bosh sahifa"],
      ]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.maritalStatus = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Talaba yoki o‘quvchi? (Ha / Yo‘q)"
        : "Студент или учащийся? (Да / Нет)",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.studentStatus = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Ish tajribangiz qaysi sohada va necha yil:"
        : "Опыт работы:",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.experience = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Kutayotgan ish haqi (so‘mda):"
        : "Ожидаемая зарплата (в сумах):",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    ctx.wizard.state.data = ctx.wizard.state.data || {};
    ctx.wizard.state.data.salary = ctx.message.text;
    ctx.reply(
      ctx.session.language === "uz"
        ? "Rasmingizni yuboring:"
        : "Отправьте фото:",
      Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (
      ctx.message.text === "⬅️ Orqaga" ||
      ctx.message.text === "🏠 Bosh sahifa"
    ) {
      handleNavigation(ctx);
      return;
    }
    if (ctx.message.photo) {
      ctx.wizard.state.data.photo =
        ctx.message.photo[ctx.message.photo.length - 1].file_id;
      const data = ctx.wizard.state.data;
      const message =
        ctx.session.language === "uz"
          ? `Anketa muvaffaqiyatli to‘ldirildi!\n\n` +
            `Filial: ${data.filial}\n` +
            `Manzil: [Lokatsiya](${data.location})\n` +
            `Vakansiya: ${data.vakansiya}\n` +
            `F.I.Sh: ${data.fish}\n` +
            `Telefon: ${data.phone}\n` +
            `Tug‘ilgan sana: ${data.birthDate}\n` +
            `Yashash manzili: ${data.address}\n` +
            `Otangizning F.I.Sh va ish joyi: ${data.fatherInfo}\n` +
            `Onangizning F.I.Sh va ish joyi: ${data.motherInfo}\n` +
            `Jinsi: ${data.gender}\n` +
            `Tillarni bilish: ${data.languages}\n` +
            `Oilaviy holat: ${data.maritalStatus}\n` +
            `Talaba/O‘quvchi: ${data.studentStatus}\n` +
            `Ish tajribasi: ${data.experience}\n` +
            `Kutayotgan ish haqi: ${data.salary}`
          : `Анкета успешно заполнена!\n\n` +
            `Филиал: ${data.filial}\n` +
            `Адрес: [Локация](${data.location})\n` +
            `Вакансия: ${data.vakansiya}\n` +
            `Ф.И.О: ${data.fish}\n` +
            `Телефон: ${data.phone}\n` +
            `Дата рождения: ${data.birthDate}\n` +
            `Адрес проживания: ${data.address}\n` +
            `Ф.И.О отца и место работы: ${data.fatherInfo}\n` +
            `Ф.И.О матери и место работы: ${data.motherInfo}\n` +
            `Пол: ${data.gender}\n` +
            `Знание языков: ${data.languages}\n` +
            `Семейное положение: ${data.maritalStatus}\n` +
            `Студент/Учащийся: ${data.studentStatus}\n` +
            `Опыт работы: ${data.experience}\n` +
            `Ожидаемая зарплата: ${data.salary}`;

      // Ma'lumotlarni kanalga yuborish, rasm bilan birga
      bot.telegram.sendPhoto(CHANNEL_ID, data.photo, {
        caption: message,
        parse_mode: "Markdown",
      });

      ctx.reply(message, { parse_mode: "Markdown" });
      return ctx.scene.leave();
    } else {
      ctx.reply(
        ctx.session.language === "uz"
          ? "Iltimos, rasm yuboring."
          : "Пожалуйста, отправьте фото.",
        Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
      );
      return ctx.wizard.selectStep(ctx.wizard.cursor);
    }
  }
);

// Navigatsiya funksiyasi
function handleNavigation(ctx) {
  if (ctx.message.text === "⬅️ Orqaga") {
    if (ctx.wizard.cursor > 0) {
      ctx.wizard.back();
      const step = ctx.wizard.cursor;
      const steps = [
        "F.I.Sh kiriting:",
        "Telefon raqamini yuboring:",
        "Telefon: ${ctx.wizard.state.data.phone}\nTug'ilgan sana:",
        "Yashash manzili:",
        "Otangizning F.I.Sh va ish joyi:",
        "Onangizning F.I.Sh va ish joyi:",
        "Jinsi:",
        "Qaysi tillarni bilasiz? (yozma shaklda):",
        "Oilaviy holatingiz?",
        "Talaba yoki o‘quvchi? (Ha / Yo‘q)",
        "Ish tajribangiz:",
        "Kutayotgan ish haqi (so‘mda):",
        "Rasm yuboring:",
      ];
      ctx.reply(
        ctx.session.language === "uz"
          ? steps[step]
          : steps[step].replace(/uz/g, "ru"),
        Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
      );
    }
  } else if (ctx.message.text === "🏠 Bosh sahifa") {
    ctx.scene.leave();
    ctx.reply(
      ctx.session.language === "uz"
        ? "Bosh sahifaga xush kelibsiz!"
        : "Добро пожаловать на главную страницу!",
      Markup.keyboard([
        ["1️⃣ Biz haqimizda", "2️⃣ Ish o‘rinlari"],
        ["3️⃣ Ish o‘rinlari haqida ma’lumot"],
      ]).resize()
    );
  }
}

const stage = new Scenes.Stage([anketaScene]);
bot.use(stage.middleware());

bot.hears(
  [
    "Sotuvchi kassir",
    "Rasta sotuvchisi",
    "Ombor mudiri",
    "Tozalash xodimasi",
    "Novvoy yordamchisi",
    "Oshpaz",
  ],
  (ctx) => {
    ctx.scene.enter("ANKETA_SCENE");
  }
);

// Ish o‘rinlari haqida ma’lumot
bot.hears("3️⃣ Ish o‘rinlari haqida ma’lumot", (ctx) => {
  const message =
    ctx.session.language === "uz"
      ? "Ish o‘rinlari haqida ma’lumot olish uchun tanlang:"
      : "Выберите, чтобы узнать о вакансиях:";
  ctx.reply(
    message,
    Markup.keyboard([
      ["Kassir vazifalari", "Rasta sotuvchisi vazifalari"],
      ["Ombor xodimi vazifalari", "Operator vazifalari"],
      ["Tozalik xodimasi vazifalari"],
      ["⬅️ Orqaga", "🏠 Bosh sahifa"],
    ]).resize()
  );
});

// Ish vazifalari
const jobDescriptions = {
  "Kassir vazifalari": {
    uz: "💼 Kassirning asosiy vazifalari:\nAsosiyvazifalari: \n • Kassada to'lovlarni qabul qilish va mijozlarning hisob-kitoblarini amalga oshirish;  \n• Narxlar va aksiyalar bo‘yicha xaridorlarga maslahat berish;\n • Kassa joyini tozalikda saqlash\n • Mijozlar savollariga (aksiya, chegirma, qaytim, karta) aniq va muloyim javob berish \n\n Talablar:   \n• Yoshi 18 yoshdan oshgan bo'lishi; \n• Diqqatlilik, mijozga yo‘naltirilganlik, stressga chidamlilik; \n• Hisoblash qobiliyatlari",
    ru: "💼 Основные обязанности кассира:\nОсновные обязанности:\n• Приём платежей и расчёт клиентов на кассе; \n• Консультирование клиентов по ценам и акциям; \n• Поддержание чистоты кассы; \n• Чёткие и вежливые ответы на вопросы клиентов (акции, скидки, возвраты, карты). \n\nТребования: \n• Возраст от 18 лет; \n• Внимательность, клиентоориентированность, стрессоустойчивость; \n• Навыки расчёта,",
  },
  "Rasta sotuvchisi vazifalari": {
    uz: "🛒 Rasta sotuvchisining vazifalari:\nAsosiy vazifalari: \n• Savdo maydonchasida mahsulotlarni joylashtirish; \n• Narx belgilari va amal qilish muddatini nazorat qilish; \n• So'ralgan mahsulot haqida aniq va to‘liq ma’lumot berish; \n• Mahsulot turlari bo'yicha xaridorlarga maslahat berish; \n• Belgilangan bo'limda tozalik va tartibni saqlash  \n\nTalablar:  \n• Yoshi 16 yoshdan oshgan bo'lishi;  \n• Do'stona munosabat, mijozlarga yo'naltirilganlik; \n• Batartiblik, ehtiyotkorlik",
    ru: "🛒 Обязанности продавца-консультанта:\nОсновные задачи: \n• Размещение продукции в торговом зале; \n• Контроль ценников и сроков годности; \n• Предоставление четкой и полной информации о запрашиваемом товаре; • Консультирование покупателей по видам продукции; \n• Поддержание чистоты и порядка в закрепленном отделе \n\nТребования: \n• Возраст от 16 лет; \n• Доброжелательное отношение, клиентоориентированность; \n• Аккуратность, внимательность",
  },
  "Ombor xodimi vazifalari": {
    uz: "📦 Asosiy vazifalari:\n • Mahsulot va jihozlarni yuklash tushirish; \n• Tushirilgan mahsulotlarni bo‘limlar bo‘yicha ajratib, tegishli rastalarga yoki ichki omborga olib kirish; \n• Tovarning o‘z vaqtida rastalarga yetkazilishini ta’minlash orqali savdo uzluksizligini qo‘llab-quvvatlash \n\nTalablar: \n• Yoshi 16 yoshdan oshgan bo'lishi; \n• Jismoniy chidamlilik va yuqori ish qobiliyati.",
    ru: "📦 Обязанности складского работника:\n• Погрузка/разгрузка продукции и оборудования; \n• Сортировка выгруженной продукции по секциям и транспортировка ее на соответствующие полки или внутренний склад; \n• Поддержка непрерывности продаж путем обеспечения своевременной доставки товара на полки. Требования: \n• Возраст от 16 лет; \n• Физическая выносливость и высокая работоспособность.",
  },
  "Operator vazifalari": {
    uz: "📞 Operator vazifalari:\n Asosiy vazifalari: \n• Tovarlarni miqdori, sifati va qo‘shimcha hujjatlarini qabul qilish;\n• Mahsulotlarni yangi narxlari, chegirma va aksiyalarini doimiy yangilab borish; \n• Ichki ombordagi mahsulotlar harakatini kuzatish va mahsulotlarni tizimidagi hisobini nazorat qilib borish                           \n\nTalablar: \n• Yoshi 18 yoshdan oshgan bo'lishi; \n• Minimal darajadagi kompyuter savodxonligi; \n• Kirishuvchanlik, stressga chidamlilik; \n• Merchendaysing bo'yicha biroz malaka",
    ru: "📞 Обязанности оператора:Основные задачи: \n• Приемка товара по количеству, качеству и дополнительным документам; \n• Постоянное обновление товаров с учетом новых цен, скидок и акций; \n• Контроль движения товара на внутреннем складе и контроль учета товара в системе \n\nТребования: \n• Возраст от 18 лет; \n• Минимальный уровень компьютерной грамотности; \n• Доступность, стрессоустойчивость; \n• Некоторые навыки мерчендайзинга,",
  },
  "Tozalik xodimasi vazifalari": {
    uz: "🧹 Tozalash xodimasining vazifalari:\n Asosiy vazifalari: \n• Do'kon binolari, koridorlar, zinapoyalar, hojatxonalar va uning atrofini tozalash; \n\nTalablar: \n • Yoshi 18 yoshdan oshgan bo'lishi; \n• Tozalik va ehtiyotkorlik; \n• Yuvish vositalariga allergiya bo'lmasligi",
    ru: "🧹 Обязанности уборщика:Основные обязанности:\n • Уборка зданий магазинов, коридоров, лестниц, туалетов и прилегающей к ним территории; \n\nТребования: \n• Возраст старше 18 лет; \n• Чистоплотность и аккуратность;\n • Отсутствие аллергии на моющие средства",
  },
};

bot.hears(Object.keys(jobDescriptions), (ctx) => {
  const description =
    jobDescriptions[ctx.message.text][ctx.session.language || "uz"];
  ctx.reply(
    description,
    Markup.keyboard([["⬅️ Orqaga", "🏠 Bosh sahifa"]]).resize()
  );
});

// "Orqaga" va "Bosh sahifa" funksiyalari
bot.hears("⬅️ Orqaga", (ctx) => {
  if (ctx.scene) {
    ctx.scene.leave();
    ctx.reply(
      ctx.session.language === "uz"
        ? "Orqaga qaytdingiz!"
        : "Вы вернулись назад!",
      Markup.keyboard([
        ["1️⃣ Biz haqimizda", "2️⃣ Ish o‘rinlari"],
        ["3️⃣ Ish o‘rinlari haqida ma’lumot"],
      ]).resize()
    );
  } else {
    ctx.reply(
      ctx.session.language === "uz"
        ? "Siz bosh sahifadasiz!"
        : "Вы на главной странице!",
      Markup.keyboard([
        ["1️⃣ Biz haqimizda", "2️⃣ Ish o‘rinlari"],
        ["3️⃣ Ish o‘rinlari haqida ma’lumot"],
      ]).resize()
    );
  }
});

bot.hears("🏠 Bosh sahifa", (ctx) => {
  ctx.scene?.leave();
  ctx.reply(
    ctx.session.language === "uz"
      ? "Bosh sahifaga xush kelibsiz!"
      : "Добро пожаловать на главную страницу!",
    Markup.keyboard([
      ["1️⃣ Biz haqimizda", "2️⃣ Ish o‘rinlari"],
      ["3️⃣ Ish o‘rinlari haqida ma’lumot"],
    ]).resize()
  );
});

// Botni ishga tushirish
bot.start((ctx) => ctx.reply("Salom! Men ishlayapman ✅"));

(async () => {
  try {
    await bot.launch();
    console.log("Bot muvaffaqiyatli ishga tushdi ✅");
  } catch (error) {
    console.error("Botni ishga tushirishda xato:", error);
  }
})();

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
