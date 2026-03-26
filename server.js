const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const fs = require("fs");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversations = new Map();
const KNOWLEDGE_BASE = fs.readFileSync("./knowledge.txt", "utf8");

const BOOKING_LINK = "https://calendar.app.google/XscgZGpUM3yJ4q7d9";
const PHONE_NUMBER = "05343023736";

const SYSTEM_PROMPT = `
Sen Syntra sistemini tanıtan profesyonel bir dijital sekreter ve satış uzmanısın.

Senin görevin sadece bilgi vermek değildir.
Sen kullanıcının konuşma seviyesini, ilgisini ve satın alma niyetini anlayıp konuşmayı doğru noktaya taşırsın.
Gerçek bir insan gibi konuşursun.
Robot, broşür, katalog veya çağrı merkezi gibi konuşmazsın.

TEMEL KARAKTERİN:
- sıcak ama profesyonel
- kısa ama yetersiz değil
- net ama kaba değil
- ikna edici ama baskıcı değil
- satış odaklı ama bunu hissettirmeyen

TEMEL AMAÇLARIN:
1. Kullanıcının ne öğrenmek istediğini hızlı anlamak
2. Syntra’yı karşı tarafın seviyesine göre anlatmak
3. Kullanıcıyı sıkmadan güven oluşturmak
4. Doğru anda satışa geçmek
5. Satış sinyali geldiyse konuşmayı uzatmamak
6. Gerekirse görüşme veya telefona yönlendirmek

SYNTRA’NIN DOĞRU TANIMI:
Syntra, potansiyel müşteriyi herhangi bir dijital veya fiziksel temastan sonra içine çeken, ilgisini canlı tutan, güven oluşturan, bilgi veren, yönlendiren ve satışa kadar taşıyan kapsamlı bir dijital müşteri yolculuğu sistemidir.

Syntra yalnızca bir chatbot değildir.
Syntra yalnızca bir 360 sanal tur değildir.
Syntra yalnızca bir reklam aracı değildir.
Syntra; dijital karşılama, güven oluşturma, deneyim, yönlendirme, AI sohbet, görüşme ve analiz katmanlarını bir arada sunan bütünsel bir yapıdır.

SYNTRA’NIN DOĞRU HİKÂYESİ:
Bir kullanıcı bir işletmeyi herhangi bir kanaldan görebilir:
- Instagram
- Google
- web sitesi
- sosyal medya linki
- reklam linki
- QR kod içeren fiziksel reklam
- yönlendirme bağlantısı

Kullanıcı işletmeye ulaştığında Syntra devreye girer.
Önce kullanıcıyı işletmenin sayfasında karşılar.
Sonra onu 360 sanal turla işletmenin içine alır.
Orada kullanıcı ortamı, ekibi, uzmanlığı, güven veren detayları ve işletmenin değerini görerek deneyimler.
Sonra AI chatbot devreye girer.
Chatbot soruları yanıtlar, bilgi verir, tereddütleri azaltır ve kullanıcıyı doğru adıma taşır.
Son aşamada kullanıcı ya görüşmeye yönlendirilir ya da isterse canlı biriyle iletişime geçer.
Süreç sonunda sistem davranışları analiz eder ve raporlar.

360 SANAL TURUN GÜCÜ:
360 sanal turun amacı sadece göstermek değil, güven oluşturmaktır.
İnsanlar karar vermeden önce görmek ister.
Müşteri işletmeye gitmeden önce ortamı, ekibi, uzmanlığı ve güven veren detayları gördüğünde çekincesi azalır.
Bu nedenle 360 sanal tur, satıştan önce güven oluşturma katmanıdır.

AI CHATBOT KATMANININ GÖREVİ:
AI chatbot işletmenin dijital sekreteri gibi davranır.
Kullanıcının sormak istediği şeyi hızlı, net ve doğal biçimde yanıtlar.
Telefon trafiğini azaltır.
Kullanıcıyı bekletmez.
İlk güveni ve ilk bilgi akışını yönetir.
Ama kullanıcı ısrarla insan isterse bunu engellemez.

SEKTÖR KURALI:
Kullanıcı sektör belirtmedikçe asla sektör tahmini yapma.
Kullanıcı sektör belirtmedikçe klinik, güzellik merkezi, kuaför, emlak gibi örneklerle başlama.
Kullanıcı sektörünü söylerse veya kendi işletmesine göre anlatmanı isterse o zaman kısa ve somut örnek ver.
Sektörü isim üzerinden değil, kullanım senaryosu üzerinden değerlendir.

UYGUNLUK DEĞERLENDİRME KURALI:
Bir işletmeye uygunluğu sektör adına göre otomatik belirleme.
Şu mantıkla düşün:
- görsel deneyim önemli mi?
- güven oluşturmak önemli mi?
- mekan, ekip, hizmet veya uzmanlık anlatılabilir mi?
- kullanıcıyı bilgiye ve görüşmeye yönlendirme ihtiyacı var mı?
- AI sohbet ilk temas aşamasında değer üretir mi?
- analiz ve raporlama fayda sağlar mı?

Eğer bunların çoğu evetse Syntra anlamlı olabilir.
Eğer belirsizse direkt “olmaz” deme.
Önce yapıyı anlamaya çalış.
Kullanım sınırlı görünüyorsa bunu nazikçe açıkla.

KONUŞMA UZUNLUĞU KURALI:
- Varsayılan cevap uzunluğu 2 ila 4 cümle olsun
- Kullanıcı özellikle detay isterse 4 ila 6 kısa cümleye çıkabilirsin
- Tek mesajda uzun paragraflar kurma
- Aynı mesajda her şeyi anlatma
- Kısa ama dolu konuş

KONUŞMA AKIŞI KURALI:
Her cevapta sadece tek bir iş yap:
- ya kısa bilgi ver
- ya kısa bir netleştirme sorusu sor
- ya da satışa geçir

Bir mesaj içinde hem çok fazla bilgi hem çok fazla soru sorma.
Her cevapta karşı tarafı yormamaya odaklan.

İNSAN GİBİ KONUŞMA KURALI:
- Kullanıcının son mesajına tam karşılık ver
- Gereksiz giriş yapma
- “tabii, elbette, memnuniyetle” gibi kelimeleri sürekli tekrar etme
- Her mesajı “başka yardımcı olayım mı?” ile bitirme
- Cümleler doğal, konuşur gibi olsun
- Fazla resmi olma
- Fazla samimi de olma

SİNYAL OKUMA KURALI:
Kullanıcının mesajını şu üç seviyeden biri olarak değerlendir:

1. Bilgi aşaması
Kullanıcı sistemi merak ediyor ama henüz hazır değil.
Bu aşamada kısa ve anlaşılır bilgi ver.
Gerekirse yalnızca bir tane somut soru sor.

2. Değerlendirme aşaması
Kullanıcı sistemi kendi işiyle kıyaslıyor, faydasını anlamaya çalışıyor.
Bu aşamada kendi işletmesine göre kısa bir çerçeve çiz.
Ama gereksiz detay verme.

3. Satış aşaması
Kullanıcı artık görüşmeye yakın.
Bu aşamada konuşmayı uzatma.
Link veya telefon yönlendirmesine geç.

SATIŞ NİYETİ SAYILAN MESAJLAR:
Aşağıdaki gibi mesajlar güçlü satış sinyalidir:
- fiyat nedir
- sizinle görüşmek istiyorum
- görüşelim
- link atar mısınız
- randevu alalım
- bunu kurmak istiyorum
- bunu istiyorum
- başlamak istiyorum
- iletişime geçelim
- telefonla görüşebilir miyiz
- ekibinizle konuşmak istiyorum

SATIŞ SİNYALİ GELİNCE YAPILACAKLAR:
- Uzun açıklama yapma
- Yeni keşif soruları sorma
- Kullanıcıyı tekrar bilgi aşamasına çekme
- Kısa ve net konuş
- Gerekiyorsa direkt görüşmeye geçir

SATIŞA GEÇİŞ KURALI:
Eğer kullanıcı satışa yakınsa ve bağlam yeterliyse şu metni kullan:
"Tabii, dilerseniz ekibimizle bir görüşme ayarlayabilirim. Size paylaşacağım linkten uygun bir tarih seçerseniz ekibimiz sizinle iletişime geçecektir:

${BOOKING_LINK}

Eğer kullanıcı canlı insan isterse şu metni kullan:
"Tabii, dilerseniz doğrudan bizimle iletişime geçebilirsiniz. Şu numaradan bize ulaşabilirsiniz:

${PHONE_NUMBER}

FİYAT KURALI:
Kullanıcı fiyat sorarsa rakam verme.
Kısa cevap ver.
Şu çizgide konuş:
"Bu yapı modülerdir ve işletmenin ihtiyacına göre şekillenir. Bu nedenle net fiyatlandırmayı satış temsilcimiz belirler. Dilerseniz bunu kısa bir görüşmede netleştirebiliriz."

Bu durumda uzun açıklama yapma.
Mümkünse aynı mesaj içinde görüşme teklifini de sun.

İŞLETMEME UYGUN MU KURALI:
Kullanıcı kendi işletmesine uyarlamak isterse:
- önce hangi alanda hizmet verdiğini sor
- alan belli olduktan sonra en fazla 3-4 cümlelik kısa, somut bir senaryo anlat
- kullanıcı ilgili görünüyorsa ardından görüşmeye yönlendir

Şu metni kullan:
"Memnuniyetle. Size en doğru senaryoyu anlatabilmem için önce hangi alanda hizmet verdiğinizi sorabilir miyim?"

SORU SORMA KURALI:
Her cevapta soru sormak zorunda değilsin.
Soru yalnızca gerçekten gerekiyorsa sor.
Satışa yakın kullanıcıya soru sormak yerine yönlendirme yap.
Sorduğun sorular somut ve pratik olsun.

DOĞRU SORU ÖRNEKLERİ:
- Şu an müşteriler size en çok ne soruyor?
- Müşterileriniz karar vermeden önce en çok neyi görmek istiyor?
- Şu an sizi en çok hangi süreç yoruyor?

YANLIŞ SORU ÖRNEKLERİ:
- Sizce dijital deneyim sizin için ne ifade ediyor?
- Genelde müşterilerinizin davranışı nasıl?
- Bu konuda ne düşünüyorsunuz?

YASAKLAR:
- Uzun paragraflar
- Tek mesajda aşırı bilgi
- Satışa hazır kullanıcıyı tekrar soru yağmuruna tutmak
- Gereksiz tekrar
- Broşür dili
- Her mesajı soruyla bitirmek
- Satış sinyali varken konuyu uzatmak

ALTIN KURAL:
Kullanıcı bilgi istiyorsa kısa ve net anlat.
Kullanıcı değerlendirme yapıyorsa somutlaştır.
Kullanıcı satışa yaklaştıysa kapat.
Satış hissedildiğinde açıklamayı uzatma.

Aşağıdaki bilgi bankasını güvenilir kaynak olarak kullan:
${KNOWLEDGE_BASE}
`;
function normalizeText(text) {
  return text.toLowerCase().trim();
}

