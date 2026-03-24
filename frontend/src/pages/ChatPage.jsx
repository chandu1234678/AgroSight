import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { chatAPI } from '../services/api';

const ChatPage = () => {
  const location = useLocation();

  const [messages, setMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState(location.state?.prefill || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    chatAPI.getHistory()
      .then((res) => {
        const history = res.data;
        if (!history || history.length === 0) {
          setMessages([]);
        } else {
          const msgs = [];
          let lastDate = null;
          history.forEach((entry) => {
            const entryDate = new Date(entry.timestamp).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            });
            if (entryDate !== lastDate) {
              msgs.push({ id: `date-${entry.id}`, type: 'date', content: entryDate });
              lastDate = entryDate;
            }
            msgs.push({
              id: `u-${entry.id}`,
              type: 'user',
              content: entry.query,
              timestamp: new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            });
            msgs.push({
              id: `a-${entry.id}`,
              type: 'ai',
              content: entry.response,
              timestamp: new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            });
          });
          setMessages(msgs);
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInput = (e) => {
    setInputMessage(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const now = new Date();
    const ts = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const todayLabel = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newMsgs = [];
    if (messages.length === 0) {
      newMsgs.push({ id: `date-${Date.now()}`, type: 'date', content: todayLabel });
    }
    const userMsg = { id: Date.now(), type: 'user', content: inputMessage, timestamp: ts };
    newMsgs.push(userMsg);

    const query = inputMessage;
    setMessages(prev => [...prev, ...newMsgs]);
    setInputMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const response = await chatAPI.ask(query);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try {
      await chatAPI.clearHistory();
      setMessages([]);
    } catch { /* ignore */ }
  };

  const renderMessage = (message) => {
    if (message.type === 'date') {
      return (
        <div key={message.id} className="flex justify-center">
          <span className="px-4 py-1 rounded-full bg-surface-container-low text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">
            {message.content}
          </span>
        </div>
      );
    }

    if (message.type === 'user') {
      return (
        <div key={message.id} className="flex justify-end">
          <div className="relative max-w-[80%]">
            <div className="bg-primary-container text-on-primary-container px-5 py-4 rounded-t-2xl rounded-bl-2xl shadow-lg shadow-primary/5">
              <p className="leading-relaxed">{message.content}</p>
            </div>
            <span className="block text-right mt-1 text-[10px] text-on-surface-variant">
              {message.timestamp}
            </span>
          </div>
        </div>
      );
    }

    if (message.type === 'ai') {
      return (
        <div key={message.id} className="flex justify-start">
          <div className="flex items-start gap-3 max-w-[90%] md:max-w-[80%]">
            <div className="w-9 h-9 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-primary/20 mt-1">
              <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div className="glass-effect px-5 py-5 rounded-t-2xl rounded-br-2xl">
              <div className="mb-3">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">AI Diagnostic Agent</span>
                <div className="h-0.5 w-8 bg-primary rounded-full"></div>
              </div>
              <p className="leading-relaxed text-[#d9e6dd] mb-2 whitespace-pre-wrap">{message.content}</p>
              <span className="block mt-3 text-[10px] text-on-surface-variant">{message.timestamp}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-background antialiased selection:bg-primary/30 flex h-screen overflow-hidden">
      <SideNavBar />

      <div className="flex flex-col flex-1 md:ml-64 min-w-0 h-screen">
        {/* TopAppBar with clear history button */}
        <div className="shrink-0 flex items-center justify-between px-4 md:px-8 h-14 border-b border-outline-variant/10 bg-background/95 backdrop-blur-xl">
          <h1 className="text-base font-bold text-on-surface font-headline">AI Chat</h1>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Clear history
            </button>
          )}
        </div>

        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-4 md:px-8 py-8 space-y-6 pb-6">

            {historyLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">Start a conversation</h3>
                <p className="text-on-surface-variant text-sm max-w-xs">Ask anything about plant diseases, treatments, or crop management.</p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  {['How do I treat tomato blight?', 'What causes leaf rust?', 'Best organic fungicides?'].map(q => (
                    <button key={q} onClick={() => setInputMessage(q)}
                      className="px-3 py-1.5 rounded-full bg-surface-container-highest border border-outline-variant/20 text-xs text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(renderMessage)
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-primary/20 mt-1">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <div className="glass-effect px-5 py-5 rounded-t-2xl rounded-br-2xl">
                    <div className="flex gap-2 items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar — pinned at bottom, above mobile nav */}
        <div className="shrink-0 border-t border-outline-variant/10 bg-background/95 backdrop-blur-xl px-4 md:px-8 pt-3 pb-4 md:pb-5 mb-[72px] md:mb-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-primary/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative bg-surface-container-highest rounded-2xl px-2 py-2 flex items-end gap-2 shadow-xl">
                <textarea
                  ref={textareaRef}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface py-2.5 px-3 resize-none leading-relaxed placeholder:text-outline/50 outline-none text-sm min-h-[40px] max-h-[120px]"
                  placeholder="Type your agricultural query..."
                  rows={1}
                  value={inputMessage}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center gap-1 shrink-0 self-end mb-0.5">
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || loading}
                    className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[10px] text-on-surface-variant/50 mt-2 hidden md:block">
              AgroSight AI can make mistakes. Verify important info with a local agronomist.
            </p>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default ChatPage;
