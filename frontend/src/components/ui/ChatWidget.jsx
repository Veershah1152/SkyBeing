import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../api/axios";

// ── Bird SVG Icon ──────────────────────────────────────────────────────────────
const BirdIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Body */}
    <ellipse cx="30" cy="36" rx="16" ry="12" fill={color} opacity="0.95" />
    {/* Head */}
    <circle cx="46" cy="24" r="10" fill={color} opacity="0.95" />
    {/* Eye */}
    <circle cx="49" cy="22" r="2.5" fill="white" />
    <circle cx="50" cy="22" r="1.2" fill="#1a1a1a" />
    {/* Beak */}
    <path d="M55 23 L62 25 L55 27 Z" fill="#f59e0b" />
    {/* Wing */}
    <path d="M18 32 Q10 24 16 18 Q24 28 30 30 Z" fill={color} opacity="0.75" />
    {/* Tail */}
    <path d="M14 40 Q8 44 6 52 Q12 46 18 46 Q14 44 14 40 Z" fill={color} opacity="0.8" />
    {/* Feet */}
    <path d="M26 47 L22 54 M26 47 L26 54 M26 47 L30 54" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M36 47 L32 54 M36 47 L36 54 M36 47 L40 54" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// ── Typing Indicator ───────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={styles.typingWrap}>
    <span style={{ ...styles.typingDot, animationDelay: "0ms" }} />
    <span style={{ ...styles.typingDot, animationDelay: "180ms" }} />
    <span style={{ ...styles.typingDot, animationDelay: "360ms" }} />
  </div>
);

// ── Quick suggestion chips ─────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What birds visit feeders? 🐦",
  "Best bird food for India?",
  "How to clean a bird feeder?",
  "Show me your products",
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I'm Skye 🦜 — your SkyBeings bird expert. Ask me anything about bird feeders, birds of India, or our products!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMessage(false);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text) => {
      const userText = (text || input).trim();
      if (!userText || loading) return;

      setInput("");
      setShowSuggestions(false);
      setLoading(true);

      const newMessages = [...messages, { role: "user", content: userText }];
      setMessages(newMessages);

      try {
        const { data } = await api.post("/chat/message", {
          messages: newMessages,
        });

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        if (!open) setHasNewMessage(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I'm having a quick nap 😴 Please try again in a moment!",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, messages, loading, open]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Keyframe injection ─────────────────────────────────────────── */}
      <style>{KEYFRAMES}</style>

      {/* ── Chat Panel ─────────────────────────────────────────────────── */}
      {open && (
        <div style={styles.panel} aria-label="Skye chat panel" role="dialog">
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarWrap}>
                <BirdIcon size={22} color="white" />
              </div>
              <div>
                <div style={styles.headerName}>Skye</div>
                <div style={styles.headerSub}>🟢 Bird Expert · Online</div>
              </div>
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={styles.messages} id="skye-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.msgRow,
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={styles.msgAvatar}>
                    <BirdIcon size={14} color="#0E7A0D" />
                  </div>
                )}
                <div
                  style={
                    msg.role === "user"
                      ? styles.userBubble
                      : styles.botBubble
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                <div style={styles.msgAvatar}>
                  <BirdIcon size={14} color="#0E7A0D" />
                </div>
                <div style={styles.botBubble}>
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {showSuggestions && messages.length === 1 && (
              <div style={styles.chips}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    style={styles.chip}
                    onClick={() => sendMessage(s)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0E7A0D";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#0E7A0D";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.inputRow}>
            <textarea
              ref={inputRef}
              id="skye-chat-input"
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about birds or feeders…"
              rows={1}
              maxLength={500}
              disabled={loading}
            />
            <button
              id="skye-send-btn"
              style={{
                ...styles.sendBtn,
                opacity: !input.trim() || loading ? 0.45 : 1,
              }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
          <div style={styles.footer}>Powered by SkyBeings AI · skybeings.in</div>
        </div>
      )}

      {/* ── Floating Bubble Button ─────────────────────────────────────── */}
      <button
        id="skye-chat-bubble"
        style={styles.bubble}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Skye bird assistant"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <BirdIcon size={26} color="white" />
        )}

        {/* Notification dot */}
        {hasNewMessage && !open && <span style={styles.notifDot} />}

        {/* Ripple ring */}
        {!open && <span style={styles.ring} />}
      </button>

      {/* Tooltip label on hover (shown when closed) */}
      {!open && (
        <div style={styles.tooltip} aria-hidden>
          Chat with Skye 🦜
        </div>
      )}
    </>
  );
}

// ── Styles (inline for zero-CSS-file dependency) ───────────────────────────────
const BRAND = "#0E7A0D";
const BRAND_DARK = "#085c08";

