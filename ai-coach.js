// ═══════════════════════════════════════════════════════════════
// AI-COACH.JS — Motivational messages, insights, win texts
// ═══════════════════════════════════════════════════════════════

// Per-habit rotating win messages (5 per habit, scientifically grounded)
window.HABIT_WINS = {
  water: [
    "💧 Ciało ludzkie składa się w ~60% z wody. Właśnie zadbałeś o fundament wszystkiego.",
    "🧠 Nawet 2% odwodnienia obniża koncentrację o 20%. Właśnie temu zapobiegłeś.",
    "⚗️ Szklanka wody na czczo aktywuje metabolizm i wypłukuje toksyny z nocy.",
    "🫀 Serce pracuje wydajniej gdy jest dobrze nawodnione. Właśnie mu pomogłeś.",
    "✅ Nawyk #1 zbudowany. Reszta dnia z górki — dobre ciało, dobry mózg.",
  ],
  reading: [
    "📚 Bill Gates czyta 50 książek rocznie. Elon Musk dorastał czytając po 10h dziennie. Jesteś na tej ścieżce.",
    "🧠 Czytanie przez 6 minut redukuje stres o 68% — skuteczniej niż muzyka czy spacer.",
    "💡 Każdy rozdział to skompresowane lata doświadczeń kogoś mądrzejszego. Złoto.",
    "🔗 Wiedza z książek tworzy sieć połączeń w mózgu. Twoja sieć właśnie urosła.",
    "📖 Statystycznie czytelnicy zarabiają więcej i żyją dłużej. Inwestujesz w siebie.",
  ],
  lang: [
    "🌍 Dwujęzyczność opóźnia demencję średnio o 5 lat. Twój mózg Ci podziękuje za dekady.",
    "🗣️ Znasz 2 języki = otwierasz się na 2x więcej możliwości zawodowych i życiowych.",
    "🧩 Nauka języka aktywuje 5 różnych obszarów mózgu jednocześnie. To trening umysłu premium.",
    "✈️ 20 minut dziennie = poziom konwersacyjny w ~18 miesięcy. Matematyka działa.",
    "💬 Znajomość języka to klucz do kultury, nie tylko komunikacji. Jesteś coraz bliżej.",
  ],
  plan: [
    "🎯 Wieczorne planowanie skraca czas potrzebny do wdrożenia zadań rano o 50%.",
    "⚡ Mózg pracuje przez noc nad problemami które mu podasz wieczorem. Właśnie to zrobiłeś.",
    "📋 Ludzie z jasno zapisanymi priorytetami osiągają cele 42% częściej. Jesteś w tej grupie.",
    "🔭 3 priorytety zamiast 10 zadań = większa skuteczność. Fokus bije ilość zawsze.",
    "✅ Każdy wieczór z planem = mniej stresu rano i więcej kontroli nad własnym życiem.",
  ],
  gratitude: [
    "💛 Neurologia potwierdza: regularna wdzięczność dosłownie zmienia strukturę mózgu na spokojniejszą.",
    "😴 Ludzie praktykujący wdzięczność zasypiają szybciej i śpią głębiej. Sprawdź dziś.",
    "💪 Zwycięstwa dnia zamiast porażek — treninujesz mózg by zauważał postęp, nie deficyt.",
    "🌟 Naukowcy z UC Davis: dziennik wdzięczności przez 10 tygodni = trwałe poczucie szczęścia.",
    "✨ 2 zwycięstwa dziennie = 730 powodów do dumy rocznie. Budujesz coś wielkiego.",
  ],
  money: [
    "📊 Średnio ludzie nie wiedzą gdzie idzie ~30% ich pieniędzy. Ty wiesz. To przewaga.",
    "💸 Świadomość wydatków to krok #1 każdej drogi do wolności finansowej.",
    "📈 Dane nie kłamią. Za miesiąc spojrzysz wstecz i zobaczysz wzorce których nie widzisz teraz.",
    "🎯 Warren Buffett przez dekady notował każdy wydatek. To nawyk miliarderów.",
    "🔍 Kto kontroluje gdzie idą pieniądze, kontroluje swój czas i wolność.",
  ],
  noscreen: [
    "🧘 Instagram i TikTok są zaprojektowane przez setki inżynierów żeby Cię uzależnić. Właśnie wygrałeś z nimi.",
    "⚡ Skupienie bez przerw to waluta XXI wieku. Dziś byłeś bogatszy niż 90% rówieśników.",
    "🧠 Każde powiadomienie podnosi kortyzol (hormon stresu). Dziś go oszczędziłeś.",
    "💪 Samodyscyplina w małym trenuje samodyscyplinę w wielkim. To mięsień.",
    "🔓 Wolność od algorytmów to wolność myślenia. Twoje myśli były dziś Twoje.",
  ],
  ai: [
    "⚡ AI zastąpi zawody — ale nie zastąpi ludzi którzy AI rozumieją i używają. Ty jesteś w tej grupie.",
    "🤖 Każde 30 minut z AI/Tech to budowanie umiejętności o wartości rynkowej rosnącej rok do roku.",
    "🚀 Technologia nie czeka. Właśnie zmniejszyłeś dystans między sobą a przyszłością.",
    "💡 Rozumiesz jak działa narzędzie którego większość ludzi używa jak czarnej skrzynki.",
    "🌐 Jesteś krok przed resztą klasy. Nie zatrzymuj się — ten dystans rośnie z każdą sesją.",
  ],
  finance: [
    "💹 Edukacja finansowa to jedyna inwestycja z gwarantowanym ROI — bo działa zawsze.",
    "📚 Bogatsi ludzie uczą dzieci o pieniądzach. Ty robisz to sam — to jeszcze lepiej.",
    "🏦 Różnica między klasą średnią a bogatymi to wiedza o tym jak pieniądze pracują.",
    "📈 Warren Buffett powiedział: im wcześniej zrozumiesz procent składany, tym lepiej dla Ciebie.",
    "💰 Dziś zainwestowałeś w swój największy zasób — własny umysł. Stopa zwrotu: nieograniczona.",
  ],
  cooking: [
    "👨‍🍳 Gotowanie własnych posiłków redukuje spożycie kalorii średnio o 200 dziennie.",
    "🥗 Wiesz co jesz. W restauracji często nie — oleje, cukry, dodatki. Dziś miałeś kontrolę.",
    "💰 Gotowanie w domu oszczędza średnio 500-1000 zł miesięcznie vs. jedzenie na mieście.",
    "🔥 Umiejętność gotowania to życiowa niezależność. Nikt Ci jej nie odbierze.",
    "🍽️ Posiłek zrobiony własnoręcznie smakuje inaczej — to potwierdzają badania. Smacznego.",
  ],
  review: [
    "🔭 Najlepsi sportowcy na świecie analizują każdy mecz. Właśnie zrobiłeś to samo z tygodniem.",
    "📊 Tydzień bez przeglądu = tydzień bez nauki. Właśnie wycisnąłeś maximum z ostatnich 7 dni.",
    "🧠 Refleksja konwertuje doświadczenia w trwałą wiedzę. Bez niej wszystko przechodzi obok.",
    "🎯 Oceń co działało, co nie — i zmień to. To jedyna definicja progresu.",
    "✨ Właśnie stałeś się mądrzejszą wersją siebie na następny tydzień.",
  ],
};

