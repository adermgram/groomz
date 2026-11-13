/* eslint-disable */
// @ts-nocheck
/* GROOMS landing behaviour (ported from app.js). Call initLanding() after the markup is mounted; returns a dispose fn. */
export const LANGS_LIST = null;
export function initLanding() {
  'use strict';
  var disposers = [];
  var onDoc = function (type, fn) { document.addEventListener(type, fn); disposers.push(function () { document.removeEventListener(type, fn); }); };

  var LANGS = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ru', label: 'Русский' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'nl', label: 'Nederlands' }
  ];

  var DICT = {
    en: {
      heroKicker: 'Afro & textured-hair specialists',
      tagline: 'Know your hair. Own your look.',
      heroNote: 'Every photo on this page is a real client. No stock, no filters standing in for skill, just two years of work off the chair in Berlin.',
      btnBook: 'Book now', scrollCue: 'Scroll, the sheet',
      s1Kicker: 'The contact sheet', s1TitleA: 'Real heads.', s1TitleB: 'Real work.',
      s1Lede: 'Twelve frames pulled from two years of the chair, every head a different growth pattern and texture, cut to what actually suits it. Hover any frame to develop it.',
      s2Kicker: 'Field notes', s2Title: 'Most barbers cut. We read the hair first.',
      s2Lede: 'What we talk about in the chair, the stuff that decides whether a style actually holds. It is the knowledge behind every frame above.',
      n1t: 'Density & porosity', n1b: '4C hair is not one thing. How thick it grows and how it takes moisture changes the cut before the clippers come out.',
      n2t: "Berlin's hard water", n2b: "The city's water is rough on textured hair. We will tell you what it is doing to yours and how to work around it.",
      n3t: 'Moisture vs. oil', n3b: 'The difference most routines get backwards. Oil is not moisture, knowing that is half the battle for healthy afro hair.',
      n4t: 'Maturing vs. balding', n4b: 'A maturing hairline is not a receding one. We cut to where your line actually is, not where panic says it is going.',
      mKicker: 'Margin note',
      mQuote: 'The best haircut is not the one that is trending, it is the one that suits you. Your head shape, hair type and growth pattern all decide how a style sits. A good barber does not copy the reference photo. They tailor it to you.',
      mSign: 'GROOMS, on how we actually work',
      s3Kicker: 'On the sheet', s3Title: 'What we do.',
      svc1n: 'Fades', svc1d: 'Taper, mid, high, low, burst, cut clean to your hairline.',
      svc2n: 'Lineups', svc2d: 'Sharp edges, held sharp.',
      svc3n: 'Beard Lineup & Grooming', svc3d: 'Shaped and conditioned, not just trimmed.',
      svc4n: 'Locs, Braids & Cornrows', svc4d: 'Textured-hair work, by barbers who actually specialize in it.',
      svcNote: 'Pick a service and book your chair online in under a minute.',
      ctaKicker: 'Book a chair', ctaTitle: 'Pick your time.',
      ctaSub: 'Berlin-based. Choose a service and a time that suits you. Prefer to chat first? Message us on Instagram.',
      hpKicker: "The Hair Profile, coming soon",
      hpTitle: "Your hair, remembered.",
      hpBody: "A digital Hair Profile that remembers your hair, its texture, your cuts, your routine, so any GROOMS barber picks up exactly where the last one left off. Consistent, personalised grooming wherever you go. Launching in Berlin first.",
      hpCta: "Claim your early invite",
      hpNote: "Free to join · Limited first-wave spots",
      wlKicker: "Early access",
      wlTitle: "Be first in the chair.",
      wlBody: "Join the Hair Profile waitlist and we will reach out the moment early access opens in Berlin.",
      wlNameL: "What should we call you?",
      wlNameP: "First name or full name",
      wlLocL: "Where are you based?",
      wlLocP: "City or neighbourhood",
      wlEmailL: "Where do we send your invite?",
      wlEmailP: "you@email.com",
      wlSubmit: "Request my invite",
      wlBack: "Back",
      findKicker: "Find us", findTitle: "Two locations. Same barber.",
      findNote: "Same services and prices at both locations.", findOpen: "Open in Maps",
      wlPrivacy: "We only use this to send your invite. No spam, ever.",
      wlSuccessT: "You are on the list.",
      wlSuccessB: "Thanks, we will be in touch at the email you gave us the moment early access opens. Keep an eye on your inbox.",
      wlClose: "Close"
    },
    de: {
      heroKicker: 'Spezialisten für Afro- & Naturhaar',
      tagline: 'Kenn dein Haar. Zeig deinen Look.',
      heroNote: 'Jedes Foto auf dieser Seite ist ein echter Kunde. Keine Stockfotos, keine Filter als Ersatz für Können, nur zwei Jahre Arbeit am Stuhl in Berlin.',
      btnBook: 'Jetzt buchen', scrollCue: 'Scrollen, der Bogen',
      s1Kicker: 'Der Kontaktbogen', s1TitleA: 'Echte Köpfe.', s1TitleB: 'Echte Arbeit.',
      s1Lede: 'Zwölf Aufnahmen aus zwei Jahren am Stuhl, jeder Kopf ein anderes Wachstumsmuster und eine andere Textur, geschnitten auf das, was wirklich passt. Fahre über ein Bild, um es zu entwickeln.',
      s2Kicker: 'Notizen', s2Title: 'Andere schneiden nur. Wir lesen zuerst das Haar.',
      s2Lede: 'Worüber wir am Stuhl reden, das, was entscheidet, ob ein Schnitt wirklich hält. Es ist das Wissen hinter jedem Bild oben.',
      n1t: 'Dichte & Porosität', n1b: '4C-Haar ist nicht gleich 4C-Haar. Wie dicht es wächst und wie es Feuchtigkeit aufnimmt, bestimmt den Schnitt, bevor die Maschine läuft.',
      n2t: 'Berlins hartes Wasser', n2b: 'Das Wasser der Stadt ist hart zu Naturhaar. Wir sagen dir, was es mit deinem macht und wie du gegensteuerst.',
      n3t: 'Feuchtigkeit vs. Öl', n3b: 'Den Unterschied bekommen die meisten falsch herum. Öl ist keine Feuchtigkeit, das zu wissen ist die halbe Miete für gesundes Afrohaar.',
      n4t: 'Reifende vs. weichende Linie', n4b: 'Eine reifende Haarlinie ist keine weichende. Wir schneiden dahin, wo deine Linie wirklich ist, nicht wohin die Panik sie schiebt.',
      mKicker: 'Randnotiz',
      mQuote: 'Der beste Haarschnitt ist nicht der angesagteste, es ist der, der zu dir passt. Kopfform, Haartyp und Wachstumsmuster entscheiden, wie ein Style sitzt. Ein guter Barbier kopiert nicht das Referenzfoto. Er passt es dir an.',
      mSign: 'GROOMS, darüber wie wir wirklich arbeiten',
      s3Kicker: 'Auf dem Bogen', s3Title: 'Was wir machen.',
      svc1n: 'Fades', svc1d: 'Taper, Mid, High, Low, Burst, sauber bis zur Haarlinie geschnitten.',
      svc2n: 'Konturen', svc2d: 'Scharfe Kanten, scharf gehalten.',
      svc3n: 'Bartkontur & Pflege', svc3d: 'Geformt und gepflegt, nicht nur gestutzt.',
      svc4n: 'Locs, Zöpfe & Cornrows', svc4d: 'Naturhaar-Arbeit von Barbieren, die sich wirklich darauf spezialisiert haben.',
      svcNote: 'Wähle einen Service und buche deinen Stuhl online in unter einer Minute.',
      ctaKicker: 'Stuhl buchen', ctaTitle: 'Wähle deine Zeit.',
      ctaSub: 'Mit Sitz in Berlin. Wähle Service und Zeit, die zu dir passen. Lieber erst schreiben? Melde dich auf Instagram.',
      hpKicker: "Das Hair Profile, bald verfügbar",
      hpTitle: "Dein Haar, gespeichert.",
      hpBody: "Ein digitales Hair Profile, das sich dein Haar merkt, Textur, deine Schnitte, deine Routine, damit jeder GROOMS-Barbier genau dort weitermacht, wo der letzte aufgehört hat. Konsistentes, persönliches Grooming, wohin du auch gehst. Zuerst in Berlin.",
      hpCta: "Early-Invite sichern",
      hpNote: "Kostenlos · Begrenzte Plätze der ersten Welle",
      wlKicker: "Early Access",
      wlTitle: "Sei zuerst im Stuhl.",
      wlBody: "Trag dich in die Hair-Profile-Warteliste ein und wir melden uns, sobald der Early Access in Berlin startet.",
      wlNameL: "Wie sollen wir dich nennen?",
      wlNameP: "Vor- oder vollständiger Name",
      wlLocL: "Wo bist du zu Hause?",
      wlLocP: "Stadt oder Kiez",
      wlEmailL: "Wohin schicken wir deine Einladung?",
      wlEmailP: "du@email.com",
      wlSubmit: "Einladung anfordern",
      wlBack: "Zurück",
      findKicker: "So findest du uns", findTitle: "Zwei Standorte. Derselbe Barber.",
      findNote: "Gleiche Services und Preise an beiden Standorten.", findOpen: "In Maps öffnen",
      wlPrivacy: "Wir nutzen das nur für deine Einladung. Niemals Spam.",
      wlSuccessT: "Du bist auf der Liste.",
      wlSuccessB: "Danke, wir melden uns an der angegebenen E-Mail, sobald der Early Access startet. Behalte dein Postfach im Auge.",
      wlClose: "Schließen"
    },
    ru: {
      heroKicker: 'Специалисты по афро и текстурным волосам',
      tagline: 'Знай свои волосы. Владей своим стилем.',
      heroNote: 'Каждое фото на этой странице, реальный клиент. Никаких стоков и фильтров вместо мастерства, только два года работы в кресле в Берлине.',
      btnBook: 'Записаться', scrollCue: 'Листай, контактный лист',
      s1Kicker: 'Контактный лист', s1TitleA: 'Реальные люди.', s1TitleB: 'Реальная работа.',
      s1Lede: 'Двенадцать кадров из двух лет работы в кресле, каждая голова со своим ростом и текстурой, стрижка под то, что действительно идёт. Наведите на кадр, чтобы проявить его.',
      s2Kicker: 'Заметки', s2Title: 'Другие просто стригут. Мы сначала читаем волосы.',
      s2Lede: 'О чём мы говорим в кресле, то, что решает, будет ли стрижка держаться. Это знание стоит за каждым кадром выше.',
      n1t: 'Плотность и пористость', n1b: 'Волосы 4C бывают разными. Насколько густо они растут и как впитывают влагу, это определяет стрижку ещё до машинки.',
      n2t: 'Жёсткая вода Берлина', n2b: 'Вода в городе тяжела для текстурных волос. Мы расскажем, что она делает с вашими и как это обойти.',
      n3t: 'Влага против масла', n3b: 'Разницу большинство путает. Масло, не влага, и понимание этого, половина успеха для здоровых афроволос.',
      n4t: 'Зрелая линия или облысение', n4b: 'Зрелая линия роста, не то же, что отступающая. Мы стрижём туда, где ваша линия на самом деле, а не куда её гонит паника.',
      mKicker: 'Заметка на полях',
      mQuote: 'Лучшая стрижка не та, что в тренде,, а та, что идёт именно вам. Форма головы, тип волос и рост решают, как ляжет стиль. Хороший барбер не копирует фото-референс. Он подгоняет его под вас.',
      mSign: 'GROOMS, о том, как мы работаем на самом деле',
      s3Kicker: 'В списке', s3Title: 'Что мы делаем.',
      svc1n: 'Фейды', svc1d: 'Тейпер, мид, хай, лоу, бёрст, чисто по линии роста.',
      svc2n: 'Контуры', svc2d: 'Чёткие края, держатся чётко.',
      svc3n: 'Контур и уход за бородой', svc3d: 'Форма и уход, а не просто подравнивание.',
      svc4n: 'Локи, косы и корнроу', svc4d: 'Работа с текстурными волосами от барберов, которые на этом специализируются.',
      svcNote: 'Выберите услугу и запишитесь онлайн меньше чем за минуту.',
      ctaKicker: 'Записаться', ctaTitle: 'Выберите время.',
      ctaSub: 'Мы в Берлине. Выберите услугу и удобное время. Хотите сначала написать? Пишите нам в Instagram.',
      hpKicker: "Hair Profile, скоро",
      hpTitle: "Твои волосы, в памяти.",
      hpBody: "Цифровой Hair Profile, который помнит твои волосы, текстуру, твои стрижки, твой уход, чтобы любой барбер GROOMS продолжил ровно с того места, где закончил предыдущий. Стабильный, персональный груминг, где бы ты ни был. Старт, в Берлине.",
      hpCta: "Получить ранний доступ",
      hpNote: "Бесплатно · Ограниченные места первой волны",
      wlKicker: "Ранний доступ",
      wlTitle: "Будь первым в кресле.",
      wlBody: "Запишись в лист ожидания Hair Profile, и мы напишем, как только откроется ранний доступ в Берлине.",
      wlNameL: "Как к тебе обращаться?",
      wlNameP: "Имя или полное имя",
      wlLocL: "Где ты находишься?",
      wlLocP: "Город или район",
      wlEmailL: "Куда прислать приглашение?",
      wlEmailP: "you@email.com",
      wlSubmit: "Запросить приглашение",
      wlBack: "Назад",
      findKicker: "Как нас найти", findTitle: "Две локации. Один барбер.",
      findNote: "Одинаковые услуги и цены в обеих локациях.", findOpen: "Открыть в Maps",
      wlPrivacy: "Используем только для приглашения. Никакого спама.",
      wlSuccessT: "Ты в списке.",
      wlSuccessB: "Спасибо, мы напишем на указанную почту, как только откроется ранний доступ. Следи за входящими.",
      wlClose: "Закрыть"
    },
    fr: {
      heroKicker: 'Spécialistes du cheveu afro & texturé',
      tagline: 'Connais tes cheveux. Affirme ton style.',
      heroNote: "Chaque photo de cette page est un vrai client. Pas de banque d'images, pas de filtres à la place du savoir-faire, juste deux ans de travail au fauteuil à Berlin.",
      btnBook: 'Réserver', scrollCue: 'Défiler, la planche',
      s1Kicker: 'La planche contact', s1TitleA: 'Vraies têtes.', s1TitleB: 'Vrai travail.',
      s1Lede: 'Douze clichés tirés de deux ans au fauteuil, chaque tête un schéma de pousse et une texture différents, coupés selon ce qui va vraiment. Survolez une image pour la révéler.',
      s2Kicker: 'Notes de terrain', s2Title: "Les autres coupent. Nous lisons d'abord le cheveu.",
      s2Lede: "Ce dont on parle au fauteuil, ce qui décide si une coupe tient vraiment. C'est le savoir derrière chaque image ci-dessus.",
      n1t: 'Densité & porosité', n1b: "Le cheveu 4C n'est pas unique. Sa densité et sa façon de prendre l'hydratation changent la coupe avant même la tondeuse.",
      n2t: "L'eau dure de Berlin", n2b: "L'eau de la ville est rude pour le cheveu texturé. On vous dit ce qu'elle fait au vôtre et comment la contourner.",
      n3t: 'Hydratation vs. huile', n3b: "La différence que la plupart des routines inversent. L'huile n'est pas de l'hydratation, le savoir, c'est la moitié du travail pour un cheveu afro sain.",
      n4t: 'Ligne mûre vs. calvitie', n4b: "Une ligne qui mûrit n'est pas une ligne qui recule. On coupe là où votre ligne est vraiment, pas là où la panique la croit.",
      mKicker: 'Note en marge',
      mQuote: "La meilleure coupe n'est pas la plus tendance, c'est celle qui vous va. Forme du crâne, type de cheveu et pousse décident de la tenue d'un style. Un bon barbier ne copie pas la photo de référence. Il l'adapte à vous.",
      mSign: 'GROOMS, sur notre vraie façon de travailler',
      s3Kicker: 'Sur la planche', s3Title: "Ce qu'on fait.",
      svc1n: 'Dégradés', svc1d: 'Taper, mid, high, low, burst, net jusqu à la ligne.',
      svc2n: 'Contours', svc2d: 'Des lignes nettes, qui le restent.',
      svc3n: 'Contour & soin de barbe', svc3d: 'Façonnée et soignée, pas seulement taillée.',
      svc4n: 'Locs, tresses & cornrows', svc4d: 'Du travail sur cheveu texturé, par des barbiers qui en sont vraiment spécialistes.',
      svcNote: 'Choisis un service et réserve ta place en ligne en moins d’une minute.',
      ctaKicker: 'Réserver un fauteuil', ctaTitle: 'Choisis ton créneau.',
      ctaSub: 'Basés à Berlin. Choisis un service et un horaire. Tu préfères discuter d’abord ? Écris-nous sur Instagram.',
      hpKicker: "Le Hair Profile, bientôt",
      hpTitle: "Tes cheveux, mémorisés.",
      hpBody: "Un Hair Profile numérique qui retient tes cheveux, leur texture, tes coupes, ta routine, pour que n'importe quel barbier GROOMS reprenne exactement là où le dernier s'est arrêté. Un grooming cohérent et personnalisé, où que tu ailles. D'abord à Berlin.",
      hpCta: "Obtenir mon invitation",
      hpNote: "Gratuit · Places limitées de la première vague",
      wlKicker: "Accès anticipé",
      wlTitle: "Sois le premier au fauteuil.",
      wlBody: "Rejoins la liste d'attente Hair Profile et on te contacte dès l'ouverture de l'accès anticipé à Berlin.",
      wlNameL: "Comment doit-on t'appeler ?",
      wlNameP: "Prénom ou nom complet",
      wlLocL: "Où es-tu basé ?",
      wlLocP: "Ville ou quartier",
      wlEmailL: "Où envoyer ton invitation ?",
      wlEmailP: "toi@email.com",
      wlSubmit: "Demander mon invitation",
      wlBack: "Retour",
      findKicker: "Nous trouver", findTitle: "Deux adresses. Même barbier.",
      findNote: "Mêmes prestations et mêmes prix aux deux adresses.", findOpen: "Ouvrir dans Maps",
      wlPrivacy: "Uniquement pour t'envoyer ton invitation. Jamais de spam.",
      wlSuccessT: "Tu es sur la liste.",
      wlSuccessB: "Merci, on t'écrit à l'adresse indiquée dès l'ouverture de l'accès anticipé. Surveille ta boîte mail.",
      wlClose: "Fermer"
    },
    es: {
      heroKicker: 'Especialistas en cabello afro y texturizado',
      tagline: 'Conoce tu cabello. Haz tuyo tu look.',
      heroNote: 'Cada foto de esta página es un cliente real. Sin bancos de imágenes ni filtros que sustituyan al oficio, solo dos años de trabajo en la silla en Berlín.',
      btnBook: 'Reservar', scrollCue: 'Desplaza, la hoja',
      s1Kicker: 'La hoja de contactos', s1TitleA: 'Cabezas reales.', s1TitleB: 'Trabajo real.',
      s1Lede: 'Doce tomas de dos años en la silla, cada cabeza con un patrón de crecimiento y textura distintos, cortada a lo que de verdad le va. Pasa el cursor sobre una toma para revelarla.',
      s2Kicker: 'Notas de campo', s2Title: 'Otros solo cortan. Nosotros leemos primero el cabello.',
      s2Lede: 'De lo que hablamos en la silla, lo que decide si un corte realmente aguanta. Es el conocimiento detrás de cada toma de arriba.',
      n1t: 'Densidad y porosidad', n1b: 'El cabello 4C no es una sola cosa. Cuánto crece y cómo toma la hidratación cambia el corte antes de encender la máquina.',
      n2t: 'El agua dura de Berlín', n2b: 'El agua de la ciudad es dura con el cabello texturizado. Te decimos qué le hace al tuyo y cómo sortearlo.',
      n3t: 'Hidratación vs. aceite', n3b: 'La diferencia que la mayoría invierte. El aceite no es hidratación, saberlo es media batalla para un cabello afro sano.',
      n4t: 'Madurez vs. calvicie', n4b: 'Una línea que madura no es una que retrocede. Cortamos donde tu línea está de verdad, no donde el pánico cree que va.',
      mKicker: 'Nota al margen',
      mQuote: 'El mejor corte no es el que está de moda, es el que te queda. La forma de la cabeza, el tipo de cabello y el crecimiento deciden cómo asienta un estilo. Un buen barbero no copia la foto de referencia. La adapta a ti.',
      mSign: 'GROOMS, sobre cómo trabajamos de verdad',
      s3Kicker: 'En la hoja', s3Title: 'Lo que hacemos.',
      svc1n: 'Degradados', svc1d: 'Taper, mid, high, low, burst, limpio hasta la línea.',
      svc2n: 'Perfilados', svc2d: 'Bordes nítidos, nítidos de verdad.',
      svc3n: 'Perfilado y arreglo de barba', svc3d: 'Modelada y cuidada, no solo recortada.',
      svc4n: 'Locs, trenzas y cornrows', svc4d: 'Trabajo en cabello texturizado, por barberos que de verdad se especializan en ello.',
      svcNote: 'Elige un servicio y reserva tu silla online en menos de un minuto.',
      ctaKicker: 'Reservar una silla', ctaTitle: 'Elige tu hora.',
      ctaSub: 'Con base en Berlín. Elige servicio y horario. ¿Prefieres hablar antes? Escríbenos en Instagram.',
      hpKicker: "El Hair Profile, muy pronto",
      hpTitle: "Tu cabello, recordado.",
      hpBody: "Un Hair Profile digital que recuerda tu cabello, su textura, tus cortes, tu rutina, para que cualquier barbero GROOMS continúe justo donde lo dejó el anterior. Grooming consistente y personalizado, vayas donde vayas. Primero en Berlín.",
      hpCta: "Consigue tu invitación",
      hpNote: "Gratis · Plazas limitadas de la primera ola",
      wlKicker: "Acceso anticipado",
      wlTitle: "Sé el primero en la silla.",
      wlBody: "Únete a la lista de espera del Hair Profile y te avisamos en cuanto abra el acceso anticipado en Berlín.",
      wlNameL: "¿Cómo te llamamos?",
      wlNameP: "Nombre o nombre completo",
      wlLocL: "¿Dónde estás?",
      wlLocP: "Ciudad o barrio",
      wlEmailL: "¿A dónde enviamos tu invitación?",
      wlEmailP: "tu@email.com",
      wlSubmit: "Pedir mi invitación",
      wlBack: "Volver",
      findKicker: "Encuéntranos", findTitle: "Dos locales. El mismo barbero.",
      findNote: "Mismos servicios y precios en ambos locales.", findOpen: "Abrir en Maps",
      wlPrivacy: "Solo lo usamos para enviarte tu invitación. Nunca spam.",
      wlSuccessT: "Estás en la lista.",
      wlSuccessB: "Gracias, te escribiremos al correo que nos diste en cuanto abra el acceso anticipado. Atento a tu bandeja.",
      wlClose: "Cerrar"
    },
    it: {
      heroKicker: 'Specialisti di capelli afro e ricci',
      tagline: 'Conosci i tuoi capelli. Fai tuo il tuo look.',
      heroNote: 'Ogni foto di questa pagina è un cliente vero. Niente stock, niente filtri al posto del mestiere, solo due anni di lavoro sulla sedia a Berlino.',
      btnBook: 'Prenota ora', scrollCue: 'Scorri, il provino',
      s1Kicker: 'Il foglio provino', s1TitleA: 'Teste vere.', s1TitleB: 'Lavoro vero.',
      s1Lede: 'Dodici scatti da due anni sulla sedia, ogni testa con una crescita e una texture diverse, tagliata su ciò che le sta davvero. Passa sopra uno scatto per svilupparlo.',
      s2Kicker: 'Appunti', s2Title: 'Gli altri tagliano. Noi prima leggiamo il capello.',
      s2Lede: 'Di cosa parliamo sulla sedia, ciò che decide se un taglio tiene davvero. È il sapere dietro ogni scatto qui sopra.',
      n1t: 'Densità e porosità', n1b: "Il capello 4C non è uno solo. Quanto cresce fitto e come prende l'idratazione cambia il taglio prima ancora del rasoio.",
      n2t: "L'acqua dura di Berlino", n2b: "L'acqua della città è dura con i capelli ricci. Ti diciamo cosa fa ai tuoi e come aggirarla.",
      n3t: 'Idratazione vs. olio', n3b: "La differenza che quasi tutte le routine sbagliano. L'olio non è idratazione, saperlo è metà del lavoro per un capello afro sano.",
      n4t: 'Maturità vs. calvizie', n4b: "Un'attaccatura che matura non è una che arretra. Tagliamo dov'è davvero la tua linea, non dove la paura la crede.",
      mKicker: 'Nota a margine',
      mQuote: 'Il taglio migliore non è quello di tendenza, è quello che sta bene a te. Forma della testa, tipo di capello e crescita decidono come cade uno stile. Un bravo barbiere non copia la foto di riferimento. La adatta a te.',
      mSign: 'GROOMS, su come lavoriamo davvero',
      s3Kicker: 'Sul foglio', s3Title: 'Cosa facciamo.',
      svc1n: 'Sfumature', svc1d: "Taper, mid, high, low, burst, netto fino all'attaccatura.",
      svc2n: 'Contorni', svc2d: 'Bordi netti, tenuti netti.',
      svc3n: 'Contorno e cura della barba', svc3d: 'Modellata e curata, non solo spuntata.',
      svc4n: 'Locs, trecce e cornrows', svc4d: 'Lavoro su capelli ricci, da barbieri che ci sono davvero specializzati.',
      svcNote: 'Scegli un servizio e prenota la tua sedia online in meno di un minuto.',
      ctaKicker: 'Prenota una sedia', ctaTitle: 'Scegli il tuo orario.',
      ctaSub: 'Con base a Berlino. Scegli servizio e orario. Preferisci scriverci prima? Trovaci su Instagram.',
      hpKicker: "Hair Profile, in arrivo",
      hpTitle: "I tuoi capelli, ricordati.",
      hpBody: "Un Hair Profile digitale che ricorda i tuoi capelli, texture, i tuoi tagli, la tua routine, così ogni barbiere GROOMS riparte esattamente da dove ha finito il precedente. Grooming coerente e personalizzato, ovunque tu vada. Prima a Berlino.",
      hpCta: "Ottieni il tuo invito",
      hpNote: "Gratis · Posti limitati della prima ondata",
      wlKicker: "Accesso anticipato",
      wlTitle: "Sii il primo sulla sedia.",
      wlBody: "Iscriviti alla lista d'attesa Hair Profile e ti contattiamo appena apre l'accesso anticipato a Berlino.",
      wlNameL: "Come ti chiamiamo?",
      wlNameP: "Nome o nome completo",
      wlLocL: "Dove ti trovi?",
      wlLocP: "Città o quartiere",
      wlEmailL: "Dove inviamo il tuo invito?",
      wlEmailP: "tu@email.com",
      wlSubmit: "Richiedi il mio invito",
      wlBack: "Indietro",
      findKicker: "Dove siamo", findTitle: "Due sedi. Lo stesso barbiere.",
      findNote: "Stessi servizi e prezzi in entrambe le sedi.", findOpen: "Apri in Maps",
      wlPrivacy: "Lo usiamo solo per inviarti l'invito. Mai spam.",
      wlSuccessT: "Sei in lista.",
      wlSuccessB: "Grazie, ti scriviamo all'email che ci hai dato appena apre l'accesso anticipato. Tieni d'occhio la posta.",
      wlClose: "Chiudi"
    },
    nl: {
      heroKicker: 'Specialisten in afro- en getextureerd haar',
      tagline: 'Ken je haar. Draag je look.',
      heroNote: 'Elke foto op deze pagina is een echte klant. Geen stockbeelden, geen filters in plaats van vakmanschap, gewoon twee jaar werk op de stoel in Berlijn.',
      btnBook: 'Boek nu', scrollCue: 'Scroll, het vel',
      s1Kicker: 'Het contactvel', s1TitleA: 'Echte koppen.', s1TitleB: 'Echt werk.',
      s1Lede: 'Twaalf opnames uit twee jaar op de stoel, elk hoofd een ander groeipatroon en textuur, geknipt naar wat echt past. Beweeg over een opname om hem te ontwikkelen.',
      s2Kicker: 'Veldnotities', s2Title: 'Anderen knippen. Wij lezen eerst het haar.',
      s2Lede: 'Waar we het op de stoel over hebben, wat bepaalt of een coupe echt houdt. Het is de kennis achter elke opname hierboven.',
      n1t: 'Dichtheid & porositeit', n1b: '4C-haar is niet één ding. Hoe dik het groeit en hoe het vocht opneemt bepaalt de knip nog vóór de tondeuse.',
      n2t: 'Berlijns harde water', n2b: 'Het water van de stad is hard voor getextureerd haar. We vertellen je wat het met het jouwe doet en hoe je het omzeilt.',
      n3t: 'Vocht vs. olie', n3b: 'Het verschil dat de meeste routines omdraaien. Olie is geen vocht, dat weten is het halve werk voor gezond afrohaar.',
      n4t: 'Rijpend vs. kalend', n4b: 'Een rijpende haarlijn is geen wijkende. We knippen naar waar je lijn echt zit, niet waar paniek denkt dat hij heen gaat.',
      mKicker: 'Kanttekening',
      mQuote: 'De beste knipbeurt is niet de trendy, het is die bij jou past. Hoofdvorm, haartype en groeipatroon bepalen hoe een stijl zit. Een goede barbier kopieert de referentiefoto niet. Hij past hem aan jou aan.',
      mSign: 'GROOMS, over hoe we echt werken',
      s3Kicker: 'Op het vel', s3Title: 'Wat we doen.',
      svc1n: 'Fades', svc1d: 'Taper, mid, high, low, burst, strak tot de haarlijn geknipt.',
      svc2n: 'Lijnen', svc2d: 'Scherpe randen, scherp gehouden.',
      svc3n: 'Baardlijn & verzorging', svc3d: 'Gevormd en verzorgd, niet alleen bijgeknipt.',
      svc4n: 'Locs, vlechten & cornrows', svc4d: 'Werk met getextureerd haar, door barbiers die er echt in gespecialiseerd zijn.',
      svcNote: 'Kies een service en boek je stoel online in minder dan een minuut.',
      ctaKicker: 'Boek een stoel', ctaTitle: 'Kies je tijd.',
      ctaSub: 'Gevestigd in Berlijn. Kies een service en tijd. Liever eerst chatten? Stuur ons een bericht op Instagram.',
      hpKicker: "Het Hair Profile, binnenkort",
      hpTitle: "Jouw haar, onthouden.",
      hpBody: "Een digitaal Hair Profile dat jouw haar onthoudt, textuur, je coupes, je routine, zodat elke GROOMS-barbier verdergaat precies waar de vorige stopte. Consistente, persoonlijke grooming, waar je ook gaat. Eerst in Berlijn.",
      hpCta: "Claim je early invite",
      hpNote: "Gratis · Beperkte plekken in de eerste golf",
      wlKicker: "Vroege toegang",
      wlTitle: "Wees als eerste in de stoel.",
      wlBody: "Schrijf je in op de Hair Profile-wachtlijst en we nemen contact op zodra de vroege toegang in Berlijn opent.",
      wlNameL: "Hoe mogen we je noemen?",
      wlNameP: "Voornaam of volledige naam",
      wlLocL: "Waar zit je?",
      wlLocP: "Stad of buurt",
      wlEmailL: "Waar sturen we je uitnodiging heen?",
      wlEmailP: "jij@email.com",
      wlSubmit: "Vraag mijn uitnodiging aan",
      wlBack: "Terug",
      findKicker: "Vind ons", findTitle: "Twee locaties. Dezelfde barber.",
      findNote: "Dezelfde diensten en prijzen op beide locaties.", findOpen: "Openen in Maps",
      wlPrivacy: "We gebruiken dit alleen voor je uitnodiging. Nooit spam.",
      wlSuccessT: "Je staat op de lijst.",
      wlSuccessB: "Bedankt, we mailen je op het opgegeven adres zodra de vroege toegang opent. Houd je inbox in de gaten.",
      wlClose: "Sluiten"
    }
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // Always start fresh in light mode + English on every open; the user can switch during the session.
  var state = { theme: 'light', lang: 'en', langOpen: false };
  try { var sl = localStorage.getItem('grooms-lang'); if (sl && DICT[sl]) state.lang = sl; var st = localStorage.getItem('grooms-theme'); if (st === 'dark' || st === 'light') state.theme = st; } catch (e) {}
  try { var sl = localStorage.getItem('grooms-lang'); if (sl && DICT[sl]) state.lang = sl; var st = localStorage.getItem('grooms-theme'); if (st === 'dark' || st === 'light') state.theme = st; } catch (e) {}

  /* ---------- i18n ---------- */
  function applyLang(lang) {
    var t = DICT[lang] ? DICT[lang] : DICT.en;
    $$('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] != null) el.textContent = t[key];
    });
    $$('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (t[key] != null) el.setAttribute('placeholder', t[key]);
    });
    $$('[data-weekdays]').forEach(function (el) {
      var names = el.getAttribute('data-weekdays').split(',').map(function (d) {
        return new Date(Date.UTC(2024, 0, 7 + Number(d))).toLocaleDateString(lang, { weekday: 'long', timeZone: 'UTC' });
      });
      el.textContent = names.join(' · ');
    });
    try { document.documentElement.setAttribute('lang', lang); } catch (e) {}
    var current = LANGS.filter(function (l) { return l.code === lang; })[0] || LANGS[0];
    var label = $('[data-langlabel]');
    if (label) label.textContent = current.label;
  }

  function buildLangMenu(menu, btn) {
    menu.innerHTML = '';
    LANGS.forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'lang-option';
      b.setAttribute('data-code', l.code);
      b.setAttribute('role', 'option');
      b.textContent = l.label;
      if (l.code === state.lang) b.setAttribute('aria-selected', 'true');
      menu.appendChild(b);
    });
    menu.addEventListener('click', function (e) {
      var target = e.target.closest('[data-code]');
      if (!target) return;
      var code = target.getAttribute('data-code');
      if (!DICT[code]) { closeLang(); return; }
      try { localStorage.setItem('grooms-lang', code); } catch (_) {}
      state.lang = code;
      applyLang(code);
      buildLangMenu(menu, btn);
      closeLang();
    });
  }

  function openLang() {
    state.langOpen = true;
    var menu = $('[data-lang-menu]'), btn = $('[data-lang-toggle]');
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
  function closeLang() {
    state.langOpen = false;
    var menu = $('[data-lang-menu]'), btn = $('[data-lang-toggle]');
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  /* ---------- Theme ---------- */
  function applyTheme() {
    try { document.documentElement.setAttribute('data-theme', state.theme); } catch (e) {}
    var btn = $('[data-theme-toggle]');
    if (btn) btn.textContent = state.theme === 'dark' ? '☀' : '☾';
  }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('grooms-theme', state.theme); } catch (e) {}
    applyTheme();
  }

  /* ---------- Waitlist ---------- */
  // The overlay gets its own history entry, so the browser/phone Back button closes it
  // instead of leaving the whole site.
  var wlPushed = false;
  function openWaitlist() {
    var wl = $('[data-waitlist]');
    if (!wl.hidden) return;
    $('[data-waitlist-form]').hidden = false;
    $('[data-waitlist-success]').hidden = true;
    var form = $('[data-waitlist-submit]');
    if (form) form.reset();
    wl.hidden = false;
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    try { history.pushState({ wl: 1 }, ''); wlPushed = true; } catch (e) {}
  }
  function hideWaitlist() {
    var wl = $('[data-waitlist]');
    if (wl) wl.hidden = true;
    wlPushed = false;
    try { document.body.style.overflow = ''; } catch (e) {}
  }
  // Close button / Escape: go back through history so the pushed entry is consumed.
  function closeWaitlist() {
    if (wlPushed && history.state && history.state.wl) { history.back(); return; }
    hideWaitlist();
  }
  function submitWaitlist(e) {
    e.preventDefault();
    var form = e.currentTarget;
    if (form.checkValidity && !form.checkValidity()) { form.reportValidity && form.reportValidity(); return; }
    var payload = { full_name: form.elements.fullname.value, location: form.elements.location.value, email: form.elements.email.value };
    if (form.dataset.busy) return; // ignore duplicate submit events (double-click / double-bound handler)
    form.dataset.busy = '1';
    var btn = form.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
    fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error('fail'); $('[data-waitlist-form]').hidden = true; $('[data-waitlist-success]').hidden = false; })
      .catch(function () { alert('Something went wrong. Please try again.'); })
      .then(function () { if (btn) btn.disabled = false; delete form.dataset.busy; });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = $$('[data-reveal]');
    var show = function (el) { el.classList.add('is-visible'); };
    if (reduce || !('IntersectionObserver' in window)) { targets.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) { show(el); return; }
      io.observe(el);
    });
    setTimeout(function () { targets.forEach(show); }, 2000);
  }

  /* ---------- Hero video crossfade ---------- */
  function initHeroVideo() {
    var SRCS = ['/assets/bg-1.mp4','/assets/bg-2.mp4','/assets/bg-3.mp4','/assets/bg-4.mp4','/assets/bg-5.mp4','/assets/bg-6.mp4','/assets/bg-7.mp4','/assets/bg-8.mp4'];
    var FADE = 0.9; // seconds, matches CSS opacity transition
    var KEY = 'grooms_bg_video';
    var a = document.getElementById('heroVidA');
    var b = document.getElementById('heroVidB');
    var poster = document.getElementById('heroPoster');
    if (!a || !b) return;

    var idx = 0, startTime = 0;
    try {
      var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved && Number.isInteger(saved.i)) { idx = ((saved.i % SRCS.length) + SRCS.length) % SRCS.length; startTime = +saved.t || 0; }
    } catch (e) {}

    [a, b].forEach(function (v) { v.muted = true; v.defaultMuted = true; v.loop = false; v.playsInline = true; });

    var active = a, standby = b;
    var swapping = false;

    var save = function () {
      try { sessionStorage.setItem(KEY, JSON.stringify({ i: idx, t: active.currentTime || 0 })); } catch (e) {}
    };
    var fadePosterOut = function () { if (poster) poster.style.opacity = '0'; };
    var play = function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    var nextIndex = function () { return (idx + 1) % SRCS.length; };
    var prepStandby = function () {
      if (standby.dataset.readySrc !== SRCS[nextIndex()]) {
        standby.src = SRCS[nextIndex()];
        standby.dataset.readySrc = SRCS[nextIndex()];
        standby.load();
      }
    };
    var onTime = function () {
      save();
      var d = active.duration;
      if (!swapping && d && isFinite(d) && d - active.currentTime <= FADE) {
        swapping = true;
        idx = nextIndex();
        standby.currentTime = 0;
        play(standby);
        standby.style.opacity = '1';
        active.style.opacity = '0';
        var finishSwap = function () {
          var old = active;
          active = standby;
          standby = old;
          swapping = false;
          try { standby.pause(); standby.currentTime = 0; } catch (e) {}
          prepStandby();
          save();
        };
        setTimeout(finishSwap, FADE * 1000);
      }
    };

    a.addEventListener('timeupdate', onTime);
    b.addEventListener('timeupdate', onTime);

    active.src = SRCS[idx];
    active.dataset.readySrc = SRCS[idx];
    var begin = function () {
      try { if (startTime > 0 && startTime < (active.duration || Infinity) - 0.2) active.currentTime = startTime; } catch (e) {}
      play(active);
      active.style.opacity = '1';
      fadePosterOut();
      prepStandby();
    };
    active.style.opacity = '1';
    play(active);
    if (active.readyState >= 2) begin();
    else active.addEventListener('loadeddata', begin, { once: true });
    if (active.readyState >= 2) fadePosterOut();
    else active.addEventListener('loadeddata', fadePosterOut, { once: true });

    var onHide = function () { save(); };
    onDoc('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    disposers.push(function () { window.removeEventListener('pagehide', onHide); try { a.pause(); b.pause(); } catch (e) {} });
  }

  /* ---------- Boot ---------- */
  function init() {
    applyTheme();
    var btn = $('[data-lang-toggle]');
    var menu = $('[data-lang-menu]');
    buildLangMenu(menu, btn);
    applyLang(state.lang);


    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (state.langOpen) closeLang(); else openLang();
    });
    $('[data-theme-toggle]').addEventListener('click', toggleTheme);

    onDoc('click', function (e) {
      if (state.langOpen && !(e.target.closest && e.target.closest('[data-langwrap]'))) closeLang();
    });

    $$('[data-open-waitlist]').forEach(function (el) { el.addEventListener('click', openWaitlist); });
    $$('[data-close-waitlist]').forEach(function (el) { el.addEventListener('click', closeWaitlist); });
    $('[data-waitlist-submit]').addEventListener('submit', submitWaitlist);
    onDoc('keydown', function (e) {
      var w = $('[data-waitlist]');
      if (e.key === 'Escape' && w && !w.hidden) closeWaitlist();
    });
    // Browser/phone Back while the overlay is open just closes it.
    var onPop = function () { var w = $('[data-waitlist]'); if (w && !w.hidden) hideWaitlist(); };
    window.addEventListener('popstate', onPop);
    disposers.push(function () { window.removeEventListener('popstate', onPop); });

    initReveal();
    initHeroVideo();
  }

  init();
  return function dispose() { disposers.forEach(function (d) { d(); }); document.body.style.overflow = ''; };
}