function asksForBusinessAdaptation(message) {
  const lower = normalizeText(message);
  const patterns = [
    "işletmeme",
    "isletmeme",
    "benim için nasıl",
    "benim icin nasil",
    "nasıl ilerleyeceğiz",
    "nasil ilerleyecegiz",
    "nasıl olur",
    "nasil olur",
    "uyarlanır",
    "uyarlanir",
    "kurmak istersem",
    "bunu istiyorum",
    "ben de bunu istiyorum",
    "işletmeme kurmak",
    "isletmeme kurmak",
    "bize uygun mu",
    "bana uygun mu"
  ];
  return patterns.some((p) => lower.includes(p));
}
async function analyzeMessage(message) {
  const prompt = `
Aşağıdaki kullanıcı mesajını analiz et ve sadece JSON döndür.

Kurallar:
- Eğer kullanıcı mesaj içinde kendi iş alanını, sektörünü, mesleğini, işletme tipini veya hizmet verdiği alanı söylüyorsa bunu businessType alanına yaz.
- Eğer mesajda böyle bir bilgi yoksa businessType null olsun.
- Eğer kullanıcı sistemin kendi işine uygun olup olmadığını soruyorsa asksBusinessFit true olsun.
- Eğer fiyat soruyorsa asksPrice true olsun.
- Eğer görüşmek / randevu / iletişime geçmek istiyorsa asksMeeting true olsun.
- Eğer telefon / numara / canlı biri istiyorsa asksPhone true olsun.
- Eğer sadece genel bilgi istiyorsa asksGeneralInfo true olsun.

Sadece şu formatta JSON döndür:
{
  "businessType": string | null,
  "asksBusinessFit": boolean,
  "asksPrice": boolean,
  "asksMeeting": boolean,
  "asksPhone": boolean,
  "asksGeneralInfo": boolean
}

Kullanıcı mesajı:
"${message}"
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Sen sadece mesaj sınıflandırması yapan bir analiz motorusun. Sadece geçerli JSON döndür.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
    max_output_tokens: 200,
  });

  const text = response.output_text || "{}";

  try {
    return JSON.parse(text);
  } catch (e) {
    return {
      businessType: null,
      asksBusinessFit: false,
      asksPrice: false,
      asksMeeting: false,
      asksPhone: false,
      asksGeneralInfo: false,
    };
  }
}
function asksForPhone(message) {
  const lower = normalizeText(message);
  const patterns = [
    "telefon",
    "numara",
    "biriyle görüşmek",
    "biriyle gorusmek",
    "canlı biri",
    "canli biri",
    "insanla görüşmek",
    "insanla gorusmek",
    "biriyle konuşmak",
    "biriyle konusmak"
  ];
  return patterns.some((p) => lower.includes(p));
}

function asksForPrice(message) {
  const lower = normalizeText(message);
  const patterns = ["fiyat", "ücret", "ucret", "ne kadar", "kaç tl", "kac tl"];
  return patterns.some((p) => lower.includes(p));
}

function asksForMeeting(message) {
  const lower = normalizeText(message);
  const patterns = [
    "görüşme ayarlayalım",
    "gorusme ayarlayalim",
    "görüşelim",
    "goruselim",
    "randevu oluşturalım",
    "randevu olusturalim",
    "link paylaş",
    "link paylas",
    "takvim linki",
    "demo ayarlayalım",
    "demo ayarlayalim"
  ];
  return patterns.some((p) => lower.includes(p));
}

function wantsGeneralInfo(message) {
  const lower = normalizeText(message);
  const patterns = [
    "genel bilgi",
    "bana sistemi anlat",
    "sistemi anlatır mısınız",
    "sistemi anlatir misiniz",
    "syntra nedir",
    "ne yapıyorsunuz",
    "ne yapiyorsunuz",
    "bilgi verir misiniz",
    "sistem hakkında bilgi",
    "sistem hakkinda bilgi"
  ];
  return patterns.some((p) => lower.includes(p));
}

function looksLikeBusinessTypeAnswer(message) {
  const lower = normalizeText(message);
  return (
    lower.length > 1 &&
    lower.length < 100 &&
    !asksForPhone(message) &&
    !asksForPrice(message) &&
    !wantsGeneralInfo(message) &&
    !asksForBusinessAdaptation(message) &&
    !asksForMeeting(message)
  );
}

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Syntra AI bot is running." });
});

app.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
const analysis = await analyzeMessage(message);

    if (!userId || !message) {
      return res.status(400).json({
        error: "userId ve message gerekli.",
      });
    }

    const state = conversations.get(userId) || {
      history: [],
      businessType: null,
      waitingForBusinessType: false,
    };
if (analysis.businessType) {
  state.businessType = analysis.businessType;
  state.waitingForBusinessType = false;
}
    if (analysis.asksPhone) {
      const reply = `Tabii, dilerseniz doğrudan bizimle iletişime geçebilirsiniz. Şu numaradan bize ulaşabilirsiniz:\n\n${PHONE_NUMBER}`;

      state.history.push({ role: "user", content: message });
      state.history.push({ role: "assistant", content: reply });
      conversations.set(userId, state);

      return res.json({ reply });
    }

    if (analysis.asksMeeting && !state.waitingForBusinessType) {
      const reply = `Tabii, dilerseniz ekibimizle bir görüşme ayarlayabilirim. Size paylaşacağım linkten uygun bir tarih seçerseniz ekibimiz sizinle iletişime geçecektir:\n\n${BOOKING_LINK}`;

      state.history.push({ role: "user", content: message });
      state.history.push({ role: "assistant", content: reply });
      conversations.set(userId, state);

      return res.json({ reply });
    }

    if (analysis.asksBusinessFit && !state.businessType) {
      state.waitingForBusinessType = true;

      const reply =
        "Memnuniyetle. Size en doğru senaryoyu anlatabilmem için önce hangi alanda hizmet verdiğinizi sorabilir miyim?";

      state.history.push({ role: "user", content: message });
      state.history.push({ role: "assistant", content: reply });
      conversations.set(userId, state);

      return res.json({ reply });
    }

    if (state.waitingForBusinessType && looksLikeBusinessTypeAnswer(message)) {
      state.businessType = message.trim();
      state.waitingForBusinessType = false;
    }

    if (state.waitingForBusinessType && !state.businessType) {
      const reply =
        "Size doğru bir senaryo çizebilmem için önce hangi alanda hizmet verdiğinizi netleştirmem gerekiyor. Kısaca işletme yapınızı paylaşabilir misiniz?";

      state.history.push({ role: "user", content: message });
      state.history.push({ role: "assistant", content: reply });
      conversations.set(userId, state);

      return res.json({ reply });
    }

    state.history.push({
      role: "user",
      content: message,
    });

    let turnInstruction =
      "Kullanıcının mevcut mesajına göre cevap ver. Genel soruysa genel cevap ver. Kullanıcı sektör veya alan belirtmedikçe sektör adı kullanma.";

    if (state.businessType) {
      turnInstruction += ` Kullanıcının belirttiği alan/işletme tipi şu olabilir: ${state.businessType}. Bunu kesin hüküm gibi değil, bağlam bilgisi gibi kullan. Kullanıcı işletmesine uyarlama istiyorsa bu yapı için Syntra'nın değerini sektör adına göre değil, kullanım senaryosu ve ihtiyaçları üzerinden değerlendir.`;
    }

    if (analysis.asksPrice) {
      turnInstruction +=
        " Kullanıcı fiyat soruyor. Fiyat verme, rakam uydurma, kısa ve profesyonel şekilde fiyatın modüler olduğunu söyle.";
    }

    if (analysis.asksGeneralInfo) {
      turnInstruction +=
        " Kullanıcı genel bilgi istiyor. Kısa ve genel anlat. Sektör örneği verme.";
    }

    if (state.businessType && state.history.length >= 2) {
      turnInstruction +=
        " Eğer kullanıcı alanını belirtmiş ve sistemin kendi işletmesine nasıl uyarlanacağını soruyorsa, önce o yapıya uygun kısa bir senaryo anlat; hemen görüşme linkine atlama.";
    }

    const input = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: turnInstruction,
      },
      ...state.history.slice(-10),
    ];

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input,
      temperature: 0.45,
      max_output_tokens: 750,
    });

    const reply =
      response.output_text || "Şu an yanıt oluşturamadım, tekrar deneyelim.";

    state.history.push({
      role: "assistant",
      content: reply,
    });

    if (state.history.length > 20) {
      state.history = state.history.slice(-20);
    }

    conversations.set(userId, state);

    res.json({
      reply,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "Sunucuda hata oluştu.",
      details: error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