// Quest win messages (varied)
window.QUEST_WINS = {
  default: [
    "Quest ukończony. Każde małe działanie składa się na coś wielkiego.",
    "Zrobione. Twoja przyszłość Ci dziękuje za ten wybór.",
    "Wykonane. Konsekwencja to supermoc — właśnie ją ćwiczysz.",
    "Zaliczone. Nie wszyscy to robią. Właśnie wyróżniłeś się.",
  ]
};

// Goal win messages
window.GOAL_WINS = [
  "🏆 Cel osiągnięty! Udowodniłeś sobie że możesz — to ważniejsze niż sam cel.",
  "🎯 Zamierzony — wykonany. Twoja wiarygodność wobec siebie właśnie wzrosła.",
  "🌟 Każde ukończone zobowiązanie buduje tożsamość człowieka sukcesu.",
  "💪 Cel zamknięty. Czas wyznaczać nowy — bo właśnie pokazałeś że potrafisz.",
];

// Greeting by hour
window.getGreeting = function() {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return "Dzień dobry";
  if (h >= 10 && h < 13) return "Dobry poranek";
  if (h >= 13 && h < 18) return "Miłego popołudnia";
  if (h >= 18 && h < 22) return "Dobry wieczór";
  return "Pracujesz późno";
};

// Motivational daily insight (changes each day)
window.getDailyInsight = function() {
  const insights = [
    { text: "Motywacja odpala. Dyscyplina jedzie.", author: "Jim Rohn" },
    { text: "Sukces to suma małych wysiłków powtarzanych dzień po dniu.", author: "Robert Collier" },
    { text: "Twoje życie nie poprawia się przez przypadek. Poprawia się przez zmianę.", author: "Jim Rohn" },
    { text: "Inwestuj w siebie. To najlepszy zwrot z inwestycji jaki możesz osiągnąć.", author: "Warren Buffett" },
    { text: "Każdy ekspert był kiedyś kompletnym początkującym.", author: "Helen Hayes" },
    { text: "Nie musisz być świetny żeby zacząć. Ale musisz zacząć żeby być świetnym.", author: "Zig Ziglar" },
    { text: "Dyscyplina to wybieranie między tym czego chcesz teraz a tym czego chcesz najbardziej.", author: "Abraham Lincoln" },
    { text: "Najlepszy czas na zasadzenie drzewa był 20 lat temu. Drugi najlepszy czas to teraz.", author: "Przysłowie chińskie" },
    { text: "Nie porównuj swojego rozdziału 1 z czyimś rozdziałem 20.", author: "Dave Hollis" },
    { text: "Idź powoli, ale nigdy się nie cofaj.", author: "Konfucjusz" },
    { text: "Marzenia nie działają jeśli Ty nie działasz.", author: "John C. Maxwell" },
    { text: "Przyszłość należy do tych którzy wierzą w piękno swoich marzeń.", author: "Eleanor Roosevelt" },
    { text: "Jedyna osoba którą powinieneś próbować być lepszą to ta którą byłeś wczoraj.", author: "Anonimowy" },
    { text: "Ciężka praca bije talent gdy talent nie pracuje ciężko.", author: "Tim Notke" },
  ];
  const day = new Date().getDate() + new Date().getMonth() * 31;
  return insights[day % insights.length];
};

// Get random win for habit
window.getHabitWin = function(habitId) {
  const wins = window.HABIT_WINS[habitId];
  if (!wins || !wins.length) return "Świetna robota! Nawyk zaliczony.";
  return wins[Math.floor(Math.random() * wins.length)];
};

// Get random goal win
window.getGoalWin = function() {
  const w = window.GOAL_WINS;
  return w[Math.floor(Math.random() * w.length)];
};

// AI assistant call
window.callAI = async function(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt || "Jesteś AI asystentem dla ambitnego nastolatka używającego apki do samorozwoju. Mówisz po polsku. Jesteś konkretny, bezpośredni, motywujący — jak starszy brat który wie co robi. Krótkie trafne odpowiedzi (max 3-4 zdania). Nie zaczynasz od 'Oczywiście' ani 'Świetne pytanie'. Używasz nieformalnego, przyjaznego tonu.",
      messages,
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Hmm, coś poszło nie tak.";
};
