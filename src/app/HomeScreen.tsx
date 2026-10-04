import { useEffect, useRef, useState } from "react";
import { Cast, Play, Plus, Check, ChevronRight, History, Heart, MoreVertical, ChevronDown } from "lucide-react";
import iconCrown from "../assets/shorts/crown.svg";

// ─── Home tab (Figma "AIS PLAY / Home / Full Page", node 695:69713) ─────────────────────────────────────────────
// The phone Home screen behind the bottom navigation's Home tab: a full-bleed hero carousel under the header and
// top tabs, then rails (Jump Right Back In, TV Guide, Hot Channel, Live and Upcoming, Top 10, Shorts, AIS Play
// Exclusive). The Figma frame is a wireframe; its slots are filled with the artwork the TV Home already uses.

const BASE = import.meta.env.BASE_URL;
const a = (path: string) => `${BASE}${path}`;
const tag = (name: string) => a(`badges/tag-${name}.png`);
const FONT = "'Open Sans', sans-serif";
const ON_SURFACE = "#e8e8e8", ON_VARIANT = "#a8a8a8", LIVE = "#ea5454";

interface Slide { title: string; img: string; pos?: string; platform: string; channel: string; live?: boolean; time?: string }
const SLIDES: Slide[] = [
  { title: "Liverpool vs Brentford", img: a("posters/liver-ben.jpg"), pos: "50% center", platform: "monomax", channel: "Channel 501: Monomax1", live: true, time: "20:00 – 22:15" },
  { title: "House of the Dragon", img: a("posters_portrait/House.jpg"), platform: "hbo", channel: "HBO Original · Season 2" },
  { title: "F1: The Movie", img: a("posters_portrait/F1.jpg"), platform: "prime", channel: "Movie · 2 hr 35 min" },
  { title: "John Wick: Chapter 4", img: a("posters_portrait/John.jpg"), platform: "netflix", channel: "Movie · 2 hr 49 min" },
  { title: "Avatar: Fire and Ash", img: a("posters_portrait/avatar.jpg"), platform: "disney", channel: "Movie · 3 hr 12 min" },
];

const CONTINUE = [
  { t: "Young Sherlock S1:E1", img: a("posters/continue/c1.jpg"), plat: "prime", left: 27, pct: 62 },
  { t: "Avengers: Endgame", img: a("posters/continue/c2.jpg"), plat: "disney", left: 48, pct: 70 },
  { t: "Superman", img: a("posters/continue/c3.jpg"), plat: "hbo", left: 35, pct: 55 },
  { t: "All Or Nothing: Brazil National Team", img: a("posters/continue/c4.jpg"), plat: "netflix", left: 18, pct: 80 },
  { t: "Project Hail Mary", img: a("posters/continue/c5.jpg"), plat: "netflix", left: 64, pct: 40 },
];

const GUIDE = [
  { logo: "mutv.png", t: "PL Match: v Chelsea (A) 25/26", sub: "Started at 6:30 PM", next: "Inside United", nextTime: "19:30", pct: 45, fav: true },
  { logo: "cnn.jpg", t: "CNN News Central", sub: "Started at 6:30 PM", next: "Anderson Cooper 360°", nextTime: "19:30", pct: 60, fav: true },
  { logo: "realmadrid.png", t: "Champions League 15/16: Real Madrid vs Atlético de Madrid", sub: "Started at 6:30 PM", next: "Classic Highlights", nextTime: "19:30", pct: 30 },
  { logo: "bbc.jpg", t: "BBC News at Ten", sub: "Started at 6:30 PM", next: "HARDtalk", nextTime: "19:30", pct: 72 },
  { logo: "wsport.png", t: "Malaysia Regional Cup '26: Wildcats v Sneakers", sub: "Started at 6:30 PM", next: "Heroines (S2E02)", nextTime: "19:30", pct: 20, contain: true },
];

type ChanBadge = "live" | "hot" | "new";
const CHANNELS: { t: string; img: string; badge?: ChanBadge; dark?: boolean }[] = [
  { t: "Asian Games 2026 · 902", img: a("tv-features-test/live-stream-assets/channel-asian-games.png"), badge: "live" },
  { t: "Asian Games 2026 · 907", img: a("tv-features-test/shorts-assets/channel-907.png"), badge: "live" },
  { t: "PLAY Sports 61", img: a("icons/channels/playsports.png"), badge: "live", dark: true },
  { t: "Warner TV", img: a("icons/channels/wbtv.png"), badge: "hot" },
  { t: "HBO", img: a("icons/channels/hbo.png"), badge: "hot" },
  { t: "HBO Hits", img: a("icons/channels/hbohits.png"), badge: "new" },
  { t: "HBO Family", img: a("icons/channels/hbofamily.png") },
  { t: "Cinemax", img: a("icons/channels/cinemax.png") },
  { t: "Rock Entertainment", img: a("icons/channels/rock.png") },
];
const RING: Record<ChanBadge, string> = { live: "#ff0000", hot: "#e7007e", new: "#b8f416" };

