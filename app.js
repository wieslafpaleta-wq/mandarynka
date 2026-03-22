// ═══════════════════════════════════════════
// CHAMPION APP — Main Logic
// Orange/Gold theme, toggle habits, history
// ═══════════════════════════════════════════

// ── SOUND ENGINE ──────────────────────────
var SFX = (function() {
  var ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function play(freq, type, dur, vol, delay) {
    vol = vol || 0.14; delay = delay || 0;
    try {
      var c = getCtx();
      var o = c.createOscillator();
      var g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + dur);
    } catch(e) {}
  }
  return {
    habit: function() {
      play(523,'sine',0.20,0.35);
      play(659,'sine',0.18,0.28,0.06);
      play(784,'sine',0.22,0.22,0.13);
    },
    quest: function() {
      [330,415,523,659,784].forEach(function(f,i){ play(f,'triangle',0.18,0.10,i*0.07); });
    },
    goal: function() {
      [392,523,659,784,1047].forEach(function(f,i){ play(f,'sine',0.22,0.11,i*0.08); });
    },
    tap: function() { play(880,'sine',0.06,0.07); },
    perfect: function() {
      [523,587,659,784,880,1047].forEach(function(f,i){ play(f,'sine',0.22,0.09,i*0.09); });
    }
  };
})();

