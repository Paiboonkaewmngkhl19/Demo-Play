import { useState, useRef, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";
import { motion, AnimatePresence, animate, useMotionValue } from "motion/react";
import {
  Heart, Plus, Share2, Info, Play, Volume2, VolumeX,
  ArrowLeft, X, ChevronUp, Clock, Star,
  Signal, Wifi, Battery, Tv, Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
type Badge = "LIVE" | "New" | "Trending";

interface Related { title: string; img: string }

interface FeedItem {
  id: number;
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

// ─── Feed Data ────────────────────────────────────────────
const FEED: FeedItem[] = [
  {
    id: 1,
    title: "Avengers: Secret Wars",
    type: "Movie", genre: "Action · Sci-Fi",
    badge: "Trending",
    duration: "2h 45m", rating: "PG-13",
    synopsis: "The Avengers face their greatest threat as the multiverse collapses, forcing heroes from across realities into one final, catastrophic battle for the survival of all existence.",
    cast: ["Chris Evans", "Robert Downey Jr.", "Scarlett Johansson", "Benedict Cumberbatch"],
    img: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Now", live: false, accent: "#FF3D57", watchProgress: 48,
    related: [
      { title: "Doctor Strange MoM", img: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=120&h=180&fit=crop&auto=format" },
      { title: "Thor: Love & Thunder", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=120&h=180&fit=crop&auto=format" },
      { title: "Guardians Vol. 3", img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 2,
    title: "Man City vs Arsenal",
    type: "Live Sports", genre: "Premier League · Football",
    badge: "LIVE",
    duration: "74’ · City 1–0 Arsenal", rating: "G",
    synopsis: "An electrifying title decider at the Etihad Stadium. City hold a one-goal lead with 16 minutes remaining in this season-defining clash between two Premier League giants.",
    cast: ["Erling Haaland", "Bukayo Saka", "Kevin De Bruyne", "Martin Ødegaard"],
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Live", live: true, accent: "#00E676", watchProgress: 74,
    related: [
      { title: "Liverpool vs Spurs", img: "https://images.unsplash.com/photo-1551958219-acbc595bfd56?w=120&h=180&fit=crop&auto=format" },
      { title: "Champions League", img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&h=180&fit=crop&auto=format" },
      { title: "Serie A Highlights", img: "https://images.unsplash.com/photo-1600679472829-3044539ce405?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 3,
    title: "Crash Landing on You",
    type: "Korean Drama", genre: "Romance · Drama",
    badge: "New",
    duration: "1h 10m · Ep 12", rating: "16+",
    synopsis: "A South Korean heiress accidentally paraglides into North Korea and falls in love with a military officer who risks everything to keep her secret from both governments.",
    cast: ["Son Ye-jin", "Hyun Bin", "Kim Jung-hyun", "Seo Ji-hye"],
    img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Now", live: false, accent: "#536DFE",
    related: [
      { title: "My Love from the Star", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=180&fit=crop&auto=format" },
      { title: "Descendants of the Sun", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=180&fit=crop&auto=format" },
      { title: "Goblin", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 4,
    title: "Dave Chappelle: Unforgiven",
    type: "Comedy Special", genre: "Stand-Up Comedy",
    badge: null,
    duration: "1h 15m", rating: "18+",
    synopsis: "Chappelle returns with his most personal special yet — unfiltered observations on controversy, culture, cancel culture, and the increasingly bizarre state of modern America.",
    cast: ["Dave Chappelle"],
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Now", live: false, accent: "#FFD740",
    related: [
      { title: "Chris Rock: Selective Outrage", img: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=120&h=180&fit=crop&auto=format" },
      { title: "Kevin Hart: Reality Check", img: "https://images.unsplash.com/photo-1548699939-e72e81c5c02a?w=120&h=180&fit=crop&auto=format" },
      { title: "Ali Wong: Single Lady", img: "https://images.unsplash.com/photo-1545912452-8aea7e25a3d3?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 5,
    title: "Coldplay: Music of the Spheres",
    type: "Concert", genre: "Music · Live Performance",
    badge: "LIVE",
    duration: "LIVE · Wembley Stadium", rating: "G",
    synopsis: "Experience Coldplay's record-breaking world tour live from Wembley. A breathtaking audio-visual spectacular featuring their greatest hits and dazzling light installations.",
    cast: ["Chris Martin", "Jonny Buckland", "Guy Berryman", "Will Champion"],
    img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Live", live: true, accent: "#E040FB",
    related: [
      { title: "Taylor Swift: Eras Tour", img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=180&fit=crop&auto=format" },
      { title: "Beyoncé: Renaissance", img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=120&h=180&fit=crop&auto=format" },
      { title: "Ed Sheeran: Subtract", img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 6,
    title: "Attack on Titan: Final Chapter",
    type: "Anime", genre: "Action · Dark Fantasy",
    badge: "Trending",
    duration: "45m · Series Finale", rating: "17+",
    synopsis: "Eren Yeager's devastating plan unfolds. The Survey Corps makes one last desperate stand to stop the Rumbling and save what remains of humanity from total annihilation.",
    cast: ["Yuki Kaji", "Yui Ishikawa", "Marina Inoue", "Kishō Taniyama"],
    img: "https://images.unsplash.com/photo-1557683316-973673baf926?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Now", live: false, accent: "#FF6D00",
    related: [
      { title: "Demon Slayer: Season 4", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&h=180&fit=crop&auto=format" },
      { title: "Jujutsu Kaisen S2", img: "https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=120&h=180&fit=crop&auto=format" },
      { title: "One Piece Film Red", img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 7,
    title: "Love Island All Stars",
    type: "Reality Show", genre: "Reality · Romance",
    badge: "New",
    duration: "50m · Episode 8", rating: "16+",
    synopsis: "Fan-favorites return to the villa for a second shot at love. With new connections forming and old flames rekindling, this is set to be the most dramatic series yet.",
    cast: ["Maya Jama", "Toby Aromolaran", "Ekin-Su Cülcüloğlu", "Wes Nelson"],
    img: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Now", live: false, accent: "#F06292",
    related: [
      { title: "Too Hot to Handle S5", img: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=120&h=180&fit=crop&auto=format" },
      { title: "The Bachelor S28", img: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=120&h=180&fit=crop&auto=format" },
      { title: "Married at First Sight", img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=120&h=180&fit=crop&auto=format" },
    ],
  },
  {
    id: 8,
    title: "CNN: Global Climate Summit",
    type: "News Highlights", genre: "News · Politics",
    badge: "LIVE",
    duration: "LIVE · Geneva, Switzerland", rating: "G",
    synopsis: "World leaders gather in Geneva for the most critical climate negotiations in history. Live as major economies announce unprecedented commitments to carbon reduction by 2035.",
    cast: ["Anderson Cooper", "Christiane Amanpour", "Jake Tapper"],
    img: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=420&h=844&fit=crop&auto=format",
    cta: "Watch Live", live: true, accent: "#29B6F6",
    related: [
      { title: "UN General Assembly 2025", img: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=120&h=180&fit=crop&auto=format" },
      { title: "G7 Summit Coverage", img: "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?w=120&h=180&fit=crop&auto=format" },
      { title: "World Economic Forum", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&h=180&fit=crop&auto=format" },
    ],
  },
];

const BADGE_STYLE: Record<Badge, string> = {
  LIVE: "bg-red-600 text-white",
  New: "bg-sky-600 text-white",
  Trending: "bg-amber-400 text-black",
};

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
  // Views the user came from, so Back can return to exactly where they were
  const [trail, setTrail] = useState<{ screen: "feed" | "playback"; sheetOpen: boolean }[]>([]);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
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
      if (trail.length) goBack();
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

  return (
    <div
      className="h-dvh overflow-hidden flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1a24 0%, #07070A 60%)" }}
    >
      <div className="h-full flex flex-col items-center">
        {/* Phone: full window height, no outer margin */}
        <div className="relative h-full" style={{ width: 390, maxWidth: "100vw" }}>
          {/* Side buttons */}
          <div className="absolute left-[-2px] top-28 w-[2px] h-7 bg-zinc-700 rounded-l-sm" />
          <div className="absolute left-[-2px] top-40 w-[2px] h-10 bg-zinc-700 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[215px] w-[2px] h-10 bg-zinc-700 rounded-l-sm" />
          <div className="absolute right-[-2px] top-36 w-[2px] h-14 bg-zinc-700 rounded-r-sm" />

          {/* Screen */}
          <div
            className="absolute inset-0 rounded-[48px] overflow-hidden bg-black"
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.8), 0 40px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-black rounded-full flex items-center justify-center gap-2 transition-all duration-300"
              style={{ width: item.live ? 120 : 112, height: 32 }}
            >
              {item.live && (
                <span className="flex items-center gap-1 text-[10px] text-red-400 font-['Inter']">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

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
                  {/* Scroll / swipe zone */}
                  <div
                    ref={swipeZoneRef}
                    className="absolute inset-0 z-10 select-none overflow-hidden"
                    style={{ touchAction: "none" }}
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
                                idx={idx + o}
                                total={FEED.length}
                                active={o === 0}
                                liked={liked.has(f.id)}
                                saved={saved.has(f.id)}
                                muted={muted}
                                onLike={() => setLiked(s => toggleSet(s, f.id))}
                                onSave={() => setSaved(s => toggleSet(s, f.id))}
                                onMute={() => setMuted(m => !m)}
                                onMoreInfo={() => goTo({ sheetOpen: true })}
                                onWatch={() => goTo({ screen: "playback" })}
                                onExit={CAME_FROM_PICKER ? exitToPicker : undefined}
                              />
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  </div>

                  {/* Bottom sheet */}
                  <AnimatePresence>
                    {sheetOpen && (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-black/70 z-20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={goBack}
                        />
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 z-30 rounded-t-[28px] overflow-hidden"
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
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Feed Card ────────────────────────────────────────────
function FeedCard({
  item, idx, total, active, liked, saved, muted,
  onLike, onSave, onMute, onMoreInfo, onWatch, onExit,
}: {
  item: FeedItem; idx: number; total: number; active: boolean;
  liked: boolean; saved: boolean; muted: boolean;
  onLike: () => void; onSave: () => void; onMute: () => void;
  onMoreInfo: () => void; onWatch: () => void; onExit?: () => void;
}) {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Background image */}
      <img
        src={item.img}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Top scrim */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: "40%", background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
      />
      {/* Bottom scrim */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: "58%", background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)" }}
      />

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pt-4 z-20">
        <span className="text-white text-[13px] font-semibold" style={{ fontFamily: "'Inter'" }}>9:41</span>
        <div className="flex items-center gap-1.5 opacity-90">
          <Signal size={12} className="text-white" />
          <Wifi size={12} className="text-white" />
          <Battery size={14} className="text-white" />
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute top-11 left-0 right-0 flex items-center justify-between px-5 z-20">
        <div className="flex items-center gap-2">
          {onExit && (
            <button
              onClick={onExit}
              aria-label="Back to content picker"
              className="w-8 h-8 mr-1 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
            >
              <ArrowLeft size={15} className="text-white" />
            </button>
          )}
          <span
            className="text-white font-bold text-[17px] tracking-tight"
            style={{ fontFamily: "'Inter'" }}
          >
            stream
          </span>
          <span
            className="text-[8px] uppercase tracking-[0.15em] text-white/40 border border-white/20 px-1.5 py-0.5 rounded-sm"
            style={{ fontFamily: "'Inter'" }}
          >
            For You
          </span>
        </div>
        <button
          onClick={onMute}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          {muted
            ? <VolumeX size={14} className="text-white" />
            : <Volume2 size={14} className="text-white" />
          }
        </button>
      </div>

      {/* Progress rail — right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 3,
              height: i === idx ? 22 : 4,
              background: i === idx ? "#fff" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>

      {/* Right FABs */}
      <div className="absolute right-5 bottom-36 flex flex-col items-center gap-5 z-20">
        {/* Watch CTA */}
        <div className="flex flex-col items-center gap-1.5">
          <motion.button
            onClick={onWatch}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: item.accent }}
          >
            <Play size={18} fill="white" className="text-white ml-0.5" />
          </motion.button>
          <span
            className="text-[9px] text-white/60 text-center leading-tight"
            style={{ fontFamily: "'Inter'" }}
          >
            {item.live ? "Live" : "Watch"}
          </span>
        </div>

        {/* Like */}
        <FAB
          icon={
            <Heart
              size={20}
              fill={liked ? item.accent : "none"}
              stroke={liked ? item.accent : "white"}
            />
          }
          label="Like"
          onClick={onLike}
        />

        {/* Add to list */}
        <FAB
          icon={
            <Plus
              size={20}
              className={saved ? "" : "text-white"}
              style={saved ? { color: item.accent } : undefined}
            />
          }
          label="My List"
          onClick={onSave}
        />

        {/* Share */}
        <FAB
          icon={<Share2 size={18} className="text-white" />}
          label="Share"
          onClick={() => {}}
        />
      </div>

      {/* Bottom content info */}
      <div className="absolute bottom-0 left-0 right-20 px-5 pb-5 z-20 space-y-2">
        {item.badge && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-1 px-2 py-[3px] rounded text-[10px] font-bold ${BADGE_STYLE[item.badge]}`}
            style={{ fontFamily: "'Inter'" }}
          >
            {item.badge === "LIVE" && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            {item.badge}
          </motion.div>
        )}

        <h2
          className="text-white leading-tight"
          style={{ fontFamily: "'Inter'", fontSize: "clamp(18px, 5.5vw, 24px)" }}
        >
          {item.title}
        </h2>

        <p
          className="text-zinc-400 text-[11px] uppercase tracking-wide"
          style={{ fontFamily: "'Inter'" }}
        >
          {item.type} · {item.genre}
        </p>

        <button
          onClick={onMoreInfo}
          className="flex items-center gap-1.5 text-white text-[13px] border border-white/20 rounded-full px-3.5 py-2 transition-all active:bg-white/20 hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(6px)", fontFamily: "'Inter'" }}
        >
          <Info size={13} />
          More Info
        </button>
      </div>

      {/* Swipe hint — first card only */}
      {idx === 0 && active && (
        <motion.div
          className="absolute bottom-[170px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: 4, duration: 0.7, delay: 2.5 }}
          >
            <ChevronUp size={16} className="text-white/40" />
          </motion.div>
          <span
            className="text-[9px] text-white/30 uppercase tracking-widest"
            style={{ fontFamily: "'Inter'" }}
          >
            Swipe up
          </span>
        </motion.div>
      )}

      {/* Simulated playback pulse — plays when this card becomes the current one */}
      {active && (
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2.5 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="w-14 h-14 rounded-full border border-white/20" />
        </motion.div>
      )}
    </div>
  );
}

function FAB({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
      >
        {icon}
      </motion.button>
      <span
        className="text-[9px] text-white/50 text-center"
        style={{ fontFamily: "'Inter'" }}
      >
        {label}
      </span>
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
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter'" }}>
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
              style={{ fontFamily: "'Inter'" }}
            >
              {item.badge === "LIVE" && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
              {item.badge}
            </span>
          )}
          <h3
            className="text-white text-xl leading-tight"
            style={{ fontFamily: "'Inter'" }}
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
                    style={{ fontFamily: "'Inter'" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-[10px] text-zinc-400 mt-0.5"
                    style={{ fontFamily: "'Inter'" }}
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
                <div className="flex items-center gap-2" style={{ fontFamily: "'Inter'" }}>
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
                  style={{ fontFamily: "'Inter'" }}
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
            style={{ fontFamily: "'Inter'" }}
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
              style={{ fontFamily: "'Inter'" }}
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
      <span className="text-[11px] text-zinc-400" style={{ fontFamily: "'Inter'" }}>{label}</span>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[9px] uppercase tracking-[0.22em] text-zinc-600 mb-2"
        style={{ fontFamily: "'Inter'" }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