const UPCOMING = [
  { t: "Liverpool vs Brentford", sub: "Premier League", img: a("posters/upcoming/live.jpg"), live: true },
  { t: "Leipzig vs Gladbach", sub: "Bundesliga", img: a("posters/upcoming/u2.jpg"), badge: "Today 20:30", premium: true },
  { t: "Dortmund vs Hamburg", sub: "Bundesliga", img: a("posters/upcoming/u3.jpg"), badge: "Today 20:30" },
  { t: "Masterchef Thailand", sub: "Season 7", img: a("posters/upcoming/u1.jpg"), badge: "Start in 58:12" },
  { t: "CT14 Eala vs Jovic (R1)", sub: "WTA Tour", img: a("posters/upcoming/u4.png"), badge: "Tomorrow 6:00 PM" },
];

const TOP10 = [
  "posters_portrait/House.jpg", "posters_portrait/John.jpg", "posters_portrait/Venom.jpg", "posters_portrait/avatar.jpg",
  "posters_portrait/debt.jpg", "posters_portrait/F1.jpg", "posters_portrait/topgun_m.jpg", "posters_portrait/legal/l1.jpg",
  "posters_portrait/lotr/r1.jpg", "posters_portrait/lotr/r5.jpg",
].map(a);

const EXCLUSIVE = [
  { img: a("posters_portrait/ex3.jpg"), live: true },
  { img: a("posters_portrait/ex1.jpg") },
  { img: a("posters_portrait/ex2.jpg") },
  { img: a("posters_portrait/ex4.jpg") },
  { img: a("posters_portrait/ex5.jpg") },
];

const TABS = ["Home", "LiveTV", "Sport", "Movie"];

// ─── Sport tab (Figma "AIS PLAY / Sport", node 701:71230) ───
const SPORT_SLIDES: Slide[] = [
  { title: "Man City vs Arsenal", img: a("posters_portrait/ex3.jpg"), platform: "monomax", channel: "Premier League", live: true, time: "20:00 – 22:15" },
  { title: "Liverpool vs Brentford", img: a("posters/liver-ben.jpg"), pos: "50% center", platform: "monomax", channel: "Premier League", live: true, time: "22:30 – 00:30" },
  { title: "Man Utd vs Chelsea", img: a("posters_portrait/ex4.jpg"), platform: "monomax", channel: "Emirates FA Cup", time: "Sat 19:30" },
  { title: "Japan vs Thailand", img: a("tv-features-test/live-stream-assets/football-255.jpg"), platform: "monomax", channel: "Asian Games 2026", live: true, time: "18:00 – 20:00" },
  { title: "F1: The Movie", img: a("posters_portrait/F1.jpg"), platform: "prime", channel: "Movie · 2 hr 35 min" },
];
// No league / club logos in the project yet: each gets a crest circle in its colours (logo = an image when there is one)
const LEAGUES = [
  { t: "Premier League", short: "PL", bg: "linear-gradient(135deg,#3d195b,#6a1b9a)", fg: "#00ff85" },
  { t: "UEFA Champions League", short: "UCL", bg: "radial-gradient(circle at 30% 30%,#1d3c8f,#06123a)", fg: "#fff" },
  { t: "La Liga", short: "LL", bg: "linear-gradient(135deg,#ff4b44,#c70f17)", fg: "#fff" },
  { t: "Bundesliga", short: "BL", bg: "linear-gradient(135deg,#d20515,#7a0009)", fg: "#fff" },
  { t: "Serie A", short: "SA", bg: "linear-gradient(135deg,#008fd7,#003a70)", fg: "#fff" },
  { t: "Thai League", short: "T1", bg: "linear-gradient(135deg,#0b2a5b,#e1251b)", fg: "#fff" },
];
const HIGHLIGHTS = [
  { t: "Man United vs Man City", img: a("tv-features-test/live-stream-assets/football-180.jpg"), plat: "monomax", pct: 35 },
  { t: "Japan vs Thailand", img: a("tv-features-test/live-stream-assets/football-024.jpg"), plat: "monomax", pct: 60 },
  { t: "Arsenal vs Chelsea", img: a("posters/arsenal.jpg"), plat: "monomax", pct: 20 },
  { t: "Mainz vs Paderborn", img: a("posters/SC.jpg"), plat: "monomax", pct: 75 },
  { t: "Thailand vs China · Volleyball", img: a("tv-features-test/shorts-assets/volleyball.jpg"), plat: "monomax", pct: 50 },
];
const SPORT_CHIPS = ["All", "Football", "Basketball", "Golf", "Tennis", "Badminton", "Motorsport"];
const FOOTBALL_FOR_YOU = [
  { img: a("posters_portrait/ex3.jpg"), badge: "Recommend" },
  { img: a("posters_portrait/ex4.jpg"), badge: "Best Seller" },
  { img: a("posters_portrait/ex5.jpg"), badge: "Best Seller" },
  { img: a("posters/upcoming/u3.jpg"), badge: "New" },
  { img: a("posters/upcoming/u2.jpg") },
];
const FAVOURITES = [
  { t: "Manchester United", logo: a("icons/epg/mutv.png") },
  { t: "Real Madrid", logo: a("icons/epg/realmadrid.png"), bg: "#0d1e46" },   // white crest: on a navy disc
  { t: "French Open", short: "RG", bg: "linear-gradient(135deg,#d35400,#a04000)", fg: "#fff" },
  { t: "UEFA Champions League", short: "UCL", bg: "radial-gradient(circle at 30% 30%,#1d3c8f,#06123a)", fg: "#fff" },
  { t: "Formula 1", short: "F1", bg: "linear-gradient(135deg,#e10600,#7a0300)", fg: "#fff" },
];
const DOCUMENTARY = [
  { img: a("posters/maxresdefault.jpg"), pos: "92% center", t: "Sir Alex Ferguson: Never Give In" },
  { img: a("posters/all.jpg"), pos: "22% center", t: "All Or Nothing: Brazil National Team" },
  { img: a("posters_portrait/F1.jpg"), t: "F1: The Movie" },
  { img: a("posters/f1.jpg"), pos: "30% center", t: "Drive to Survive" },
];