// ── CONSTANTS ─────────────────────────────
var DAYS_PL    = ["Niedziela","Poniedziałek","Wtorek","Środa","Czwartek","Piątek","Sobota"];
var DAYS_SHORT = ["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];
var MONTHS_PL  = ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia"];

var ALL_QUESTS = [
  // ── ODKRYWANIE LUDZI I BIOGRAFII ──
  {id:"q1",  label:"Zbadaj biografię osoby którą podziwiasz — znajdź 3 rzeczy których nie wiedziałeś", xp:20, win:"Biografie to skrócone podręczniki życia. Właśnie przeżyłeś czyjeś doświadczenia w 30 minut."},
  {id:"q2",  label:"Dowiedz się skąd pochodzi założyciel Twojej ulubionej firmy i jak zaczynał", xp:20, win:"Każde imperium zaczynało się w garażu lub sypialni. Teraz wiesz od czego."},
  {id:"q3",  label:"Znajdź wywiad z kimś kogo podziwiasz i zapisz 3 rzeczy których Cię nauczył", xp:25, win:"Wywiad to mentoring za darmo. Właśnie z niego skorzystałeś."},
  {id:"q4",  label:"Przeczytaj o dzieciństwie jednej wybitnej osoby — jak wyglądało ich życie zanim stali się sławni", xp:20, win:"Nikt nie rodził się na szczycie. To krzepiące i motywujące jednocześnie."},
  {id:"q5",  label:"Dowiedz się kto jest najbogatszym człowiekiem w Polsce i co zbudował", xp:15, win:"Znajomość lokalnych historii sukcesu daje bardziej realistyczny wzorzec niż Elon Musk."},
  {id:"q6",  label:"Zbadaj historię życia kogoś kto zaczynał od zera i zbudował coś wielkiego", xp:25, win:"Zero do bohatera to nie mit — to powtarzający się wzorzec w historii."},
  {id:"q7",  label:"Przeczytaj o błędzie który popełnił ktoś sławny i jak sobie z nim poradził", xp:20, win:"Odporność psychiczna wielkich ludzi to ich prawdziwy sekret. Właśnie go poznajesz."},
  {id:"q8",  label:"Znajdź osobę która mówi Twoim językiem obcym jako ojczystym i dowiedz się czegoś o jej życiu", xp:20, win:"Język to okno na konkretnego człowieka, nie tylko na kraj."},

  // ── UPADKI FIRM I LEKCJE BIZNESOWE ──
  {id:"q9",  label:"Zbadaj dlaczego Nokia straciła rynek telefonów — co poszło nie tak?", xp:25, win:"Nokia miała wszystko i straciła wszystko przez arogancję. Lekcja warta miliardy."},
  {id:"q10", label:"Dowiedz się dlaczego Blockbuster odrzucił ofertę kupna Netflixa za 50 mln dolarów", xp:25, win:"Blockbuster mógł być Netflixem. Nie był. Wiesz już dlaczego branże umierają."},
  {id:"q11", label:"Zbadaj upadek Kodaka — firmy która wynalazła aparat cyfrowy, ale go ukryła", xp:25, win:"Kodak bał się własnego wynalazku. Innowacja wewnątrz firmy bywa trudniejsza niż z zewnątrz."},
  {id:"q12", label:"Przeczytaj o upadku Enronu — największym oszustwie korporacyjnym w historii USA", xp:30, win:"Enron to lekcja o tym jak kultura firmy może stać się bronią masowego rażenia."},
  {id:"q13", label:"Dowiedz się dlaczego MySpace przegrał z Facebookiem mimo że był pierwszy", xp:20, win:"Bycie pierwszym nie wystarczy. Liczy się kto słucha użytkowników. Facebook słuchał."},
  {id:"q14", label:"Zbadaj historię upadku jednej polskiej firmy którą kiedyś znałeś", xp:20, win:"Lokalne przykłady uczą więcej niż case studies z Harvardu. Masz teraz własny."},
  {id:"q15", label:"Dowiedz się czym był kryzys finansowy 2008 roku i kto na nim zarobił", xp:30, win:"2008 zmienił świat. Kto rozumie co się stało, rozumie jak działa naprawdę kapitalizm."},
  {id:"q16", label:"Zbadaj dlaczego Yahoo odrzuciło ofertę kupna od Microsoftu za 44 miliardy dolarów", xp:25, win:"44 miliardy odrzucone. Yahoo warte dziś ułamek. Decyzje mają konsekwencje dekadami."},

  // ── KULTURA I JĘZYK OBCY ──
  {id:"q17", label:"Dowiedz się o 3 zupełnie różnych tradycjach z kraju którego języka się uczysz", xp:20, win:"Tradycje to skompresowana historia narodu. Teraz rozumiesz więcej niż słowa."},
  {id:"q18", label:"Zbadaj co jest absolutnie kultowe w kulturze popularnej kraju Twojego języka obcego", xp:15, win:"Kultura popularna to najszybszy klucz do serca każdego języka."},
  {id:"q19", label:"Dowiedz się jak wygląda typowy dzień licealisty w kraju którego języka się uczysz", xp:20, win:"Codzienność innych kultur obala stereotypy i otwiera głowę."},
  {id:"q20", label:"Znajdź 5 słów w Twoim języku obcym które nie mają odpowiednika po polsku", xp:25, win:"Każde takie słowo to inny sposób myślenia o rzeczywistości. Język kształtuje umysł."},
  {id:"q21", label:"Przeczytaj o historii kraju którego języka się uczysz — 1 ważne wydarzenie którego nie znałeś", xp:20, win:"Historia narodu to klucz do zrozumienia dlaczego ludzie tam są jacy są."},
  {id:"q22", label:"Dowiedz się jak działa system podatkowy lub emerytalny w kraju Twojego języka obcego", xp:20, win:"Finanse publiczne różnych krajów to okno na ich wartości i priorytety."},
  {id:"q23", label:"Zbadaj co jedzą na śniadanie w kraju którego języka się uczysz i dlaczego", xp:15, win:"Jedzenie to najgłębsza kultura. Dowiedziałeś się czegoś czego nie ma w podręczniku."},
  {id:"q24", label:"Znajdź muzyka lub artystę z kraju Twojego języka obcego i dowiedz się o nim więcej", xp:15, win:"Muzyka łączy język z emocjami. To najszybsza droga do prawdziwej płynności."},

  // ── TECHNOLOGIA OD WEWNĄTRZ ──
  {id:"q25", label:"Dowiedz się jak naprawdę działa algorytm TikToka — co decyduje co widzisz", xp:25, win:"Rozumiesz maszynę która Cię wciągała. Teraz jesteś przed nią, nie za nią."},
  {id:"q26", label:"Zbadaj jak Google zarabia pieniądze — jaki jest ich prawdziwy produkt", xp:20, win:"Jeśli coś jest darmowe, produktem jesteś Ty. Teraz wiesz co to znaczy w praktyce."},
  {id:"q27", label:"Dowiedz się czym jest open source i znajdź 3 narzędzia których używasz a nie wiedziałeś że są open source", xp:20, win:"Open source to jeden z najpiękniejszych wynalazków w historii technologii."},
  {id:"q28", label:"Zbadaj jak powstał internet — od ARPANET do dzisiaj w 10 minutach", xp:20, win:"Internet zaczynał jako projekt militarny. Historia technologii jest zawsze zaskakująca."},
  {id:"q29", label:"Dowiedz się co to jest Moore's Law i dlaczego przestaje działać", xp:20, win:"Moore's Law napędzał 50 lat postępu. To co teraz będzie je zastępować — to Twoja era."},
  {id:"q30", label:"Zbadaj jak działa GPS — satelity, sygnały, dokładność", xp:15, win:"Używasz GPS kilkadziesiąt razy dziennie. Teraz wiesz jak to działa od środka."},
  {id:"q31", label:"Dowiedz się czym jest blockchain i znajdź 1 zastosowanie inne niż kryptowaluty", xp:20, win:"Blockchain to technologia szukająca problemu. Właśnie znalazłeś jeden."},
  {id:"q32", label:"Zbadaj historię pierwszego iPhone'a — jak Steve Jobs zmienił branżę w 1 prezentacji", xp:20, win:"Prezentacja z 2007 roku to studium storytellingu i wizji. Obejrzyj ją kiedyś."},
  {id:"q33", label:"Dowiedz się czym jest quantum computing i co zmieni w ciągu 20 lat", xp:25, win:"Komputery kwantowe złamią dzisiejsze szyfrowanie. To nie sci-fi — to plan na 2030."},
  {id:"q34", label:"Napisz skrypt w Pythonie który robi cokolwiek — choćby wyświetla Twoje imię 10 razy", xp:35, win:"Pierwsza linijka kodu to granica której większość ludzi nie przekroczy. Ty ją właśnie przekroczyłeś."},
  {id:"q35", label:"Zbadaj jak działa szyfrowanie end-to-end w WhatsApp — prościej niż myślisz", xp:20, win:"Twoje wiadomości są szyfrowane matematyką której rozłożenie zajęłoby miliardy lat. Nieźle."},

  // ── FINANSE I PSYCHOLOGIA PIENIĘDZY ──
  {id:"q36", label:"Dowiedz się czym jest 'lifestyle inflation' i jak niszczy bogactwo nawet wysokich zarobków", xp:20, win:"Zarabiasz więcej, wydajesz więcej. To pułapka w której tkwi 90% ludzi. Ty ją widzisz."},
  {id:"q37", label:"Zbadaj historię Warrena Buffetta — jak zaczął inwestować i ile miał lat", xp:20, win:"Buffett kupił pierwszą akcję w wieku 11 lat. Twój czas nie minął. Właśnie się zaczął."},
  {id:"q38", label:"Dowiedz się co to jest 'efekt IKEA' — dlaczego cenimy bardziej to co sami zrobiliśmy", xp:15, win:"Psychologia wartości jest wszędzie. Teraz widzisz ją w tym co kupujesz i jak się czujesz."},
  {id:"q39", label:"Zbadaj jak działa marketing strachu i pilności — FOMO, countdown timers, 'ostatnie sztuki'", xp:20, win:"Widzisz teraz manipulacje których wcześniej nie dostrzegałeś. To immunitet na wydawanie."},
  {id:"q40", label:"Dowiedz się czym jest 'opportunity cost' — ukryty koszt każdej decyzji finansowej", xp:20, win:"Każda złotówka którą wydajesz to złotówka która nie pracuje. Teraz to czujesz."},
  {id:"q41", label:"Zbadaj dlaczego lotto to podatek na nieumiejętność liczenia prawdopodobieństwa", xp:15, win:"Szansa wygranej w Lotto to 1 do 14 milionów. Teraz rozumiesz jak działa nadzieja na skróty."},
  {id:"q42", label:"Dowiedz się co to jest 'dollar cost averaging' i jak stosuje to zwykły inwestor", xp:25, win:"Regularność pokonuje timing. To jedna z najważniejszych strategii inwestycyjnych. Prosta jak cegła."},
  {id:"q43", label:"Zbadaj jak Amazon budował przez lata bez zysku i dlaczego Bezos miał rację", xp:25, win:"Amazon był bez zysku przez dekadę. Długoterminowe myślenie to rzadka supermoc."},
  {id:"q44", label:"Dowiedz się co to jest 'sunk cost fallacy' i znajdź przykład z własnego życia", xp:20, win:"Wrzucasz pieniądze w coś złego bo już tyle włożyłeś? Właśnie to przestaniesz robić."},
  {id:"q45", label:"Zbadaj historię kryptowaluty Bitcoin — kto ją stworzył i dlaczego do dziś nie wiemy", xp:25, win:"Satoshi Nakamoto to największa tajemnica technologiczna XXI wieku. I jeden z najbogatszych."},

  // ── PSYCHOLOGIA I DZIAŁANIE UMYSŁU ──
  {id:"q46", label:"Dowiedz się czym jest 'growth mindset' wg Carol Dweck i jak zmienia wyniki w nauce", xp:20, win:"Jedno badanie zmieniło podejście do edukacji na świecie. Teraz masz je w głowie."},
  {id:"q47", label:"Zbadaj czym jest 'deep work' wg Cal Newporta — i dlaczego jest rzadkością", xp:20, win:"Głęboka praca to supermoc epoki rozproszenia. Rozumiesz teraz dlaczego tak trudno Ci się skupić."},
  {id:"q48", label:"Dowiedz się co mówi nauka o prokrastynacji — to nie lenistwo, to regulacja emocji", xp:20, win:"Prokrastynacja to unikanie dyskomfortu, nie zadania. Właśnie dostałeś klucz do walki z nią."},
  {id:"q49", label:"Zbadaj jak działa dopamina i dlaczego powiadomienia są zaprojektowane żeby Cię uzależnić", xp:25, win:"Twój mózg produkuje dopaminę w oczekiwaniu nagrody, nie przy jej otrzymaniu. To zmienia wszystko."},
  {id:"q50", label:"Dowiedz się co to jest 'confirmation bias' — dlaczego szukamy informacji które potwierdzają to co już wiemy", xp:20, win:"Każdy ma tę słabość. Kto ją zna, może ją kontrolować. Teraz Ty możesz."},
  {id:"q51", label:"Zbadaj czym jest efekt placebo i jak silny jest naprawdę — przykłady z badań", xp:20, win:"Przekonanie zmienia biologię. To nie metafora — to udokumentowana medycyna."},
  {id:"q52", label:"Dowiedz się o eksperymencie Stanford ze Stanfordzkimi Więzieniami i co mówi o ludzkim zachowaniu", xp:25, win:"Władza zmienia ludzi szybciej niż myślimy. To jedna z najbardziej niepokojących lekcji psychologii."},
  {id:"q53", label:"Zbadaj czym jest 'imposter syndrome' — i sprawdź czy go masz", xp:20, win:"70% ludzi sukcesu odczuwa imposter syndrome. Nie jesteś sam. I to nie jest prawda o Tobie."},
  {id:"q54", label:"Dowiedz się co to jest 'second-order thinking' — jak myślą inwestorzy i strategowie", xp:25, win:"Większość myśli: co się stanie. Nieliczni: co się stanie po tym co się stanie. Teraz Ty też."},

  // ── HISTORIA KTÓRA ZMIENIA PERSPEKTYWĘ ──
  {id:"q55", label:"Zbadaj historię powstania internetu — jak 3 zdania wysłane w 1969 roku zmieniły świat", xp:20, win:"Pierwszy message wysłany przez internet brzmiał 'LO' bo system się zawiesił po 2 literach. Tyle wystarczyło."},
  {id:"q56", label:"Dowiedz się czym była rewolucja przemysłowa i jak zmieniła codzienne życie zwykłych ludzi", xp:20, win:"Żyjemy w erze porównywalnej do rewolucji przemysłowej. To co robimy teraz będą studiować za 100 lat."},
  {id:"q57", label:"Zbadaj historię szczepionek — kto je wynalazł i jak uratowały miliardy ludzi", xp:20, win:"Edward Jenner wstrzyknął 8-latkowi chorobę krowią w 1796. Brak etyki komitetu. I zmienił historię."},
  {id:"q58", label:"Dowiedz się co to był Projekt Manhattan i jakie miał etyczne konsekwencje", xp:25, win:"Naukowcy stworzyli broń i przestraszyli się jej skutków. To najważniejszy dylemat etyczny nauki."},
  {id:"q59", label:"Zbadaj jak Japonia odbudowała się po II Wojnie Światowej i stała się drugą gospodarką świata", xp:25, win:"Z ruin do potęgi w 30 lat. Japonia pokazała że kultura i determinacja zmieniają wszystko."},
  {id:"q60", label:"Dowiedz się o upadku Związku Radzieckiego — co się naprawdę stało i dlaczego tak szybko", xp:25, win:"Imperium rozpadło się w ciągu miesięcy. Systemy wydające się wieczne mogą zniknąć z dnia na dzień."},
  {id:"q61", label:"Zbadaj historię Nikoli Tesli — geniusz który umarł w biedzie mimo że zmienił świat", xp:20, win:"Tesla vs Edison to historia wizji vs biznesu. Geniusz bez strategii finansowej przegrywa."},
  {id:"q62", label:"Dowiedz się jak powstał YouTube — od garażu do 2 miliardów użytkowników w 15 lat", xp:20, win:"YouTube startował jako portal randkowy. Pomysły zmieniają się pod wpływem użytkowników. Zawsze."},

  // ── ŚWIAT I GLOBALNE PERSPEKTYWY ──
  {id:"q63", label:"Zbadaj kraj z innego kontynentu którego prawie nic nie wiesz — 3 zaskakujące fakty", xp:15, win:"Świat jest większy i ciekawszy niż go sobie wyobrażamy. Właśnie się o tym przekonałeś."},
  {id:"q64", label:"Dowiedz się jak wygląda system edukacji w Finlandii i dlaczego jest uważany za najlepszy", xp:20, win:"Finlandia nie ma prac domowych ani rankingów. I ma najlepiej wykształconych ludzi. Zastanów się."},
  {id:"q65", label:"Zbadaj czym jest Singapore i jak zostało jednym z najbogatszych krajów świata w 50 lat", xp:25, win:"Singapur nie miał zasobów, wody ani ziemi. Miał tylko jedną rzecz: właściwą politykę i determinację."},
  {id:"q66", label:"Dowiedz się jak działa gospodarka Niemiec — dlaczego Mittelstand to sekret ich sukcesu", xp:20, win:"Gospodarka Niemiec opiera się na małych firmach rodzinnych, nie gigantach. To zaskakuje wszystkich."},
  {id:"q67", label:"Zbadaj co to jest 'brain drain' i dlaczego Polska traci talenty do Zachodu", xp:20, win:"Emigracja mózgów to problem który dotyczy Ciebie bezpośrednio — jako potencjalnego talentu lub pracodawcy."},
  {id:"q68", label:"Dowiedz się jak Chiny zbudowały gospodarkę od jednej z najuboższych do drugiej na świecie w 40 lat", xp:25, win:"Najszybszy wzrost w historii ludzkości. Niezależnie od polityki — to jest studium z ekonomii."},

  // ── KREATYWNOŚĆ I PROJEKTY ──
  {id:"q69", label:"Wymyśl produkt lub usługę która rozwiązuje problem który sam widzisz każdego dnia", xp:25, win:"Najlepsze startupy rozwiązują problemy założycieli. Właśnie siebie sprawdziłeś jako founder."},
  {id:"q70", label:"Zbadaj jak Airbnb i Uber zbudowały biznesy bez własnych aktywów — model platform", xp:25, win:"Airbnb nie ma hoteli, Uber nie ma samochodów. Platforma to najpotężniejszy model biznesowy XXI w."},
  {id:"q71", label:"Stwórz swój 'media diet' — oceń skąd czerpiesz informacje i czy to dobre źródła", xp:20, win:"Garbage in, garbage out. Jakość informacji które konsumujesz kształtuje jakość Twojego myślenia."},
  {id:"q72", label:"Nagraj 60-sekundowe video wyjaśniające coś czego się ostatnio nauczyłeś", xp:25, win:"Feynman mówił: jeśli nie możesz wyjaśnić prosto, nie rozumiesz. Właśnie to sprawdziłeś."},
  {id:"q73", label:"Napisz 1-stronicowe streszczenie ostatniej książki którą czytałeś własnymi słowami", xp:20, win:"Streszczenie własnymi słowami to najtwardszy test rozumienia. Zdałeś go."},
  {id:"q74", label:"Zbadaj jak Pixar tworzy filmy — ich proces kreatywny i kultura 'braintrust'", xp:20, win:"Pixar stworzył kulturę gdzie każdy może krytykować każdego. I dzięki temu robi arcydzieła."},
  {id:"q75", label:"Napisz list do założyciela firmy lub twórcy treści których śledzisz — nawet jeśli go nie wyślesz", xp:20, win:"Pisanie listu wymaga konkretności. Właśnie odkryłeś co naprawdę cenisz w tej osobie."},

  // ── FILOZOFIA I ŻYCIE ──
  {id:"q76", label:"Dowiedz się czym jest stoicyzm i znajdź 1 zasadę którą możesz zastosować dziś", xp:20, win:"Stoicyzm przetrwał 2000 lat bo działa. Marcus Aurelius rządził imperium tymi zasadami."},
  {id:"q77", label:"Zbadaj czym jest 'memento mori' — jak świadomość śmierci zmienia podejście do życia", xp:25, win:"Starożytni Rzymianie mieli sługę który szeptał 'pamiętaj że umrzesz' w czasie triumfów. Dobry pomysł."},
  {id:"q78", label:"Dowiedz się o koncepcji ikigai — japońskim połączeniu pasji, misji, zawodu i powołania", xp:20, win:"Ikigai to odpowiedź na pytanie 'po co wstaję rano'. Wiesz już gdzie szukać swojego."},
  {id:"q79", label:"Zbadaj czym jest 'via negativa' — jak usuwanie złego jest często ważniejsze niż dodawanie dobrego", xp:20, win:"Zamiast dodawać nawyki — usuń co Ci przeszkadza. To prostsze i skuteczniejsze."},
  {id:"q80", label:"Dowiedz się o koncepcji 'skin in the game' Nassima Taleba — kto ryzykuje własną skórą?", xp:25, win:"Kto nie ryzykuje własnym, nie powinien decydować o cudzym. Zasada która zmienia jak oceniasz rady."},
  {id:"q81", label:"Zbadaj czym jest 'inversion thinking' — rozwiązywanie problemów od końca, jak Munger", xp:20, win:"Charlie Munger mówił: powiedz mi gdzie umrę, a tam nie pójdę. Odwracanie problemów działa."},
  {id:"q82", label:"Dowiedz się o koncepcji 'antifragility' — co rośnie pod wpływem stresu zamiast łamać się", xp:25, win:"Kości wzmacniają się pod obciążeniem. Ludzie sukcesu też. Teraz masz dla tego słowo."},

  // ── SAMOPOZNANIE I WYZWANIA ──
  {id:"q83", label:"Napisz list do siebie za 5 lat — co chcesz żeby tamten Ty o Tobie wiedział", xp:30, win:"Rozmawiasz z przyszłą wersją siebie. Ona czyta to dziś z dumą albo ze wstydem. Ty decydujesz."},
  {id:"q84", label:"Zbadaj teorię 'five regrets of the dying' — czego żałują umierający ludzie", xp:25, win:"Bronnie Ware spędziła lata przy umierających. Żaden nie żałował że za mało pracował."},
  {id:"q85", label:"Stwórz swój 'user manual' — dokument jak najlepiej z Tobą pracować i co Cię motywuje", xp:30, win:"Samoświadomość to fundament. Właśnie stworzyłeś najważniejszy dokument o sobie."},
  {id:"q86", label:"Zbadaj czym jest 'deliberate practice' wg Andersa Ericssona — jak naprawdę się mistrzostwo", xp:25, win:"10 000 godzin to mit. Ericsson mówił o 10 000 godzinach ukierunkowanego, bolesnego treningu. Inna sprawa."},
  {id:"q87", label:"Poproś kogoś o szczerą krytyczną opinię o jednej Twojej cesze i przyjmij ją bez defensywności", xp:40, win:"Feedback to najszybsza pętla uczenia się. Odwaga jego przyjęcia jest rzadka. Masz ją."},
  {id:"q88", label:"Zacznij projekt który odkładałeś — cokolwiek, choć 15 minut", xp:60, win:"Gotowość nie przychodzi przed działaniem. Przychodzi w jego trakcie. Właśnie to odkryłeś."},
  {id:"q89", label:"Znajdź coś w co wierzysz mocno i zbadaj najsilniejszy kontrargument przeciwko temu", xp:35, win:"Stalowe przekonania to takie które przetrwały najlepsze kontrargumenty. Sprawdziłeś swoje."},
  {id:"q90", label:"Dowiedz się o 'asymmetric upside' — dlaczego warto próbować rzeczy gdzie możesz dużo zyskać a mało stracić", xp:25, win:"Opcjonalność to jeden z najważniejszych konceptów w budowaniu życia. Właśnie go rozumiesz."},

  // ── OSTATNIE 10 — GŁĘBSZE QUESTY ──
  {id:"q91", label:"Zbadaj historię powstania firmy którą codziennie używasz i była blisko bankructwa", xp:25, win:"Apple było 90 dni od bankructwa w 1997. Disney zbankrutował kilka razy. Wytrwanie to strategia."},
  {id:"q92", label:"Dowiedz się o 'butterfly effect' — jak małe decyzje zmieniają historię świata", xp:20, win:"Arcyksiążę Franciszek Ferdynand przeżyłby zamach gdyby jego kierowca skręcił w lewo. I nie byłoby WWI."},
  {id:"q93", label:"Zbadaj czym jest 'Overton window' — jak zmienia się to co społeczeństwo uważa za normalne", xp:25, win:"Rzeczy niemożliwe stają się normalne. Geje, kobiety głosujące, smartfony. Kto rozumie Overton — rozumie zmiany."},
  {id:"q94", label:"Dowiedz się jak działa propaganda i znajdź 3 techniki które są używane dziś w mediach", xp:30, win:"Odporność na manipulację zaczyna się od jej rozpoznania. Właśnie zacząłeś ją budować."},
  {id:"q95", label:"Zbadaj historię SpaceX — jak Elon Musk prawie stracił wszystko trzy razy w 6 lat", xp:25, win:"Falcon 1 eksplodował 3 razy. Przy czwartym starcie weszło na orbitę. Trwanie ma cenę i nagrodę."},
  {id:"q96", label:"Dowiedz się czym jest 'compounding knowledge' — jak wiedza rośnie jak odsetki gdy łączy się dziedziny", xp:25, win:"Charlie Munger czyta 5 godzin dziennie i łączy biologie z ekonomią z psychologią. To jego sekret."},
  {id:"q97", label:"Zbadaj jak TED Talks stało się globalnym zjawiskiem — i przeczytaj o jednym prelegencie z którego możesz się nauczyć", xp:20, win:"TED zaczął od 18 minut. Format zmuszający do esencji. Wiedza bez lania wody."},
  {id:"q98", label:"Dowiedz się co to jest 'Pareto principle' i znajdź gdzie 20% Twoich działań daje 80% wyników", xp:20, win:"20% spraw tworzy 80% wartości. Które 20% to Twoje? To najważniejsze pytanie produktywności."},
  {id:"q99", label:"Zbadaj historię Elon Muska przed Teslą i SpaceX — co robił i skąd ma pieniądze", xp:20, win:"Musk zarobił pierwsze miliony na Zip2 i PayPal. Potem postawił wszystko na Mars. To nie jest szczęście."},
  {id:"q100",label:"Stwórz swoje osobiste 'manifesto' — 10 zasad według których chcesz żyć i podejmować decyzje", xp:50, win:"Zasady to decyzje podjęte z wyprzedzeniem. Nie musisz już myśleć w trudnych momentach — masz kodeks."},
];


var HABITS = [
  {id:"water",    emoji:"💧", label:"Szklanka wody",        desc:"500ml po przebudzeniu",              days:[0,1,2,3,4,5,6], xp:10,  color:"#00d4ff"},
  {id:"reading",  emoji:"📖", label:"Czytanie książki",      desc:"1 rozdział",                         days:[0,1,2,3,4,5,6], xp:15,  color:"#a78bfa"},
  {id:"lang",     emoji:"🌍", label:"Nauka języka",          desc:"20 minut dziennie",                  days:[0,1,2,3,4,5,6], xp:20,  color:"#34d399"},
  {id:"plan",     emoji:"📝", label:"Wieczorne planowanie",  desc:"3 priorytety na jutro",              days:[0,1,2,3,4,5,6], xp:15,  color:"#fbbf24"},
  {id:"gratitude",emoji:"✨", label:"Wdzięczność",           desc:"5 rzeczy + 2 zwycięstwa dnia",       days:[0,1,2,3,4,5,6], xp:15,  color:"#f59e0b"},
  {id:"money",    emoji:"💰", label:"Zapisanie wydatków",    desc:"Zapisuj po każdej zapłacie",         days:[0,1,2,3,4,5,6], xp:10,  color:"#10b981"},
  {id:"noscreen", emoji:"🚫", label:"Bez scrollowania",      desc:"Nie wyłączaj blokady",               days:[0,1,2,3,4,5,6], xp:25,  color:"#f87171"},
  {id:"ai",       emoji:"🤖", label:"AI / Technologie",      desc:"30 min · Pn, Pt, Sob",               days:[1,5,6],         xp:20,  color:"#22d3ee"},
  {id:"finance",  emoji:"📊", label:"Finanse i Biznes",      desc:"30 min · Czw, Sob",                  days:[4,6],           xp:20,  color:"#fbbf24"},
  {id:"cooking",  emoji:"🍳", label:"Gotowanie posiłku",     desc:"Piątek · Niedziela",                 days:[5,0],           xp:15,  color:"#fb923c"},
  {id:"review",   emoji:"🔍", label:"Przegląd tygodnia",     desc:"Tylko Niedziela",                    days:[0],             xp:30,  color:"#c084fc"},
];

var LEVELS = [
  {lvl:1,  name:"Nowicjusz",   icon:"🌱", xp:0,    desc:"Pierwszy krok w podróży."},
  {lvl:2,  name:"Uczeń",       icon:"📚", xp:120,  desc:"Zaczynasz dostrzegać wzorce."},
  {lvl:3,  name:"Praktykant",  icon:"⚡", xp:240,  desc:"Masz fundamenty. Czas budować."},
  {lvl:4,  name:"Adept",       icon:"🔥", xp:360,  desc:"Dyscyplina stała się nawykiem."},
  {lvl:5,  name:"Wojownik",    icon:"⚔️", xp:480,  desc:"Nie poddajesz się gdy ciężko."},
  {lvl:6,  name:"Mistrz",      icon:"🛡️", xp:600,  desc:"Nawyki działają bez motywacji."},
  {lvl:7,  name:"Ekspert",     icon:"🎯", xp:720,  desc:"Inni pytają Cię o radę."},
  {lvl:8,  name:"Lider",       icon:"👑", xp:840,  desc:"Inspirujesz innych."},
  {lvl:9,  name:"Wizjoner",    icon:"🌟", xp:960,  desc:"Widzisz dalej niż inni."},
  {lvl:10, name:"Legenda",     icon:"🏆", xp:1080, desc:"Osiągnąłeś coś rzadkiego."},
];

var BADGES = [
  {id:"b1",  e:"🌱", name:"Pierwszy krok",    desc:"Odznacz pierwszy nawyk",        cond:function(s){return s.habitsTotal>=1;}},
  {id:"b2",  e:"🔥", name:"Tydzień z rzędu",  desc:"7 dni streaka",                 cond:function(s){return s.maxStreak>=7;}},
  {id:"b3",  e:"💎", name:"Perfekcjonista",    desc:"Idealny dzień",                 cond:function(s){return s.perfectDays>=1;}},
  {id:"b4",  e:"⚡", name:"500 XP",           desc:"Zdobądź 500 XP",               cond:function(s){return s.xp>=500;}},
  {id:"b5",  e:"🏆", name:"1000 XP",          desc:"Zdobądź 1000 XP",              cond:function(s){return s.xp>=1000;}},
  {id:"b6",  e:"🗡️", name:"Łowca questów",    desc:"10 questów",                    cond:function(s){return s.questsDone>=10;}},
  {id:"b7",  e:"🎯", name:"Ambitny",           desc:"5 celów",                       cond:function(s){return s.goalsCompleted>=5;}},
  {id:"b8",  e:"💰", name:"Kontroler",         desc:"20 wydatków",                   cond:function(s){return s.expensesCount>=20;}},
  {id:"b9",  e:"🌟", name:"Quest Hunter 50",   desc:"50 questów",                    cond:function(s){return s.questsDone>=50;}},
  {id:"b10", e:"👑", name:"Legenda 2000 XP",   desc:"2000 XP",                       cond:function(s){return s.xp>=2000;}},
  {id:"b11", e:"📚", name:"Czytelnik",         desc:"20 rozdziałów",                 cond:function(s){return s.chaptersRead>=20;}},
  {id:"b12", e:"🍳", name:"Kucharz",           desc:"10 posiłków",                   cond:function(s){return s.mealsCooked>=10;}},
  {id:"b13", e:"🌊", name:"Hydro Champion",    desc:"Woda 14 razy",                  cond:function(s){return s.waterCount>=14;}},
  {id:"b14", e:"🗣️", name:"Poliglota",         desc:"Język 30 razy",                 cond:function(s){return s.langCount>=30;}},
  {id:"b15", e:"🧘", name:"Detoks Mistrz",     desc:"Bez scrollowania 7 razy",       cond:function(s){return s.noscreenCount>=7;}},
  {id:"b16", e:"🔭", name:"Strateg",           desc:"4 przeglądy tygodnia",          cond:function(s){return s.weeklyReviews>=4;}},
  {id:"b17", e:"💹", name:"Finansista",        desc:"Finanse 10 razy",               cond:function(s){return s.financeCount>=10;}},
  {id:"b18", e:"🤖", name:"Tech Master",       desc:"AI/Tech 15 razy",               cond:function(s){return s.aiCount>=15;}},
  {id:"b19", e:"📝", name:"Planista",          desc:"Planowanie 21 razy",            cond:function(s){return s.planCount>=21;}},
  {id:"b20", e:"💫", name:"Wdzięczny",         desc:"Wdzięczność 30 razy",           cond:function(s){return s.gratitudeCount>=30;}},
];

var GOAL_CATS = ["🎯 Cel główny","🔥 Priorytet","📚 Nauka","💪 Zdrowie","💰 Finanse","🚀 Projekt","🤝 Relacje","✈️ Podróże","🧘 Rozwój","🎮 Hobby","👨‍👩‍👧 Rodzina"];
var DEFAULT_EXP_CATS = ["🍕 Jedzenie","🎮 Rozrywka","📚 Nauka","👕 Ubrania","🚌 Transport","💊 Zdrowie","☕ Kawiarnia","🎁 Inne"];

// ── STATE ─────────────────────────────────
var S = {
  xp: 0, completed: [], streaks: {}, streakDates: {},
  goals: [], todos: [], doneQuests: [], expenses: [],
  customExpCats: [], habitNotes: {}, weekHistory: {},
  currentQuest: null, weekSel: new Date().getDay(),
  lastDate: new Date().toDateString(),
  stats: {
    maxStreak:0, perfectDays:0, habitsTotal:0, questsDone:0,
    goalsCompleted:0, goalsAdded:0, expensesCount:0,
    chaptersRead:0, mealsCooked:0, waterCount:0, langCount:0,
    noscreenCount:0, weeklyReviews:0, financeCount:0, aiCount:0,
    planCount:0, gratitudeCount:0,
  },
};

var todayIdx = new Date().getDay();
function getTodayHabits() { return HABITS.filter(function(h){ return h.days.indexOf(todayIdx) >= 0; }); }
function xpToLvl(xp) { return Math.min(Math.floor(xp/120), 9); }
function xpInLvl(xp) { return xp % 120; }
function getLevelObj(xp) { return LEVELS[xpToLvl(xp)]; }
function dateKey(d) {
  // Use local date to avoid UTC timezone shifting dates by 1 day
  var dt = d ? new Date(d) : new Date();
  if (isNaN(dt.getTime())) dt = new Date();
  var y = dt.getFullYear();
  var m = String(dt.getMonth() + 1).padStart(2, '0');
  var day = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
function todayKey() { return dateKey(); }
function yesterdayKey() {
  var d = new Date(); d.setDate(d.getDate() - 1); return dateKey(d);
}

// ── PERSIST ───────────────────────────────
function saveState() {
  try { localStorage.setItem('championState', JSON.stringify(S)); } catch(e) {}
}
function archiveDay(dateStr, completedIds) {
  if (!S.weekHistory) S.weekHistory = {};
  var dk = dateKey(dateStr);
  var dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return;
  var dow = dt.getDay();
  var scheduled = HABITS.filter(function(h){ return h.days.indexOf(dow) >= 0; });
  if (!scheduled.length) return;
  S.weekHistory[dk] = { _notes: {} };
  scheduled.forEach(function(h) {
    S.weekHistory[dk][h.id] = completedIds.indexOf(h.id) >= 0;
    // Archive the current note for this habit
    if (S.habitNotes && S.habitNotes[h.id]) {
      S.weekHistory[dk]._notes[h.id] = S.habitNotes[h.id];
    }
  });
  var keys = Object.keys(S.weekHistory).sort();
  if (keys.length > 60) keys.slice(0, keys.length - 60).forEach(function(k){ delete S.weekHistory[k]; });
}
function loadState() {
  try {
    var saved = localStorage.getItem('championState');
    if (saved) {
      var parsed = JSON.parse(saved);
      var todayStr = new Date().toDateString();
      if (parsed.lastDate !== todayStr) {
        // Archive yesterday before resetting
        if (parsed.lastDate) archiveDay(parsed.lastDate, parsed.completed || []);
        // Break streaks for habits scheduled yesterday but not done
        var yest = new Date(); yest.setDate(yest.getDate() - 1);
        var yDow = new Date(parsed.lastDate || todayStr).getDay();
        var yKey = dateKey(new Date(parsed.lastDate || todayStr));
        HABITS.forEach(function(h) {
          if (h.days.indexOf(yDow) >= 0) {
            var wasDone = parsed.streakDates && parsed.streakDates[h.id] === yKey;
            if (!wasDone) {
              if (!parsed.streaks) parsed.streaks = {};
              parsed.streaks[h.id] = 0;
              if (parsed.streakDates) delete parsed.streakDates[h.id];
            }
          }
        });
        parsed.completed = [];
        parsed.lastDate = todayStr;
      }
      S = Object.assign({}, S, parsed);
      if (!S.weekHistory)   S.weekHistory = {};
      if (!S.todos)         S.todos = [];
      if (!S.habitNotes)    S.habitNotes = {};
      if (!S.streakDates)   S.streakDates = {};
      if (!S.customExpCats) S.customExpCats = [];
    }
  } catch(e) { console.warn('loadState error:', e); }
  S.lastDate = new Date().toDateString();
}

// ── EFFECTS ───────────────────────────────
function showWin(msg, color) {
  var el = document.getElementById("win-toast");
  el.textContent = msg;
  el.style.color = color || "var(--g2)";
  el.style.borderColor = color ? color + "66" : "rgba(255,106,0,0.45)";
  el.className = "";
  void el.offsetWidth;
  el.classList.add("show");
  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function() {
    el.classList.add("hide");
    setTimeout(function(){ el.className = ""; }, 400);
  }, 5000);
}
function spawnBurst(x, y, color, count) {
  color = color || "#ff6a00"; count = count || 14;
  var cont = document.getElementById("burst-container");
  for (var i = 0; i < count; i++) {
    var angle = (360/count)*i + Math.random()*10;
    var dist  = 40 + Math.random()*50;
    var px = Math.cos(angle*Math.PI/180)*dist;
    var py = Math.sin(angle*Math.PI/180)*dist;
    var el = document.createElement("div");
    el.className = "particle";
    el.style.cssText = "left:"+x+"px;top:"+y+"px;background:"+(i%3===0?"#fff":color)+";--px:"+px+"px;--py:"+py+"px;animation-delay:"+(i*0.025)+"s;";
    cont.appendChild(el);
    setTimeout(function(e){ return function(){ e.remove(); }; }(el), 900);
  }
}
function spawnXpFloat(xpVal, x, y) {
  var cont = document.getElementById("xp-floats");
  var el = document.createElement("div");
  el.className = "xp-float";
  el.style.left = (x-24)+"px";
  el.style.top  = (y-20)+"px";
  el.textContent = "+"+xpVal+" XP";
  cont.appendChild(el);
  setTimeout(function(){ el.remove(); }, 1300);
}

// ── TABS ──────────────────────────────────
var currentTab = "today";
window.switchTab = function(tab) {
  document.querySelectorAll(".tab-content").forEach(function(el){ el.classList.remove("active"); });
  document.querySelectorAll(".nav-btn").forEach(function(el){ el.classList.remove("active"); });
  var tc = document.getElementById("tab-"+tab);
  if (tc) tc.classList.add("active");
  var btn = document.querySelector('[data-tab="'+tab+'"]');
  if (btn) btn.classList.add("active");
  currentTab = tab;
  renderTab(tab);
};
function renderTab(tab) {
  if (tab === "today")   renderToday();
  if (tab === "week")    renderWeek();
  if (tab === "quests")  renderQuests();
  if (tab === "goals")   renderGoals();
  if (tab === "finance") renderFinance();
  if (tab === "cooking") renderCooking();
  if (tab === "history") renderHistory();
  if (tab === "level")   renderLevel();
}

// ── BAR HTML ──────────────────────────────
function barHTML(val, max, color, h) {
  color = color || "var(--g)"; h = h || 8;
  var pct = max === 0 ? 0 : Math.min((val/max)*100, 100);
  return '<div class="bar-wrap" style="height:'+h+'px"><div class="bar-fill" style="width:'+pct+'%;background:linear-gradient(90deg,'+color+','+color+'bb);box-shadow:0 0 8px '+color+'88;"></div></div>';
}

// ── HEADER ────────────────────────────────
function renderHeader() {
  var el = document.getElementById("header-card");
  if (!el) return;
  var lv   = getLevelObj(S.xp);
  var inLv = xpInLvl(S.xp);
  var th   = getTodayHabits();
  var done = S.completed.filter(function(id){ return th.find(function(h){ return h.id===id; }); }).length;
  var pct  = th.length > 0 ? Math.round((done/th.length)*100) : 0;
  var allDone = th.length > 0 && done === th.length;

  var html = '<div style="display:flex;align-items:center;gap:10px;">';
  html += '<div style="flex:1;min-width:0;">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">';
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span style="font-size:19px;font-weight:900;color:'+(allDone?"var(--gold)":"var(--g)")+';font-family:var(--mono);">'+pct+'%</span>';
  html += '<span style="font-size:11px;color:var(--mut);">dziś · <b style="color:var(--txt);">'+done+'/'+th.length+'</b></span>';
  html += '</div>';
  html += '<div style="display:flex;align-items:center;gap:5px;">';
  html += '<span style="font-size:13px;">'+lv.icon+'</span>';
  html += '<span style="font-size:11px;font-weight:700;color:var(--txt);">'+lv.name+'</span>';
  html += '<span style="font-size:10px;color:var(--mut);font-family:var(--mono);">'+inLv+'/120xp</span>';
  html += '</div></div>';
  html += '<div style="display:flex;gap:4px;align-items:center;">';
  html += '<div style="flex:2;height:6px;background:rgba(255,106,0,0.12);border-radius:3px;overflow:hidden;border:1px solid rgba(255,106,0,0.18);">';
  html += '<div style="width:'+Math.min((done/(th.length||1))*100,100)+'%;height:100%;background:linear-gradient(90deg,var(--g),var(--g2));border-radius:3px;box-shadow:0 0 8px var(--g);transition:width 0.5s;"></div></div>';
  html += '<span style="font-size:9px;color:var(--mut);">XP</span>';
  html += '<div style="flex:1;height:6px;background:rgba(255,215,0,0.12);border-radius:3px;overflow:hidden;border:1px solid rgba(255,215,0,0.18);">';
  html += '<div style="width:'+Math.min((inLv/120)*100,100)+'%;height:100%;background:var(--gold);border-radius:3px;box-shadow:0 0 6px rgba(255,215,0,0.5);transition:width 0.5s;"></div></div>';
  html += '</div></div>';
  if (allDone) html += '<div style="font-size:20px;" class="float-anim">🏆</div>';
  html += '</div>';
  if (allDone) html += '<div style="text-align:center;font-size:10px;font-weight:800;color:var(--gold);margin-top:5px;letter-spacing:2px;" class="neon-pulse">✦ IDEALNY DZIEŃ · +50 XP ✦</div>';

  el.innerHTML = html;
}

// ── TODAY ─────────────────────────────────
function renderToday() {
  var daily   = HABITS.filter(function(h){ return h.days.length === 7; });
  var special = HABITS.filter(function(h){ return h.days.length < 7 && h.days.indexOf(todayIdx) >= 0; });

  var html = '<div class="fade-up">';

  var now = new Date();
  html += '<div style="padding:4px 0 16px;">';
  html += '<div style="font-size:22px;font-weight:900;background:linear-gradient(135deg,#ff6a00,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Champion ⚡</div>';
  html += '<div style="font-size:12px;color:var(--mut);margin-top:2px;">'+DAYS_PL[now.getDay()]+' · '+now.getDate()+' '+MONTHS_PL[now.getMonth()]+'</div>';
  html += '</div>';

  if (daily.length) {
    html += '<div class="slabel">Codzienne</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">';
    daily.forEach(function(h){ html += habitCardHTML(h); });
    html += '</div>';
  }
  if (special.length) {
    html += '<div class="slabel" style="color:var(--g2);">Dzisiaj dodatkowo</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    special.forEach(function(h){ html += habitCardHTML(h); });
    html += '</div>';
  }
  html += '</div>';
  document.getElementById("tab-today").innerHTML = html;
}

function habitCardHTML(h) {
  var done   = S.completed.indexOf(h.id) >= 0;
  var streak = S.streaks[h.id] || 0;
  var note   = (S.habitNotes && S.habitNotes[h.id]) || "";
  var sf     = streak >= 7 ? "animation:streakFire 1s ease infinite;" : "";

  var html = '<div class="habit-card'+(done?' done':'')+'" style="--habit-color:'+h.color+'" onclick="toggleHabit(\''+h.id+'\',event)">';

  // Sliding fill background
  html += '<div class="habit-fill"></div>';

  // Emoji box
  html += '<div class="habit-left"><span class="habit-emoji">'+h.emoji+'</span></div>';

  // Content
  html += '<div class="habit-mid">';
  html += '<div class="habit-label">'+h.label+'</div>';
  html += '<div class="habit-desc">'+h.desc+'</div>';
  if (streak > 0) html += '<div class="habit-streak"><span style="'+sf+'">🔥</span> '+streak+' '+(streak===1?'dzień':'dni')+' z rzędu</div>';
  if (note) html += '<div style="font-size:10px;color:var(--mut);margin-top:3px;font-style:italic;border-left:2px solid '+h.color+'55;padding-left:6px;">'+note+'</div>';
  html += '<div class="habit-xp">+'+h.xp+'xp</div>';
  html += '</div>';

  // Right: slider + note button
  html += '<div class="habit-right">';
  html += '<div class="habit-slider"></div>';
  html += '<button onclick="openHabitNote(\''+h.id+'\',event)" style="font-size:11px;background:none;border:none;color:'+(note?'var(--g2)':'var(--mut)')+';cursor:pointer;padding:0;" title="Notatka">✏️</button>';
  html += '</div>';

  html += '</div>';
  return html;
}

// ── TOGGLE HABIT ──────────────────────────
window.toggleHabit = function(id, event) {
  var habit = HABITS.find(function(h){ return h.id === id; });
  if (!habit) return;
  var isDone = S.completed.indexOf(id) >= 0;
  var rect = event && event.currentTarget ? event.currentTarget.getBoundingClientRect() : {left:100,top:100,width:100,height:50};
  var cx = rect.left + rect.width/2;
  var cy = rect.top  + rect.height/2;

  if (!isDone) {
    S.completed.push(id);
    S.xp += habit.xp;

    // Real streak — consecutive days
    var tKey = todayKey();
    var lastKey  = S.streakDates[id];
    if (!lastKey) {
      S.streaks[id] = 1;
    } else {
      var yKey2 = yesterdayKey();
      if (lastKey === yKey2) {
        S.streaks[id] = (S.streaks[id] || 0) + 1;
      } else if (lastKey === tKey) {
        // already counted today
      } else {
        S.streaks[id] = 1; // broken
      }
    }
    S.streakDates[id] = tKey;

    S.stats.habitsTotal++;
    S.stats.maxStreak = Math.max(S.stats.maxStreak, S.streaks[id] || 0);
    if (id === "reading")   S.stats.chaptersRead++;
    if (id === "cooking")   S.stats.mealsCooked++;
    if (id === "water")     S.stats.waterCount++;
    if (id === "lang")      S.stats.langCount++;
    if (id === "noscreen")  S.stats.noscreenCount++;
    if (id === "review")    S.stats.weeklyReviews++;
    if (id === "finance")   S.stats.financeCount++;
    if (id === "ai")        S.stats.aiCount++;
    if (id === "plan")      S.stats.planCount++;
    if (id === "gratitude") S.stats.gratitudeCount++;

    var th = getTodayHabits();
    var nowD = S.completed.filter(function(x){ return th.find(function(h){ return h.id===x; }); }).length;
    if (nowD === th.length && th.length > 0) {
      S.xp += 50; S.stats.perfectDays++;
      setTimeout(function(){ SFX.perfect(); }, 300);
    }

    spawnBurst(cx, cy, habit.color);
    spawnXpFloat(habit.xp, cx, cy);
    var win = window.getHabitWin ? window.getHabitWin(id) : "Nawyk zaliczony!";
    SFX.habit();
    showWin(win, habit.color);
  } else {
    S.completed = S.completed.filter(function(x){ return x !== id; });
    S.xp = Math.max(0, S.xp - habit.xp);
  }
  saveState();
  renderHeader();
  renderToday();
};

// ── HABIT NOTES ───────────────────────────
window.openHabitNote = function(id, e) {
  if (e) e.stopPropagation();
  var habit = HABITS.find(function(h){ return h.id === id; });
  if (!habit) return;
  var note = (S.habitNotes && S.habitNotes[id]) || "";

  var existing = document.getElementById("habit-note-modal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "habit-note-modal";
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.78);z-index:9999;display:flex;align-items:flex-end;justify-content:center;padding:16px;";

  var inner = document.createElement("div");
  inner.style.cssText = "background:var(--bg2);border:1px solid var(--bord);border-radius:20px 20px 16px 16px;padding:20px;width:100%;max-width:480px;";
  inner.innerHTML = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;"><span style="font-size:20px;">'+habit.emoji+'</span><div style="flex:1;font-size:14px;font-weight:700;color:var(--txt);">'+habit.label+'</div><button id="hn-close" style="font-size:22px;color:var(--mut);background:none;border:none;cursor:pointer;">×</button></div><textarea id="hn-ta" rows="4" style="width:100%;background:var(--bg3);border:1.5px solid var(--bord);border-radius:12px;color:var(--txt);font-family:var(--font);font-size:13px;padding:12px;resize:none;outline:none;line-height:1.5;" placeholder="Zapisz przemyślenia, obserwacje...">'+note+'</textarea><div style="display:flex;gap:8px;margin-top:12px;"><button id="hn-cancel" style="flex:1;padding:11px;background:var(--bg3);border:1px solid var(--bord);border-radius:12px;color:var(--mut);font-size:13px;font-weight:600;cursor:pointer;">Anuluj</button><button id="hn-save" style="flex:2;padding:11px;background:var(--g);border:none;border-radius:12px;color:#000;font-size:13px;font-weight:800;cursor:pointer;">💾 Zapisz</button></div>';

  modal.appendChild(inner);
  document.body.appendChild(modal);

  setTimeout(function(){
    var ta = document.getElementById("hn-ta");
    if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
  }, 50);

  document.getElementById("hn-close").onclick = function(){ modal.remove(); };
  document.getElementById("hn-cancel").onclick = function(){ modal.remove(); };
  document.getElementById("hn-save").onclick = function() {
    var ta = document.getElementById("hn-ta");
    if (!ta) return;
    if (!S.habitNotes) S.habitNotes = {};
    S.habitNotes[id] = ta.value.trim();
    saveState(); modal.remove(); renderToday(); SFX.tap();
  };
  modal.onclick = function(ev){ if (ev.target === modal) modal.remove(); };
};

// ── WEEK ──────────────────────────────────
function renderWeek() {
  var sel = S.weekSel;
  var daySel = '<div class="scroll-x" style="margin-bottom:20px;">';
  DAYS_SHORT.forEach(function(d, i) {
    var isToday = i === todayIdx, isSel = i === sel;
    var dh = HABITS.filter(function(h){ return h.days.indexOf(i) >= 0; });
    var doneCt = (i === todayIdx) ? S.completed.filter(function(id){ return dh.find(function(h){ return h.id===id; }); }).length : null;
    var bord = isSel ? "var(--g)" : "var(--bord)";
    var bg   = isSel ? "rgba(255,106,0,0.08)" : "var(--card)";
    var col  = isSel ? "var(--g)" : isToday ? "var(--g2)" : "var(--mut)";
    var numCol = isSel ? "var(--g)" : "var(--txt)";
    var score = doneCt !== null ? (doneCt+"/"+dh.length) : dh.length;
    var scoreColor = (doneCt !== null && doneCt === dh.length && dh.length > 0) ? "var(--gold)" : numCol;
    daySel += '<button onclick="selWeekDay('+i+')" style="flex-shrink:0;min-width:52px;padding:10px 6px;border-radius:14px;border:1px solid '+bord+';background:'+bg+';cursor:pointer;text-align:center;transition:all 0.2s;">';
    daySel += '<div style="font-size:9px;font-family:var(--mono);color:'+col+';margin-bottom:4px;letter-spacing:1px;">'+d+'</div>';
    daySel += '<div style="font-size:13px;font-weight:800;color:'+scoreColor+';">'+score+'</div>';
    if (isToday) daySel += '<div style="width:4px;height:4px;border-radius:50%;background:var(--g);margin:4px auto 0;box-shadow:0 0 6px var(--g);"></div>';
    daySel += '</button>';
  });
  daySel += '</div>';

  var grid = '<div class="slabel" style="margin-bottom:12px;">Rozkład tygodnia</div>';
  HABITS.forEach(function(h) {
    var streak = S.streaks[h.id] || 0;
    var note   = (S.habitNotes && S.habitNotes[h.id]) || "";
    grid += '<div style="margin-bottom:8px;background:var(--card);border:1px solid var(--bord);border-radius:12px;padding:11px 14px;">';
    grid += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">';
    grid += '<span style="font-size:16px;">'+h.emoji+'</span>';
    grid += '<span style="font-size:12px;font-weight:600;flex:1;">'+h.label+'</span>';
    if (streak > 0) grid += '<span style="font-size:10px;color:var(--gold);">🔥'+streak+'</span>';
    grid += '</div><div style="display:flex;gap:3px;">';
    DAYS_SHORT.forEach(function(d, i) {
      var active = h.days.indexOf(i) >= 0;
      var isToday2 = i === todayIdx;
      var isDone = isToday2 && S.completed.indexOf(h.id) >= 0;
      var bg2 = isDone ? h.color : active ? h.color+"22" : "var(--bg3)";
      var bord2 = active ? h.color+"44" : "var(--bord)";
      var col2 = isDone ? "#000" : active ? h.color : "var(--mut)";
      var outline = isToday2 ? "outline:2px solid "+h.color+"66;outline-offset:1px;" : "";
      grid += '<div style="flex:1;height:22px;border-radius:5px;font-size:8px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-weight:700;background:'+bg2+';border:1px solid '+bord2+';color:'+col2+';'+outline+'">'+d+'</div>';
    });
    grid += '</div>';
    if (note) grid += '<div style="margin-top:6px;font-size:10px;color:var(--mut);font-style:italic;border-left:2px solid '+h.color+'55;padding-left:6px;">✏️ '+note+'</div>';
    grid += '</div>';
  });

  document.getElementById("tab-week").innerHTML = '<div class="fade-up">'+daySel+grid+'</div>';
}
window.selWeekDay = function(i){ S.weekSel = i; renderWeek(); };

// ── HISTORY ───────────────────────────────
function renderHistory() {
  var history = S.weekHistory || {};
  var today = new Date();
  var todayDk = dateKey();

  var html = '<div class="fade-up">';
  html += '<div style="font-size:20px;font-weight:900;margin-bottom:4px;background:linear-gradient(135deg,#ff6a00,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">📅 Historia</div>';
  html += '<div style="font-size:12px;color:var(--mut);margin-bottom:20px;">Twój postęp dzień po dniu</div>';

  // Build list of last 60 days
  var days = [];
  for (var i = 0; i < 60; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  // Group by week
  var weeks = [];
  var currentWeek = null;
  days.forEach(function(d) {
    var dk = dateKey(d.toDateString());
    var dow = d.getDay();
    var isToday2 = dk === todayDk;
    var scheduled = HABITS.filter(function(h){ return h.days.indexOf(dow) >= 0; });
    if (!scheduled.length && !isToday2) return;

    var weekStart = new Date(d);
    weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    var weekKey = dateKey(weekStart.toDateString());

    if (!currentWeek || currentWeek.key !== weekKey) {
      currentWeek = { key: weekKey, label: '', days: [] };
      weeks.push(currentWeek);
      var monDay = weekStart.getDate();
      var monMon = weekStart.getMonth();
      var sunDate = new Date(weekStart);
      sunDate.setDate(weekStart.getDate() + 6);
      if (i === 0 || i < 7) {
        currentWeek.label = "Ten tydzień";
      } else if (i < 14) {
        currentWeek.label = "Poprzedni tydzień";
      } else {
        currentWeek.label = monDay+"."+String(monMon+1).padStart(2,"0")+" – "+sunDate.getDate()+"."+String(sunDate.getMonth()+1).padStart(2,"0");
      }
    }

    var dayData = { d: d, dk: dk, dow: dow, isToday: isToday2, scheduled: scheduled };

    // Get completion data
    if (isToday2) {
      dayData.done = S.completed.filter(function(id){ return scheduled.find(function(h){ return h.id===id; }); }).length;
      dayData.habits = scheduled.map(function(h){
        return { h: h, done: S.completed.indexOf(h.id) >= 0 };
      });
    } else if (history[dk]) {
      var hdata = history[dk];
      dayData.done = scheduled.filter(function(h){ return hdata[h.id]; }).length;
      dayData.habits = scheduled.map(function(h){
        return { h: h, done: !!hdata[h.id] };
      });
    } else {
      dayData.done = null; // no data
      dayData.habits = [];
    }

    currentWeek.days.push(dayData);
  });

  weeks.forEach(function(week) {
    if (!week.days.length) return;
    var hasAnyData = week.days.some(function(dd){ return dd.isToday || dd.done !== null; });
    if (!hasAnyData) return;

    html += '<div style="margin-bottom:20px;">';
    html += '<div style="font-size:11px;font-weight:800;color:var(--g);font-family:var(--mono);letter-spacing:1px;margin-bottom:10px;">'+week.label.toUpperCase()+'</div>';

    week.days.forEach(function(dd) {
      var dayName = DAYS_PL[dd.dow];
      var dateStr = dd.d.getDate()+' '+MONTHS_PL[dd.d.getMonth()];
      var isFuture = dd.d > today && !dd.isToday;
      if (isFuture) return;

      var pct = dd.scheduled.length > 0 && dd.done !== null ? Math.round((dd.done/dd.scheduled.length)*100) : null;
      var allDoneDay = pct === 100;
      var hasData = dd.done !== null;

      var borderColor = dd.isToday ? "var(--g)" : allDoneDay ? "rgba(255,215,0,0.4)" : "var(--bord)";
      var bgColor = dd.isToday ? "rgba(255,106,0,0.05)" : allDoneDay ? "rgba(255,215,0,0.03)" : "var(--card)";

      html += '<div class="history-day'+(dd.isToday?' today':'')+(allDoneDay?' done':'')+'" style="border-color:'+borderColor+';background:'+bgColor+'" onclick="toggleHistoryDay(\''+dd.dk+'\')">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;">';

      // Left: day name + date
      html += '<div style="display:flex;align-items:center;gap:10px;">';
      html += '<div>';
      html += '<div style="font-size:13px;font-weight:800;color:'+(dd.isToday?'var(--g)':'var(--txt)')+';">'+dayName+(dd.isToday?' (dziś)':'')+'</div>';
      html += '<div style="font-size:10px;color:var(--mut);font-family:var(--mono);">'+dateStr+'</div>';
      html += '</div></div>';

      // Right: progress
      html += '<div style="display:flex;align-items:center;gap:8px;">';
      if (!hasData && !dd.isToday) {
        html += '<span style="font-size:11px;color:var(--mut);">brak danych</span>';
      } else {
        // Habit dots
        html += '<div style="display:flex;gap:3px;align-items:center;">';
        dd.scheduled.forEach(function(h) {
          var isDone = dd.habits.find(function(x){ return x.h.id===h.id; });
          var dotDone = isDone && isDone.done;
          html += '<div style="width:8px;height:8px;border-radius:50%;background:'+(dotDone?h.color:'var(--bord)')+';border:1px solid '+(dotDone?h.color+'88':'var(--bord)')+';"></div>';
        });
        html += '</div>';
        if (pct !== null) {
          html += '<span style="font-size:12px;font-weight:800;color:'+(allDoneDay?'var(--gold)':pct>50?'var(--g)':'var(--mut)')+';">'+(allDoneDay?'💎':pct+'%')+'</span>';
        }
      }
      html += '</div></div>';

      // Expanded detail (hidden by default, shown when clicked)
      html += '<div id="hday-'+dd.dk+'" style="display:none;margin-top:12px;border-top:1px solid rgba(255,106,0,0.15);padding-top:12px;">';
      if (dd.habits.length > 0) {
        // Get notes: for today use current S.habitNotes, for past days use archived notes
        var archivedNotes = dd.isToday
          ? (S.habitNotes || {})
          : ((S.weekHistory[dd.dk] && S.weekHistory[dd.dk]._notes) || S.habitNotes || {});

        dd.habits.forEach(function(hd) {
          var note   = archivedNotes[hd.h.id] || "";
          var streak = S.streaks[hd.h.id] || 0;
          html += '<div style="margin-bottom:10px;">';
          html += '<div style="display:flex;align-items:center;gap:10px;">';
          html += '<div style="width:32px;height:32px;border-radius:10px;'
            +'background:'+(hd.done ? hd.h.color+'22' : 'rgba(255,255,255,0.04)')+';'
            +'border:1px solid '+(hd.done ? hd.h.color+'55' : 'rgba(255,255,255,0.08)')+';'
            +'display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">'+hd.h.emoji+'</div>';
          html += '<span style="flex:1;font-size:14px;font-weight:600;'
            +'color:'+(hd.done ? 'var(--txt)' : 'var(--mut)')+';'
            +(hd.done ? '' : 'text-decoration:line-through;')+'">'+hd.h.label+'</span>';
          if (streak > 0 && hd.done) html += '<span style="font-size:11px;color:var(--gold);margin-right:4px;">🔥'+streak+'</span>';
          html += '<span style="font-size:16px;">'+(hd.done ? '✅' : '⬜')+'</span>';
          html += '</div>';
          if (note) {
            html += '<div style="'
              +'margin:6px 0 0 42px;'
              +'font-size:12px;color:var(--mut);font-style:italic;'
              +'background:rgba(255,255,255,0.03);'
              +'border-left:3px solid '+hd.h.color+';'
              +'border-radius:0 8px 8px 0;'
              +'padding:6px 10px;'
              +'line-height:1.4;'
              +'">✏️ '+note+'</div>';
          }
          html += '</div>';
        });
      } else if (!dd.isToday) {
        html += '<div style="font-size:13px;color:var(--mut);padding:8px 0;">Brak zapisanych danych dla tego dnia.</div>';
      }
      html += '</div>';

      html += '</div>'; // history-day
    });

    html += '</div>'; // week group
  });

  if (weeks.length === 0 || !weeks.some(function(w){ return w.days.length > 0; })) {
    html += '<div style="text-align:center;color:var(--mut);padding:60px 0;font-size:14px;">Zacznij zaznaczać nawyki — <br>historia pojawi się tutaj automatycznie.</div>';
  }

  html += '</div>';
  document.getElementById("tab-history").innerHTML = html;
}

window.toggleHistoryDay = function(dk) {
  var el = document.getElementById("hday-"+dk);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
};

// ── QUESTS ────────────────────────────────
var questDrawing = false;
function renderQuests() {
  var done    = S.doneQuests.length;
  var doneXp  = S.doneQuests.reduce(function(s,id){ var q=ALL_QUESTS.find(function(x){return x.id===id;}); return s+(q?q.xp:0); }, 0);
  var avail   = ALL_QUESTS.filter(function(q){ return S.doneQuests.indexOf(q.id) < 0; });
  var hasResult = S.currentQuest && S.doneQuests.indexOf(S.currentQuest.id) < 0;

  var drawBox = "";
  if (avail.length === 0) {
    drawBox = '<div style="background:rgba(255,215,0,0.06);border:2px solid var(--gold);border-radius:22px;padding:36px 20px;text-align:center;margin-bottom:20px;"><div style="font-size:48px;margin-bottom:12px;">🏆</div><div style="font-size:18px;font-weight:800;color:var(--gold);">Wszystkie questy ukończone!</div></div>';
  } else if (hasResult) {
    var q = S.currentQuest;
    var xpC = q.xp >= 40 ? "var(--gold)" : q.xp >= 25 ? "var(--g2)" : "var(--g)";
    drawBox = '<div id="quest-result-box" style="background:linear-gradient(135deg,#1a1000,#130010);border:2px solid rgba(255,106,0,0.45);border-radius:22px;padding:26px 20px;margin-bottom:20px;animation:questReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) both;">';
    drawBox += '<div style="font-size:10px;color:var(--mut);font-family:var(--mono);letter-spacing:3px;margin-bottom:14px;">TWÓJ QUEST</div>';
    drawBox += '<div style="font-size:16px;font-weight:800;color:var(--txt);line-height:1.5;margin-bottom:14px;">'+q.label+'</div>';
    drawBox += '<div style="display:inline-block;padding:5px 14px;border-radius:20px;font-family:var(--mono);font-weight:800;font-size:12px;color:'+xpC+';background:'+xpC+'22;border:1px solid '+xpC+'55;margin-bottom:14px;">+'+q.xp+' XP</div>';
    drawBox += '<div id="quest-ai-area"></div>';
    drawBox += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    drawBox += '<button onclick="questAILearn()" style="background:rgba(255,106,0,0.12);color:var(--g);border:1px solid rgba(255,106,0,0.35);border-radius:14px;padding:11px 18px;font-size:13px;font-weight:700;font-family:var(--font);">🧠 Dowiedz się</button>';
    drawBox += '<button onclick="completeCurrentQuest()" style="background:linear-gradient(135deg,var(--g),var(--g2));color:#000;border:none;border-radius:14px;padding:11px 22px;font-weight:800;font-size:13px;font-family:var(--font);">✓ Wykonane!</button>';
    drawBox += '<button onclick="reDrawQuest()" style="background:transparent;color:var(--mut);border:1px solid var(--bord);border-radius:14px;padding:11px 14px;font-size:13px;font-family:var(--font);">🎲 Inne</button>';
    drawBox += '</div></div>';
  } else {
    drawBox = '<div id="quest-draw-idle" style="background:linear-gradient(135deg,#130010,#0d0008);border:2px dashed rgba(255,106,0,0.4);border-radius:22px;padding:32px 20px;text-align:center;margin-bottom:20px;cursor:pointer;transition:all 0.2s;" onclick="drawQuest()" onmouseenter="this.style.borderColor=\'rgba(255,106,0,0.75)\'" onmouseleave="this.style.borderColor=\'rgba(255,106,0,0.4)\'">';
    drawBox += '<div id="draw-dice" style="font-size:44px;margin-bottom:12px;">🎲</div>';
    drawBox += '<div style="font-size:17px;font-weight:800;color:var(--g);margin-bottom:6px;">Losuj quest</div>';
    drawBox += '<div style="font-size:12px;color:var(--mut);">'+avail.length+' dostępnych</div>';
    drawBox += '</div>';
  }

  var doneList = "";
  if (S.doneQuests.length > 0) {
    doneList = '<div class="slabel" style="margin-bottom:10px;">Ostatnio ukończone</div>';
    var recent = S.doneQuests.slice().reverse().slice(0,5);
    recent.forEach(function(id) {
      var q = ALL_QUESTS.find(function(x){ return x.id===id; });
      if (!q) return;
      doneList += '<div class="quest-done-item"><div style="font-size:13px;color:var(--g);flex-shrink:0;">✓</div><div style="flex:1;font-size:12px;color:var(--mut);text-decoration:line-through;line-height:1.4;">'+q.label+'</div><div style="font-size:11px;font-family:var(--mono);color:var(--g2);flex-shrink:0;">+'+q.xp+'</div></div>';
    });
  }

  var el = document.getElementById("tab-quests");
  var html = '<div class="fade-up">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">';
  html += '<div class="card" style="padding:12px;text-align:center;"><div style="font-size:18px;font-weight:900;color:var(--g);">'+done+'</div><div style="font-size:9px;color:var(--mut);font-family:var(--mono);">ZROBIONE</div></div>';
  html += '<div class="card" style="padding:12px;text-align:center;"><div style="font-size:18px;font-weight:900;color:var(--g2);">'+avail.length+'</div><div style="font-size:9px;color:var(--mut);font-family:var(--mono);">DOSTĘPNE</div></div>';
  html += '<div class="card" style="padding:12px;text-align:center;"><div style="font-size:18px;font-weight:900;color:var(--gold);">'+doneXp+'</div><div style="font-size:9px;color:var(--mut);font-family:var(--mono);">XP ZDOBYTE</div></div>';
  html += '</div>';
  html += '<div style="margin-bottom:18px;">';
  html += barHTML(done, ALL_QUESTS.length, "var(--g)", 8);
  html += '</div>';
  html += drawBox;
  html += doneList;
  html += '</div>';
  el.innerHTML = html;
}

window.drawQuest = function() {
  var avail = ALL_QUESTS.filter(function(q){ return S.doneQuests.indexOf(q.id) < 0; });
  if (!avail.length || questDrawing) return;
  questDrawing = true;
  var winner = avail[Math.floor(Math.random()*avail.length)];
  S.currentQuest = winner;
  var dice = document.getElementById("draw-dice");
  var faces = ["⚀","⚁","⚂","⚃","⚄","⚅","🎲"];
  var spins = 0;
  var si = setInterval(function() {
    if (dice) { dice.textContent = faces[spins % faces.length]; dice.style.transform = "rotate("+(spins*60)+"deg) scale("+(1+Math.sin(spins)*0.15)+")"; }
    spins++;
    if (spins > 14) {
      clearInterval(si);
      questDrawing = false;
      renderQuests();
      spawnBurst(window.innerWidth/2, 200, "#ff6a00", 12);
    }
  }, 80);
};
window.reDrawQuest = function() { S.currentQuest = null; renderQuests(); setTimeout(function(){ window.drawQuest(); }, 50); };
window.completeCurrentQuest = function() {
  var q = S.currentQuest;
  if (!q || S.doneQuests.indexOf(q.id) >= 0) return;
  S.doneQuests.push(q.id);
  S.xp += q.xp;
  S.stats.questsDone++;
  spawnBurst(window.innerWidth/2, window.innerHeight/2, "#ff6a00", 22);
  spawnXpFloat(q.xp, window.innerWidth/2, window.innerHeight/2);
  SFX.quest();
  showWin(q.win);
  S.currentQuest = null;
  saveState(); renderHeader(); renderQuests();
};
window.questAILearn = function() {
  var q = S.currentQuest;
  if (!q) return;
  var area = document.getElementById("quest-ai-area");
  if (!area) return;
  var answer = (typeof QUEST_ANSWERS !== 'undefined') ? QUEST_ANSWERS[q.id] : null;
  if (answer) {
    var formatted = answer.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    area.innerHTML = '<div style="background:rgba(255,106,0,0.06);border:1px solid rgba(255,106,0,0.2);border-radius:12px;padding:14px;margin-bottom:14px;"><div style="font-size:10px;color:var(--g);font-family:var(--mono);letter-spacing:1px;margin-bottom:10px;">🧠 ODPOWIEDŹ</div><div style="font-size:13px;color:var(--txt);line-height:1.7;">'+formatted+'</div></div>';
  } else {
    area.innerHTML = '<div style="font-size:12px;color:var(--mut);margin-bottom:14px;padding:10px;background:rgba(255,106,0,0.05);border-radius:10px;border-left:3px solid var(--g);">📖 Zbadaj to samodzielnie — wyszukaj temat i zapisz 3 rzeczy których się dowiedziałeś.</div>';
  }
};

// ── GOALS ─────────────────────────────────
var selGoalCat = GOAL_CATS[0];
function renderGoals() {
  var catColors = {
    "🔥 Priorytet":"#ff3d5a","🎯 Cel główny":"var(--g)","📚 Nauka":"#818cf8",
    "💪 Zdrowie":"#34d399","💰 Finanse":"#fbbf24","🚀 Projekt":"#fb923c",
    "🤝 Relacje":"#c084fc","✈️ Podróże":"#22d3ee","🧘 Rozwój":"#a3e635",
    "🎮 Hobby":"#f472b6","👨‍👩‍👧 Rodzina":"#fdba74"
  };
  var priority = S.goals.filter(function(g){ return !g.done && g.cat==="🔥 Priorytet"; });
  var active   = S.goals.filter(function(g){ return !g.done && g.cat!=="🔥 Priorytet"; });
  var done     = S.goals.filter(function(g){ return g.done; });

  var pillsHTML = GOAL_CATS.map(function(c) {
    var isActive = selGoalCat === c;
    var col = catColors[c] || '';
    var activeStyle = isActive && col ? "border-color:"+col+";color:"+col+";" : "";
    return '<button class="pill pill-sm'+(isActive?' active':'')+'" onclick="selGCat(this,\''+c.replace(/'/g,"\\'")+'\')" style="'+activeStyle+'">'+c+'</button>';
  }).join('');

  var html = '<div class="fade-up">';
  html += '<div class="card" style="margin-bottom:16px;">';
  html += '<div style="font-size:13px;font-weight:800;color:var(--g);margin-bottom:10px;">+ Nowy cel</div>';
  html += '<input class="inp" id="goal-inp" placeholder="Co chcesz osiągnąć?" style="margin-bottom:8px;" onkeydown="if(event.key===\'Enter\')addGoal()">';
  html += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;" id="gcat-pills">'+pillsHTML+'</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">';
  html += '<input type="date" class="inp inp-mono" id="goal-dl" style="flex:1;color:var(--mut);color-scheme:dark;">';
  html += '<label style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--mut);white-space:nowrap;cursor:pointer;"><input type="checkbox" id="goal-nodeadline" onchange="document.getElementById(\'goal-dl\').disabled=this.checked;document.getElementById(\'goal-dl\').style.opacity=this.checked?\'0.3\':\'1\'"> Bez terminu</label>';
  html += '</div>';
  html += '<button onclick="addGoal()" style="width:100%;background:linear-gradient(135deg,var(--g),var(--g2));color:#000;border:none;border-radius:10px;padding:11px;font-weight:800;font-size:14px;font-family:var(--font);">Dodaj cel</button>';
  html += '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">';
  html += '<div class="card" style="padding:12px;text-align:center;"><div style="font-size:24px;font-weight:900;color:var(--g);">'+(active.length+priority.length)+'</div><div style="font-size:9px;color:var(--mut);font-family:var(--mono);">W TRAKCIE</div></div>';
  html += '<div class="card" style="padding:12px;text-align:center;"><div style="font-size:24px;font-weight:900;color:var(--gold);">'+done.length+'</div><div style="font-size:9px;color:var(--mut);font-family:var(--mono);">OSIĄGNIĘTE</div></div>';
  html += '</div>';

  if (priority.length) {
    html += '<div class="slabel" style="color:#ff3d5a;margin-bottom:8px;">🔥 Priorytety</div>';
    priority.forEach(function(g){ html += goalHTML(g, catColors); });
  }
  if (active.length) {
    html += '<div class="slabel" style="margin-bottom:8px;">Aktywne cele</div>';
    active.forEach(function(g){ html += goalHTML(g, catColors); });
  }
  if (done.length) {
    html += '<div class="slabel" style="color:var(--gold);margin-bottom:8px;">Osiągnięte 🏆</div>';
    done.forEach(function(g){ html += goalHTML(g, catColors); });
  }
  if (!S.goals.length) {
    html += '<div style="text-align:center;color:var(--mut);padding:40px 0;font-size:14px;">Dodaj swój pierwszy cel!</div>';
  }

  html += '</div>';
  document.getElementById("tab-goals").innerHTML = html;
  renderTodos();
}

function goalHTML(g, catColors) {
  var color = (catColors && catColors[g.cat]) || "var(--g)";
  var isOverdue = g.deadline && !g.done && new Date(g.deadline) < new Date();
  var borderColor = g.done ? "var(--bord)" : isOverdue ? "rgba(255,61,90,0.35)" : color+"44";
  var btnBg = g.done ? "var(--gold)" : "transparent";
  var btnBorder = g.done ? "var(--gold)" : color;
  var deadlineDiv = "";
  if (g.deadline) {
    deadlineDiv = '<div style="font-size:10px;color:'+(isOverdue?'var(--red)':'var(--mut)')+';margin-top:3px;font-family:var(--mono);">'+(isOverdue?'⚠️':'📅')+' '+g.deadline+'</div>';
  } else if (!g.done) {
    deadlineDiv = '<div style="font-size:10px;color:var(--mut);margin-top:2px;">∞ bez terminu</div>';
  }
  var html = '<div style="background:var(--card);border:1.5px solid '+borderColor+';border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:flex-start;gap:10px;'+(g.done?'opacity:0.6':'')+';">';
  html += '<button onclick="toggleGoal('+g.id+')" style="width:22px;height:22px;border-radius:50%;border:2px solid '+btnBorder+';background:'+btnBg+';color:'+(g.done?'#000':'transparent')+';font-size:12px;font-weight:900;flex-shrink:0;margin-top:1px;cursor:pointer;transition:all 0.2s;">'+(g.done?'✓':'')+'</button>';
  html += '<div style="flex:1;min-width:0;"><div style="font-size:10px;color:'+color+';font-weight:700;margin-bottom:2px;">'+g.cat+'</div>';
  html += '<div style="font-size:14px;font-weight:700;color:'+(g.done?'var(--mut)':'var(--txt)')+';'+(g.done?'text-decoration:line-through;':'')+'">'+g.title+'</div>';
  html += deadlineDiv+'</div>';
  html += '<button onclick="deleteGoal('+g.id+')" style="color:var(--mut);font-size:16px;padding:0 4px;background:none;border:none;cursor:pointer;">×</button>';
  html += '</div>';
  return html;
}

window.selGCat = function(el, cat) {
  document.querySelectorAll("#gcat-pills .pill").forEach(function(p){ p.classList.remove("active"); });
  el.classList.add("active"); selGoalCat = cat;
};
window.addGoal = function() {
  var title = document.getElementById("goal-inp").value.trim();
  var noDeadline = document.getElementById("goal-nodeadline") && document.getElementById("goal-nodeadline").checked;
  var dl = noDeadline ? "" : (document.getElementById("goal-dl").value || "");
  if (!title) return;
  S.goals.push({id:Date.now(), title:title, cat:selGoalCat, deadline:dl, done:false});
  S.stats.goalsAdded++;
  saveState(); renderGoals();
};
window.toggleGoal = function(id) {
  var g = S.goals.find(function(x){ return x.id===id; });
  if (!g) return;
  if (!g.done) {
    S.xp += 30; S.stats.goalsCompleted++;
    var win = window.getGoalWin ? window.getGoalWin() : "Cel osiągnięty! Brawo! 🏆";
    spawnBurst(window.innerWidth/2, window.innerHeight/2, "#ffd700", 22);
    spawnXpFloat(30, window.innerWidth/2, window.innerHeight/2);
    SFX.goal(); showWin(win, "#ffd700");
    saveState(); renderHeader();
  }
  g.done = !g.done;
  saveState(); renderGoals();
};
window.deleteGoal = function(id){ S.goals = S.goals.filter(function(g){ return g.id!==id; }); saveState(); renderGoals(); };

// ── TODOS ─────────────────────────────────
function renderTodos() {
  var open = S.todos.filter(function(t){ return !t.done; });
  var done = S.todos.filter(function(t){ return t.done; });
  var tab  = document.getElementById("tab-goals");
  if (!tab) return;
  var todoDiv = document.getElementById("todo-section");
  if (!todoDiv) {
    todoDiv = document.createElement("div");
    todoDiv.id = "todo-section";
    var fu = tab.querySelector(".fade-up");
    if (fu) fu.appendChild(todoDiv); else tab.appendChild(todoDiv);
  }
  var html = '<div style="height:1px;background:var(--bord);margin:24px 0 20px;"></div>';
  html += '<div style="font-size:13px;font-weight:800;color:var(--g2);margin-bottom:14px;">📋 Lista TO-DO</div>';
  html += '<div class="card" style="margin-bottom:14px;"><div style="display:flex;gap:8px;"><input class="inp" id="todo-inp" placeholder="Dodaj zadanie..." style="flex:1;" onkeydown="if(event.key===\'Enter\')addTodo()"><button onclick="addTodo()" style="background:var(--g);color:#000;border:none;border-radius:10px;padding:10px 16px;font-weight:800;font-size:13px;font-family:var(--font);white-space:nowrap;">+ Dodaj</button></div></div>';
  if (!open.length && !done.length) html += '<div style="text-align:center;color:var(--mut);padding:24px 0;font-size:13px;">Brak zadań. Dodaj pierwsze!</div>';

  var todoColors = ["#ff6a00","#22d3ee","#34d399","#a78bfa","#f472b6","#fb923c","#fbbf24"];
  open.forEach(function(t, idx) {
    var col = todoColors[idx % todoColors.length];
    html += '<div style="background:var(--card);border:1.5px solid '+col+'44;border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:flex-start;gap:10px;border-left:3px solid '+col+';">';
    html += '<button onclick="toggleTodo('+t.id+')" style="width:22px;height:22px;border-radius:50%;border:2px solid '+col+';background:transparent;color:transparent;flex-shrink:0;margin-top:1px;cursor:pointer;transition:all 0.2s;"></button>';
    html += '<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--txt);">'+t.text+'</div>';
    if (t.added) html += '<div style="font-size:10px;color:var(--mut);margin-top:2px;font-family:var(--mono);">📅 '+t.added+'</div>';
    html += '</div><button onclick="deleteTodo('+t.id+')" style="color:var(--mut);font-size:16px;padding:0 4px;background:none;border:none;cursor:pointer;">×</button>';
    html += '</div>';
  });
  if (done.length) {
    html += '<div style="font-size:10px;color:var(--mut);font-family:var(--mono);letter-spacing:2px;margin:12px 0 8px;">ZROBIONE</div>';
    done.slice(0,5).forEach(function(t) {
      html += '<div style="background:var(--card);border:1px solid var(--bord);border-radius:12px;padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;opacity:0.6;">';
      html += '<button onclick="toggleTodo('+t.id+')" style="width:22px;height:22px;border-radius:50%;border:2px solid var(--gold);background:var(--gold);color:#000;font-size:12px;font-weight:900;flex-shrink:0;cursor:pointer;">✓</button>';
      html += '<div style="flex:1;font-size:13px;color:var(--mut);text-decoration:line-through;">'+t.text+'</div>';
      if (t.completedDate) html += '<div style="font-size:10px;color:var(--mut);font-family:var(--mono);">'+t.completedDate+'</div>';
      html += '<button onclick="deleteTodo('+t.id+')" style="color:var(--mut);font-size:16px;padding:0 4px;background:none;border:none;cursor:pointer;">×</button>';
      html += '</div>';
    });
  }
  todoDiv.innerHTML = html;
}

window.addTodo = function() {
  var inp  = document.getElementById("todo-inp");
  var text = inp ? inp.value.trim() : "";
  if (!text) return;
  if (!S.todos) S.todos = [];
  var now = new Date();
  var ds  = now.getDate()+"."+String(now.getMonth()+1).padStart(2,"0")+"."+now.getFullYear();
  S.todos.unshift({id:Date.now(), text:text, done:false, added:ds});
  SFX.tap(); saveState(); renderTodos();
  if (inp) inp.value = "";
};
window.toggleTodo = function(id) {
  var t = S.todos.find(function(x){ return x.id===id; });
  if (!t) return;
  t.done = !t.done;
  if (t.done) {
    var now = new Date();
    t.completedDate = now.getDate()+"."+String(now.getMonth()+1).padStart(2,"0")+"."+now.getFullYear();
    SFX.goal();
    showWin("✓ Zadanie ukończone! Małe kroki budują wielkie zmiany.", "#ffd700");
    spawnBurst(window.innerWidth/2, window.innerHeight/2, "#ffd700", 14);
  }
  saveState(); renderTodos();
};
window.deleteTodo = function(id){ S.todos = S.todos.filter(function(x){ return x.id!==id; }); saveState(); renderTodos(); };

// ── FINANCE ───────────────────────────────
function getExpCats() { return DEFAULT_EXP_CATS.concat(S.customExpCats || []); }
var selExpCat = DEFAULT_EXP_CATS[0];
function renderFinance() {
  var cats  = getExpCats();
  if (cats.indexOf(selExpCat) < 0) selExpCat = cats[0];
  var total = S.expenses.reduce(function(s,e){ return s+e.amount; }, 0);
  var bycat = {};
  S.expenses.forEach(function(e){ bycat[e.cat] = (bycat[e.cat]||0)+e.amount; });
  var top = Object.entries ? Object.entries(bycat).sort(function(a,b){return b[1]-a[1];}) : [];

  var breakdown = "";
  if (top.length) {
    breakdown = '<div class="card" style="margin-bottom:14px;"><div style="font-size:13px;font-weight:700;margin-bottom:12px;">💸 Gdzie idzie kasa</div>';
    top.slice(0,6).forEach(function(kv) {
      var c=kv[0], v=kv[1];
      breakdown += '<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;margin-bottom:3px;font-size:12px;"><span>'+c+'</span><span style="font-family:var(--mono);color:var(--g2);font-weight:700;">'+v.toFixed(2)+' zł</span></div>'+barHTML(v,total||1,"var(--g2)",5)+'</div>';
    });
    breakdown += '</div>';
  }

  var list = "";
  if (S.expenses.length) {
    list = '<div style="display:flex;flex-direction:column;gap:8px;">';
    S.expenses.slice().reverse().slice(0,30).forEach(function(e) {
      var ico = e.cat.split(" ")[0];
      list += '<div class="expense-row"><div style="font-size:20px;">'+ico+'</div><div style="flex:1;"><div style="font-size:13px;font-weight:600;">'+e.desc+'</div><div style="font-size:10px;color:var(--mut);font-family:var(--mono);">'+e.date+' · '+e.cat+'</div></div><div style="font-family:var(--mono);font-weight:800;color:var(--red);font-size:14px;">-'+e.amount.toFixed(2)+' zł</div><button class="del-btn" onclick="delExp('+e.id+')">×</button></div>';
    });
    list += '</div>';
  }

  var pillsHTML = cats.map(function(c) {
    return '<button class="pill pill-sm'+(selExpCat===c?' active':'')+'" onclick="selEC(this,\''+c.replace(/'/g,"\\'")+'\')">'+c+'</button>';
  }).join('');

  var el = document.getElementById("tab-finance");
  var html = '<div class="fade-up">';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">';
  html += '<div class="card" style="padding:14px;"><div style="font-size:10px;color:var(--mut);font-family:var(--mono);margin-bottom:4px;">WYDANO ŁĄCZNIE</div><div style="font-size:22px;font-weight:900;color:var(--red);font-family:var(--mono);">'+total.toFixed(2)+'</div><div style="font-size:11px;color:var(--mut);">złotych</div></div>';
  html += '<div class="card" style="padding:14px;"><div style="font-size:10px;color:var(--mut);font-family:var(--mono);margin-bottom:4px;">TRANSAKCJI</div><div style="font-size:22px;font-weight:900;color:var(--g);">'+S.expenses.length+'</div><div style="font-size:11px;color:var(--mut);">zapisanych</div></div>';
  html += '</div>';
  html += breakdown;
  html += '<div class="card" style="margin-bottom:14px;">';
  html += '<div style="font-size:13px;font-weight:800;color:var(--g);margin-bottom:10px;">+ Nowy wydatek</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:10px;"><input type="number" step="0.01" id="exp-am" placeholder="Kwota (zł)" class="inp inp-mono" style="width:110px;flex-shrink:0;"><input id="exp-de" placeholder="Opis" class="inp" style="flex:1;" onkeydown="if(event.key===\'Enter\')addExp()"></div>';
  html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;" id="ecat-pills">'+pillsHTML+'</div>';
  html += '<div style="display:flex;gap:8px;margin-bottom:8px;"><input id="exp-newcat-ico" placeholder="🏷️" class="inp" style="width:52px;text-align:center;flex-shrink:0;"><input id="exp-newcat-name" placeholder="Nowa kategoria..." class="inp" style="flex:1;" onkeydown="if(event.key===\'Enter\')addExpCat()"><button onclick="addExpCat()" style="background:var(--bg3);border:1px solid var(--bord);color:var(--mut);border-radius:10px;padding:8px 12px;font-size:12px;font-family:var(--font);">+ Kat.</button></div>';
  html += '<button onclick="addExp()" style="width:100%;background:linear-gradient(135deg,var(--g),var(--g2));color:#000;border:none;border-radius:10px;padding:12px;font-weight:800;font-family:var(--font);font-size:14px;">Dodaj wydatek</button>';
  html += '</div>'+list+'</div>';
  el.innerHTML = html;
}
window.selEC = function(el, cat) { document.querySelectorAll("#ecat-pills .pill").forEach(function(p){p.classList.remove("active");}); el.classList.add("active"); selExpCat = cat; };
window.addExpCat = function() {
  var ico  = (document.getElementById("exp-newcat-ico").value.trim()) || "🏷️";
  var name = document.getElementById("exp-newcat-name").value.trim();
  if (!name) return;
  var cat = ico+" "+name;
  if (!S.customExpCats) S.customExpCats = [];
  if (S.customExpCats.indexOf(cat) < 0) S.customExpCats.push(cat);
  selExpCat = cat; saveState(); renderFinance();
};
window.addExp = function() {
  var a = parseFloat(document.getElementById("exp-am").value);
  var d = document.getElementById("exp-de").value.trim();
  if (!a || !d) return;
  S.expenses.push({id:Date.now(), amount:a, desc:d, cat:selExpCat, date:new Date().toLocaleDateString("pl")});
  S.stats.expensesCount++; saveState(); renderFinance();
};
window.delExp = function(id){ S.expenses = S.expenses.filter(function(e){return e.id!==id;}); saveState(); renderFinance(); };

// ── COOKING ───────────────────────────────
var RECIPES = [
  // ŚNIADANIA
  {id:"r1",  name:"Jajecznica z warzywami",    time:"10 min", diff:"🟢", tag:"śniadanie", macro:{kcal:320,b:22,w:8,t:22},  steps:["Rozbij 3 jajka do miski, roztrzep widelcem","Podsmaż cebulę i paprykę 3 min","Wlej jajka, mieszaj na małym ogniu","Dopraw solą i pieprzem","Podaj z chlebem pełnoziarnistym"]},
  {id:"r2",  name:"Owsianka bananowa",          time:"5 min",  diff:"🟢", tag:"śniadanie", macro:{kcal:380,b:12,w:65,t:8},   steps:["Wsyp 60g płatków owsianych do garnka","Zalej 250ml mleka, gotuj 3 min mieszając","Dodaj pokrojonego banana i łyżkę masła orzechowego","Opcjonalnie: miód, cynamon"]},
  {id:"r3",  name:"Tost z awokado i jajkiem",   time:"10 min", diff:"🟢", tag:"śniadanie", macro:{kcal:420,b:18,w:30,t:26},  steps:["Usmaż jajko sadzone lub gotowane","Rozgnieć awokado widelcem, dopraw solą i cytryną","Posmaruj tosty awokado","Połóż jajko na wierzchu","Dodaj szczyptę chili i sezam"]},
  {id:"r4",  name:"Smoothie białkowe",           time:"5 min",  diff:"🟢", tag:"śniadanie", macro:{kcal:350,b:28,w:40,t:6},   steps:["Wrzuć do blendera: 1 banan, 200ml mleka","Dodaj 30g odżywki białkowej lub jogurtu greckiego","Garść szpinaku (nie czuć smaku!)","Zblenduj do gładkości","Opcjonalnie: łyżka masła orzechowego"]},
  {id:"r5",  name:"Pancakes proteinowe",         time:"15 min", diff:"🟢", tag:"śniadanie", macro:{kcal:410,b:30,w:45,t:10},  steps:["Wymieszaj: 2 jajka, 1 banan, 50g płatków owsianych","Blenduj na gładkie ciasto","Smaż na małej patelni po 2 min z każdej strony","Podaj z jogurtem i owocami"]},
  {id:"r6",  name:"Jogurt z granolą i owocami", time:"3 min",  diff:"🟢", tag:"śniadanie", macro:{kcal:340,b:16,w:48,t:8},   steps:["Nalej 200g jogurtu greckiego do miski","Wsyp 40g granoli","Dodaj ulubione owoce świeże lub mrożone","Polej łyżką miodu"]},
  {id:"r7",  name:"Kanapki z twarogiem",         time:"5 min",  diff:"🟢", tag:"śniadanie", macro:{kcal:290,b:20,w:28,t:10},  steps:["Pokrój pieczywo razowe","Wymieszaj twaróg ze szczypiorkiem i solą","Posmaruj pieczywo grubą warstwą","Dodaj plasterki ogórka i rzodkiewki"]},
  {id:"r8",  name:"Overnight oats",              time:"5 min+noc",diff:"🟢",tag:"śniadanie",macro:{kcal:390,b:14,w:58,t:10},  steps:["Wymieszaj w słoiku: 60g płatków, 200ml mleka, 1 łyżka chia","Dodaj łyżkę miodu","Wstaw do lodówki na noc","Rano dodaj owoce i orzechy"]},
  {id:"r9",  name:"Omlet z serem",               time:"8 min",  diff:"🟢", tag:"śniadanie", macro:{kcal:360,b:26,w:4,t:27},   steps:["Roztrzep 3 jajka z szczyptą soli","Rozgrzej patelnię z masłem","Wlej jajka, nie mieszaj — poczekaj aż brzegi stężeją","Posyp startym serem, złóż na pół","Smaż jeszcze 1 min"]},
  {id:"r10", name:"Jajka na twardo z warzywami", time:"12 min", diff:"🟢", tag:"śniadanie", macro:{kcal:250,b:18,w:10,t:16},  steps:["Gotuj jajka 8 min w wrzącej wodzie","Przelej zimną wodą, obierz","Pokrój pomidory, ogórki, paprykę","Ułóż na talerzu z jajkami","Dopraw oliwą, solą i pieprzem"]},

  // OBIADY
  {id:"r11", name:"Kurczak z ryżem i brokułem", time:"25 min", diff:"🟢", tag:"obiad",     macro:{kcal:480,b:42,w:52,t:8},   steps:["Ugotuj ryż (20 min)","Ugotuj brokuł na parze lub w wodzie 8 min","Pokrój pierś w kostkę, smaż z czosnkiem 8 min","Dopraw papryką, solą, pieprzem","Złóż na talerzu: ryż, kurczak, brokuł"]},
  {id:"r12", name:"Makaron bolognese",           time:"30 min", diff:"🟢", tag:"obiad",     macro:{kcal:580,b:35,w:62,t:18},  steps:["Usmaż cebulę i czosnek","Dodaj 300g mielonego wołowego, smaż 8 min","Wlej puszkę pomidorów, dopraw oregano i bazylią","Gotuj sos 15 min","Ugotuj makaron al dente, wymieszaj z sosem"]},
  {id:"r13", name:"Zupa pomidorowa",             time:"20 min", diff:"🟢", tag:"obiad",     macro:{kcal:220,b:8,w:28,t:8},    steps:["Podsmaż cebulę i czosnek w garnku","Dodaj 2 puszki pomidorów i 500ml bulionu","Gotuj 10 min, blenduj na gładko","Dodaj śmietanę, dopraw solą, pieprzem, cukrem","Podaj z makaronem lub chlebem"]},
  {id:"r14", name:"Sałatka grecka",              time:"10 min", diff:"🟢", tag:"obiad",     macro:{kcal:280,b:10,w:14,t:22},  steps:["Pokrój pomidory, ogórka, paprykę, cebulę w kostkę","Dodaj oliwki i ser feta pokruszoną","Polej oliwą i sokiem z cytryny","Dopraw oregano, solą i pieprzem"]},
  {id:"r15", name:"Kasza jaglana z warzywami",   time:"25 min", diff:"🟢", tag:"obiad",     macro:{kcal:380,b:12,w:58,t:10},  steps:["Ugotuj kaszę jaglaną (20 min) wg przepisu na opakowaniu","Podsmaż cukinię, paprykę i cebulę 8 min","Wymieszaj kaszę z warzywami","Dopraw kurkumą, solą i oliwą","Posyp pestkami dyni"]},
  {id:"r16", name:"Zupa krem z dyni",            time:"25 min", diff:"🟢", tag:"obiad",     macro:{kcal:190,b:4,w:28,t:8},    steps:["Podsmaż cebulę i czosnek","Dodaj dynię pokrojoną w kostkę (400g)","Wlej 600ml bulionu, gotuj 15 min aż dynia miękka","Blenduj, dodaj śmietankę","Dopraw imbir, gałką muszkatołową, solą"]},
  {id:"r17", name:"Wrap z tuńczykiem",           time:"8 min",  diff:"🟢", tag:"obiad",     macro:{kcal:420,b:32,w:38,t:12},  steps:["Odsącz puszkę tuńczyka","Wymieszaj z majonezem, cebulką i cytryną","Na tortillę połóż sałatę, pomidor, tuńczyka","Zwiń szczelnie, pokrój na pół"]},
  {id:"r18", name:"Zupa soczewicowa",            time:"30 min", diff:"🟢", tag:"obiad",     macro:{kcal:310,b:18,w:42,t:6},   steps:["Podsmaż cebulę, marchewkę i czosnek","Dodaj 150g czerwonej soczewicy","Wlej 800ml bulionu, gotuj 20 min","Dopraw kuminem, kolendrą, solą","Podaj z pieczywem"]},
  {id:"r19", name:"Ryż z jajkiem sadzonym",      time:"15 min", diff:"🟢", tag:"obiad",     macro:{kcal:440,b:18,w:62,t:14},  steps:["Ugotuj ryż (15 min)","Posiekaj dymkę i czosnek","Na oleju sezamowym podsmaż czosnek chwilę","Dodaj ryż, sos sojowy, wymieszaj","Zrób jajko sadzone, połóż na wierzchu"]},
  {id:"r20", name:"Placki ziemniaczane",         time:"25 min", diff:"🟡", tag:"obiad",     macro:{kcal:390,b:10,w:52,t:16},  steps:["Zetrzyj 4 ziemniaki na tarce, odsącz wodę","Dodaj 1 jajko, 2 łyżki mąki, sól i pieprz","Uformuj placki i smaż 3 min z każdej strony","Podaj ze śmietaną i szczypiorkiem"]},
  {id:"r21", name:"Kurczak stir-fry",            time:"20 min", diff:"🟢", tag:"obiad",     macro:{kcal:430,b:38,w:40,t:12},  steps:["Pokrój pierś kurczaka w paski","Podsmaż na dużym ogniu z czosnkiem i imbirem","Dodaj paprykę, brokuł, marchewkę","Skrop sosem sojowym i ostrygowym","Podaj z ryżem lub makaronem"]},
  {id:"r22", name:"Spaghetti aglio e olio",      time:"15 min", diff:"🟢", tag:"obiad",     macro:{kcal:490,b:14,w:70,t:18},  steps:["Ugotuj spaghetti al dente","Na patelni podsmaż dużo czosnku w oliwie","Dodaj chili w płatkach","Wymieszaj makaron z oliwą czosnkową","Posyp pietruszką i parmezanem"]},
  {id:"r23", name:"Zupa żurek z jajkiem",        time:"15 min", diff:"🟢", tag:"obiad",     macro:{kcal:260,b:14,w:18,t:14},  steps:["Kupleuj gotowy żurek (lub z proszku)","Dodaj bulion, gotuj 5 min","Wrzuć pokrojone kiełbasy i 2 gotowane jajka","Dopraw majerankiem i czosnkiem","Podaj z pieczywem lub ziemniakami"]},
  {id:"r24", name:"Bowl z ciecierzycą",          time:"15 min", diff:"🟢", tag:"obiad",     macro:{kcal:420,b:18,w:54,t:14},  steps:["Odsącz i opłucz puszkę ciecierzycy","Podsmaż z czosnkiem, papryką i kuminem","Ugotuj kaszę bulgur lub kuskus (10 min)","Pokrój pomidory i ogórka","Złóż bowl, skrop tahini i cytryną"]},
  {id:"r25", name:"Pierogi z ziemniakami",       time:"45 min", diff:"🟡", tag:"obiad",     macro:{kcal:460,b:14,w:72,t:14},  steps:["Zagnieć ciasto: mąka, jajko, woda, sól","Ugotuj i rozgnieć ziemniaki, wymieszaj z twarogiem i cebulką","Wałkuj ciasto cienko, wycinaj kółka","Nakładaj farsz, lepi brzegi","Gotuj 5 min po wypłynięciu na wierzch"]},

  // KOLACJE
  {id:"r26", name:"Kanapki z pastą jajeczną",   time:"10 min", diff:"🟢", tag:"kolacja",   macro:{kcal:340,b:18,w:30,t:16},  steps:["Ugotuj 4 jajka na twardo (8 min)","Rozgnieć widelcem, dodaj majonez i musztardę","Dopraw solą, pieprzem, szczypiorkiem","Posmaruj pieczywo grubą warstwą"]},
  {id:"r27", name:"Ryba w panierce",             time:"20 min", diff:"🟢", tag:"kolacja",   macro:{kcal:390,b:28,w:30,t:16},  steps:["Rozbij jajko w miseczce","Obtocz filety rybne w mące, jajku, bułce tartej","Smaż na oleju 4 min z każdej strony","Podaj z cytryną i sałatą"]},
  {id:"r28", name:"Zupa jarzynowa",              time:"30 min", diff:"🟢", tag:"kolacja",   macro:{kcal:180,b:6,w:28,t:4},    steps:["Pokrój marchewkę, pietruszkę, seler, ziemniaki w kostkę","Gotuj w 1L bulionu 20 min","Dodaj makaron lub ryż na ostatnie 10 min","Dopraw solą, pieprzem, lubczykiem","Posyp natką pietruszki"]},
  {id:"r29", name:"Burritos z fasolą",           time:"15 min", diff:"🟢", tag:"kolacja",   macro:{kcal:510,b:22,w:68,t:14},  steps:["Podgrzej fasolę z puszki z papryką i kuminem","Na tortillę połóż ryż, fasolę, ser, salsa","Zwiń ciasno w rulon","Opcjonalnie: opiecz na suchej patelni z obu stron"]},
  {id:"r30", name:"Makaron z pesto",             time:"12 min", diff:"🟢", tag:"kolacja",   macro:{kcal:520,b:16,w:62,t:24},  steps:["Ugotuj makaron al dente","Odcedź, zachowaj szklankę wody","Wymieszaj gorący makaron z 3 łyżkami pesto","Rozrzedź wodą z makaronu do kremowej konsystencji","Posyp parmezanem i orzeszkami piniowymi"]},
  {id:"r31", name:"Ziemniaki zapiekane",         time:"45 min", diff:"🟢", tag:"kolacja",   macro:{kcal:380,b:12,w:52,t:14},  steps:["Pokrój ziemniaki w ćwiartki","Wymieszaj z oliwą, solą, rozmaryn, czosnkiem","Wyłóż na blachę","Piecz 200°C przez 35-40 min","Podaj z jogurtem lub śmietaną"]},
  {id:"r32", name:"Klopsiki w sosie pomidorowym",time:"30 min", diff:"🟡", tag:"kolacja",   macro:{kcal:440,b:30,w:22,t:26},  steps:["Wymieszaj mięso mielone z jajkiem, bułką tartą, solą","Uformuj kulki wielkości orzecha włoskiego","Obsmaż ze wszystkich stron 5 min","Zalej sosem pomidorowym (puszka + przyprawy)","Gotuj pod przykryciem 15 min"]},
  {id:"r33", name:"Quesadilla z serem",          time:"10 min", diff:"🟢", tag:"kolacja",   macro:{kcal:460,b:22,w:44,t:20},  steps:["Na tortillę połóż starty ser i ulubione dodatki","Złóż na pół","Smaż na suchej patelni 2 min z każdej strony","Pokrój na trójkąty","Podaj z salsa i śmietaną"]},
  {id:"r34", name:"Smażony ryż z jajkiem",       time:"15 min", diff:"🟢", tag:"kolacja",   macro:{kcal:420,b:16,w:58,t:14},  steps:["Na oleju podsmaż czosnek i cebulkę","Dodaj zimny ryż z poprzedniego dnia","Smaż mieszając na dużym ogniu 5 min","Przesuń ryż, wbij 2 jajka i scrambluj","Polej sosem sojowym, wymieszaj"]},
  {id:"r35", name:"Naleśniki z dżemem",          time:"20 min", diff:"🟢", tag:"kolacja",   macro:{kcal:390,b:12,w:62,t:10},  steps:["Wymieszaj: 200g mąki, 2 jajka, 300ml mleka, szczypta soli","Smaż na rozgrzanej patelni z masłem","Każdy naleśnik ok 1-2 min z każdej strony","Podaj z dżemem, nutellą lub świeżymi owocami"]},

  // WEEKENDOWE
  {id:"r36", name:"Shakshuka",                   time:"25 min", diff:"🟡", tag:"weekend",   macro:{kcal:320,b:18,w:22,t:16},  steps:["Podsmaż cebulę i paprykę w oliwie 5 min","Dodaj pomidory z puszki, kminek, paprykę ostrą","Gotuj sos 10 min na małym ogniu","Zrób wgłębienia i wbij 4 jajka","Przykryj i gotuj 5-7 min. Podaj z chlebem"]},
  {id:"r37", name:"Curry z kurczaka",            time:"35 min", diff:"🟡", tag:"weekend",   macro:{kcal:490,b:38,w:42,t:16},  steps:["Pokrój kurczaka w kostkę, obsmaż 5 min","Dodaj cebulę i czosnek, smaż 3 min","Dodaj 2 łyżki pasty curry lub proszku","Wlej mleko kokosowe (400ml)","Gotuj 15 min. Podaj z ryżem"]},
  {id:"r38", name:"Pizza na patelni",            time:"20 min", diff:"🟡", tag:"weekend",   macro:{kcal:560,b:24,w:66,t:20},  steps:["Wymieszaj: 150g mąki, 1 łyżeczka proszku, 100ml wody, sól","Wałkuj ciasto na okrąg wielkości patelni","Smaż 3 min bez tłuszczu do złota","Przewróć, posmaruj sosem, dodaj ser i ulubione składniki","Przykryj i smaż 5 min"]},
  {id:"r39", name:"Gyros domowy",                time:"30 min", diff:"🟡", tag:"weekend",   macro:{kcal:520,b:34,w:44,t:20},  steps:["Pokrój pierś kurczaka w paski, marynuj z oregano, papryką, czosnkiem 15 min","Smaż na dużym ogniu 8 min","Podgrzej pitę","Złóż: pita, kurczak, surówka, sos tzatziki","Skrop cytryną"]},
  {id:"r40", name:"Risotto z grzybami",          time:"35 min", diff:"🔴", tag:"weekend",   macro:{kcal:480,b:14,w:68,t:16},  steps:["Podsmaż szalotkę w maśle, dodaj ryż Arborio","Wlej wino białe, mieszaj aż wchłonie","Dodawaj gorący bulion po chochli, non-stop mieszając","Dodaj namoczone grzyby po 15 min","Na końcu wmieszaj masło i parmezan"]},
  {id:"r41", name:"Burger wołowy",               time:"20 min", diff:"🟡", tag:"weekend",   macro:{kcal:580,b:36,w:44,t:26},  steps:["Uformuj kotlety z 150g mielonej wołowiny","Smaż 3-4 min z każdej strony na mocno rozgrzanej patelni","Posól dopiero po usmażeniu","Podgrzej bułkę","Złóż: bułka, sałata, pomidor, cebula, sos, kotlet, ser"]},
  {id:"r42", name:"Pad Thai",                    time:"25 min", diff:"🟡", tag:"weekend",   macro:{kcal:460,b:24,w:58,t:14},  steps:["Namocz makaron ryżowy 15 min w zimnej wodzie","Podsmaż czosnek z krewetkami lub kurczakiem","Dodaj makaron, sos rybny, sojowy, cukier","Przesuń na bok, wbij jajko i scrambluj","Podaj z kiełkami, limonką i orzeszkami"]},
  {id:"r43", name:"Naleśniki amerykańskie",      time:"20 min", diff:"🟢", tag:"weekend",   macro:{kcal:440,b:14,w:66,t:14},  steps:["Wymieszaj: 200g mąki, 1 łyżeczka proszku, 2 jajka, 200ml mleka, 2 łyżki cukru","Ciasto powinno być gęstsze niż na naleśniki","Smaż małe placki (8cm) 2 min — poczekaj aż pojawią się bąbelki","Przewróć i smaż 1 min","Podaj z syropem klonowym i owocami"]},
  {id:"r44", name:"Zupa ramen",                  time:"30 min", diff:"🟡", tag:"weekend",   macro:{kcal:430,b:28,w:48,t:12},  steps:["Zagotuj 800ml bulionu drobiowego","Dodaj 2 łyżki pasty miso, sos sojowy, sezam","Ugotuj makaron ramen","Ugotuj jajko 6 min (płynne w środku)","Złóż: makaron, zupa, jajko, dymka, nori, kiełki"]},
  {id:"r45", name:"Frittata warzywna",           time:"20 min", diff:"🟢", tag:"weekend",   macro:{kcal:310,b:22,w:12,t:20},  steps:["Na patelni żaroodpornej podsmaż warzywa (papryka, cukinia, cebula)","Rozbij 5 jajek, dodaj sól i zioła","Wlej na warzywa","Smaż 3 min na kuchence","Przesuń do piekarnika 180°C na 8 min"]},

  // DESERY
  {id:"r46", name:"Budyń chia",                  time:"5 min+noc",diff:"🟢",tag:"deser",   macro:{kcal:280,b:8,w:32,t:12},   steps:["Wymieszaj 3 łyżki nasion chia z 250ml mleka","Dodaj łyżkę miodu i wanilię","Wstaw do lodówki na minimum 4h","Rano ułóż warstwy: budyń chia, owoce","Posyp granolą"]},
  {id:"r47", name:"Bananowe ciasteczka",         time:"15 min", diff:"🟢", tag:"deser",     macro:{kcal:180,b:4,w:32,t:5},    steps:["Rozgnieć 2 dojrzałe banany widelcem","Wymieszaj z 100g płatków owsianych","Opcjonalnie: kawałki czekolady lub suszone owoce","Uformuj ciasteczka i wyłóż na blachę","Piecz 180°C przez 12 min"]},
  {id:"r48", name:"Lody bananowe",               time:"5 min+mróz",diff:"🟢",tag:"deser",  macro:{kcal:120,b:2,w:28,t:1},    steps:["Obierz i pokrój 3 banany w plastry","Zamroź przez minimum 3 godziny","Zblenduj zamrożone banany na gładkie lody","Opcjonalnie: kakao, masło orzechowe, owoce","Podaj od razu lub zamroź jeszcze 30 min"]},
  {id:"r49", name:"Mug cake czekoladowy",        time:"5 min",  diff:"🟢", tag:"deser",     macro:{kcal:340,b:8,w:46,t:14},   steps:["W kubku wymieszaj: 4 łyżki mąki, 4 łyżki cukru, 2 łyżki kakao","Dodaj 1 jajko, 3 łyżki mleka, 3 łyżki oleju","Wymieszaj dokładnie do gładkości","Wstaw do mikrofalówki na 90 sekund","Sprawdź patyczkiem — środek może być lekko wilgotny"]},
  {id:"r50", name:"Tiramisu w szklance",         time:"20 min+2h",diff:"🟡",tag:"deser",   macro:{kcal:380,b:8,w:42,t:20},   steps:["Ubij mascarpone z 3 łyżkami cukru pudru","Zaparz mocne espresso i ostudź","Maczaj biszkopty chwilę w kawie","W szklance układaj warstwy: biszkopty, krem","Powtórz warstwę, posyp kakaem, chłodź 2h"]},
];


window._cookCat = "wszystkie";
function renderCooking() {
  var cats = ["wszystkie","śniadanie","obiad","kolacja","weekend","deser"];
  var selCat = window._cookCat || "wszystkie";
  var filtered = selCat === "wszystkie" ? RECIPES : RECIPES.filter(function(r){ return r.tag===selCat; });

  var catBtns = cats.map(function(c) {
    var isSel = selCat === c;
    return '<button onclick="window._cookCat=\''+c+'\';renderCooking()" style="flex-shrink:0;padding:7px 14px;border-radius:20px;border:1px solid '+(isSel?'var(--g)':'var(--bord)')+';background:'+(isSel?'rgba(255,106,0,0.1)':'var(--card)')+';color:'+(isSel?'var(--g)':'var(--mut)')+';font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:var(--font);">'+c+'</button>';
  }).join('');

  var cards = filtered.map(function(r) {
    var diffCol = r.diff==="🟢"?"#34d399":r.diff==="🟡"?"#fbbf24":"#f87171";
    var m = r.macro;
    return '<div onclick="openRecipe(\''+r.id+'\')" style="background:var(--card);border:1px solid var(--bord);border-radius:14px;padding:14px;margin-bottom:8px;cursor:pointer;transition:border-color 0.2s;" onmouseenter="this.style.borderColor=\'rgba(255,106,0,0.35)\'" onmouseleave="this.style.borderColor=\'var(--bord)\'">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">'
      +'<div style="font-size:15px;font-weight:800;">'+r.name+'</div>'
      +'<div style="font-size:10px;background:'+diffCol+'22;color:'+diffCol+';border-radius:8px;padding:2px 8px;white-space:nowrap;margin-left:8px;font-family:var(--mono);">'+r.diff+' '+r.time+'</div>'
      +'</div>'
      +'<div style="display:flex;gap:10px;font-size:10px;font-family:var(--mono);">'
      +'<span style="color:var(--red);">⚡'+m.kcal+'kcal</span>'
      +'<span style="color:#60a5fa;">P:'+m.b+'g</span>'
      +'<span style="color:#fbbf24;">W:'+m.w+'g</span>'
      +'<span style="color:#fb923c;">T:'+m.t+'g</span>'
      +'</div>'
      +'</div>';
  }).join('');

  document.getElementById("tab-cooking").innerHTML = '<div class="fade-up">'
    +'<div style="font-size:20px;font-weight:900;margin-bottom:16px;background:linear-gradient(135deg,#ff6a00,#ffd700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">🍳 Przepisy</div>'
    +'<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px;scrollbar-width:none;">'+catBtns+'</div>'
    +cards+'</div>';
}
window.openRecipe = function(id) {
  var r = RECIPES.find(function(x){ return x.id===id; });
  if (!r) return;
  var modal = document.createElement("div");
  modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:9999;overflow-y:auto;padding:20px;";
  var m = r.macro;
  var macroBar = '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">'
    +'<div style="background:rgba(255,61,90,0.1);border:1px solid rgba(255,61,90,0.2);border-radius:10px;padding:8px 12px;text-align:center;flex:1;min-width:60px;">'
    +'<div style="font-size:16px;font-weight:900;color:var(--red);">'+m.kcal+'</div>'
    +'<div style="font-size:9px;color:var(--mut);font-family:var(--mono);">KCAL</div></div>'
    +'<div style="background:rgba(96,165,250,0.1);border:1px solid rgba(96,165,250,0.2);border-radius:10px;padding:8px 12px;text-align:center;flex:1;min-width:60px;">'
    +'<div style="font-size:16px;font-weight:900;color:#60a5fa;">'+m.b+'g</div>'
    +'<div style="font-size:9px;color:var(--mut);font-family:var(--mono);">BIAŁKO</div></div>'
    +'<div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);border-radius:10px;padding:8px 12px;text-align:center;flex:1;min-width:60px;">'
    +'<div style="font-size:16px;font-weight:900;color:#fbbf24;">'+m.w+'g</div>'
    +'<div style="font-size:9px;color:var(--mut);font-family:var(--mono);">WĘGLE</div></div>'
    +'<div style="background:rgba(251,146,60,0.1);border:1px solid rgba(251,146,60,0.2);border-radius:10px;padding:8px 12px;text-align:center;flex:1;min-width:60px;">'
    +'<div style="font-size:16px;font-weight:900;color:#fb923c;">'+m.t+'g</div>'
    +'<div style="font-size:9px;color:var(--mut);font-family:var(--mono);">TŁUSZCZ</div></div>'
    +'</div>';
  var stepsHTML = r.steps.map(function(s, i) {
    return '<div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">'
      +'<div style="width:24px;height:24px;border-radius:50%;background:rgba(255,106,0,0.15);border:1px solid rgba(255,106,0,0.3);color:var(--g);font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+(i+1)+'</div>'
      +'<div style="font-size:13px;color:var(--txt);line-height:1.5;padding-top:3px;">'+s+'</div>'
      +'</div>';
  }).join('');
  modal.innerHTML = '<div style="max-width:480px;margin:0 auto;background:var(--bg2);border:1px solid var(--bord);border-radius:20px;padding:24px 20px;">'
    +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">'
    +'<div><div style="font-size:22px;font-weight:900;">'+r.name+'</div><div style="font-size:11px;color:var(--mut);margin-top:2px;">⏱ '+r.time+' · '+r.diff+' · #'+r.tag+'</div></div>'
    +'<button onclick="this.closest(\'[style*=fixed]\').remove()" style="font-size:22px;color:var(--mut);background:none;border:none;cursor:pointer;">×</button>'
    +'</div>'+macroBar+stepsHTML
    +'<button onclick="this.closest(\'[style*=fixed]\').remove();markCookingDone()" style="width:100%;margin-top:16px;background:linear-gradient(135deg,var(--g),var(--g2));color:#000;border:none;border-radius:12px;padding:13px;font-weight:800;font-size:14px;font-family:var(--font);">✓ Ugotowałem!</button>'
    +'</div>';
  document.body.appendChild(modal);
};
window.markCookingDone = function() {
  S.stats.mealsCooked++; S.xp += 15;
  spawnBurst(window.innerWidth/2, window.innerHeight/2, "#fb923c", 16);
  showWin("🍳 Posiłek ugotowany! +15 XP", "#fb923c");
  SFX.habit(); saveState(); renderHeader();
};

// ── LEVEL / POSTĘPY ───────────────────────
function renderLevel() {
  var lv = getLevelObj(S.xp), inLv = xpInLvl(S.xp);
  var bs = Object.assign({}, S.stats, {xp:S.xp});
  var earnedBadges = BADGES.filter(function(b){ return b.cond(bs); });

  var levelHero = '<div style="background:linear-gradient(160deg,#1a1000,#130010,#0f0700);border:1px solid rgba(255,106,0,0.25);border-radius:20px;padding:22px 20px;text-align:center;margin-bottom:16px;position:relative;overflow:hidden;">'
    +'<div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(255,106,0,0.08)0%,transparent 65%);pointer-events:none;"></div>'
    +'<div style="font-size:44px;margin-bottom:10px;" class="float-anim">'+lv.icon+'</div>'
    +'<div style="font-size:26px;font-weight:900;color:var(--gold);text-shadow:0 0 24px rgba(255,215,0,0.4);">'+lv.name+'</div>'
    +'<div style="font-size:11px;color:var(--mut);font-family:var(--mono);margin-bottom:14px;">Poziom '+lv.lvl+' · '+S.xp+' XP łącznie</div>'
    +'<div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:10px;color:var(--mut);">DO POZIOMU '+(lv.lvl+1)+'</span><span style="font-size:10px;color:var(--gold);font-family:var(--mono);">'+inLv+'/120</span></div>'
    +barHTML(inLv,120,"var(--gold)",8)+'</div>';

  var badgesHTML = '<div class="slabel" style="margin-bottom:10px;">Odznaki '+earnedBadges.length+'/'+BADGES.length+'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:20px;">';
  BADGES.forEach(function(b) {
    var e = b.cond(bs);
    badgesHTML += '<div class="badge-item'+(e?' earned':'')+'" title="'+b.name+': '+b.desc+'" style="opacity:'+(e?1:0.3)+';">'
      +'<div style="font-size:24px;">'+b.e+'</div>'
      +'<div style="font-size:9px;color:'+(e?'var(--g)':'var(--mut)')+';margin-top:4px;font-weight:700;line-height:1.2;">'+b.name+'</div>'
      +'</div>';
  });
  badgesHTML += '</div>';

  var counters = [
    {e:"🔥",l:"Max streak",v:S.stats.maxStreak},{e:"💎",l:"Idealne dni",v:S.stats.perfectDays},
    {e:"🗡️",l:"Questy",v:S.stats.questsDone},{e:"🎯",l:"Cele",v:S.stats.goalsCompleted},
    {e:"📖",l:"Rozdziały",v:S.stats.chaptersRead},{e:"🍳",l:"Posiłki",v:S.stats.mealsCooked},
    {e:"💧",l:"Woda",v:S.stats.waterCount},{e:"🌍",l:"Język",v:S.stats.langCount},
    {e:"🚫",l:"Detoks",v:S.stats.noscreenCount},{e:"🤖",l:"AI/Tech",v:S.stats.aiCount},
    {e:"📊",l:"Finanse",v:S.stats.financeCount},{e:"🔍",l:"Przeglądy",v:S.stats.weeklyReviews},
  ];
  var cHTML = '<div class="slabel" style="margin-bottom:10px;">Statystyki</div><div class="counter-grid" style="margin-bottom:20px;">';
  counters.forEach(function(c) {
    cHTML += '<div class="counter-item"><div style="font-size:18px;">'+c.e+'</div><div><div style="font-size:18px;font-weight:900;color:var(--g);line-height:1;">'+c.v+'</div><div style="font-size:9px;color:var(--mut);">'+c.l+'</div></div></div>';
  });
  cHTML += '</div>';

  var stHTML = '<div class="slabel" style="margin-bottom:10px;">Streaki</div><div style="margin-bottom:20px;">';
  HABITS.forEach(function(h) {
    var st = S.streaks[h.id] || 0;
    stHTML += '<div style="background:var(--card);border:1px solid var(--bord);border-radius:10px;padding:9px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px;">'
      +'<span style="font-size:16px;">'+h.emoji+'</span>'
      +'<span style="flex:1;font-size:12px;font-weight:600;">'+h.label+'</span>'
      +'<span style="font-family:var(--mono);font-size:12px;color:'+(st>=7?'var(--gold)':st>0?'var(--g)':'var(--mut)')+';"> '+(st>0?'🔥 '+st:'—')+'</span>'
      +'</div>';
  });
  stHTML += '</div>';

  var lvlList = '<div class="slabel" style="margin-bottom:10px;">Mapa poziomów</div><div style="margin-bottom:20px;">';
  LEVELS.forEach(function(l) {
    var cur = xpToLvl(S.xp) === l.lvl-1, passed = S.xp >= l.xp;
    lvlList += '<div class="level-row'+(cur?' current':!passed?' locked':'')+'">'
      +'<div style="font-size:26px;flex-shrink:0;">'+l.icon+'</div>'
      +'<div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:1px;">'
      +'<span style="font-weight:800;font-size:14px;color:'+(cur?'var(--g)':'var(--txt)')+';">'+l.name+'</span>'
      +(cur?'<span style="font-size:9px;background:var(--g);color:#000;border-radius:5px;padding:1px 5px;font-weight:700;">TERAZ</span>':'')
      +'</div><div style="font-size:10px;color:var(--mut);">'+l.desc+'</div></div>'
      +'<div style="font-family:var(--mono);font-size:10px;color:'+(passed?'var(--gold)':'var(--mut)')+';">'+l.xp+' XP</div>'
      +'</div>';
  });
  lvlList += '</div>';

  var resetHTML = '<div style="padding-top:20px;border-top:1px solid var(--bord);">'
    +'<div style="font-size:10px;color:var(--mut);text-align:center;margin-bottom:10px;font-family:var(--mono);letter-spacing:2px;">STREFA NIEBEZPIECZNA</div>'
    +'<button onclick="confirmReset()" style="width:100%;padding:13px;background:transparent;border:1px solid rgba(255,61,90,0.25);border-radius:14px;color:rgba(255,100,120,0.5);font-size:13px;font-weight:700;font-family:var(--font);cursor:pointer;" onmouseenter="this.style.borderColor=\'rgba(255,61,90,0.7)\';this.style.color=\'#ff3d5a\'" onmouseleave="this.style.borderColor=\'rgba(255,61,90,0.25)\';this.style.color=\'rgba(255,100,120,0.5)\'">🗑️ Zresetuj wszystkie dane</button>'
    +'</div>';

  var historyBtn = '<button onclick="switchTab(\'history\')" style="width:100%;padding:13px;background:rgba(255,106,0,0.08);border:1.5px solid rgba(255,106,0,0.3);border-radius:14px;color:var(--g);font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;">🗓️ Historia nawyków (poprzednie dni)</button>';

  document.getElementById("tab-level").innerHTML = '<div class="fade-up">'+historyBtn+levelHero+badgesHTML+cHTML+stHTML+lvlList+resetHTML+'</div>';
}

// ── RESET ─────────────────────────────────
window.confirmReset = function() {
  var overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);";
  overlay.innerHTML = '<div style="background:var(--bg2);border:1px solid rgba(255,61,90,0.4);border-radius:22px;padding:28px 24px;max-width:340px;width:100%;text-align:center;"><div style="font-size:40px;margin-bottom:12px;">⚠️</div><div style="font-size:18px;font-weight:900;color:var(--txt);margin-bottom:8px;">Na pewno?</div><div style="font-size:13px;color:var(--mut);line-height:1.6;margin-bottom:24px;">To usunie <strong style="color:var(--g)">cały postęp</strong> — XP, questy, cele, wydatki, streaki.</div><div style="display:flex;gap:10px;"><button onclick="this.closest(\'[style*=fixed]\').remove()" style="flex:1;padding:13px;background:var(--bg3);border:1px solid var(--bord);border-radius:12px;color:var(--txt);font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;">Anuluj</button><button onclick="doReset();this.closest(\'[style*=fixed]\').remove()" style="flex:1;padding:13px;background:linear-gradient(135deg,#ff3d5a,#cc1a35);border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:800;font-family:var(--font);cursor:pointer;">Resetuj</button></div></div>';
  document.body.appendChild(overlay);
};
window.doReset = function() {
  try { localStorage.removeItem('championState'); } catch(e) {}
  S = {xp:0,completed:[],streaks:{},streakDates:{},goals:[],todos:[],doneQuests:[],expenses:[],customExpCats:[],habitNotes:{},weekHistory:{},currentQuest:null,weekSel:new Date().getDay(),lastDate:new Date().toDateString(),stats:{maxStreak:0,perfectDays:0,habitsTotal:0,questsDone:0,goalsCompleted:0,goalsAdded:0,expensesCount:0,chaptersRead:0,mealsCooked:0,waterCount:0,langCount:0,noscreenCount:0,weeklyReviews:0,financeCount:0,aiCount:0,planCount:0,gratitudeCount:0}};
  renderHeader(); switchTab('today');
};

// ── DATE CHANGE ───────────────────────────
function checkDateChange() {
  var todayStr = new Date().toDateString();
  if (S.lastDate && S.lastDate !== todayStr) {
    archiveDay(S.lastDate, S.completed);
    var prevDate = new Date(S.lastDate);
    var prevDow  = prevDate.getDay();
    var prevKey  = dateKey(prevDate);
    HABITS.forEach(function(h) {
      if (h.days.indexOf(prevDow) >= 0) {
        if (S.streakDates[h.id] !== prevKey) {
          S.streaks[h.id] = 0; delete S.streakDates[h.id];
        }
      }
    });
    S.completed = []; S.lastDate = todayStr;
    saveState(); renderHeader();
    if (currentTab === 'today') renderToday();
  }
}
setInterval(checkDateChange, 60000);

// ── INIT ──────────────────────────────────
try {
  loadState();
  renderHeader();
  renderToday();
} catch(e) {
  console.error("Champion init error:", e);
  var app = document.getElementById('app');
  if (app) app.innerHTML = '<div style="padding:24px;color:#ff6a00;font-family:monospace;font-size:12px;background:#0d0008;min-height:100vh;"><b>Błąd startu:</b><br>'+e.message+'<br><br>'+String(e.stack||'').replace(/\n/g,'<br>')+'</div>';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js').catch(function(){});
  });
}
