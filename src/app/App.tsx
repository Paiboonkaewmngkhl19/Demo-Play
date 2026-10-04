import { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { motion, AnimatePresence, animate, useMotionValue } from "motion/react";
import {
  Heart, Play, Volume2, VolumeX,
  ArrowLeft, X, Clock, Star, Users, Check, Link2, MoreHorizontal,
} from "lucide-react";
// Shorts screen icons, exported from Figma (PLAY-player, "Screen: Mobile", node 1248:43772)
import iconBattery from "../assets/shorts/status-battery.svg";
import iconWifi from "../assets/shorts/status-wifi.svg";
import iconCellular from "../assets/shorts/status-cellular.svg";
import iconRewind from "../assets/shorts/rewind-10.svg";
import iconForward from "../assets/shorts/forward-10.svg";
import iconPause from "../assets/shorts/pause.svg";
import iconPlay from "../assets/shorts/play.svg";
import iconMetaDot from "../assets/shorts/meta-dot.svg";
import iconLiveDot from "../assets/shorts/live-dot.svg";
import iconCrown from "../assets/shorts/crown.svg";
import iconBell from "../assets/shorts/bell.svg";
import iconAdd from "../assets/shorts/add.svg";
import iconHeart from "../assets/shorts/heart.svg";
import iconHeartFilled from "../assets/shorts/heart-filled.svg";
import iconAdded from "../assets/shorts/added.svg";
import iconShare from "../assets/shorts/share.svg";
import iconClearScreen from "../assets/shorts/clear-screen.svg";
import iconNavHome from "../assets/shorts/nav-home.svg";
import iconNavHomeActive from "../assets/shorts/nav-home-active.svg";
import iconNavTv from "../assets/shorts/nav-tv.svg";
import iconNavShorts from "../assets/shorts/nav-shorts.svg";
import iconNavShortsDefault from "../assets/shorts/nav-shorts-default.svg";
import iconNavSearch from "../assets/shorts/nav-search.svg";
import avatarUser from "../assets/shorts/avatar-placeholder.png";
import HomeScreen from "./HomeScreen";
// Brand marks for the share sheet (Simple Icons, CC0), inlined so they take the tile's colour
import logoLine from "../assets/shorts/share-line.svg?raw";
import logoMessenger from "../assets/shorts/share-messenger.svg?raw";
import logoFacebook from "../assets/shorts/share-facebook.svg?raw";
import logoX from "../assets/shorts/share-x.svg?raw";
import logoInstagram from "../assets/shorts/share-instagram.svg?raw";

// ─── Types ────────────────────────────────────────────────
type Badge = "LIVE" | "New" | "Trending";

interface Related { title: string; img: string }

// Who published a short: a channel (round logo; a red ring + LIVE label while it's live) or an OTT service
// (square logo). A channel's short gets the Favourite (heart) action, every other short gets Add (+).
type OttBrand = "netflix" | "hbo" | "disney" | "viu";
interface Publisher { kind: "channel" | "ott"; name: string; logo?: string; brand?: OttBrand; live?: boolean }

interface FeedItem {
  id: number;
  publisher: Publisher;
  // the short plays `video` from `start` for `length` seconds, looping; without a video it shows `img` as a still
  video?: string;
  start?: number;
  length?: number;
  // "contain": show the whole video, uncropped, at `aspect` (width / height); otherwise it's cropped to fill the screen
  fit?: "cover" | "contain";
  aspect?: number;
  zoom?: number;        // enlarges a cropped video, e.g. to cut black bars baked into the file
  blurFill?: boolean;   // with "contain": fill the empty space around the video with a blurred copy of it
  summary: string;      // the subtitle under the title: one or two lines, never more
  // Badges after the title, always in this order: crown (premium) > LIVE > Upcoming > age rating > HD / 4K.
  // HD / 4K are only for movies and series, never for a channel.
  premium?: boolean;
  upcoming?: boolean;   // Upcoming badge; its CTA sets a reminder instead of opening the details page
  ageRating?: string;   // e.g. "16+"
  quality?: "HD" | "4K";
  ctaIcon: "play" | "bell" | "crown";   // crown: a subscription / package CTA
  title: string;
  type: string;
  genre: string;
  badge: Badge | null;
  duration: string;
  rating: string;
  synopsis: string;
  cast: string[];
  img: string;
  cta: string;
  live: boolean;
  accent: string;
  watchProgress?: number;
  related: Related[];
}

const BASE = import.meta.env.BASE_URL;
const FOOTBALL = `${BASE}tv-features-test/Video/Football.mp4`;
const CONCERT = `${BASE}tv-features-test/Video/Concert.mp4`;
const ALL_STAR = `${BASE}tv-features-test/Video/All%20star.mp4`;
const DOOMSDAY = `${BASE}tv-features-test/Video/Dis.mp4`;
const SPIDERMAN = `${BASE}tv-features-test/Video/spiderman.mp4`;
const HBO_CLIP = `${BASE}tv-features-test/Video/hbo.mp4`;
const COOL_CLIP = `${BASE}tv-features-test/Video/coolch.mp4`;
const BADMINTON = `${BASE}tv-features-test/Video/bad.mp4`;
const VOLLEYBALL = `${BASE}tv-features-test/Video/vall.mp4`;
const ASIAN_GAMES: Publisher = { kind: "channel", name: "Asian Games 2026", logo: `${BASE}tv-features-test/live-stream-assets/channel-asian-games.png` };
const COOL_CHANNEL: Publisher = { kind: "channel", name: "Cool Channel", logo: `${BASE}tv-features-test/concert-assets/channel-cool.png` };
const frame = (path: string) => `${BASE}tv-features-test/${path}`;
const ASIAN_GAMES_907: Publisher = { kind: "channel", name: "Asian Games 2026", logo: frame("shorts-assets/channel-907.png") };
const ASIAN_GAMES_909: Publisher = { kind: "channel", name: "Asian Games 2026", logo: frame("shorts-assets/channel-909.png") };
const VIU: Publisher = { kind: "ott", name: "Viu", brand: "viu", logo: frame("shorts-assets/viu.png") };

// ─── Feed Data ────────────────────────────────────────────
// Live, highlights (sport, music, movie/series) and promos. Shorts without their own video yet show a still.
const FEED: FeedItem[] = [
  {
    id: 1,
    publisher: { ...ASIAN_GAMES, live: true },
    video: FOOTBALL, start: 247, length: 30,
    title: "Japan vs Thailand",
    summary: "Asian Games 2026 · Men's football, Group A. Japan lead 3–0 early in the second half — catch the rest live.",
    premium: true, ctaIcon: "play",
    type: "Live Sports", genre: "Asian Games 2026 · Football",
    badge: "LIVE",
    duration: "49’ · Japan 3–0 Thailand", rating: "G",
    synopsis: "Japan meet Thailand in Group A of the men's football at the 20th Asian Games, Aichi-Nagoya 2026. Three goals in the first minutes of each half put Japan firmly in control.",
    cast: ["Japan U-23", "Thailand U-23", "AIS PLAY commentary"],
    img: frame("live-stream-assets/football-255.jpg"),
    cta: "Watch Live", live: true, accent: "#EA5454", watchProgress: 82,
    related: [
      { title: "Japan 1–0 · 30’", img: frame("live-stream-assets/football-109.jpg") },
      { title: "Japan 2–0 · 46’", img: frame("live-stream-assets/football-190.jpg") },
      { title: "Kick-off", img: frame("live-stream-assets/football-024.jpg") },
    ],
  },
  {
    id: 2,
    publisher: COOL_CHANNEL,
    video: COOL_CLIP, start: 0, length: 16.8,
    title: "Special Offer · Herbal Tonic",
    summary: "A regular customer shares how he feels after a month. 1 large + 1 small bottle for just 1,500 baht — call now.",
    ctaIcon: "play",
    type: "TV Shopping", genre: "Shopping · Health",
    badge: "Trending",
    duration: "Offer · 17s", rating: "G",
    synopsis: "A short customer story from Cool Channel's shopping slot: a long-time user talks about his routine, then the offer — one large and one small bottle for 1,500 baht, delivered to your door.",
    cast: ["Cool Channel Shopping"],
    img: frame("shorts-assets/coolch.jpg"),
    cta: "Watch Now", live: false, accent: "#B388FF",
    related: [
      { title: "Intro", img: frame("concert-assets/moment-010.jpg") },
      { title: "Dance break", img: frame("concert-assets/moment-150.jpg") },
      { title: "Ending", img: frame("concert-assets/moment-190.jpg") },
    ],
  },
  {
    id: 3,
    publisher: { kind: "ott", name: "Netflix", brand: "netflix" },
    video: SPIDERMAN, start: 0, length: 21, zoom: 1.1,   // the file has 24px letterbox bars top and bottom
    title: "Spider-Man: Brand New Day",
    summary: "Peter Parker starts over — a new suit, the same city, and one call he can't ignore.",
    ageRating: "PG-13", quality: "4K", ctaIcon: "play",
    type: "Movie", genre: "Marvel · Action · Adventure",
    badge: "Trending",
    duration: "Trailer · 21s", rating: "PG-13",
    synopsis: "Spider-Man swings back into New York for a fresh start. Watch the official trailer, then add it to My List for release day.",
    cast: ["Tom Holland", "Zendaya", "Jacob Batalon"],
    img: frame("shorts-assets/spiderman.jpg"),
    cta: "Watch Trailer", live: false, accent: "#E50914", watchProgress: 48,
    related: [
      { title: "Doctor Strange MoM", img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=120&h=180&fit=crop&auto=format" },
      { title: "Thor: Love & Thunder", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&h=180&fit=crop&auto=format" },
      { title: "Guardians Vol. 3", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 4,
    publisher: ASIAN_GAMES_907,
    video: VOLLEYBALL, start: 0, length: 14,
    title: "Thailand vs China · Volleyball",
    summary: "Asian Games 2026 women's volleyball. Thailand's bench erupts as the rally swings their way.",
    ctaIcon: "play",
    type: "Sports Highlight", genre: "Asian Games 2026 · Volleyball",
    badge: null,
    duration: "Highlight · 14s", rating: "G",
    synopsis: "Women's volleyball at the 20th Asian Games, Aichi-Nagoya 2026: Thailand take on China, and the Thai bench is on its feet after a long rally.",
    cast: ["Thailand Women", "China Women"],
    img: frame("shorts-assets/volleyball.jpg"),
    cta: "Watch Highlight", live: false, accent: "#EA5454",
    related: [
      { title: "Japan 2–0 · 46’", img: frame("live-stream-assets/football-190.jpg") },
      { title: "Japan 3–0 · 49’", img: frame("live-stream-assets/football-255.jpg") },
      { title: "Kick-off", img: frame("live-stream-assets/football-024.jpg") },
    ],
  },
  {
    id: 9,
    publisher: ASIAN_GAMES_909,
    video: BADMINTON, start: 0, length: 32.8,
    title: "Thailand vs Singapore · Badminton",
    summary: "Asian Games 2026 women's singles. The next match starts Saturday 18:00 — set a reminder so you don't miss it.",
    upcoming: true, premium: true, ctaIcon: "bell",
    type: "Live Sports", genre: "Asian Games 2026 · Badminton",
    badge: "New",
    duration: "Sat 4 Oct · 18:00", rating: "G",
    synopsis: "Thailand meet Singapore in the women's singles badminton at the 20th Asian Games, Aichi-Nagoya 2026. Live on Asian Games 2026, channel 909.",
    cast: ["Thailand", "Singapore", "AIS PLAY commentary"],
    img: frame("shorts-assets/badminton.jpg"),
    cta: "Remind Me", live: false, accent: "#EA5454",
    related: [
      { title: "Japan 3–0 Thailand", img: frame("live-stream-assets/football-255.jpg") },
      { title: "Japan 1–0 · 30’", img: frame("live-stream-assets/football-109.jpg") },
      { title: "Kick-off", img: frame("live-stream-assets/football-180.jpg") },
    ],
  },
  {
    id: 5,
    publisher: { kind: "ott", name: "HBO", brand: "hbo" },
    video: HBO_CLIP, start: 0, length: 5.9,
    title: "New HBO Original Series",
    summary: "A soldier, a red-lit room and one line: \"This ain't America.\" Coming soon to HBO.",
    upcoming: true, ageRating: "16+", quality: "HD", ctaIcon: "bell",
    type: "Series", genre: "Drama · Thriller",
    badge: "New",
    duration: "Coming soon", rating: "16+",
    synopsis: "A first look at HBO's next original series. Set a reminder and we'll let you know the moment the first episode is out.",
    cast: ["HBO Original"],
    img: frame("shorts-assets/hbo.jpg"),
    cta: "Remind Me", live: false, accent: "#7B61FF",
    related: [
      { title: "My Love from the Star", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=180&fit=crop&auto=format" },
      { title: "Descendants of the Sun", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=180&fit=crop&auto=format" },
      { title: "Goblin", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 6,
    publisher: VIU,
    video: CONCERT, start: 150, length: 30,
    title: "Love Language — Dance Break",
    summary: "The dance break, now streaming on Viu.",
    ctaIcon: "crown",
    type: "Concert", genre: "Music · Live",
    badge: "Trending",
    duration: "Music Bank · 3m", rating: "G",
    synopsis: "TOMORROW X TOGETHER's Love Language dance break, streaming on Viu. Subscribe to a Viu package to watch the full stage and every episode.",
    cast: ["Soobin", "Yeonjun", "Beomgyu", "Taehyun", "Hueningkai"],
    img: frame("concert-assets/moment-150.jpg"),
    cta: "Subscription", live: false, accent: "#EA5454",
    related: [
      { title: "Chorus", img: frame("concert-assets/moment-080.jpg") },
      { title: "Close-up", img: frame("concert-assets/moment-120.jpg") },
      { title: "Ending", img: frame("concert-assets/moment-190.jpg") },
    ],
  },
  {
    id: 7,
    publisher: { kind: "ott", name: "Disney+", brand: "disney" },
    video: DOOMSDAY, start: 0, length: 27, fit: "contain", aspect: 1280 / 584, blurFill: true,
    title: "Avengers: Doomsday",
    summary: "The official trailer. Marvel Studios' Avengers: Doomsday — only in cinemas, then streaming on Disney+.",
    ageRating: "13+", quality: "4K", premium: true, ctaIcon: "play",
    type: "Movie", genre: "Marvel · Action · Sci-Fi",
    badge: "Trending",
    duration: "Trailer · 27s", rating: "13+",
    synopsis: "Marvel Studios' Avengers: Doomsday. Something we may not be able to deter — the heroes gather for the fight that will decide the fate of every reality.",
    cast: ["Robert Downey Jr.", "Chris Hemsworth", "Anthony Mackie", "Letitia Wright"],
    img: frame("shorts-assets/doomsday.jpg"),
    cta: "Watch Trailer", live: false, accent: "#1F80E0",
    related: [
      { title: "Avengers: Endgame", img: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=120&h=180&fit=crop&auto=format" },
      { title: "Thunderbolts*", img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=120&h=180&fit=crop&auto=format" },
      { title: "Fantastic Four", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 8,
    publisher: { kind: "ott", name: "Netflix", brand: "netflix" },
    video: ALL_STAR, start: 0, length: 21,
    title: "Love Island All Stars",
    summary: "Old flames return to the villa.",
    ageRating: "16+", quality: "HD", ctaIcon: "play",
    type: "Reality Show", genre: "Reality · Romance",
    badge: "New",
    duration: "50m · Episode 8", rating: "16+",
    synopsis: "Fan-favorites return to the villa for a second shot at love. With new connections forming and old flames rekindling, this is set to be the most dramatic series yet.",
    cast: ["Maya Jama", "Toby Aromolaran", "Ekin-Su Cülcüloğlu", "Wes Nelson"],
    img: frame("shorts-assets/love-island.jpg"),
    cta: "Watch Now", live: false, accent: "#E50914",
    related: [
      { title: "Too Hot to Handle S5", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=180&fit=crop&auto=format" },
      { title: "The Bachelor S28", img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=120&h=180&fit=crop&auto=format" },
      { title: "Married at First Sight", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=120&h=180&fit=crop&auto=format" },
    ],
  },
];

const BADGE_STYLE: Record<Badge, string> = {
  LIVE: "bg-red-600 text-white",
  New: "bg-sky-600 text-white",
  Trending: "bg-amber-400 text-black",
};

const PHONE_QUERY = "(max-width: 520px)";
// 44px status bar (phone frame only), 76px nav + 24px below it (frame), or at least 24px / the safe area (phone)
const STATUS_H = 44, NAV_H = 76, INDICATOR_H = 24;

// Opened from the TV Content Picker (?from=picker): offer a way back to it
const PICKER_URL = `${import.meta.env.BASE_URL}tv-features-test/content-picker.html`;
const CAME_FROM_PICKER = new URLSearchParams(window.location.search).get("from") === "picker";

function exitToPicker() {
  if (document.referrer.includes("content-picker.html") && history.length > 1) history.back();
  else window.location.href = PICKER_URL;
}

function toggleSet(set: Set<number>, id: number): Set<number> {
  const next = new Set(set);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

// ─── App ──────────────────────────────────────────────────
export default function App() {
  const [idx, setIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [screen, setScreen] = useState<"feed" | "playback">("feed");
  // Bottom navigation tab: Shorts (the feed) or Home (HomeScreen, drawn over the feed, which pauses meanwhile)
  const [tab, setTab] = useState<"Shorts" | "Home">("Shorts");
  // Views the user came from, so Back can return to exactly where they were
  const [trail, setTrail] = useState<{ screen: "feed" | "playback"; sheetOpen: boolean }[]>([]);
  const [muted, setMuted] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  // The current short's seek position while it's being dragged: its handle is drawn here, above the bottom navigation,
  // because the short itself is clipped at the top of the nav
  const [seekUi, setSeekUi] = useState<{ progress: number; scrubbing: boolean }>({ progress: 0, scrubbing: false });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const toast = (msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  };
  // On a phone-sized screen the app fills it like a native app; anywhere wider it sits in a phone frame
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const on = () => setIsPhone(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [reminded, setReminded] = useState<Set<number>>(new Set());
  // Vertical offset of the 3-page strip [prev, current, next]; the strip follows the finger 1:1
  const dragY = useMotionValue(0);
  const zoneEl = useRef<HTMLDivElement | null>(null);
  const gesture = useRef<{ x: number; y: number; lastY: number; lastT: number; v: number; dragging: boolean } | null>(null);
  const settling = useRef(false);
  const wheelLockUntil = useRef(0);

  const item = FEED[idx];

  // Warm the cache so the incoming card never shows black while its image loads
  useEffect(() => {
    FEED.forEach(f => { new Image().src = f.img; });
  }, []);

  const pageHeight = () => zoneEl.current?.clientHeight ?? 842;

  // Animate the strip to `target`; when it lands on another page, swap the index and reset the strip in the same frame
  const settle = (target: number, next: number | null) => {
    settling.current = true;
    // Time scales with the distance still to cover: a wheel step takes ~0.28s, finishing a drag ~0.2s
    const remaining = Math.abs(target - dragY.get()) / pageHeight();
    animate(dragY, target, {
      duration: next === null ? 0.2 : 0.14 + 0.14 * Math.min(1, remaining),
      ease: [0.32, 0.72, 0, 1],
      onComplete: () => {
        if (next !== null) flushSync(() => setIdx(next));
        dragY.set(0);
        settling.current = false;
      },
    });
  };

  const page = (forward: boolean) => {
    const next = idx + (forward ? 1 : -1);
    if (settling.current || next < 0 || next >= FEED.length) return;
    settle(forward ? -pageHeight() : pageHeight(), next);
  };

  const goTo = (next: { screen?: "feed" | "playback"; sheetOpen?: boolean }) => {
    setTrail(t => [...t, { screen, sheetOpen }]);
    setScreen(next.screen ?? screen);
    setSheetOpen(next.sheetOpen ?? sheetOpen);
  };

  const goBack = () => {
    const prev = trail[trail.length - 1];
    if (!prev) return;
    setTrail(t => t.slice(0, -1));
    setScreen(prev.screen);
    setSheetOpen(prev.sheetOpen);
  };

  // Touch and mouse drag: the page tracks the pointer, then snaps to the next/previous page or back on release
  // Remote/keyboard Back: step back through the views, and from the first one leave to the picker
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" && e.key !== "Backspace") return;
      if (shareOpen) setShareOpen(false);
      else if (trail.length) goBack();
      else if (CAME_FROM_PICKER) exitToPicker();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (settling.current) return;
    gesture.current = { x: e.clientX, y: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0, dragging: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dy = e.clientY - g.y;
    if (!g.dragging) {
      if (Math.abs(dy) < 8 || Math.abs(dy) < Math.abs(e.clientX - g.x)) return;
      g.dragging = true;
      e.currentTarget.setPointerCapture(e.pointerId); // only once it's a drag, so plain taps still reach buttons
    }
    const dt = e.timeStamp - g.lastT;
    if (dt > 0) g.v = 0.6 * g.v + 0.4 * ((e.clientY - g.lastY) / dt);
    g.lastY = e.clientY;
    g.lastT = e.timeStamp;
    const h = pageHeight();
    let off = Math.max(-h, Math.min(h, dy));
    // Rubber-band at the first / last page
    if ((off < 0 && idx === FEED.length - 1) || (off > 0 && idx === 0)) off *= 0.25;
    dragY.set(off);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.dragging) return;
    const off = dragY.get();
    const forward = off < 0;
    const next = idx + (forward ? 1 : -1);
    const h = pageHeight();
    // A pause before release means "let go", not "flick": ignore stale velocity
    const v = e.timeStamp - g.lastT > 80 ? 0 : g.v;
    const flicked = forward ? v < -0.35 : v > 0.35;
    if ((Math.abs(off) > h * 0.15 || flicked) && next >= 0 && next < FEED.length) {
      settle(forward ? -h : h, next);
    } else {
      settle(0, null);
    }
  };
  const onPointerCancel = () => {
    if (gesture.current?.dragging) settle(0, null);
    gesture.current = null;
  };

  // A trackpad flick fires wheel events for ~1s (inertia). Move one page, then stay locked until the events stop.
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) < 4) return;
    const now = Date.now();
    if (now < wheelLockUntil.current) {
      wheelLockUntil.current = Math.max(wheelLockUntil.current, now + 250);
      return;
    }
    wheelLockUntil.current = now + 400;
    page(e.deltaY > 0);
  };
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  // Non-passive listener so the page itself doesn't scroll under the phone
  const wheelCleanup = useRef<(() => void) | null>(null);
  const swipeZoneRef = useCallback((node: HTMLDivElement | null) => {
    zoneEl.current = node;
    wheelCleanup.current?.();
    wheelCleanup.current = null;
    if (!node) return;
    const handler = (e: WheelEvent) => { e.preventDefault(); onWheelRef.current(e); };
    node.addEventListener("wheel", handler, { passive: false });
    wheelCleanup.current = () => node.removeEventListener("wheel", handler);
  }, []);

  // space below the tab row: 24px, or the phone's own home-bar area if that's taller
  const navBottom = isPhone ? `max(${INDICATOR_H}px, env(safe-area-inset-bottom, 0px))` : `${INDICATOR_H}px`;
  const feedBottom = `calc(${NAV_H}px + ${navBottom})`;

  const screenBody = (
    <>
      <AnimatePresence mode="wait">
        {screen === "feed" ? (
          <motion.div
            key="feed-screen"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Scroll / swipe zone: everything above the bottom navigation */}
            <div
              ref={swipeZoneRef}
              className="absolute top-0 left-0 right-0 z-10 select-none overflow-hidden"
              style={{ touchAction: "none", bottom: feedBottom }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            >
              {/* Strip of [prev, current, next], each exactly one screen tall; dragY moves the strip */}
              <motion.div
                className="absolute left-0 right-0 grid grid-rows-3"
                style={{ top: "-100%", height: "300%", y: dragY }}
              >
                {[-1, 0, 1].map(o => {
                  const f = FEED[idx + o];
                  return (
                    <div key={f ? f.id : `empty${o}`} className="relative min-h-0">
                      {f && (
                        <FeedCard
                          item={f}
                          active={o === 0 && !sheetOpen && !shareOpen && tab === "Shorts"}
                          liked={liked.has(f.id)}
                          saved={saved.has(f.id)}
                          reminded={reminded.has(f.id)}
                          muted={muted}
                          topInset={isPhone ? "env(safe-area-inset-top, 0px)" : `${STATUS_H}px`}
                          onSeekUi={o === 0 ? setSeekUi : undefined}
                          onLike={() => { setLiked(s => toggleSet(s, f.id)); toast(liked.has(f.id) ? `Removed ${f.publisher.name} from favourites` : `Added ${f.publisher.name} to favourites`); }}
                          onSave={() => { setSaved(s => toggleSet(s, f.id)); toast(saved.has(f.id) ? "Removed from My List" : "Added to My List"); }}
                          onShare={() => setShareOpen(true)}
                          onProfile={() => toast(`${f.publisher.name} (demo)`)}
                          onCta={() => {
                            // Upcoming: the CTA sets (or clears) a reminder; anything else would open the details page,
                            // which isn't part of this demo
                            if (!f.upcoming) { toast(`${f.cta} (demo)`); return; }
                            setReminded(s => toggleSet(s, f.id));
                            toast(reminded.has(f.id) ? "Reminder removed" : `We'll remind you before it starts`);
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {CAME_FROM_PICKER && tab === "Shorts" && (
              <button
                onClick={exitToPicker}
                aria-label="Back"
                className="absolute left-3 z-20 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ top: isPhone ? "calc(env(safe-area-inset-top, 0px) + 8px)" : STATUS_H + 4, background: "rgba(0,0,0,0.6)" }}
              >
                <ArrowLeft size={18} className="text-white" />
              </button>
            )}

            {/* seek handle, in front of the nav */}
            {seekUi.scrubbing && (
              <span
                className="absolute z-30 w-3 h-3 rounded-full bg-white pointer-events-none"
                style={{ left: `${seekUi.progress * 100}%`, bottom: `calc(${feedBottom} - 4px)`, transform: "translateX(-50%)", boxShadow: "0 0 0 4px rgba(255,255,255,0.25)" }}
              />
            )}
            {tab === "Home" && (
              <HomeScreen
                topInset={isPhone ? "env(safe-area-inset-top, 0px)" : `${STATUS_H}px`}
                bottom={feedBottom}
                shorts={FEED.map(f => ({ img: f.img, title: f.title }))}
                onOpenShort={i => { flushSync(() => setIdx(i)); setTab("Shorts"); }}
                onToast={toast}
              />
            )}
            <BottomNav
              bottom={navBottom}
              indicator={!isPhone}
              active={tab}
              onTab={label => { if (label === "Home" || label === "Shorts") setTab(label); else toast(`${label} (demo)`); }}
            />

            {/* Details page (the CTA opens it) */}
            <AnimatePresence>
              {sheetOpen && (
                <>
                  <motion.div
                    className="absolute inset-0 bg-black/70 z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={goBack}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 z-40 rounded-t-[28px] overflow-hidden"
                    style={{ maxHeight: "82%", background: "#111114" }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 340, damping: 40 }}
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={{ top: 0.1, bottom: 0.5 }}
                    onDragEnd={(_e, info) => { if (info.offset.y > 80) goBack(); }}
                  >
                    <BottomSheet
                      item={item}
                      onClose={goBack}
                      onWatch={() => goTo({ screen: "playback", sheetOpen: false })}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Share */}
            <AnimatePresence>
              {shareOpen && (
                <>
                  <motion.div
                    className="absolute inset-0 bg-black/70 z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShareOpen(false)}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 z-40 rounded-t-[24px] overflow-hidden"
                    style={{ background: "#1b1b1f", paddingBottom: navBottom }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 340, damping: 40 }}
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={{ top: 0.1, bottom: 0.5 }}
                    onDragEnd={(_e, info) => { if (info.offset.y > 80) setShareOpen(false); }}
                  >
                    <ShareSheet
                      item={item}
                      onClose={() => setShareOpen(false)}
                      onDone={msg => { setShareOpen(false); toast(msg); }}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="playback-screen"
            className="absolute inset-0"
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <PlaybackScreen
              item={item}
              muted={muted}
              onMute={() => setMuted(m => !m)}
              onBack={goBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isPhone && <StatusBar />}

      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg}
            className="absolute left-1/2 z-50 px-4 py-2 rounded-full text-[13px] text-white whitespace-nowrap pointer-events-none"
            style={{ top: isPhone ? "calc(env(safe-area-inset-top, 0px) + 12px)" : STATUS_H + 8, background: "rgba(40,40,44,0.95)", fontFamily: "'Open Sans'", x: "-50%" }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Browsers only autoplay muted: the first touch, click or key turns the sound on
  const unmute = () => { if (muted) setMuted(false); };

  if (isPhone) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-black" onPointerDownCapture={unmute} onKeyDownCapture={unmute}>
        {screenBody}
      </div>
    );
  }

  return (
    <div
      className="h-dvh overflow-hidden flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1a24 0%, #07070A 60%)" }}
      onPointerDownCapture={unmute}
      onKeyDownCapture={unmute}
    >
      <div className="h-full flex flex-col items-center py-4">
        {/* Phone frame: 375 wide like the Figma screen, as tall as the window allows (max 812) */}
        <div className="relative h-full" style={{ width: 375, maxHeight: 812 }}>
          {/* Side buttons */}
          <div className="absolute left-[-2px] top-28 w-[2px] h-7 bg-zinc-700 rounded-l-sm" />
          <div className="absolute left-[-2px] top-40 w-[2px] h-10 bg-zinc-700 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[215px] w-[2px] h-10 bg-zinc-700 rounded-l-sm" />
          <div className="absolute right-[-2px] top-36 w-[2px] h-14 bg-zinc-700 rounded-r-sm" />

          {/* Screen */}
          <div
            className="absolute inset-0 rounded-[44px] overflow-hidden bg-black"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.8), 0 40px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {screenBody}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feed Card ────────────────────────────────────────────
// Figma "Screen: Mobile" (PLAY-player node 1248:43772): the short fills the screen; play/pause with 10s skips in the
// middle; the publisher's logo, Add or Favourite and Share down the right; title + badges, a 2-line summary and the
// CTA (to the details page) bottom-left; a 2px progress line along the bottom.
function FeedCard({
  item, active, liked, saved, reminded, muted, topInset, onSeekUi,
  onLike, onSave, onShare, onProfile, onCta,
}: {
  item: FeedItem; active: boolean; liked: boolean; saved: boolean; reminded: boolean; muted: boolean; topInset: string;
  onSeekUi?: (s: { progress: number; scrubbing: boolean }) => void;
  onLike: () => void; onSave: () => void; onShare: () => void; onProfile: () => void; onCta: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [controls, setControls] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const start = item.start ?? 0, length = item.length ?? 15;
  // Gestures: hold for 2x speed, double-tap a side to jump 10s, drag the seek bar to scrub
  const [fast, setFast] = useState(false);
  const rate = useRef(1);
  const [scrubbing, setScrubbing] = useState(false);
  // Clear screen: hides the title, subtitle, badges, CTA, profile and every action icon so only the picture (and
  // its progress line) shows; any tap brings them back
  const [clear, setClear] = useState(false);
  const [tapFx, setTapFx] = useState<{ side: -1 | 1; secs: number; key: number } | null>(null);
  // tell the feed where the seek handle goes while dragging (it draws the handle above the nav)
  useEffect(() => { if (active) onSeekUi?.({ progress, scrubbing }); }, [active, progress, scrubbing]);
  // a pointer position along the card, 0 (left) to 1 (right)
  const alongX = (clientX: number, _clientY: number, r: DOMRect) => (clientX - r.left) / r.width;

  // A card that becomes the current one starts playing again from its beginning
  useEffect(() => {
    if (active) { setPlaying(true); }
    else {
      setClear(false);
      setControls(false);
      const v = videoRef.current;
      if (v) { v.pause(); v.currentTime = start; }
      setProgress(0);
    }
  }, [active]);

  // Video: play inside the [start, start + length] window, looping
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && playing) {
      if (v.currentTime < start || v.currentTime > start + length) v.currentTime = start;
      v.play().catch(() => {});
    } else v.pause();
  }, [active, playing]);
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);

  // ── Blurred background fill (item.blurFill) ──
  // The one <video> is drawn onto a small canvas behind it, so the space above and below a wide video (or beside a
  // tall one) shows a blurred, dimmed copy of the same frames instead of black, always in sync and loaded once.
  // The canvas is tiny (96px wide) and stretched by CSS: it's blurred anyway, so that costs almost nothing.
  const blurRef = useRef<HTMLCanvasElement>(null);
  const [blurOn, setBlurOn] = useState(false);
  useEffect(() => {
    const v = videoRef.current, c = blurRef.current;
    if (!item.blurFill || !v || !c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const draw = () => {
      if (!v.videoWidth) return;
      // only needed when the video's shape differs from the card's (e.g. 16:9 in a 9:16 screen)
      const card = c.parentElement!;
      const mismatch = Math.abs(v.videoWidth / v.videoHeight - card.clientWidth / card.clientHeight) > 0.05;
      setBlurOn(mismatch);
      if (!mismatch) return;
      const w = 96, h = Math.max(1, Math.round(w * v.videoHeight / v.videoWidth));
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      ctx.drawImage(v, 0, 0, w, h);     // scale the current frame down onto the canvas
    };
    draw();
    // a still frame is always drawn: on load, after seeks, and when paused
    v.addEventListener("loadeddata", draw);
    v.addEventListener("seeked", draw);
    v.addEventListener("pause", draw);
    // while this short is on screen and playing, redraw every new video frame (or every animation frame as a
    // fallback); with "reduce motion" the background stays a still frame
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stop = false, raf = 0, vfc = 0;
    const rv = v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number; cancelVideoFrameCallback?: (id: number) => void };
    if (active && playing && !reduced) {
      const tick = () => {
        if (stop) return;
        draw();
        if (rv.requestVideoFrameCallback) vfc = rv.requestVideoFrameCallback(tick);
        else raf = requestAnimationFrame(tick);
      };
      tick();
    }
    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      if (vfc && rv.cancelVideoFrameCallback) rv.cancelVideoFrameCallback(vfc);
      v.removeEventListener("loadeddata", draw);
      v.removeEventListener("seeked", draw);
      v.removeEventListener("pause", draw);
    };
  }, [active, playing]);
  useEffect(() => {
    rate.current = fast ? 2 : 1;
    if (videoRef.current) videoRef.current.playbackRate = rate.current;
  }, [fast]);

  // A still (no video yet) shows the same progress line, timed to `length`
  useEffect(() => {
    if (item.video || !active || !playing) return;
    const t = setInterval(() => setProgress(p => (p + 0.2 * rate.current / length) % 1), 200);
    return () => clearInterval(t);
  }, [active, playing]);

  const onTime = () => {
    const v = videoRef.current;
    if (!v) return;
    // loop the clip window; also when it reaches (or passes) the end of the file
    if (v.currentTime >= start + length - 0.15 || (v.duration && v.currentTime >= v.duration - 0.15)) v.currentTime = start;
    setProgress(Math.max(0, Math.min(1, (v.currentTime - start) / length)));
  };

  const flashControls = (keepWhilePaused = true) => {
    setControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 2500);
    if (!keepWhilePaused) clearTimeout(hideTimer.current);
  };
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const togglePlay = () => { setPlaying(p => !p); flashControls(); };
  const skip = (s: number, showControls = true) => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = Math.max(start, Math.min(start + length - 0.5, v.currentTime + s));
      onTime();
    } else setProgress(p => Math.max(0, Math.min(0.99, p + s / length)));
    if (showControls) flashControls();
  };
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  // Move to a point in the short (0-1), for the seek bar
  const seekFrac = (f: number) => {
    f = Math.max(0, Math.min(0.999, f));
    const v = videoRef.current;
    if (v) v.currentTime = start + f * length;
    setProgress(f);
  };

  // ── Taps on the picture ──
  // Single tap: show / hide the controls (after a short wait, so a double tap can claim it).
  // Double tap on the left / right 40%: back / forward 10s; further quick taps on that side add 10s each.
  // Press and hold: play at 2x until released.
  const press = useRef<{ x: number; y: number; timer?: ReturnType<typeof setTimeout>; held: boolean } | null>(null);
  const lastTap = useRef<{ t: number; side: -1 | 0 | 1; streak: number }>({ t: 0, side: 0, streak: 0 });
  const singleTapTimer = useRef<ReturnType<typeof setTimeout>>();
  const DOUBLE_TAP_MS = 300, HOLD_MS = 450;

  const onPressStart = (e: React.PointerEvent) => {
    const p = { x: e.clientX, y: e.clientY, held: false } as NonNullable<typeof press.current>;
    p.timer = setTimeout(() => { p.held = true; setControls(false); setFast(true); }, HOLD_MS);
    press.current = p;
  };
  const onPressMove = (e: React.PointerEvent) => {
    const p = press.current;
    // moving the finger means a swipe between shorts, not a hold
    if (p && !p.held && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) { clearTimeout(p.timer); press.current = null; }
  };
  const onPressEnd = () => {
    const p = press.current;
    if (!p) return;
    clearTimeout(p.timer);
    if (p.held) setFast(false);
  };
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = press.current;
    press.current = null;
    if (p?.held) return;                       // the end of a hold, not a tap
    // first tap after clearing brings the UI back together with the play / pause and 10s controls
    if (clear) { setClear(false); clearTimeout(singleTapTimer.current); flashControls(); return; }
    const r = e.currentTarget.getBoundingClientRect(), fx = alongX(e.clientX, e.clientY, r);
    const side: -1 | 0 | 1 = fx < 0.4 ? -1 : fx > 0.6 ? 1 : 0;
    const now = e.timeStamp, last = lastTap.current;
    const quick = now - last.t < DOUBLE_TAP_MS && side === last.side && side !== 0;
    lastTap.current = { t: now, side, streak: quick ? last.streak + 1 : 0 };
    clearTimeout(singleTapTimer.current);
    if (quick) {
      const secs = 10 * lastTap.current.streak;
      skip(side * 10, false);
      setTapFx({ side: side as -1 | 1, secs, key: now });
      return;
    }
    singleTapTimer.current = setTimeout(() => (controls || !playing ? setControls(false) : flashControls()), DOUBLE_TAP_MS);
  };
  useEffect(() => () => clearTimeout(singleTapTimer.current), []);
  useEffect(() => {
    if (!tapFx) return;
    const t = setTimeout(() => setTapFx(null), 650);
    return () => clearTimeout(t);
  }, [tapFx]);

  // ── Seek bar: drag (or tap) along it to scrub; it thickens and shows the time while dragging ──
  const barRef = useRef<HTMLDivElement>(null);
  const fracAt = (clientX: number, clientY = 0) => alongX(clientX, clientY, barRef.current!.getBoundingClientRect());
  const onSeekDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();                        // not a swipe between shorts, not a hold
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true);
    seekFrac(fracAt(e.clientX, e.clientY));
  };
  const onSeekMove = (e: React.PointerEvent) => { if (scrubbing) { e.stopPropagation(); seekFrac(fracAt(e.clientX, e.clientY)); } };
  const onSeekUp = (e: React.PointerEvent) => { e.stopPropagation(); setScrubbing(false); };
  const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

  const showControls = (controls || !playing) && !clear;
  // Badges in priority order: crown > LIVE > Upcoming > age rating > HD / 4K. A live channel has no LIVE badge:
  // its profile logo already carries the LIVE label.
  const liveBadge = item.live && item.publisher.kind !== "channel";
  const greyBadges = [item.upcoming ? "Upcoming" : null, item.ageRating, item.quality].filter(Boolean) as string[];
  const hasBadges = !!item.premium || liveBadge || greyBadges.length > 0;
  // Title • badges share a line when they fit (Figma); otherwise the badges go on the next line, without the dot
  const fitsOneLine = item.title.length + greyBadges.reduce((n, b) => n + b.length + 3, 0) + (liveBadge ? 7 : 0) + (item.premium ? 3 : 0) <= 30;

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden select-none [&_button:focus:not(:focus-visible)]:outline-none"
      style={{ fontFamily: "'Open Sans', sans-serif" }}
      onPointerDown={onPressStart}
      onPointerMove={onPressMove}
      onPointerUp={onPressEnd}
      onPointerCancel={onPressEnd}
      onPointerLeave={onPressEnd}
      onClick={onTap}
    >
      {/* The short: a 16:9 video sits centred on the controls; a portrait still fills the screen */}
      {/* blurred copy behind a "contain" video: object-fit cover, blur 40px, dimmed to 0.7, scaled 1.2 so the soft
          blur edges never show */}
      {item.blurFill && (
        <canvas
          ref={blurRef}
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300"
          style={{ objectFit: "cover", filter: "blur(40px) brightness(0.7)", transform: "scale(1.2)", opacity: blurOn ? 1 : 0 }}
        />
      )}
      {item.video ? (
        // a video is cropped to fill the vertical screen (centre kept), unless it asks to be shown whole ("contain"):
        // then it sits uncropped, centred 28px above the middle like the Figma screen
        <div
          className={`absolute pointer-events-none ${item.blurFill ? "" : "bg-black"}`}
          style={item.fit === "contain"
            ? { left: 0, right: 0, top: "calc(50% - 28px)", transform: "translateY(-50%)", aspectRatio: String(item.aspect ?? 16 / 9), maxHeight: "100%" }
            : { inset: 0 }}
        >
          <video
            ref={videoRef}
            src={item.video}
            poster={item.img}
            muted={muted}
            playsInline
            preload="auto"
            loop
            onLoadedMetadata={e => { e.currentTarget.currentTime = start; }}
            onTimeUpdate={onTime}
            // the clip window can run to the very end of the file: start it again rather than stopping
            onEnded={e => { const v = e.currentTarget; v.currentTime = start; if (active && playing) v.play().catch(() => {}); }}
            className={`w-full h-full block ${item.fit === "contain" ? "object-contain" : "object-cover"}`}
            style={item.zoom ? { transform: `scale(${item.zoom})` } : undefined}
          />
        </div>
      ) : (
        <img src={item.img} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      )}

      {/* Scrims so the status bar and the text stay readable */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none transition-opacity duration-200"
        style={{ height: 120, background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none transition-opacity duration-200"
        style={{ height: "45%", opacity: clear ? 0 : 1, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)" }} />

      {/* Double-tap feedback: a soft half-circle on that side with the seconds jumped */}
      <AnimatePresence>
        {tapFx && (
          <motion.div
            key={tapFx.key}
            className="absolute top-0 bottom-0 z-10 flex items-center justify-center pointer-events-none"
            style={{
              width: "42%", [tapFx.side < 0 ? "left" : "right"]: 0,
              background: "rgba(255,255,255,0.12)",
              borderRadius: tapFx.side < 0 ? "0 50% 50% 0 / 0 50% 50% 0" : "50% 0 0 50% / 50% 0 0 50%",
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          >
            <span className="flex flex-col items-center gap-1 text-white text-[13px] font-semibold" style={{ fontFamily: "'Open Sans'" }}>
              <img src={tapFx.side < 0 ? iconRewind : iconForward} alt="" className="block w-12 h-16 -my-3" />
              {tapFx.side < 0 ? "−" : "+"}{tapFx.secs}s
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrubbing: the time, large, just above the picture; the info and actions step aside */}
      {scrubbing && (
        <div className="absolute left-0 right-0 z-20 flex justify-center pointer-events-none" style={{ top: "calc(50% - 28px - 160px)" }}>
          <span className="text-[28px] font-semibold tabular-nums text-white" style={{ fontFamily: "'Open Sans'", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
            {clock(progress * length)} <span style={{ color: "#a8a8a8" }}>/ {clock(length)}</span>
          </span>
        </div>
      )}

      {/* Hold: 2x speed pill */}
      <AnimatePresence>
        {fast && (
          <motion.div
            className="absolute left-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[13px] font-semibold pointer-events-none"
            style={{ top: `calc(${topInset} + 56px)`, x: "-50%", background: "rgba(0,0,0,0.6)", fontFamily: "'Open Sans'" }}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          >
            2x <span className="tracking-[-3px]">▶▶</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play / pause and 10s skips: a 240 x 64 row, 40px gaps, centred 28px above the middle. The skips are bare
          48 x 64 icons; play/pause sits in a 54px #4A4A4A circle */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            className="absolute left-1/2 z-10 flex items-center gap-10"
            style={{ top: "calc(50% - 28px)", x: "-50%", y: "-50%" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          >
            <button onClick={e => { stop(e); skip(-10); }} aria-label="Back 10 seconds" className="block w-12 h-16">
              <img src={iconRewind} alt="" className="block w-12 h-16" />
            </button>
            <button onClick={e => { stop(e); togglePlay(); }} aria-label={playing ? "Pause" : "Play"} className="block w-16 h-16">
              <img src={playing ? iconPause : iconPlay} alt="" className="block w-16 h-16" />
            </button>
            <button onClick={e => { stop(e); skip(10); }} aria-label="Forward 10 seconds" className="block w-12 h-16">
              <img src={iconForward} alt="" className="block w-12 h-16" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom: info on the left, actions on the right, then the progress line */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col">
        <div className="flex items-end justify-between transition-opacity duration-200" style={{ opacity: scrubbing || clear ? 0 : 1, pointerEvents: clear ? "none" : undefined }}>
          <div className="flex-1 min-w-0 flex flex-col gap-4 justify-center pl-4 py-4">
            <div className="flex flex-col gap-2 w-full">
              {/* Title • badges on one line (Figma); a long title gets the badges on their own line, without the dot */}
              <div className={fitsOneLine ? "flex items-center gap-2 w-full" : "flex flex-col items-start gap-1.5 w-full"}>
                <p className="font-semibold text-[17px] leading-normal" style={{ color: "#e8e8e8" }}>{item.title}</p>
                {fitsOneLine && hasBadges && <img src={iconMetaDot} alt="" className="w-1 h-1 block flex-shrink-0" />}
                {hasBadges && <div className="flex flex-wrap items-center gap-1">
                  {item.premium && <img src={iconCrown} alt="Premium" className="w-5 h-5 block" />}
                  {liveBadge && (
                    <span className="flex items-center gap-1 px-1.5 py-1 rounded-[11px] text-[11px] font-medium leading-none text-white" style={{ background: "#ea5454" }}>
                      <img src={iconLiveDot} alt="" className="w-1 h-1 block" />LIVE
                    </span>
                  )}
                  {greyBadges.map(t => (
                    <span key={t} className="px-1.5 py-1 rounded-[11px] text-[11px] font-medium leading-none" style={{ background: "#3a3a3a", color: "#e8e8e8" }}>{t}</span>
                  ))}
                </div>}
              </div>
              <Summary text={item.summary} active={active} />
            </div>
            <button
              onClick={e => { stop(e); onCta(); }}
              className="w-full h-10 px-3 rounded-[8px] flex items-center justify-center gap-2"
              style={{ background: "#e7e7e7" }}
            >
              {item.ctaIcon === "crown"
                ? <img src={iconCrown} alt="" className="w-4 h-4 block" />
                : item.ctaIcon === "bell"
                ? (reminded ? <Check size={16} strokeWidth={2.5} className="text-[#282828]" /> : <img src={iconBell} alt="" className="w-4 h-4 block" />)
                : <Play size={16} fill="#282828" className="text-[#282828]" />}
              <span className="text-[14px] font-bold leading-normal" style={{ color: "#282828", fontFamily: "'Open Sans'" }}>{item.upcoming && reminded ? "Reminder Set" : item.cta}</span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-5 px-2 py-4 flex-shrink-0">
            <button onClick={e => { stop(e); onProfile(); }} aria-label={item.publisher.name}>
              <ProfileLogo publisher={item.publisher} />
            </button>
            {item.publisher.kind === "channel" ? (
              <button onClick={e => { stop(e); onLike(); }} aria-label={liked ? "Remove from favourites" : "Add to favourites"}
                className="w-10 h-10 rounded-full flex items-center justify-center">
                <img src={liked ? iconHeartFilled : iconHeart} alt="" className="w-6 h-6 block flex-shrink-0" />
              </button>
            ) : (
              <button onClick={e => { stop(e); onSave(); }} aria-label={saved ? "Remove from My List" : "Add to My List"}
                className="w-10 h-10 rounded-full flex items-center justify-center">
                <img src={saved ? iconAdded : iconAdd} alt="" className="w-6 h-6 block flex-shrink-0" />
              </button>
            )}
            <button onClick={e => { stop(e); onShare(); }} aria-label="Share" className="w-10 h-10 rounded-full flex items-center justify-center">
              <img src={iconShare} alt="" className="w-6 h-6 block flex-shrink-0" />
            </button>
            <button onClick={e => { stop(e); setControls(false); setClear(true); }} aria-label="Clear screen" className="w-10 h-10 rounded-full flex items-center justify-center">
              <img src={iconClearScreen} alt="" className="w-10 h-10 block flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Progress line: 2.5px, with a taller invisible strip to grab; while dragging it grows to 4px with a handle,
            and the time shows above the picture */}
        <div
          className="relative w-full flex items-end cursor-pointer"
          style={{ height: 18, marginTop: -16, touchAction: "none" }}
          onPointerDown={onSeekDown}
          onPointerMove={onSeekMove}
          onPointerUp={onSeekUp}
          onPointerCancel={onSeekUp}
          onClick={stop}
        >
          <div ref={barRef} className="relative w-full transition-[height] duration-150" style={{ height: scrubbing ? 4 : 2.5, background: "#2a2a2a" }}>
            <div className="absolute left-0 top-0 h-full rounded-r-[4px]" style={{ width: `${progress * 100}%`, background: "#e8e8e8" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// The subtitle: at most 2 lines. When the text runs longer it's cut so that "… Read more" fits at the end of line 2,
// as plain inline text (no box over the picture); tapping it opens the whole description in place (scrolling if
// it's very long), and "Show less" folds it back.
function Summary({ text, active }: { text: string; active: boolean }) {
  const measure = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [cut, setCut] = useState<number | null>(null);   // characters shown before "… Read more"; null = all fits
  useEffect(() => {
    const el = measure.current;
    if (!el) return;
    const fit = () => {
      const line = parseFloat(getComputedStyle(el).lineHeight) || 18;
      // measure exactly what will be shown: the text, then "… " and a semibold "Read more"
      const fits = (t: string, more: boolean) => {
        el.textContent = t;
        if (more) {
          el.append("… ");
          const b = document.createElement("span");
          b.className = "font-semibold";
          b.textContent = "Read more";
          el.append(b);
        }
        return el.scrollHeight <= line * 2 + 1;
      };
      if (fits(text, false)) { setCut(null); return; }
      // longest start of the text that still leaves room for "… Read more", ending on a whole word
      const shown = (n: number) => text.slice(0, n).replace(/[\s—–\-,;:·]+$/, "");
      let lo = 0, hi = text.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        if (fits(shown(mid), true)) lo = mid; else hi = mid - 1;
      }
      const space = text.lastIndexOf(" ", lo);
      setCut(space > lo - 12 && space > 0 ? space : lo);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    // the web font is wider than the fallback it replaces, so measure again once it has loaded
    document.fonts?.ready.then(fit);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => { ro.disconnect(); document.fonts?.removeEventListener("loadingdone", fit); };
  }, [text]);
  useEffect(() => { if (!active) setOpen(false); }, [active]);
  const toggle = (e: React.SyntheticEvent) => { e.stopPropagation(); setOpen(o => !o); };
  const linkProps = {
    onClick: toggle,
    onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
    className: "font-semibold text-[15px] leading-normal",
    style: { color: "#e8e8e8" },
  };
  const body = "text-[15px] leading-normal";
  return (
    <div className="relative">
      {/* invisible copy at the same width, used to find where to cut */}
      <p ref={measure} aria-hidden className={`${body} absolute left-0 right-0 top-0 invisible pointer-events-none`} />
      {open ? (
        <div className="max-h-[40vh] overflow-y-auto" style={{ scrollbarWidth: "none" }} onPointerDown={e => e.stopPropagation()}>
          <p className={`${body} whitespace-pre-line`} style={{ color: "#d9d9d9" }}>
            {text} <button {...linkProps}>Show less</button>
          </p>
        </div>
      ) : (
        <p className={`${body} line-clamp-2`} style={{ color: "#d9d9d9" }}>
          {cut === null ? text : <>{text.slice(0, cut).replace(/[\s—–\-,;:·]+$/, "")}… <button {...linkProps}>Read more</button></>}
        </p>
      )}
    </div>
  );
}

// The publisher's logo on the right of a short: a channel is round (a red ring and LIVE label while it's live),
// an OTT service square
function ProfileLogo({ publisher }: { publisher: Publisher }) {
  if (publisher.kind === "ott") {
    return publisher.logo
      ? <img src={publisher.logo} alt="" className="w-12 h-12 rounded-[8px] object-cover block" />
      : <OttLogo brand={publisher.brand!} />;
  }
  if (!publisher.live) {
    return <img src={publisher.logo} alt="" className="w-12 h-12 rounded-full object-cover block bg-white" />;
  }
  // Live, TikTok style: red rings ripple out from the avatar while the logo gently "breathes"
  return (
    <span className="relative block w-12 h-12">
      {[0, 0.7].map(delay => (
        <motion.span
          key={delay}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: "1.5px solid red" }}
          initial={{ scale: 1, opacity: 0.9 }}
          animate={{ scale: 1.45, opacity: 0 }}
          transition={{ duration: 1.4, delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <span className="absolute inset-0 rounded-full" style={{ border: "1.2px solid red" }} />
      <motion.img
        src={publisher.logo} alt="" className="absolute rounded-full object-cover bg-white"
        style={{ left: 2.4, top: 2.4, width: 43.2, height: 43.2 }}
        animate={{ scale: [1, 0.9, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-[2px] text-white font-semibold"
        style={{ bottom: -8, width: 26, height: 12, background: "red", fontSize: 10, letterSpacing: -0.24, fontFamily: "'Open Sans'" }}>
        LIVE
      </span>
    </span>
  );
}

// Square OTT logos, drawn as type in each service's colours (no logo files)
function OttLogo({ brand }: { brand: OttBrand }) {
  const base = "w-12 h-12 rounded-[8px] flex items-center justify-center overflow-hidden";
  if (brand === "netflix") {
    return <span className={base} style={{ background: "#000" }}><span style={{ color: "#E50914", fontWeight: 900, fontSize: 30, fontFamily: "'Open Sans'", transform: "scaleY(1.15)" }}>N</span></span>;
  }
  if (brand === "hbo") {
    return <span className={base} style={{ background: "#000" }}><span style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: 0.5, fontFamily: "'Open Sans'" }}>HBO</span></span>;
  }
  return (
    <span className={base} style={{ background: "linear-gradient(160deg, #0b1d4f 0%, #0c3b8a 60%, #1384c9 100%)" }}>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 11, fontStyle: "italic", fontFamily: "'Open Sans'" }}>Disney<span style={{ color: "#7fd3ff" }}>+</span></span>
    </span>
  );
}

// ─── Share sheet ──────────────────────────────────────────
// Each app's real mark in its own colours: white on the brand colour, except Facebook, whose round mark is drawn
// full size in blue over white so its "f" shows white
const SHARE_TARGETS: { label: string; logo: string; bg: string; color: string; full?: boolean; border?: string }[] = [
  { label: "LINE", logo: logoLine, bg: "#06C755", color: "#fff" },
  { label: "Messenger", logo: logoMessenger, bg: "linear-gradient(45deg, #0099FF, #A033FF 60%, #FF5280 90%, #FF7061)", color: "#fff" },
  { label: "Facebook", logo: logoFacebook, bg: "#fff", color: "#0866FF", full: true },
  { label: "X", logo: logoX, bg: "#000", color: "#fff", border: "1px solid #3a3a3a" },
  { label: "Instagram", logo: logoInstagram, bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", color: "#fff" },
];

function ShareSheet({ item, onClose, onDone }: { item: FeedItem; onClose: () => void; onDone: (msg: string) => void }) {
  const link = `${window.location.origin}${BASE}?from=picker#short-${item.id}`;
  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    onDone("Link copied");
  };
  const more = () => {
    if (navigator.share) navigator.share({ title: item.title, url: link }).catch(() => {});
    else onDone("Sharing (demo)");
  };
  return (
    <div className="flex flex-col" style={{ fontFamily: "'Open Sans'" }}>
      <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-zinc-600" /></div>
      <div className="flex items-center justify-between px-5 pb-3">
        <p className="text-white text-[16px] font-semibold">Share</p>
        <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
          <X size={15} className="text-zinc-400" />
        </button>
      </div>
      {/* What's being shared */}
      <div className="mx-5 mb-4 flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "#26262b" }}>
        <img src={item.img} alt="" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-white text-[13px] font-semibold truncate">{item.title}</p>
          <p className="text-zinc-400 text-[11px] mt-0.5 truncate">{item.genre.startsWith(item.publisher.name) ? item.genre : `${item.publisher.name} · ${item.genre}`}</p>
        </div>
      </div>
      <div className="flex justify-between px-5 pb-6">
        {SHARE_TARGETS.map(t => (
          <button key={t.label} onClick={() => onDone(`Shared to ${t.label} (demo)`)} className="flex flex-col items-center gap-1.5 w-14">
            <span
              className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${t.full ? "[&>svg]:w-12 [&>svg]:h-12" : "[&>svg]:w-[26px] [&>svg]:h-[26px]"}`}
              style={{ background: t.bg, color: t.color, border: t.border }}
              dangerouslySetInnerHTML={{ __html: t.logo }}
            />
            <span className="text-zinc-300 text-[11px]">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3 px-5 pb-5">
        <button onClick={copy} className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-white text-[13px] font-semibold" style={{ background: "#2e2e34" }}>
          <Link2 size={16} /> Copy link
        </button>
        <button onClick={more} className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-white text-[13px] font-semibold" style={{ background: "#2e2e34" }}>
          <MoreHorizontal size={16} /> More
        </button>
      </div>
    </div>
  );
}

// ─── Status bar (phone frame only; a real phone shows its own) ─────
function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ height: STATUS_H }}>
      <span className="absolute text-white" style={{ left: 29.5, top: "calc(50% - 9px)", fontSize: 15, fontWeight: 590, letterSpacing: -0.165, fontFamily: "-apple-system, 'SF Pro Text', 'Open Sans', sans-serif" }}>9:41</span>
      <img src={iconCellular} alt="" className="absolute" style={{ right: 64.4, top: "calc(50% + 0.95px)", transform: "translateY(-50%)", width: 17.1, height: 10.7 }} />
      <img src={iconWifi} alt="" className="absolute" style={{ right: 44, top: "calc(50% + 0.93px)", transform: "translateY(-50%)", width: 15.4, height: 11.057 }} />
      <img src={iconBattery} alt="" className="absolute" style={{ right: 14.5, top: "calc(50% + 0.91px)", transform: "translateY(-50%)", width: 24.5, height: 11.5 }} />
      <span className="absolute bg-white rounded-[1.6px]" style={{ right: 19, top: "calc(50% + 0.91px)", transform: "translateY(-50%)", width: 18, height: 7.667 }} />
    </div>
  );
}

// ─── Bottom navigation (Figma "Mobile / Bottom Navigation"), Shorts selected ─────
const NAV_TABS = [
  { label: "Home", icon: iconNavHome, activeIcon: iconNavHomeActive },
  { label: "TV", icon: iconNavTv },
  { label: "Shorts", icon: iconNavShortsDefault, activeIcon: iconNavShorts },
  { label: "Search", icon: iconNavSearch },
  { label: "Profile", avatar: avatarUser },
];

function BottomNav({ bottom, indicator, active, onTab }: { bottom: string; indicator: boolean; active: string; onTab: (label: string) => void }) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-20 flex flex-col"
      style={{ background: "#101010", borderTop: "1px solid #282e38", filter: "drop-shadow(0 -8px 12px rgba(0,0,0,0.33))", paddingBottom: bottom }}
    >
      <div className="flex items-center w-full" style={{ height: NAV_H }}>
        {NAV_TABS.map(tb => ({ ...tb, active: tb.label === active })).map(t => (
          <button
            key={t.label}
            onClick={() => { if (!t.active) onTab(t.label); }}
            className="flex-1 h-16 flex flex-col items-center justify-center gap-1"
          >
            <span className="w-10 h-9 rounded-[12px] flex items-center justify-center">
              {t.avatar
                ? <img src={t.avatar} alt="" className="w-6 h-6 rounded-full object-cover" style={{ background: "#404045" }} />
                : <img src={t.active && t.activeIcon ? t.activeIcon : t.icon} alt="" className="w-6 h-6 block" />}
            </span>
            <span className="text-[11px] leading-[1.15]" style={{ color: t.active ? "#e8e8e8" : "#a8a8a8", fontWeight: t.active ? 600 : 400, fontFamily: "'Open Sans'" }}>{t.label}</span>
          </button>
        ))}
      </div>
      {indicator && (
        <div className="flex items-center justify-center w-full" style={{ height: INDICATOR_H, position: "absolute", bottom: 0, left: 0 }}>
          <div className="bg-white h-[5px] w-[135px] rounded-[100px]" />
        </div>
      )}
    </div>
  );
}

// ─── Bottom Sheet ─────────────────────────────────────────
function BottomSheet({
  item, onClose, onWatch,
}: {
  item: FeedItem; onClose: () => void; onWatch: () => void;
}) {
  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Open Sans'" }}>
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
        <div className="w-10 h-1 rounded-full bg-zinc-700" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between px-5 pb-4 flex-shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          {item.badge && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-[3px] rounded mb-1.5 ${BADGE_STYLE[item.badge]}`}
              style={{ fontFamily: "'Open Sans'" }}
            >
              {item.badge === "LIVE" && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
              {item.badge}
            </span>
          )}
          <h3
            className="text-white text-xl leading-tight"
            style={{ fontFamily: "'Open Sans'" }}
          >
            {item.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1"
        >
          <X size={15} className="text-zinc-400" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-5" style={{ scrollbarWidth: "none" }}>
        {/* Meta pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <MetaPill icon={<Clock size={10} />} label={item.duration} />
          <MetaPill icon={<Star size={10} />} label={item.rating} />
          <MetaPill icon={null} label={item.genre} />
        </div>

        {/* Synopsis */}
        <Section label="Synopsis">
          <p className="text-zinc-300 text-[13px] leading-relaxed">{item.synopsis}</p>
        </Section>

        {/* Cast / Teams */}
        <Section label={item.type === "Live Sports" ? "Teams & Commentary" : "Cast"}>
          <div className="flex flex-wrap gap-2">
            {item.cast.map((name) => (
              <div
                key={name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800"
              >
                <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <Users size={8} className="text-zinc-500" />
                </div>
                <span className="text-[11px] text-zinc-300">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Continue watching */}
        {item.watchProgress !== undefined && (
          <Section label="Continue Watching">
            <div className="flex items-center gap-3 bg-zinc-800/50 rounded-xl p-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: item.accent + "22" }}
              >
                <Play size={16} fill={item.accent} className="" style={{ color: item.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[12px] font-medium truncate">{item.title}</p>
                <p className="text-zinc-500 text-[11px] mt-0.5">
                  {item.live ? "Rejoin live stream" : `${Math.round((1 - item.watchProgress / 100) * parseInt(item.duration) || 0)}m remaining`}
                </p>
                <div className="mt-1.5 h-[3px] bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.watchProgress}%`, background: item.accent }}
                  />
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Related */}
        <Section label="Related Content">
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {item.related.map((r) => (
              <div key={r.title} className="flex-shrink-0 w-[88px]">
                <div className="w-[88px] h-[124px] rounded-xl overflow-hidden bg-zinc-800">
                  <img
                    src={r.img}
                    alt={r.title}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1.5 leading-tight line-clamp-2">{r.title}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <div
        className="flex-shrink-0 px-5 pb-8 pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onWatch}
          className="w-full h-12 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 text-white"
          style={{ background: item.accent }}
        >
          <Play size={16} fill="white" className="text-white" />
          {item.cta}
        </motion.button>
      </div>
    </div>
  );
}

// ─── Playback Screen ──────────────────────────────────────
function PlaybackScreen({
  item, muted, onMute, onBack,
}: {
  item: FeedItem; muted: boolean; onMute: () => void; onBack: () => void;
}) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(item.watchProgress ?? 12);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  };

  useEffect(() => {
    showControls();
    return () => clearTimeout(hideTimer.current);
  }, [playing]);

  return (
    <div className="absolute inset-0 bg-black" onClick={showControls}>
      {/* Simulated video frame */}
      <img
        src={item.img}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        style={{ opacity: playing ? 0.92 : 0.6 }}
      />
      <div className="absolute inset-0 bg-black/15" />

      {/* Tap zone */}
      <div className="absolute inset-0 z-10" onClick={showControls} />

      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top bar */}
            <div
              className="absolute top-0 left-0 right-0 pb-8 px-4 pt-12 pointer-events-auto"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  <ArrowLeft size={17} className="text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-white font-semibold text-[14px] truncate"
                    style={{ fontFamily: "'Open Sans'" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-[10px] text-zinc-400 mt-0.5"
                    style={{ fontFamily: "'Open Sans'" }}
                  >
                    {item.type} · {item.genre}
                  </p>
                </div>
                <button
                  onClick={onMute}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.5)" }}
                >
                  {muted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
                </button>
              </div>
            </div>

            {/* Centre play/pause */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); showControls(); }}
                className="w-16 h-16 rounded-full flex items-center justify-center pointer-events-auto"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
              >
                {playing
                  ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-[5px] h-6 bg-white rounded-sm" />
                      <div className="w-[5px] h-6 bg-white rounded-sm" />
                    </div>
                  )
                  : <Play size={22} fill="white" className="text-white ml-1" />
                }
              </motion.button>
            </div>

            {/* Bottom controls */}
            <div
              className="absolute bottom-0 left-0 right-0 pt-10 pb-8 px-5 pointer-events-auto"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)" }}
            >
              {/* Progress bar */}
              <div
                className="relative h-[3px] rounded-full mb-3 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.2)" }}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  setProgress(Math.max(0, Math.min(100, pct)));
                  showControls();
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{ width: `${progress}%`, background: item.accent }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow"
                  style={{ left: `calc(${progress}% - 7px)` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ fontFamily: "'Open Sans'" }}>
                  {item.live ? (
                    <span className="flex items-center gap-1.5 text-[11px] text-red-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-400">{progress}% · {item.duration}</span>
                  )}
                </div>
                <div
                  className="flex items-center gap-1.5 text-zinc-400 text-[11px]"
                  style={{ fontFamily: "'Open Sans'" }}
                >
                  <Tv size={12} />
                  <span>Full Screen</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent live badge */}
      {item.live && (
        <div className="absolute top-14 right-4 z-30">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-white font-bold bg-red-600"
            style={{ fontFamily: "'Open Sans'" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        </div>
      )}

      {/* Pause overlay */}
      <AnimatePresence>
        {!playing && (
          <motion.div
            className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="text-[11px] text-white/40 uppercase tracking-[0.25em] mt-24"
              style={{ fontFamily: "'Open Sans'" }}
            >
              Paused
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper UI ────────────────────────────────────────────
function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800">
      {icon && <span className="text-zinc-500">{icon}</span>}
      <span className="text-[11px] text-zinc-400" style={{ fontFamily: "'Open Sans'" }}>{label}</span>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[9px] uppercase tracking-[0.22em] text-zinc-600 mb-2"
        style={{ fontFamily: "'Open Sans'" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