export interface ShortThumb { img: string; title: string }

export default function HomeScreen({
  topInset, bottom, shorts, onOpenShort, onToast,
}: {
  topInset: string;                      // status bar / safe-area height
  bottom: string;                        // space taken by the bottom navigation
  shorts: ShortThumb[];
  onOpenShort: (index: number) => void;
  onToast: (msg: string) => void;
}) {
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState("Home");
  const [scrolled, setScrolled] = useState(false);
  // the top tabs stay hidden on the first view and fade in, sliding down from the top, once the page scrolls
  const [showTabs, setShowTabs] = useState(false);
  // titles added to My List from the hero's + button (it turns into a check mark)
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const toggleList = (title: string) => {
    const has = myList.has(title);
    setMyList(prev => { const n = new Set(prev); if (has) n.delete(title); else n.add(title); return n; });
    onToast(has ? "Removed from My List" : "Added to My List");
  };
  const scroller = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const logoRowRef = useRef<HTMLDivElement>(null);
  const playRowRef = useRef<HTMLDivElement>(null);
  // compact header: once the Play button scrolls up to the header, the logo and the tab row give way to a single
  // "⌄ Home" title (Figma "Mobile / Header Detail Page"); tapping it expands the tab row under it again
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Sport tab: the selected sport chip, and whether the chip row is docked inside the header
  const [chip, setChip] = useState("All");
  const onChip = (c: string) => { setChip(c); if (c !== "All") onToast(`${c} (demo)`); };
  const chipsRef = useRef<HTMLDivElement>(null);
  const [chipsDocked, setChipsDocked] = useState(false);

  // the hero carousel moves on every 5s; a swipe moves it at once and restarts the wait
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const n = tab === "Sport" ? SPORT_SLIDES.length : SLIDES.length;
    const t = setTimeout(() => setSlide(s => (s + 1) % n), 5000);
    return () => clearTimeout(t);
  }, [slide, tick, tab]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const go = (d: number) => { const n = tab === "Sport" ? SPORT_SLIDES.length : SLIDES.length; setSlide(s => (s + d + n) % n); setTick(t => t + 1); };

  const demo = (label: string) => onToast(`${label} (demo)`);
  // the tab row shows once the page has scrolled a little; in the compact header only while it's expanded (⌄ tapped)
  const tabsOn = compact ? menuOpen : showTabs;
  // the compact "⌄ Home" title, only while collapsed
  const titleOn = compact && !menuOpen;
  const openedAt = useRef(0);
  useEffect(() => { if (menuOpen) openedAt.current = scroller.current?.scrollTop ?? 0; }, [menuOpen]);
  const pickTab = (t: string) => {
    setMenuOpen(false);
    if (t === "Home" || t === "Sport") {
      setTab(t); setSlide(0); setTick(k => k + 1); scroller.current?.scrollTo({ top: 0 });
      setShowTabs(false); setScrolled(false); setCompact(false); setChipsDocked(false);
    } else demo(t);
  };
  const slides = tab === "Sport" ? SPORT_SLIDES : SLIDES;
  const s = slides[slide % slides.length];
  const sport = tab === "Sport";

  return (
    <div className="absolute inset-x-0 top-0 z-[15]" style={{ bottom, background: "#101010", fontFamily: FONT }}>
      {/* Header: logo + Cast, then the top tabs. Transparent over the hero, solid once the page scrolls. */}
      <div
        ref={headerRef}
        className="absolute inset-x-0 top-0 z-20 transition-all duration-300"
        style={{
          paddingTop: topInset,
          // scrolled: Figma's "Mobile / Header Detail Page" glass, a dark-to-clear tint over a blur of the page below
          background: scrolled ? "linear-gradient(180deg, rgba(16,16,16,0.6), rgba(118,118,118,0))" : "linear-gradient(180deg, rgba(0,0,0,0.65), rgba(0,0,0,0))",
          backdropFilter: scrolled ? "blur(20px)" : "none", WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        }}
      >
        <div ref={logoRowRef} className="relative flex items-center justify-between px-4" style={{ height: 64 }}>
          <div className="relative flex items-center" style={{ height: 32 }}>
            {/* the app logo, also while the compact header is expanded (tapping it then collapses it again) */}
            <span onClick={() => { if (compact) setMenuOpen(false); }} className="text-white transition-all duration-300"
              style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.5, opacity: titleOn ? 0 : 1, transform: titleOn ? "translateY(-8px)" : "none", pointerEvents: titleOn ? "none" : "auto" }}>AIS <span style={{ color: "#b8f416" }}>PLAY</span></span>
            <button onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-label={`${tab}: show sections`}
              className="absolute left-0 top-1/2 flex items-center gap-2 transition-all duration-300 whitespace-nowrap"
              style={{ opacity: titleOn ? 1 : 0, transform: `translateY(${titleOn ? "-50%" : "calc(-50% + 8px)"})`, pointerEvents: titleOn ? "auto" : "none" }}>
              <span className="w-8 h-8 flex items-center justify-center"><ChevronDown size={20} className="text-white" /></span>
              <span style={{ fontSize: 24, fontWeight: 600, color: ON_SURFACE }}>{tab}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => demo("Cast")} aria-label="Cast" className="w-8 h-8 rounded-full flex items-center justify-center"><Cast size={20} className="text-white" /></button>
          </div>
        </div>
        {/* pulled up 17px: 26px between the bottom of the logo and the top of the tab text */}
        <div className="flex gap-2 px-4 overflow-hidden" style={{
          marginTop: compact && !menuOpen ? 0 : -17, maxHeight: compact && !menuOpen ? 0 : 60,
          opacity: tabsOn ? 1 : 0, transform: tabsOn ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity .3s ease, transform .3s cubic-bezier(.2,0,0,1), max-height .3s cubic-bezier(.2,0,0,1), margin-top .3s cubic-bezier(.2,0,0,1)",
          pointerEvents: tabsOn ? "auto" : "none",
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => pickTab(t)} className="relative flex flex-col items-center px-2 pt-3 pb-[8px]">
              <span style={{ fontSize: 16, fontWeight: t === tab ? 700 : 400, color: t === tab ? "#fff" : ON_SURFACE }}>{t}</span>
              {t === tab && <span className="absolute left-2 right-2 bottom-0 h-[3px] rounded-[1.5px] bg-white" />}
            </button>
          ))}
        </div>
        {/* docked chips: 16px under the tab row when that's expanded, 4px under the compact title otherwise */}
        {sport && chipsDocked && <div className="pb-3 transition-[padding] duration-300" style={{ paddingTop: tabsOn ? 16 : 4 }}><SportChips chip={chip} onPick={onChip} /></div>}
      </div>

      <div
        ref={scroller}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden home-scroll"
        onScroll={e => {
          const y = e.currentTarget.scrollTop;
          setShowTabs(y > 24);
          // glass header once the hero title comes within 130px of the header's bottom edge
          const h = headerRef.current?.getBoundingClientRect(), t = titleRef.current?.getBoundingClientRect();
          setScrolled(!!h && !!t && y > 0 && t.top - h.bottom <= 130);
          const l = logoRowRef.current?.getBoundingClientRect(), p = playRowRef.current?.getBoundingClientRect();
          const c = !!l && !!p && y > 0 && p.top <= l.bottom;
          setCompact(c);
          const cr = chipsRef.current?.getBoundingClientRect();
          setChipsDocked(!!l && !!cr && y > 0 && cr.top <= l.bottom);
          // the expanded header folds back up once the page moves on
          if (!c || Math.abs(y - openedAt.current) > 40) setMenuOpen(false);
        }}
      >
        {/* Hero */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 647, borderRadius: "0 0 16px 16px" }}
          onPointerDown={e => { swipe.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={e => {
            const st = swipe.current; swipe.current = null;
            if (!st) return;
            const dx = e.clientX - st.x;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - st.y)) go(dx < 0 ? 1 : -1);
          }}
        >
          {slides.map((sl, i) => (
            <img key={tab + sl.title} src={sl.img} alt="" draggable={false}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
              style={{ objectPosition: sl.pos ?? "center", opacity: i === slide ? 1 : 0 }} />
          ))}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,16,16,0) 45%, rgba(16,16,16,0.85) 78%, #101010 100%)" }} />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 py-2" style={{ gap: sport ? 20 : 26, paddingLeft: sport ? 16 : 24, paddingRight: sport ? 16 : 24 }}>
            {sport ? (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2">
                  <h2 ref={titleRef} className="flex-1 text-white m-0" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{s.title}</h2>
                  <button onClick={() => demo("More")} aria-label="More" className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ border: "1px solid rgba(255,255,255,0.6)" }}>
                    <MoreVertical size={18} className="text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <img src={tag(s.platform)} alt={s.platform} className="block object-contain" style={{ width: 45, height: 30, borderRadius: 6 }} />
                  {s.live && <LivePill size={1.5} />}
                  {s.time && <span className="flex items-center rounded-full px-3" style={{ height: 26, fontSize: 12, color: ON_SURFACE, border: "1px solid rgba(255,255,255,0.5)" }}>{s.time}</span>}
                </div>
              </div>
            ) : (
            <div className="flex flex-col items-center gap-2 w-full">
                <h2 ref={titleRef} className="text-white text-center m-0" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15, textShadow: "0 2px 10px rgba(0,0,0,.5)" }}>{s.title}</h2>
                <div className="flex items-center gap-[9px]">
                  <img src={tag(s.platform)} alt={s.platform} className="block object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <span style={{ fontSize: 11, color: ON_SURFACE }}>{s.channel}</span>
                </div>
                {(s.live || s.time) && (
                  <div className="flex items-center gap-[9px]">
                    {s.live && <LivePill />}
                    {s.time && <span className="flex items-center rounded-[10px] px-[7px]" style={{ height: 20, fontSize: 11, color: ON_SURFACE, background: "rgba(255,255,255,0.12)" }}>{s.time}</span>}
                  </div>
                )}
              </div>
            )}
            <div ref={playRowRef} className="flex items-center gap-4 w-full">
              <button onClick={() => demo(s.live ? "Watch live" : "Play")} className="flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2" style={{ background: "#f0f0f0", height: 44 }}>
                <Play size={20} fill="#282828" stroke="#282828" />
                <span style={{ fontSize: 16, fontWeight: 600, color: "#282828" }}>{s.live ? "Watch Live" : "Play"}</span>
              </button>
              <button onClick={() => toggleList(s.title)} aria-label={myList.has(s.title) ? "Remove from My List" : "Add to My List"} aria-pressed={myList.has(s.title)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "1.5px solid rgba(255,255,255,0.85)" }}>
                {myList.has(s.title) ? <Check size={22} className="text-white" /> : <Plus size={22} className="text-white" />}
              </button>
            </div>
            <div className="flex items-center gap-[6px] pb-1">
              {slides.map((_, i) => (
                <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => { setSlide(i); setTick(t => t + 1); }}
                  className="rounded-full transition-all duration-300"
                  style={{ height: 8, width: i === slide ? 22 : 8, background: i === slide ? "#e6e6e6" : "rgba(255,255,255,0.35)" }} />
              ))}
            </div>
          </div>
        </div>

        {sport ? <SportRails demo={demo} chip={chip} onChip={onChip} chipsRef={chipsRef} chipsDocked={chipsDocked} /> : (
        <div className="flex flex-col gap-6 pt-6 pb-[60px]">
          {/* Jump Right Back In */}
          <Rail title="Jump Right Back In">
            {CONTINUE.map(c => (
              <button key={c.t} onClick={() => demo(c.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 200 }}>
                <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
                  <img src={c.img} alt="" className="w-full h-full object-cover" />
                  <img src={tag(c.plat)} alt={c.plat} className="absolute left-2 bottom-[14px] object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: "#4a4a4a" }}>
                    <div className="h-full" style={{ width: `${c.pct}%`, background: "#f44735" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-[2px]">
                  <span className="truncate" style={{ fontSize: 16, color: ON_SURFACE }}>{c.t}</span>
                  <span style={{ fontSize: 12, color: ON_VARIANT }}>{c.left} mins left</span>
                </div>
              </button>
            ))}
          </Rail>

          {/* TV Guide: two rows that scroll together */}
          <Rail title="TV Guide" more onMore={() => demo("TV Guide")} gap={16}>
            {pairs(GUIDE).map((col, ci) => (
              <div key={ci} className="flex flex-col gap-4 shrink-0">
                {col.map(g => (
                  <button key={g.t} onClick={() => demo(g.t)} className="relative text-left rounded-[12px] shrink-0 flex flex-col justify-between p-3" style={{ width: 300, height: 94, background: "#3a3a3a" }}>
                    <div className="flex items-start gap-2">
                      <img src={a(`icons/epg/${g.logo}`)} alt="" className="shrink-0 rounded-full" style={{ width: 32, height: 32, objectFit: g.contain ? "contain" : "cover", background: g.contain ? "#fff" : "#404045" }} />
                      <div className="flex-1 min-w-0 flex flex-col">
                        <span className="truncate text-white" style={{ fontSize: 14, fontWeight: 600 }}>{g.t}</span>
                        <span className="text-white" style={{ fontSize: 11 }}>{g.sub}</span>
                      </div>
                      <History size={16} className="text-white shrink-0" />
                      {g.fav && <Heart size={16} fill="#fff" className="text-white shrink-0" />}
                    </div>
                    <div className="h-[6px] rounded-[24px] overflow-hidden" style={{ background: "rgba(255,255,255,0.4)" }}>
                      <div className="h-full rounded-[24px]" style={{ width: `${g.pct}%`, background: "#f44735" }} />
                    </div>
                    <div className="flex items-baseline gap-[6px] text-white">
                      <span style={{ fontSize: 10 }}>{g.nextTime}</span>
                      <span className="truncate" style={{ fontSize: 12, fontWeight: 600 }}>Next: {g.next}</span>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </Rail>

          {/* Hot Channel */}
          <Rail title="Hot Channel" gap={12} padBottom={10}>
            {CHANNELS.map(c => (
              <button key={c.t} onClick={() => demo(c.t)} aria-label={c.t} className="relative shrink-0" style={{ width: 56, height: 56 }}>
                {c.badge && <span className="absolute inset-0 rounded-full" style={{ border: `2.8px solid ${RING[c.badge]}` }} />}
                {c.badge === "live" && <span className="absolute inset-0 rounded-full pointer-events-none chan-ripple" style={{ border: "2px solid #ff0000" }} />}
                <span className={"absolute rounded-full overflow-hidden flex items-center justify-center" + (c.badge === "live" ? " chan-breathe" : "")}
                  style={{ inset: c.badge ? 5 : 0, background: c.dark ? "#404045" : "#fff" }}>
                  <img src={c.img} alt="" className="w-full h-full" style={{ objectFit: c.dark || c.img.includes("tv-features-test") ? "cover" : "contain", padding: c.dark || c.img.includes("tv-features-test") ? 0 : 4 }} />
                </span>
                {c.badge && (
                  <span className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[2px]"
                    style={{
                      top: 48, height: 15, minWidth: 30, padding: "0 4px", fontSize: 11, fontWeight: 700, lineHeight: 1,
                      background: c.badge === "hot" ? "linear-gradient(90deg,#e7007e,#ff048d 50%,#ff3aa6)" : RING[c.badge],
                      color: c.badge === "new" ? "#111" : "#fff",
                    }}>
                    {c.badge === "live" ? "LIVE" : c.badge === "hot" ? "Hot" : "New"}
                  </span>
                )}
              </button>
            ))}
          </Rail>

          {/* Live and Upcoming */}
          <Rail title="Live and Upcoming" gap={16}>
            {UPCOMING.map(u => (
              <button key={u.t} onClick={() => demo(u.t)} className="flex flex-col gap-1 text-left shrink-0" style={{ width: 200 }}>
                <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
                  <img src={u.img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute left-3 top-3">
                    {u.live ? <LivePill /> : <span className="flex items-center rounded-full px-[6px]" style={{ height: 18, fontSize: 11, color: ON_SURFACE, background: "rgba(58,58,58,0.92)" }}>{u.badge}</span>}
                  </span>
                  {u.premium && <img src={iconCrown} alt="Premium" className="absolute left-3 bottom-2" style={{ width: 20, height: 20 }} />}
                </div>
                <span className="truncate" style={{ fontSize: 14, color: ON_SURFACE, fontWeight: 600 }}>{u.t}</span>
                <span style={{ fontSize: 11, color: ON_VARIANT }}>{u.sub}</span>
              </button>
            ))}
          </Rail>

          {/* Top 10 */}
          <Rail title="Top 10" gap={12}>
            {TOP10.map((img, i) => (
              <button key={img} onClick={() => demo(`#${i + 1} in Top 10`)} className="relative shrink-0 flex items-end" style={{ height: 180, width: 120 + (i === 9 ? 84 : 46) }}>
                <span className="absolute left-0 select-none" style={{
                  bottom: -4, fontSize: 118, fontWeight: 800, lineHeight: 1, letterSpacing: i === 9 ? -12 : 0,
                  color: "rgba(255,255,255,0.14)", WebkitTextStroke: "1px rgba(255,255,255,0.35)",
                }}>{i + 1}</span>
                <img src={img} alt="" className="absolute right-0 top-0 rounded-[12px] object-cover" style={{ width: 120, height: 180, boxShadow: "0 0 10px rgba(0,0,0,0.6)" }} />
              </button>
            ))}
          </Rail>

          {/* Shorts: opens the Shorts tab at that short */}
          <Rail title="Shorts" more onMore={() => onOpenShort(0)} gap={12}>
            {shorts.map((sh, i) => (
              <button key={sh.img} onClick={() => onOpenShort(i)} aria-label={sh.title} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 104, height: 156 }}>
                <img src={sh.img} alt="" className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 p-2 text-left text-white" style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.75))" }}>{sh.title}</span>
              </button>
            ))}
          </Rail>

          {/* AIS Play Exclusive */}
          <Rail title="AIS Play Exclusive" gap={16}>
            {EXCLUSIVE.map(e => (
              <button key={e.img} onClick={() => demo("AIS Play Exclusive")} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 253, height: 380 }}>
                <img src={e.img} alt="" className="w-full h-full object-cover" />
                {e.live && <span className="absolute left-3 top-3"><LivePill /></span>}
              </button>
            ))}
          </Rail>
        </div>
        )}
      </div>
      <style>{`
        /* TikTok-style live channel (same as the TV Home): the red ring stays still, the logo breathes and a second
           ring ripples outward and fades */
        .chan-breathe{animation:chanBreathe 1.4s ease-in-out infinite}
        .chan-ripple{animation:chanRipple 1.4s ease-out infinite}
        @keyframes chanBreathe{0%,100%{transform:scale(1)}50%{transform:scale(.92)}}
        @keyframes chanRipple{0%{transform:scale(.96);opacity:.9}100%{transform:scale(1.25);opacity:0}}
        @media (prefers-reduced-motion: reduce){.chan-breathe,.chan-ripple{animation:none}}
        .home-scroll{scrollbar-width:none}.home-scroll::-webkit-scrollbar,.home-rail::-webkit-scrollbar{display:none}.home-rail{scrollbar-width:none}`}</style>
    </div>
  );
}

function Crest({ item, size }: { item: { t: string; logo?: string; short?: string; bg?: string; fg?: string }; size: number }) {
  return (
    <span className="relative rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size, background: item.bg ?? "#fff" }}>
      {item.logo
        ? <img src={item.logo} alt="" className="w-full h-full object-contain" style={{ padding: size * 0.1 }} />
        : <span style={{ color: item.fg, fontSize: size * (item.short && item.short.length > 2 ? 0.26 : 0.32), fontWeight: 800, letterSpacing: 0.5 }}>{item.short}</span>}
    </span>
  );
}

function SportChips({ chip, onPick }: { chip: string; onPick: (c: string) => void }) {
  return (
    <div className="home-rail flex gap-2 overflow-x-auto overflow-y-hidden px-4">
      {SPORT_CHIPS.map(c => (
        <button key={c} onClick={() => onPick(c)}
          className="shrink-0 rounded-[8px] px-3" style={{
            height: 40, fontSize: 14,
            background: c === chip ? "#e8e8e8" : "rgba(16,16,16,0.25)", color: c === chip ? "#1c1c1c" : ON_SURFACE,
            border: c === chip ? "2px solid #fff" : "1.5px solid rgba(255,255,255,0.55)",
          }}>{c}</button>
      ))}
      <span className="shrink-0" style={{ width: 4 }} />
    </div>
  );
}

function SportRails({ demo, chip, onChip, chipsRef, chipsDocked }: {
  demo: (label: string) => void; chip: string; onChip: (c: string) => void;
  chipsRef: React.RefObject<HTMLDivElement>; chipsDocked: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 pt-6 pb-[60px]">
      {/* Leagues */}
      <Rail title="" gap={16}>
        {LEAGUES.map(l => (
          <button key={l.t} onClick={() => demo(l.t)} className="flex flex-col items-center gap-2 shrink-0" style={{ width: 80 }}>
            <Crest item={l} size={80} />
            <span className="text-center" style={{ fontSize: 12, lineHeight: 1.3, color: ON_SURFACE }}>{l.t}</span>
          </button>
        ))}
      </Rail>

      {/* Latest Highlight */}
      <Rail title="Latest Highlight">
        {HIGHLIGHTS.map(h => (
          <button key={h.t} onClick={() => demo(h.t)} className="flex flex-col gap-2 text-left shrink-0" style={{ width: 200 }}>
            <div className="relative overflow-hidden rounded-[12px]" style={{ height: 112 }}>
              <img src={h.img} alt="" className="w-full h-full object-cover" />
              <img src={tag(h.plat)} alt={h.plat} className="absolute left-2 bottom-[14px] object-contain" style={{ width: 30, height: 20, borderRadius: 6 }} />
              <div className="absolute inset-x-0 bottom-0 h-[6px]" style={{ background: "#4a4a4a" }}>
                <div className="h-full" style={{ width: `${h.pct}%`, background: "#f44735" }} />
              </div>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="truncate" style={{ fontSize: 14, fontWeight: 600, color: ON_SURFACE }}>{h.t}</span>
              <span style={{ fontSize: 12, color: ON_VARIANT }}>Short Highlight</span>
            </div>
          </button>
        ))}
      </Rail>

      {/* Sport filter chips. Once the page scrolls up to them they dock inside the header's glass (HomeScreen draws
          that copy); this one keeps its place in the page, hidden meanwhile. */}
      <div ref={chipsRef} style={{ visibility: chipsDocked ? "hidden" : "visible" }}>
        <SportChips chip={chip} onPick={onChip} />
      </div>

      {/* Sport Reel */}
      <div className="px-4">
        <button onClick={() => demo("Sport Reel")} className="relative w-full overflow-hidden rounded-[12px] text-left" style={{ aspectRatio: "16 / 9" }}>
          <img src={a("posters/upcoming/live.jpg")} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7))" }} />
          <span className="absolute left-3 bottom-3 flex flex-col items-start gap-2">
            <span className="text-white" style={{ fontSize: 18, fontWeight: 600 }}>Sport Reel</span>
            <span className="flex items-center gap-1 rounded-full px-4" style={{ height: 36, background: "#f0f0f0", color: "#282828", fontSize: 14, fontWeight: 600 }}>View <ChevronRight size={16} /></span>
          </span>
        </button>
      </div>

      {/* Football For You */}
      <Rail title="Football For You" more onMore={() => demo("Football For You")}>
        {FOOTBALL_FOR_YOU.map((f, i) => (
          <button key={i} onClick={() => demo("Football For You")} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 104, height: 146 }}>
            <img src={f.img} alt="" className="w-full h-full object-cover" />
            {f.badge && <span className="absolute left-1/2 -translate-x-1/2 top-[6px] whitespace-nowrap rounded-full px-2 text-white" style={{ fontSize: 11, lineHeight: "16px", background: "rgba(40,40,40,0.9)" }}>{f.badge}</span>}
          </button>
        ))}
      </Rail>

      {/* Your Favorite */}
      <Rail title="Your Favorite" more onMore={() => demo("Your Favorite")} gap={16}>
        {FAVOURITES.map(f => (
          <button key={f.t} onClick={() => demo(f.t)} className="flex flex-col items-center gap-2 shrink-0" style={{ width: 80 }}>
            <span className="relative">
              <Crest item={f} size={80} />
              <span className="absolute -right-1 bottom-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#fff" }}>
                <Heart size={14} fill="#1c1c1c" stroke="#1c1c1c" />
              </span>
            </span>
            <span className="text-center" style={{ fontSize: 12, lineHeight: 1.3, color: ON_SURFACE }}>{f.t}</span>
          </button>
        ))}
      </Rail>

      {/* Documentary */}
      <Rail title="Documentary" more onMore={() => demo("Documentary")}>
        {DOCUMENTARY.map(d => (
          <button key={d.t} onClick={() => demo(d.t)} aria-label={d.t} className="relative shrink-0 overflow-hidden rounded-[12px]" style={{ width: 104, height: 146 }}>
            <img src={d.img} alt="" className="w-full h-full object-cover" style={{ objectPosition: d.pos ?? "center" }} />
          </button>
        ))}
      </Rail>
    </div>
  );
}

