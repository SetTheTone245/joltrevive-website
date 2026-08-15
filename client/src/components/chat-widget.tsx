import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Paperclip, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICES, STORE_INFO, formatPrice } from "@/lib/siteData";

interface Msg {
  from: "bot" | "user";
  text: string;
  file?: string;
}

const QUICK = ["Get a quote", "Not charging", "Store hours", "Where are you?"];

function botReply(input: string): string {
  const q = input.toLowerCase();
  if (/(quote|price|pric|cost|how much|estimate)/.test(q)) {
    const list = SERVICES.slice(0, 4).map((s) => `${s.name} — from ${formatPrice(s.startingPrice)}`).join("\n");
    return `Here are our starting service rates:\n${list}\n\nFinal pricing depends on your battery. Want to book a diagnostic? I can send you to the appointment page.`;
  }
  if (/(not charg|won't charg|wont charg|dead|won't turn|wont turn|no power)/.test(q)) {
    return `Let's narrow it down. A few quick questions:\n1. Does the charger indicator illuminate when plugged in?\n2. Has the battery been exposed to water or a hard drop?\n3. Does the pack show any voltage on a multimeter?\n\nBased on common cases, this usually points to a connector repair or BMS replacement. I'd recommend a $49 diagnostic so we can confirm before any work is done.`;
  }
  if (/(hour|open|when|close|today)/.test(q)) {
    const hrs = STORE_INFO.hours.map((h) => `${h.day}: ${h.time}`).join("\n");
    return `We're at ${STORE_INFO.addressShort}.\n\nHours:\n${hrs}`;
  }
  if (/(where|location|address|direction|map|park)/.test(q)) {
    return `Jolt Revive\n${STORE_INFO.address}\nThere's street parking on Blondell and a small lot behind the shop. Tap "Get Directions" on the Contact page for turn-by-turn routing.`;
  }
  if (/(warrant)/.test(q)) {
    return `New batteries: 6–24 month warranty (varies by pack). Refurbished: 6 months. Rebuilt packs: 12 months. All work is covered if the failure relates to the serviced component.`;
  }
  if (/(appoint|book|schedul|reserv|pickup)/.test(q)) {
    return `You can book a diagnostic, repair, rebuild, replacement, or consultation on the Appointments page. Times update live based on availability.`;
  }
  if (/(water|rain|wet|drop|fell|damage|burn|swell|puffy|hot|overheat)/.test(q)) {
    return `Stop using the pack immediately and don't attempt to charge it. Swelling, heat, or water exposure can be a safety risk. Bring it in for a free safety inspection — we'll advise whether it's repairable or needs replacement.`;
  }
  if (/(hi|hello|hey|yo|sup|thanks|thank)/.test(q)) {
    return `Hey — I'm a Jolt Revive technician (live demo). I can help with quotes, diagnosis questions, hours, and directions. What's going on with your battery?`;
  }
  return `Got it. I'm a demo technician assistant — I can help with quotes, charging issues, store hours, directions, and warranties. For hands-on diagnosis, book a $49 diagnostic and we'll test your pack in person.`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("jolt:open-chat", handler);
    return () => window.removeEventListener("jolt:open-chat", handler);
  }, []);
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: "Jolt Revive support — ask me about quotes, a battery that won't charge, store hours, or directions. (Live demo assistant)",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "user", text: t }]);
    setInput("");
    setTyping(true);
    const delay = 600 + Math.min(t.length * 18, 900);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: botReply(t) }]);
      setTyping(false);
    }, delay);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMsgs((m) => [...m, { from: "user", text: `Uploaded photo: ${f.name}`, file: f.name }]);
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        { from: "bot", text: `Got your photo "${f.name}". A technician will review the label/connector and factor it into your quote. (Photo previews are demo-only — nothing is stored.)` },
      ]);
      setTyping(false);
    }, 800);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg glow-primary animate-jolt-pulse"
          aria-label="Open support chat"
          data-testid="button-chat-open"
        >
          <MessageSquare className="size-6" />
          <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background">
            <Zap className="size-2.5 text-primary" />
          </span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Zap className="size-4 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-status-online" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Jolt Revive Support</p>
                <p className="text-xs text-muted-foreground leading-tight">Technician online · demo</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat" data-testid="button-chat-close">
              <X className="size-5" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-grid-sm p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.from === "user"
                      ? "max-w-[80%] rounded-lg rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[85%] whitespace-pre-line rounded-lg rounded-bl-sm bg-muted px-3 py-2 text-sm"
                  }
                  data-testid={m.from === "user" ? "chat-msg-user" : "chat-msg-bot"}
                >
                  {m.file && <span className="mb-1 flex items-center gap-1 text-xs opacity-80"><Paperclip className="size-3" />{m.file}</span>}
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-lg rounded-bl-sm bg-muted px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 pt-2.5">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover-elevate hover:text-foreground"
                data-testid={`chat-quick-${q.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              >
                {q}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <label className="cursor-pointer text-muted-foreground hover:text-foreground" data-testid="chat-upload">
              <Paperclip className="size-5" />
              <input type="file" accept="image/*" className="hidden" onChange={onFile} data-testid="chat-file-input" />
            </label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1"
              data-testid="chat-input"
            />
            <Button type="submit" size="icon" aria-label="Send" data-testid="chat-send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
