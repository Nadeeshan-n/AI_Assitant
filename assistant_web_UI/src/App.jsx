import { useEffect, useRef, useState } from 'react'
import './App.css'

const QUICK_REPLIES = ['Track my order', 'Business hours', 'Talk to a human']

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

let idCounter = 0
const msg = (from, text, chips) => ({ id: ++idCounter, from, text, chips, time: timeNow() })

// One chat session ID per browser tab
let chatSessionId = sessionStorage.getItem('chatSessionId')
if (!chatSessionId) {
  chatSessionId = crypto.randomUUID()
  sessionStorage.setItem('chatSessionId', chatSessionId)
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [
    msg('bot', 'Hi there! 👋 I\'m Nia, your support assistant. Ask me anything or pick a topic below.', QUICK_REPLIES),
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = (text) => {
    const clean = text.trim()
    if (!clean) return
    setMessages((m) => [...m, msg('user', clean)])
    setInput('')
    sendToN8n(clean)
  }

  const sendMessage = () => send(input)

  // Pull a readable reply out of an n8n webhook response
  // (handles objects, arrays, plain strings, or stringified JSON)
  const extractReply = (data) => {
    if (typeof data === 'string') {
      try {
        return extractReply(JSON.parse(data))
      } catch {
        return data
      }
    }
    const obj = Array.isArray(data) ? data[0] : data
    if (typeof obj === 'string') return obj
    if (obj && typeof obj === 'object') {
      return obj.output ?? obj.message ?? obj.text ?? obj.reply ?? JSON.stringify(obj)
    }
    return String(obj ?? '')
  }

  // POST the user's message to the n8n customer-chat webhook
  const sendToN8n = async (text) => {
    console.log('Sending:', text)
    try {
      const response = await fetch('http://localhost:5678/webhook/customer-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: chatSessionId,
          chatInput: text,
        }),
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('n8n response:', data)

      const reply = extractReply(data)
      if (reply && String(reply).trim()) {
        setMessages((m) => [...m, msg('bot', String(reply))])
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((m) => [...m, msg('bot', "Sorry — I couldn't reach the assistant service. Please try again in a moment.")])
    }
  }

  const toggle = () => setOpen((o) => !o)

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
                <span className="chat-status"><span className="dot" /> Online</span>
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
              <button type="button" onClick={sendMessage} disabled={!input.trim()}>
                Send
              </button>
            </form>
          </section>
        )}

        <button
          className={`chat-launcher ${open ? 'open' : ''}`}
          onClick={toggle}
          aria-label={open ? 'Close support chat' : 'Open support chat'}
        >
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
