import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_SLIDES = 9;
const HIDE_DELAY = 2000;

export default function KeplerAskPitch() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      setCurrent((c) => Math.max(0, Math.min(TOTAL_SLIDES - 1, c + dir)));
      showControls();
    },
    [showControls]
  );

  // Hide navbar/footer on mount, restore on unmount
  useEffect(() => {
    document.body.classList.add("pitch-fullscreen");
    // Start auto-hide timer
    hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_DELAY);
    return () => {
      document.body.classList.remove("pitch-fullscreen");
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  // Mouse movement shows controls
  useEffect(() => {
    const handler = () => showControls();
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [showControls]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>(".slide");
    slides[current]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [current]);

  return (
    <>
      <style>{`
        /* Hide navbar + footer when pitch is active */
        body.pitch-fullscreen > div > div > nav,
        body.pitch-fullscreen > div > div > header,
        body.pitch-fullscreen > div > div > footer,
        body.pitch-fullscreen > div > nav,
        body.pitch-fullscreen > div > header,
        body.pitch-fullscreen > div > footer {
          display: none !important;
        }
        body.pitch-fullscreen {
          overflow: hidden;
        }
        .pitch-wrapper {
          background: #1a1a1a;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .pitch-slide-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pitch-slide-container .slide {
          margin: 0 !important;
          transform-origin: center center;
        }
        .pitch-controls {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(26,26,26,.85);
          padding: 8px 16px;
          border-radius: 30px;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          backdrop-filter: blur(8px);
          user-select: none;
          opacity: 1;
          transition: opacity .4s ease;
        }
        .pitch-controls.hidden {
          opacity: 0;
          pointer-events: none;
        }
        .pitch-controls button {
          background: none;
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          padding: 2px 8px;
          border-radius: 6px;
          line-height: 1;
        }
        .pitch-controls button:hover { background: rgba(255,255,255,.15); }
        .pitch-controls button:disabled { opacity: .3; cursor: default; }
        .pitch-controls .counter {
          min-width: 60px;
          text-align: center;
          font-weight: 600;
          font-size: 13px;
        }
      `}</style>

      <div className="pitch-wrapper" ref={containerRef}>
        <SlideView html={SLIDES_HTML} index={current} />
      </div>

      <div className={`pitch-controls ${controlsVisible ? "" : "hidden"}`}>
        <button onClick={() => go(-1)} disabled={current === 0}>
          ←
        </button>
        <span className="counter">
          {current + 1} / {TOTAL_SLIDES}
        </span>
        <button
          onClick={() => go(1)}
          disabled={current === TOTAL_SLIDES - 1}
        >
          →
        </button>
      </div>
    </>
  );
}

function SlideView({ html, index }: { html: string; index: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Parse slides once
  const slidesRef = useRef<string[]>([]);
  if (slidesRef.current.length === 0) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<div>${html}</div>`,
      "text/html"
    );
    // Extract the <style> block(s)
    const styles = Array.from(doc.querySelectorAll("style"))
      .map((s) => s.outerHTML)
      .join("");
    const link = doc.querySelector("link")?.outerHTML ?? "";
    const slides = doc.querySelectorAll(".slide");
    slidesRef.current = Array.from(slides).map(
      (s) => link + styles + s.outerHTML
    );
  }

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setScale(Math.min(vw / 1920, vh / 1080));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const slideHtml = slidesRef.current[index] ?? "";

  return (
    <div
      className="pitch-slide-container"
      ref={wrapperRef}
      dangerouslySetInnerHTML={{ __html: slideHtml }}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        width: 1920,
        height: 1080,
      }}
    />
  );
}

const SLIDES_HTML = `
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  .pitch-wrapper{--o:#F37A1F;--od:#D4600A;--ol:#FFF3E8;--dk:#1A1A1A;--gr:#666;--lg:#F5F5F5;--gn:#1B7A3D;--rd:#CC3333;--gold:#B8860B;--goldbg:#FFF8E1;--gnbg:#E8F8EE}
  .pitch-wrapper *{margin:0;padding:0;box-sizing:border-box}
  .pitch-wrapper{font-family:'Poppins',sans-serif;color:#222}

  .slide{width:1920px;height:1080px;background:#FFF;position:relative;overflow:hidden;display:flex;flex-direction:column}
  .top-bar{height:6px;background:var(--o);flex-shrink:0}
  .slide-pad{flex:1;display:flex;flex-direction:column;padding:44px 100px 0;overflow:hidden;min-height:0}
  .sf{height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 100px;font-size:11px;color:#BBB;flex-shrink:0}
  .sf .fb{font-weight:600;color:var(--o)}
  .sl{font-size:13px;color:var(--o);font-weight:700;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px}
  .stitle{font-size:46px;font-weight:800;color:var(--dk);line-height:1.1}
  .stitle span{color:var(--o)}
  .sdesc{font-size:15px;color:var(--gr);margin-top:10px;max-width:700px;line-height:1.6}
  .sheader{margin-bottom:28px;flex-shrink:0}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--o);flex-shrink:0}
  .rb{display:inline-block;padding:5px 16px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;margin-top:12px}
  .rl{background:var(--gnbg);color:var(--gn)}.rm{background:var(--ol);color:var(--od)}

  .s1{display:block !important}
  .s1 .bg{position:absolute;right:0;top:0;width:55%;height:100%;background:var(--o);clip-path:polygon(20% 0,100% 0,100% 100%,0% 100%)}
  .s1 .al{position:absolute;left:0;top:0;width:8px;height:100%;background:var(--o)}
  .s1 .cl{position:absolute;left:100px;top:50%;transform:translateY(-50%);width:38%}
  .s1 .rc{position:absolute;right:80px;top:50%;transform:translateY(-50%);color:#fff;text-align:right;z-index:2}
  .s1 .sf{position:absolute;bottom:0;left:0;right:0}

  .flow-row{display:flex;align-items:stretch;gap:0;flex:1;min-height:0}
  .flow-col{display:flex;flex-direction:column;justify-content:center}
  .flow-arrow{display:flex;align-items:center;justify-content:center;padding:0 6px;flex-shrink:0}
  .flow-arrow .arr{font-size:28px;color:var(--o)}
  .flow-arrow.gold .arr{color:var(--gold)}
  .flow-arrow.green .arr{color:var(--gn)}
  .opt-mini{border:2px solid var(--gn);border-radius:10px;padding:14px 18px;margin-bottom:10px;background:#fff}
  .opt-mini.b{border-color:var(--o)}
  .opt-mini .om-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
  .opt-mini .om-letter{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;flex-shrink:0}
  .opt-mini .om-title{font-size:15px;font-weight:800;color:var(--dk)}
  .opt-mini .om-price{font-size:20px;font-weight:900;margin-left:auto;flex-shrink:0}
  .opt-mini .om-sub{font-size:10px;color:#999;line-height:1.4}
  .or-pill{text-align:center;font-size:11px;font-weight:800;color:#999;padding:4px 0}
  .ea-box{background:var(--gn);border-radius:12px;padding:22px 20px;color:#fff;text-align:center}
  .ea-box .ea-date{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.7;margin-bottom:4px}
  .ea-box h3{font-size:22px;font-weight:900;margin-bottom:8px}
  .ea-box .ea-list{font-size:11px;opacity:.85;line-height:1.6;text-align:left}
  .gate-box{border:3px solid #F4D03F;border-radius:12px;overflow:hidden;background:#fff}
  .gate-box .gate-hdr{background:var(--goldbg);padding:12px 18px;text-align:center}
  .gate-box .gate-hdr h4{font-size:16px;font-weight:800;color:var(--dk)}
  .gate-box .gate-hdr .gate-sub{font-size:10px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase}
  .gate-box .gate-body{padding:10px 18px}
  .gate-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F0F0F0;font-size:12px}
  .gate-row:last-child{border:none}
  .gate-row .gk{color:#888}.gate-row .gv{font-weight:800;color:var(--gold)}
  .p2-box{border:3px solid var(--o);border-radius:12px;overflow:hidden;background:#fff}
  .p2-box .p2-hdr{background:var(--o);padding:14px 20px;display:flex;justify-content:space-between;align-items:center;color:#fff}
  .p2-box .p2-hdr h4{font-size:18px;font-weight:900}
  .p2-box .p2-hdr .p2-amt{font-size:26px;font-weight:900}
  .p2-box .p2-body{padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}
  .p2-box .p2-body .p2k{font-size:10px;color:#999;font-weight:600}.p2-box .p2-body .p2v{font-size:14px;font-weight:800;color:var(--dk)}
  .p2-box .p2-foot{padding:8px 20px 14px}
  .p2-box .p2-foot .p2badge{padding:6px 12px;background:var(--ol);border-radius:6px;font-size:10px;color:var(--od);font-weight:600;text-align:center}
  .timeline-bar{display:flex;align-items:center;margin-top:16px;flex-shrink:0}
  .tl-line{flex:1;height:3px;background:#E0E0E0}
  .tl-line.gn{background:var(--gn)}.tl-line.gold{background:#F4D03F}.tl-line.o{background:var(--o)}
  .tl-dot{width:14px;height:14px;border-radius:50%;flex-shrink:0}
  .tl-label{text-align:center;flex-shrink:0;padding:0 8px}
  .tl-label .tld{font-size:12px;font-weight:700}.tl-label .tls{font-size:10px;color:#999}
  .bottom-bar{background:var(--dk);border-radius:10px;padding:18px 32px;display:flex;justify-content:space-between;align-items:center;margin-top:16px;flex-shrink:0}
  .bottom-bar .bb-left .bb-label{font-size:10px;color:#888;font-weight:600;letter-spacing:2px;text-transform:uppercase}
  .bottom-bar .bb-left .bb-text{font-size:16px;color:#FFF;font-weight:600;margin-top:4px}
  .bottom-bar .bb-left .bb-text .hl-gn{color:var(--gn)}.bottom-bar .bb-left .bb-text .hl-o{color:var(--o)}
  .bottom-bar .bb-right{text-align:right;flex-shrink:0;margin-left:40px}
  .bottom-bar .bb-right .bbr-label{font-size:10px;color:#888;letter-spacing:1px}
  .bottom-bar .bb-right .bbr-val{font-size:24px;font-weight:900;color:var(--o)}
  .bottom-bar .bb-right .bbr-sub{font-size:10px;color:#666}

  .phases-row{display:flex;gap:32px;flex:1;min-height:0;align-items:stretch}
  .pc{flex:1;border:2px solid #EEE;border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
  .pc.hi{border-color:var(--o);box-shadow:0 6px 24px rgba(243,122,31,.12)}
  .pc .ch{padding:22px 28px 16px;background:var(--lg);border-bottom:2px solid #EEE;flex-shrink:0}
  .pc.hi .ch{background:var(--o);border-bottom-color:var(--o);color:#fff}
  .pc .ch .pn{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gr);margin-bottom:4px}
  .pc.hi .ch .pn{color:rgba(255,255,255,.7)}
  .pc .ch h3{font-size:24px;font-weight:800;color:var(--dk)}
  .pc.hi .ch h3{color:#fff}
  .pc .ch .tl{font-size:12px;color:var(--gr);margin-top:2px}
  .pc.hi .ch .tl{color:rgba(255,255,255,.8)}
  .pc .cb{padding:22px 28px;flex:1}
  .pc .am{font-size:32px;font-weight:900;color:var(--o);margin-bottom:2px}
  .pc .as{font-size:12px;color:#999;margin-bottom:16px}
  .pc .cb ul{list-style:none;padding:0}
  .pc .cb li{font-size:13px;color:#555;padding:6px 0;border-bottom:1px solid #F0F0F0;display:flex;align-items:center;gap:10px}
  .pc .cb li:last-child{border:none}
  .arrow-col{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex-shrink:0;padding:0 8px}
  .arrow-col .at{font-size:9px;font-weight:700;color:var(--o);letter-spacing:1px;text-align:center}
  .arrow-col .aline{width:40px;height:3px;background:var(--o)}
  .arrow-col .ahead{width:0;height:0;border-top:7px solid transparent;border-bottom:7px solid transparent;border-left:10px solid var(--o)}

  .opts-row{display:flex;gap:0;flex:1;min-height:0;align-items:stretch}
  .opt-col{flex:1;display:flex;flex-direction:column;gap:12px}
  .divider-col{width:2px;background:#EEE;margin:0 24px;position:relative;flex-shrink:0;display:flex;align-items:center;justify-content:center}
  .divider-col .orbadge{background:#fff;border:2px solid #EEE;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:var(--gr)}
  .opt-hdr{display:flex;align-items:center;gap:14px}
  .opt-letter{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;flex-shrink:0}
  .opt-card{background:var(--lg);border-radius:10px;padding:20px 24px}
  .opt-card.bd{border:2px solid var(--o);background:#fff}
  .opt-card h4{font-size:12px;font-weight:700;color:var(--gr);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
  .opt-card .bv{font-size:32px;font-weight:900;line-height:1.1}
  .opt-card .sv{font-size:12px;color:#999;margin-top:2px}
  .opt-card ul{list-style:none;padding:0;margin-top:10px}
  .opt-card li{font-size:13px;color:#555;padding:4px 0;display:flex;gap:8px;align-items:center}
  .opt-card .highlight-box{margin-top:12px;padding:10px 14px;background:var(--ol);border-radius:8px;font-size:12px;color:var(--od)}

  .budget-2col{display:flex;gap:40px;flex:1;min-height:0}
  .budget-col{flex:1;display:flex;flex-direction:column;gap:6px}
  .budget-col-title{font-size:14px;font-weight:700;letter-spacing:2px;margin-bottom:10px}
  .b1i{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-radius:8px}
  .b1i.free{background:var(--gnbg);border-left:4px solid var(--gn)}
  .b1i.paid{background:var(--lg);border-left:4px solid var(--o)}
  .b1i .b1n{font-size:13px;font-weight:500;color:var(--dk)}
  .b1i .b1t{font-size:10px;color:#999;margin-top:1px}
  .b1i .b1v{font-size:14px;font-weight:800;flex-shrink:0;margin-left:12px}
  .b1i .b1v.green{color:var(--gn)}.b1i .b1v.orange{color:var(--o)}
  .b1-summary{padding:16px 20px;background:var(--lg);border-radius:10px;margin-top:auto}

  .cond-row{display:flex;gap:0;flex:1;min-height:0}
  .cond-left{width:38%;background:var(--o);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:60px 80px}
  .cond-right{flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 80px 20px 60px}
  .ci{display:flex;gap:20px;align-items:flex-start;padding:22px 0;border-bottom:1px solid #EEE}
  .ci:last-child{border:none}
  .cn{width:50px;height:50px;border-radius:50%;background:var(--o);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex-shrink:0}
  .cd h4{font-size:18px;font-weight:700;color:var(--dk);margin-bottom:4px}
  .cd .tgt{font-size:24px;font-weight:800;color:var(--o);margin-bottom:4px}
  .cd p{font-size:12px;color:var(--gr);line-height:1.4}

  .budget-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;flex:1;min-height:0}
  .bi{background:var(--lg);border-radius:10px;padding:22px;border-left:5px solid var(--o);display:flex;flex-direction:column;position:relative}
  .bi .cat{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--gr);margin-bottom:4px}
  .bi h4{font-size:18px;font-weight:700;color:var(--dk);margin-bottom:8px}
  .bi .rng{font-size:20px;font-weight:800;color:var(--o);margin-bottom:2px}
  .bi .rs{font-size:11px;color:#999;margin-bottom:10px}
  .bi .bbg{width:100%;height:6px;background:#E0E0E0;border-radius:3px;margin-bottom:10px}
  .bi .bf{height:6px;background:var(--o);border-radius:3px}
  .bi .det{font-size:11px;color:var(--gr);line-height:1.5;margin-top:auto}
  .bi .pct{font-size:24px;font-weight:900;color:var(--o);opacity:.15;position:absolute;top:22px;right:22px}
  .bi.cont{border-left-color:#F4D03F;background:#FFFBE8}
  .bi.cont .rng{color:var(--gold)}.bi.cont .bf{background:#F4D03F}

  .regional-row{display:flex;gap:40px;flex:1;min-height:0}
  .regional-left{flex:1.1;display:flex;flex-direction:column}
  .regional-right{flex:0.9;display:flex;flex-direction:column;gap:14px}
  .rbar{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #F0F0F0}
  .rbar:last-child{border:none}
  .rbar .rn{width:110px;font-size:12px;font-weight:500;color:var(--dk);flex-shrink:0}
  .rbar .rbg{flex:1;height:16px;background:#F0F0F0;border-radius:4px;overflow:hidden}
  .rbar .rbf{height:16px;border-radius:4px}
  .rbar .rv{width:60px;font-size:12px;font-weight:700;color:var(--o);text-align:right;flex-shrink:0}
  .rbar .rp{width:36px;font-size:10px;color:#999;text-align:right;flex-shrink:0}
  .info-card{background:var(--lg);border-radius:10px;padding:18px 22px}
  .info-card.green{background:var(--gnbg)}
  .info-card .ic-label{font-size:11px;color:var(--gr);font-weight:600;margin-bottom:4px}
  .info-card .ic-val{font-size:28px;font-weight:900}
  .info-card .ic-sub{font-size:11px;color:#999;margin-top:2px}
  .info-card.green .ic-label{color:var(--gn)}
  .info-card.green .ic-val{color:var(--gn);font-size:16px}

  .returns-row{display:flex;gap:0;flex:1;min-height:0}
  .ret-left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:50px 50px 50px 100px}
  .ret-right{width:38%;background:var(--o);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:60px 80px}
  .rr{padding:16px 0;border-bottom:1px solid #EEE}
  .rr:last-child{border:none}
  .rr .sn{font-size:13px;color:var(--gr);font-weight:500;margin-bottom:4px}
  .rr .rv{font-size:24px;font-weight:800;color:var(--dk);margin-bottom:2px}
  .rr .rv span{font-size:13px;color:var(--gr);font-weight:400}
  .ml{display:inline-block;padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700}
  .mr{background:#FDE8E8;color:var(--rd)}.my{background:#FFF8E1;color:var(--gold)}.mg{background:var(--gnbg);color:var(--gn)}
  .ks{margin-bottom:28px}
  .ks .kn{font-size:44px;font-weight:900;line-height:1;margin-bottom:2px}
  .ks .kl{font-size:13px;opacity:.8}

  .compare-row{display:flex;gap:24px;flex:1;min-height:0}
  .cc{flex:1;border-radius:12px;overflow:hidden;border:2px solid #EEE;display:flex;flex-direction:column}
  .cc.rec{border:3px solid var(--o);box-shadow:0 8px 30px rgba(243,122,31,.1)}
  .cc .cch{padding:18px 24px;background:var(--lg);text-align:center;flex-shrink:0}
  .cc.rec .cch{background:var(--o);color:#fff}
  .cc .cch .ccl{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gr);margin-bottom:2px}
  .cc.rec .cch .ccl{color:rgba(255,255,255,.7)}
  .cc .cch h3{font-size:20px;font-weight:800}
  .cc.rec .cch h3{color:#fff}
  .cc .ccb{padding:20px 24px;flex:1}
  .cc .cca{font-size:26px;font-weight:900;color:var(--o);text-align:center;margin-bottom:2px}
  .cc .ccas{font-size:11px;color:#999;text-align:center;margin-bottom:14px}
</style>

<!-- S1: TITLE -->
<div class="slide s1">
  <div class="al"></div><div class="bg"></div>
  <div class="cl">
    <div style="font-size:22px;font-weight:700;color:var(--o);letter-spacing:3px;text-transform:uppercase;margin-bottom:40px">Chefs Hat Studio</div>
    <h1 style="font-size:68px;font-weight:900;line-height:1;color:var(--dk);margin-bottom:20px;letter-spacing:-2px">Investment<br><span style="color:var(--o)">Roadmap.</span></h1>
    <div style="font-size:19px;color:var(--gr);line-height:1.6;margin-bottom:40px">A phased publishing partnership for Eccentricity —<br>A Steampunk Power Production Roguelike</div>
    <div style="font-size:13px;color:#999;letter-spacing:2px;text-transform:uppercase">March 2026 · chefshatstudio@gmail.com · Godot Engine</div>
  </div>
  <div class="rc">
    <div style="font-size:76px;font-weight:900;opacity:.2;line-height:1">$750K</div>
    <div style="font-size:26px;font-weight:600;margin-top:10px">Phased Production Deal</div>
    <div style="font-size:14px;font-weight:300;opacity:.8;margin-top:8px">Phase 1: $4K Self-Funded → Phase 2: $750K Production</div>
    <div style="margin-top:40px;opacity:.5;font-size:13px">Marketing handled by Kepler — separate budget<br>Within Kepler's preferred $500K–$2M range</div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>Chefs Hat Studio — Hong Kong</span></div>
</div>

<!-- S2: OVERVIEW FLOW -->
<div class="slide">
  <div class="top-bar"></div>
  <div class="slide-pad">
    <div class="sheader"><div class="sl">Executive Overview</div><div class="stitle">The Deal at a <span>Glance.</span></div></div>
    <div class="flow-row">
      <div class="flow-col" style="width:310px;flex-shrink:0;gap:8px">
        <div style="font-size:10px;font-weight:700;letter-spacing:3px;color:var(--gn);text-transform:uppercase;margin-bottom:4px">Phase 1 · Two Options</div>
        <div class="opt-mini">
          <div class="om-top"><div class="om-letter" style="background:var(--gnbg);color:var(--gn)">A</div><div><div class="om-title">White Label</div><div style="font-size:10px;color:#999">Kepler Ghost · Pub only</div></div><div class="om-price" style="color:var(--gn)">$0</div></div>
          <div class="om-sub">Self-funded $4K · Godot free · CN+TW in-house</div>
        </div>
        <div class="or-pill">OR</div>
        <div class="opt-mini b">
          <div class="om-top"><div class="om-letter" style="background:var(--ol);color:var(--o)">B</div><div><div class="om-title">WL + GEPS</div><div style="font-size:10px;color:#999">+ marketing loan</div></div><div class="om-price" style="color:var(--o)">$70.5K</div></div>
          <div class="om-sub">Net ~$12.8K risk · $57.7K refunded by gov't</div>
        </div>
      </div>
      <div class="flow-arrow green"><div class="arr">→</div></div>
      <div class="flow-col" style="width:210px;flex-shrink:0">
        <div class="ea-box">
          <div class="ea-date">Sep 2026</div>
          <h3>EA Launch</h3>
          <div style="width:30px;height:2px;background:rgba(255,255,255,.3);margin:8px auto"></div>
          <div class="ea-list">✓ Revenue begins<br>✓ Player data flows<br>✓ Reviews accumulate<br>✓ Community grows</div>
        </div>
      </div>
      <div class="flow-arrow gold"><div class="arr">→</div></div>
      <div class="flow-col" style="width:220px;flex-shrink:0">
        <div class="gate-box">
          <div class="gate-hdr"><div class="gate-sub">Phase 2 Gate</div><h4>Prove It First</h4></div>
          <div class="gate-body">
            <div class="gate-row"><span class="gk">Reviews</span><span class="gv">85%+</span></div>
            <div class="gate-row"><span class="gk">Units (6mo)</span><span class="gv">10-30K+</span></div>
            <div class="gate-row"><span class="gk">Community</span><span class="gv">2-5K+</span></div>
            <div class="gate-row"><span class="gk">Revenue</span><span class="gv">$100-300K+</span></div>
          </div>
        </div>
      </div>
      <div class="flow-arrow"><div class="arr">→</div></div>
      <div class="flow-col" style="flex:1">
        <div class="p2-box">
          <div class="p2-hdr"><div><div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:.7">Phase 2 · Q3 2028</div><h4>Expand & Scale</h4></div><div class="p2-amt">$750K</div></div>
          <div class="p2-body">
            <div><div class="p2k">Team</div><div class="p2v">6-8 people</div></div>
            <div><div class="p2k">Marketing</div><div class="p2v" style="color:#666">Kepler (sep.)</div></div>
            <div><div class="p2k">Content</div><div class="p2v">Orchestra + cutscenes</div></div>
            <div><div class="p2k">Target ROI</div><div class="p2v" style="color:var(--o)">2x – 5x+</div></div>
          </div>
          <div class="p2-foot"><div class="p2badge">In Kepler's preferred $500K–$2M deal range</div></div>
        </div>
      </div>
    </div>
    <div class="timeline-bar">
      <div class="tl-label"><div class="tld" style="color:var(--gn)">Now</div><div class="tls">Development</div></div>
      <div class="tl-line gn"></div>
      <div class="tl-dot" style="background:var(--gn)"></div>
      <div class="tl-label"><div class="tld" style="color:var(--gn)">Sep 2026</div><div class="tls">EA Launch</div></div>
      <div class="tl-line gold"></div>
      <div class="tl-dot" style="background:#F4D03F;width:18px;height:18px"></div>
      <div class="tl-label"><div class="tld" style="color:var(--gold)">Q1 2027</div><div class="tls">Gate Review</div></div>
      <div class="tl-line o"></div>
      <div class="tl-dot" style="background:var(--o)"></div>
      <div class="tl-label"><div class="tld" style="color:var(--o)">Q3 2028</div><div class="tls">Full Release</div></div>
    </div>
    <div class="bottom-bar">
      <div class="bb-left"><div class="bb-label">The Core Proposition</div><div class="bb-text">Kepler risks <span class="hl-gn">$0</span> in Phase 1. We prove the game works. Then Kepler deploys <span class="hl-o">$750K</span> backed by real data.</div></div>
      <div class="bb-right"><div class="bbr-label">BASE PRICE</div><div class="bbr-val">$14.99</div><div class="bbr-sub">PPP worldwide</div></div>
    </div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>02 · Executive Overview</span></div>
</div>

<!-- S3: TWO PHASES -->
<div class="slide">
  <div class="top-bar"></div>
  <div class="slide-pad">
    <div class="sheader"><div class="sl">Our Approach</div><div class="stitle">Two Phases. <span>One Clear Path.</span></div><div class="sdesc">We don't ask for $750K upfront. We prove the game first — then scale with data-backed confidence.</div></div>
    <div class="phases-row">
      <div class="pc hi">
        <div class="ch"><div class="pn">Phase 1</div><h3>Prove & Launch</h3><div class="tl">Sep 2026 · Steam Early Access</div></div>
        <div class="cb"><div class="am">$0</div><div class="as">Kepler investment required</div>
          <ul><li><span class="dot"></span>White label publishing (Kepler Ghost)</li><li><span class="dot"></span>Studio self-funds with $4K budget</li><li><span class="dot"></span>CN+TW localization in-house (HK team)</li><li><span class="dot"></span>Godot engine — zero licensing costs</li><li><span class="dot"></span>EA validates market fit & revenue</li></ul>
          <div class="rb rl">● &nbsp;ZERO KEPLER RISK</div></div>
      </div>
      <div class="arrow-col"><div class="at">DATA<br>PROVES<br>FIT</div><div class="aline"></div><div class="ahead"></div></div>
      <div class="pc">
        <div class="ch"><div class="pn">Phase 2</div><h3>Expand & Scale</h3><div class="tl">Q3 2028 · Expanded Release</div></div>
        <div class="cb"><div class="am">$750,000</div><div class="as">Production only — marketing by Kepler separately</div>
          <ul><li><span class="dot"></span>Team expansion (+2 hires, Polish contractors)</li><li><span class="dot"></span>Live orchestra recording</li><li><span class="dot"></span>Story, cutscenes & animations</li><li><span class="dot"></span>Full localization (6-8 additional languages)</li><li><span class="dot"></span>Console ports + professional QA</li></ul>
          <div class="rb rm">● &nbsp;PRODUCTION BUDGET — KEPLER HANDLES MARKETING</div></div>
      </div>
    </div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>03 · Phased Approach</span></div>
</div>

<!-- S4: PHASE 1 OPTIONS -->
<div class="slide">
  <div class="top-bar"></div>
  <div class="slide-pad">
    <div class="sheader"><div class="sl">Phase 1 Options</div><div class="stitle">Two Ways to <span>Start.</span></div><div class="sdesc">Phase 1 offers Kepler flexibility — enter with zero capital, or add a small marketing catalyst via GEPS.</div></div>
    <div class="opts-row">
      <div class="opt-col">
        <div class="opt-hdr"><div class="opt-letter" style="background:var(--gnbg);color:var(--gn)">A</div><div><div style="font-size:22px;font-weight:800;color:var(--dk)">Pure White Label</div><div style="font-size:12px;color:var(--gr)">Kepler Ghost — zero capital required</div></div></div>
        <div class="opt-card"><h4>Kepler Investment</h4><div class="bv" style="color:var(--gn)">$0</div><div class="sv">Absolutely zero capital at risk</div></div>
        <div class="opt-card"><h4>What Kepler Provides</h4><ul><li><span class="dot"></span>Steam publishing & distribution</li><li><span class="dot"></span>Storefront presence & visibility</li><li><span class="dot"></span>Standard publishing revenue share</li></ul></div>
        <div class="opt-card"><h4>Studio Self-Funds ($4K)</h4><ul><li><span class="dot"></span>Sound design + music ($1,300-2,200)</li><li><span class="dot"></span>HK company registration ($480-600)</li><li><span class="dot"></span>Capsule art, ads, misc ($850-1,700)</li><li><span class="dot"></span>CN+TW localization — free (HK team)</li><li><span class="dot"></span>Godot engine — free forever</li></ul></div>
        <div class="rb rl">● &nbsp;ZERO RISK — Kepler earns with no capital deployed</div>
      </div>
      <div class="divider-col"><div class="orbadge">OR</div></div>
      <div class="opt-col">
        <div class="opt-hdr"><div class="opt-letter" style="background:var(--ol);color:var(--o)">B</div><div><div style="font-size:22px;font-weight:800;color:var(--dk)">White Label + GEPS</div><div style="font-size:12px;color:var(--gr)">Add government-backed marketing loan</div></div></div>
        <div class="opt-card bd"><h4>Kepler Fronts</h4><div class="bv" style="color:var(--o)">$70,500</div><div class="sv">HK$550K GEPS marketing budget</div></div>
        <div class="opt-card"><h4>But Here's the Key</h4><ul><li><span class="dot"></span><strong>$57,700</strong> refunded by gov't (~1 year)</li><li><span class="dot"></span><strong>Net real cost: ~$12,800</strong></li><li><span class="dot"></span>Revenue share: 50% capped at $256K</li></ul><div class="highlight-box"><strong>What $70.5K buys:</strong> Influencer campaign, paid ads, professional trailer, PR agency for launch window.</div></div>
        <div class="rb rm">● &nbsp;NET $12.8K RISK — government-backed safety net</div>
      </div>
    </div>
    <div class="bottom-bar"><div class="bb-left"><div class="bb-text"><strong style="color:var(--o)">Either option →</strong> EA launches Sep 2026, market data flows, and if triggers are met →</div></div><div class="bb-right"><div style="font-size:16px;font-weight:700;color:#fff">Phase 2: $750K</div><div class="bbr-sub">Activated by performance data</div></div></div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>04 · Phase 1 Options</span></div>
</div>

<!-- S5: $4K BUDGET -->
<div class="slide">
  <div class="top-bar"></div>
  <div class="slide-pad">
    <div class="sheader"><div class="sl">Phase 1 Budget</div><div class="stitle">$4,000. <span>Every Dollar Justified.</span></div><div class="sdesc">Godot is free. CN+TW localization is in-house. Your time replaces money for everything else.</div></div>
    <div class="budget-2col">
      <div class="budget-col">
        <div class="budget-col-title" style="color:var(--gn)">$0 — FREE (TIME INVESTMENT)</div>
        <div class="b1i free"><div><div class="b1n">Godot Engine</div><div class="b1t">No licensing, no rev share, no per-seat</div></div><div class="b1v green">$0</div></div>
        <div class="b1i free"><div><div class="b1n">CN + TW Localization</div><div class="b1t">Team is HK-based — largest Steam language group</div></div><div class="b1v green">$0</div></div>
        <div class="b1i free"><div><div class="b1n">Steam Store Page</div><div class="b1t">$100 recoupable after $1K revenue</div></div><div class="b1v green">$0*</div></div>
        <div class="b1i free"><div><div class="b1n">Discord Community</div><div class="b1t">Player hub; direct feedback loop</div></div><div class="b1v green">$0</div></div>
        <div class="b1i free"><div><div class="b1n">Social Media (TikTok/X/Reddit)</div><div class="b1t">Gameplay clips, devlogs — 3-5 hrs/week</div></div><div class="b1v green">$0</div></div>
        <div class="b1i free"><div><div class="b1n">Steam Next Fest</div><div class="b1t">Free massive exposure; demo required</div></div><div class="b1v green">$0</div></div>
        <div class="b1i free"><div><div class="b1n">Influencer Keys (50-100)</div><div class="b1t">Retromation, Olexa, Nookrium</div></div><div class="b1v green">$0</div></div>
        <div class="b1i free"><div><div class="b1n">DIY Trailer + Press Kit</div><div class="b1t">OBS + DaVinci Resolve; presskit.html</div></div><div class="b1v green">$0</div></div>
      </div>
      <div class="budget-col">
        <div class="budget-col-title" style="color:var(--o)">$2,630–$4,500 — PAID (PRIORITY ORDER)</div>
        <div class="b1i paid"><div><div class="b1n">P1 · HK Company Registration</div><div class="b1t">Electronic incorp + Business Registration</div></div><div class="b1v orange">$480–600</div></div>
        <div class="b1i paid"><div><div class="b1n">P2 · Professional Capsule Art</div><div class="b1t">Most-viewed Steam asset — or Bono in-house</div></div><div class="b1v orange">$250–400</div></div>
        <div class="b1i paid"><div><div class="b1n">P3 · Sound Design (Core SFX)</div><div class="b1t">30-50 SFX + UI + ambience; freelancer</div></div><div class="b1v orange">$800–1,200</div></div>
        <div class="b1i paid"><div><div class="b1n">P4 · Music (Emerging Composer)</div><div class="b1t">10-15 min adaptive steampunk score</div></div><div class="b1v orange">$500–1,000</div></div>
        <div class="b1i paid"><div><div class="b1n">P5 · Paid Ads (Launch Week)</div><div class="b1t">1-week TikTok/Reddit — cut first if over</div></div><div class="b1v orange">$400–800</div></div>
        <div class="b1i paid"><div><div class="b1n">P6 · Misc (Domain, Buffer)</div><div class="b1t">Contingency for unexpected</div></div><div class="b1v orange">$200–500</div></div>
        <div class="b1-summary">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;font-weight:700">Total Paid</span><span style="font-size:16px;font-weight:900;color:var(--o)">$2,630 – $4,500</span></div>
          <div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:700;color:var(--gn)">Remaining from $4K</span><span style="font-size:16px;font-weight:900;color:var(--gn)">$1,370 headroom</span></div>
          <div style="font-size:10px;color:#999;margin-top:4px">If over budget: cut P5 (ads) first, then P2 (capsule)</div>
        </div>
      </div>
    </div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>05 · Phase 1 Budget</span></div>
</div>

<!-- S6: TRIGGER CONDITIONS -->
<div class="slide" style="display:block">
  <div class="cond-row" style="height:100%">
    <div class="cond-left">
      <div style="font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;opacity:.7;margin-bottom:16px">Phase Gate</div>
      <h2 style="font-size:40px;font-weight:800;line-height:1.15;margin-bottom:20px;color:#fff">Phase 2 Only Triggers With Proof.</h2>
      <p style="font-size:14px;line-height:1.7;opacity:.85">Kepler's $750K production investment only deploys after EA demonstrates clear commercial viability.</p>
    </div>
    <div class="cond-right">
      <div class="ci"><div class="cn">1</div><div class="cd"><h4>Steam Reviews</h4><div class="tgt">85%+ Positive</div><p>"Very Positive" — proves player satisfaction and quality</p></div></div>
      <div class="ci"><div class="cn">2</div><div class="cd"><h4>Units Sold</h4><div class="tgt">10,000 – 30,000+</div><p>First 6 months post-EA — demonstrates organic demand</p></div></div>
      <div class="ci"><div class="cn">3</div><div class="cd"><h4>Community Size</h4><div class="tgt">2,000 – 5,000+ Members</div><p>Active Discord community — signals long-term retention</p></div></div>
      <div class="ci"><div class="cn">4</div><div class="cd"><h4>Revenue Trajectory</h4><div class="tgt">$100K – $300K+</div><p>6-month gross revenue at $14.99 base (PPP-adjusted)</p></div></div>
    </div>
  </div>
</div>

<!-- S7: $750K BUDGET -->
<div class="slide">
  <div class="top-bar"></div>
  <div class="slide-pad">
    <div class="sheader"><div class="sl">Phase 2 — Production Only</div><div class="stitle">$750K. <span>Every Dollar Into the Game.</span></div><div class="sdesc" style="max-width:900px">Marketing, PR, influencers, events handled separately by Kepler. This budget is 100% production.</div></div>
    <div class="budget-grid">
      <div class="bi"><div class="pct">36%</div><div class="cat">Core Team</div><h4>Team Expansion</h4><div class="rng">$216K – $324K</div><div class="rs">2 HK hires + Polish contractors · 18 months</div><div class="bbg"><div class="bf" style="width:85%"></div></div><div class="det">Programmer + artist (HK). 1-2 Polish 3D artists ($25-35/hr). Founder stipends for full-time focus.</div></div>
      <div class="bi"><div class="pct">12%</div><div class="cat">Art Pipeline</div><h4>Contract 3D Art</h4><div class="rng">$72K – $108K</div><div class="rs">Poland/Eastern Europe outsourcing</div><div class="bbg"><div class="bf" style="width:40%"></div></div><div class="det">Best cost-to-quality ratio. 30-40% less than Western rates.</div></div>
      <div class="bi"><div class="pct">9%</div><div class="cat">Content</div><h4>Cutscenes & Story</h4><div class="rng">$60K – $110K</div><div class="rs">5-8 min cinematics + narrative writer</div><div class="bbg"><div class="bf" style="width:35%"></div></div><div class="det">In-engine 3D using existing assets. Contract writer.</div></div>
      <div class="bi"><div class="pct">9%</div><div class="cat">Audio</div><h4>Music & Sound</h4><div class="rng">$45K – $80K</div><div class="rs">Composer + live orchestra + full SFX</div><div class="bbg"><div class="bf" style="width:30%"></div></div><div class="det">Hybrid: samples + 25-piece live orchestra for hero themes.</div></div>
      <div class="bi"><div class="pct">9%</div><div class="cat">Distribution</div><h4>Loc, QA & Ports</h4><div class="rng">$50K – $95K</div><div class="rs">6-8 langs (CN/TW free) · QA · Consoles</div><div class="bbg"><div class="bf" style="width:30%"></div></div><div class="det">DE, RU, JP, KR, FR, ES, PT-BR. QA sprints. Console ports.</div></div>
      <div class="bi cont"><div class="pct">25%</div><div class="cat">Buffer</div><h4>Contingency</h4><div class="rng">~$33K – $281K</div><div class="rs">Scales with spending approach</div><div class="bbg"><div class="bf" style="width:55%;background:#F4D03F"></div></div><div class="det">15-25% standard. Room for Kepler input on priorities.</div></div>
    </div>
    <div class="bottom-bar"><div class="bb-left"><div class="bb-label">Phase 2 Production Total</div><div class="bb-text">Marketing handled separately by Kepler</div></div><div class="bb-right"><div class="bbr-val">$750,000</div></div></div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>07 · Production Budget</span></div>
</div>

<!-- S8: REGIONAL PRICING -->
<div class="slide">
  <div class="top-bar"></div>
  <div class="slide-pad">
    <div class="sheader"><div class="sl">Global Market</div><div class="stitle">$14.99 Base. <span>PPP Worldwide.</span></div><div class="sdesc" style="max-width:900px">Regional pricing unlocks 30-40% more volume. CN+TW localized in-house from Day 1.</div></div>
    <div class="regional-row">
      <div class="regional-left">
        <div style="font-size:13px;font-weight:700;color:var(--dk);margin-bottom:12px">REVENUE SHARE BY REGION (50K units)</div>
        <div class="rbar"><div class="rn">United States</div><div class="rbg"><div class="rbf" style="width:70%;background:var(--o)"></div></div><div class="rv">$131K</div><div class="rp">25%</div></div>
        <div class="rbar"><div class="rn">China</div><div class="rbg"><div class="rbf" style="width:33%;background:#E74C3C"></div></div><div class="rv">$61K</div><div class="rp">18%</div></div>
        <div class="rbar"><div class="rn">UK / Ireland</div><div class="rbg"><div class="rbf" style="width:16%;background:var(--o)"></div></div><div class="rv">$30K</div><div class="rp">6%</div></div>
        <div class="rbar"><div class="rn">Germany</div><div class="rbg"><div class="rbf" style="width:14%;background:var(--o)"></div></div><div class="rv">$26K</div><div class="rp">5%</div></div>
        <div class="rbar"><div class="rn">Japan</div><div class="rbg"><div class="rbf" style="width:10%;background:var(--o)"></div></div><div class="rv">$18K</div><div class="rp">4%</div></div>
        <div class="rbar"><div class="rn">South Korea</div><div class="rbg"><div class="rbf" style="width:10%;background:var(--o)"></div></div><div class="rv">$18K</div><div class="rp">4%</div></div>
        <div class="rbar"><div class="rn">Russia / CIS</div><div class="rbg"><div class="rbf" style="width:8%;background:#8E44AD"></div></div><div class="rv">$14K</div><div class="rp">6%</div></div>
        <div class="rbar"><div class="rn">Brazil</div><div class="rbg"><div class="rbf" style="width:7%;background:#8E44AD"></div></div><div class="rv">$13K</div><div class="rp">5%</div></div>
        <div class="rbar"><div class="rn">All Others</div><div class="rbg"><div class="rbf" style="width:18%;background:#95A5A6"></div></div><div class="rv">$92K</div><div class="rp">27%</div></div>
        <div style="margin-top:12px;padding:12px 16px;background:var(--ol);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px;font-weight:700;color:var(--dk)">Total (50K units, PPP)</span>
          <span style="font-size:20px;font-weight:900;color:var(--o)">~$403K net</span>
        </div>
      </div>
      <div class="regional-right">
        <div class="info-card"><div class="ic-label">RECOMMENDED BASE PRICE</div><div class="ic-val" style="color:var(--o)">$14.99</div><div class="ic-sub">Matches Balatro launch · Sale headroom to $7.49</div></div>
        <div class="info-card"><div class="ic-label">WEIGHTED AVG NET PER UNIT (PPP)</div><div class="ic-val" style="color:var(--dk)">$8.08</div><div class="ic-sub">After Steam 30% + PPP discounts · Godot = $0 cost</div></div>
        <div class="info-card green"><div class="ic-label" style="color:var(--gn)">YOUR UNFAIR ADVANTAGE</div><div class="ic-val" style="color:var(--gn)">CN + TW localized from Day 1</div><div class="ic-sub" style="color:#555">11.4M Chinese + 3M TW/HK Steam users · In-house = $0<br>Most indies don't localize Chinese until months post-launch</div></div>
        <div class="info-card"><div class="ic-label">LOCALIZATION SCALING (Phase 2)</div><div class="ic-sub" style="color:#555;font-size:12px;line-height:1.6">EN + CN + TW (free) → +DE, RU, JP → +KR, FR, ES, PT-BR<br>English alone: 23M users → Full loc: 74M (3.2x reach)</div></div>
      </div>
    </div>
  </div>
  <div class="sf"><span class="fb">ECCENTRICITY</span><span>08 · Regional Pricing & Market</span></div>
</div>

<!-- S9: RETURNS -->
<div class="slide" style="display:block">
  <div class="returns-row" style="height:100%">
    <div class="ret-left">
      <div class="sl" style="margin-bottom:12px">Projections</div>
      <div style="font-size:40px;font-weight:800;color:var(--dk);line-height:1.15;margin-bottom:16px">Revenue<br>Scenarios.</div>
      <p style="font-size:13px;color:var(--gr);line-height:1.5;margin-bottom:16px">Phase 2 · $14.99 base (PPP) · Proposed 60/40 → 40/60 split</p>
      <div class="rr"><div class="sn">Conservative · 30K units</div><div class="rv">$315K net <span>· Kepler $189K</span></div><span class="ml mr">-80%</span></div>
      <div class="rr"><div class="sn">Moderate · 75K units</div><div class="rv">$788K net <span>· Kepler $473K</span></div><span class="ml my">-50%</span></div>
      <div class="rr"><div class="sn">Strong · 175K units</div><div class="rv">$1.84M net <span>· Kepler $1.05M</span></div><span class="ml mg">+11% (1.1x)</span></div>
      <div class="rr"><div class="sn">Breakout · 300K units</div><div class="rv">$3.15M net <span>· Kepler $1.58M</span></div><span class="ml mg">+66% (1.7x)</span></div>
      <div class="rr"><div class="sn">Balatro-adjacent · 500K+</div><div class="rv">$5.25M+ net <span>· Kepler $2.42M+</span></div><span class="ml mg">+154% (2.5x+)</span></div>
    </div>
    <div class="ret-right">
      <div class="ks"><div class="kn">$1.82B</div><div class="kl">Roguelike market (2024)</div></div>
      <div class="ks"><div class="kn">13.2%</div><div class="kl">CAGR through 2033</div></div>
      <div class="ks"><div class="kn">+22%</div><div class="kl">Roguelike engagement boost (2025)</div></div>
      <div style="margin-top:36px;opacity:.7;font-size:12px;line-height:1.7">Eccentricity targets the proven<br>roguelike-strategy intersection:<br><strong>Balatro</strong> — 4M+ units<br><strong>Slay the Spire</strong> — 6M+ units<br><strong>Inscryption</strong> — 2M+ units<br><br><span style="opacity:.6">Phased approach: $750K deploys<br>only after EA proves market fit</span></div>
    </div>
  </div>
</div>
`;