function pairs<T>(list: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2));
  return out;
}

function LivePill({ big, size }: { big?: boolean; size?: number }) {
  const k = size ?? (big ? 2 : 1);
  return (
    <span className="inline-flex items-center rounded-full text-white" style={{ background: LIVE, height: 18 * k, gap: 4 * k, padding: `0 ${6 * k}px`, fontSize: 11 * k, fontWeight: 600 }}>
      <span className="rounded-full bg-white" style={{ width: 6 * k, height: 6 * k }} />LIVE
    </span>
  );
}

function Rail({ title, more, onMore, gap = 12, padBottom = 0, children }: {
  title: string; more?: boolean; onMore?: () => void; gap?: number; padBottom?: number; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      {title && <div className="flex items-center gap-1 px-4">
        <h3 className="m-0" style={{ fontSize: 18, fontWeight: 500, color: ON_SURFACE }}>{title}</h3>
        {more && <button onClick={onMore} aria-label={`More ${title}`} className="p-1 rounded-full"><ChevronRight size={16} className="text-white" /></button>}
      </div>}
      {/* overflow-y hidden: rails scroll sideways only, so an up/down swipe over one scrolls the page */}
      <div className="home-rail flex overflow-x-auto overflow-y-hidden px-4" style={{ gap, paddingBottom: padBottom, scrollPaddingLeft: 16 }}>
        {children}
        <span className="shrink-0" style={{ width: 4 }} />
      </div>
    </section>
  );
}