const styles = {
  // --- Bubble ---
  bubble: {
    position: "fixed",
    bottom: "88px",       // stacked above the WhatsApp button (24px + ~48px button + 16px gap)
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${BRAND} 0%, #16a34a 100%)`,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(14,122,13,0.45)",
    zIndex: 9998,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    animation: "skye-pulse 3s ease-in-out infinite",
  },
  ring: {
    position: "absolute",
    inset: "-6px",
    borderRadius: "50%",
    border: `2px solid ${BRAND}`,
    opacity: 0,
    animation: "skye-ring 3s ease-out infinite",
    pointerEvents: "none",
  },
  notifDot: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#ef4444",
    border: "2px solid white",
  },
  tooltip: {
    position: "fixed",
    bottom: "102px",
    right: "88px",
    background: "rgba(0,0,0,0.75)",
    color: "white",
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "20px",
    pointerEvents: "none",
    zIndex: 9997,
    whiteSpace: "nowrap",
    opacity: 0,
    animation: "skye-tooltip-fade 4s ease-in-out 1.5s infinite",
  },

  // --- Panel ---
  panel: {
    position: "fixed",
    bottom: "160px",
    right: "24px",
    width: "340px",
    maxWidth: "calc(100vw - 32px)",
    height: "480px",
    maxHeight: "calc(100vh - 200px)",
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(14,122,13,0.12)",
    zIndex: 9998,
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(14,122,13,0.15)",
    animation: "skye-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  // --- Header ---
  header: {
    background: `linear-gradient(135deg, ${BRAND} 0%, #16a34a 100%)`,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatarWrap: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid rgba(255,255,255,0.4)",
  },
  headerName: {
    color: "white",
    fontWeight: "700",
    fontSize: "15px",
    lineHeight: 1.2,
    fontFamily: "system-ui, sans-serif",
  },
  headerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "11px",
    fontFamily: "system-ui, sans-serif",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    color: "white",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  },

  // --- Messages ---
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    scrollbarWidth: "thin",
    scrollbarColor: "#0E7A0D22 transparent",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "6px",
  },
  msgAvatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "rgba(14,122,13,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userBubble: {
    background: `linear-gradient(135deg, ${BRAND} 0%, #16a34a 100%)`,
    color: "white",
    padding: "9px 13px",
    borderRadius: "18px 18px 4px 18px",
    maxWidth: "78%",
    fontSize: "13.5px",
    lineHeight: 1.5,
    fontFamily: "system-ui, sans-serif",
    wordBreak: "break-word",
    boxShadow: "0 2px 8px rgba(14,122,13,0.25)",
  },
  botBubble: {
    background: "#f1f5f0",
    color: "#1a2e19",
    padding: "9px 13px",
    borderRadius: "18px 18px 18px 4px",
    maxWidth: "78%",
    fontSize: "13.5px",
    lineHeight: 1.5,
    fontFamily: "system-ui, sans-serif",
    wordBreak: "break-word",
    border: "1px solid rgba(14,122,13,0.1)",
  },

  // --- Suggestion chips ---
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "4px",
  },
  chip: {
    background: "transparent",
    border: `1.5px solid ${BRAND}`,
    color: BRAND,
    borderRadius: "20px",
    padding: "5px 11px",
    fontSize: "11.5px",
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    transition: "all 0.2s ease",
    lineHeight: 1.4,
  },

  // --- Typing dots ---
  typingWrap: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "2px 4px",
  },
  typingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: BRAND,
    display: "inline-block",
    animation: "skye-dot 1.2s ease-in-out infinite",
  },

  // --- Input area ---
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderTop: "1px solid rgba(14,122,13,0.1)",
    background: "white",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "1.5px solid rgba(14,122,13,0.25)",
    borderRadius: "12px",
    padding: "9px 12px",
    fontSize: "13.5px",
    fontFamily: "system-ui, sans-serif",
    resize: "none",
    outline: "none",
    color: "#1a2e19",
    background: "#f9fdf9",
    lineHeight: 1.4,
    transition: "border-color 0.15s",
  },
  sendBtn: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${BRAND} 0%, #16a34a 100%)`,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 2px 8px rgba(14,122,13,0.3)",
  },
  footer: {
    textAlign: "center",
    fontSize: "10px",
    color: "#9ca3af",
    padding: "4px 0 8px",
    fontFamily: "system-ui, sans-serif",
    background: "white",
    flexShrink: 0,
  },
};

// ── Keyframe animations string ─────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes skye-pulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(14,122,13,0.45); }
    50%       { box-shadow: 0 4px 32px rgba(14,122,13,0.7); }
  }
  @keyframes skye-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes skye-slide-up {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes skye-dot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%           { transform: scale(1);   opacity: 1; }
  }
  @keyframes skye-tooltip-fade {
    0%   { opacity: 0; }
    15%  { opacity: 1; }
    75%  { opacity: 1; }
    100% { opacity: 0; }
  }
  #skye-chat-bubble:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 28px rgba(14,122,13,0.6) !important;
  }
  #skye-chat-input:focus {
    border-color: #0E7A0D !important;
    background: white !important;
  }
`;
