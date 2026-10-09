import { useEffect, useRef, useState } from 'react'
import './App.css'

const QUICK_REPLIES = ['Track my order', 'Business hours', 'Talk to a human']

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function botReply(text) {
  const t = text.toLowerCase()
  if (/(^|\W)(hi|hello|hey|good (morning|afternoon|evening))(\W|$)/.test(t))
    return { text: 'Hello! 👋 Welcome to Northbeam Studio support. How can I help you today?' }
  if (t.includes('track') || t.includes('order') || t.includes('parcel'))
    return {
      text: 'I can help with that. Orders usually arrive within 3–5 business days. If you share your order number, I can look it up for you.',
      chips: ['Where is my package?', 'Change delivery address'],
    }
  if (t.includes('hour') || t.includes('open') || t.includes('close'))
    return { text: 'We\'re open Mon–Fri, 9:00 AM – 6:00 PM, and Saturday 10:00 AM – 2:00 PM. I\'m here 24/7 for quick questions.' }
  if (t.includes('ship') || t.includes('deliver'))
    return { text: 'Standard shipping takes 3–5 business days and is free over $50. Express (1–2 days) is available at checkout.' }
  if (t.includes('return') || t.includes('refund') || t.includes('exchange'))
    return { text: 'Returns are easy — you have 30 days from delivery for a full refund. Just keep the item unused and in its original packaging.' }
  if (t.includes('price') || t.includes('cost') || t.includes('pricing') || t.includes('plan'))
    return { text: 'Our plans start at $19/month. You can compare features anytime on the Pricing page — want me to send you the link?' }
  if (t.includes('human') || t.includes('agent') || t.includes('person') || t.includes('call') || t.includes('phone'))
    return { text: 'Of course — I\'ll connect you with a human agent. Average wait right now is under 2 minutes. Meanwhile, is there anything I can answer first?' }
  if (t.includes('thank'))
    return { text: 'You\'re very welcome! 😊 Anything else I can help with?' }
  if (t.includes('bye'))
    return { text: 'Goodbye, and thanks for stopping by! 👋' }
  return {
    text: 'Got it — let me make sure I point you the right way. Could you tell me a bit more, or pick one of the topics below?',
    chips: ['Track my order', 'Business hours', 'Pricing'],
  }
}

let idCounter = 0
const msg = (from, text, chips) => ({ id: ++idCounter, from, text, chips, time: timeNow() })

export default function App() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [
    msg('bot', 'Hi there! 👋 I\'m Nia, your support assistant. Ask me anything or pick a topic below.', QUICK_REPLIES),
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, open])

  const sendBotReply = (userText) => {
    setTyping(true)
    const delay = 800 + (idCounter % 7) * 100
    setTimeout(() => {
      const { text, chips } = botReply(userText)
      setTyping(false)
      setMessages((m) => [...m, msg('bot', text, chips)])
      if (!open) setUnread((u) => u + 1)
    }, delay)
  }

  const send = (text) => {
    const clean = text.trim()
    if (!clean || typing) return
    setMessages((m) => [...m, msg('user', clean)])
    setInput('')
    sendBotReply(clean)
  }

  const toggle = () => {
    setOpen((o) => {
      if (o === false) setUnread(0)
      return !o
    })
  }

  return (
    <div className="demo-page">
      <main className="demo-hero">
        <span className="demo-pill">Demo storefront</span>
        <h1>Northbeam Studio</h1>
        <p>
          This is a sample business page. The support assistant lives in the
          chat bubble at the bottom-right — click it to try the demo.
        </p>
        <button className="demo-cta" onClick={toggle}>
          {open ? 'Close chat' : 'Open support chat'}
        </button>
      </main>

      <div className="chat-widget">
        {open && (
          <section className="chat-panel" aria-label="Support chat">
            <header className="chat-header">
              <div className="chat-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div className="chat-meta">
                <strong>Nia · Support Assistant</strong>
                <span className="chat-status"><span className="dot" /> Online — replies instantly</span>
              </div>
              <button className="chat-close" onClick={toggle} aria-label="Close chat">✕</button>
            </header>

            <div className="chat-messages">
              {messages.map((m) => (
                <div key={m.id} className={`msg-row ${m.from}`}>
                  {m.from === 'bot' && <div className="msg-avatar" aria-hidden="true">N</div>}
                  <div className="msg-col">
                    <div className="msg-bubble">{m.text}</div>
                    <span className="msg-time">{m.time}</span>
                    {m.chips && (
                      <div className="chips">
                        {m.chips.map((c) => (
                          <button key={c} className="chip" onClick={() => send(c)}>{c}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="msg-row bot">
                  <div className="msg-avatar" aria-hidden="true">N</div>
                  <div className="msg-bubble typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              className="chat-input"
              onSubmit={(e) => { e.preventDefault(); send(input) }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
                aria-label="Type your message"
                maxLength={500}
              />
              <button type="submit" aria-label="Send message" disabled={!input.trim()}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </section>
        )}

        <button
          className={`chat-launcher ${open ? 'open' : ''}`}
          onClick={toggle}
          aria-label={open ? 'Close support chat' : 'Open support chat'}
        >
          {!open && unread > 0 && <span className="chat-badge">{unread}</span>}
          {open ? (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
