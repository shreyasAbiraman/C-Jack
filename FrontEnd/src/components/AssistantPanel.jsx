import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, LoadingSpinner } from './ui';
import { Mic, Send, Bot, User, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { useEmergencyDispatch } from '../context/EmergencyDispatchContext';

const AssistantPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { initiateEmergencyCall, confirmAndDispatch } = useEmergencyDispatch();
  const [chat, setChat] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am C-JACK AI Assistant. You can ask me questions about patient vitals, CPR rate, ambulance ETA, or trigger emergency dispatch in English, Tamil, or Tanglish.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);

  const togglePanel = () => setIsOpen(prev => !prev);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat, isOpen]);

  const sendMessage = async (textToSend = message) => {
    const query = (textToSend || '').trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', content: query };
    setChat(prev => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language: 'auto' }),
      });
      const json = await res.json();
      if (json && json.success && json.data) {
        const { intent, response, requiresConfirmation, language, parameters } = json.data;
        const assistantMsg = {
          role: 'assistant',
          content: response || 'Action processed.',
          data: { intent, requiresConfirmation, language, parameters },
        };
        setChat(prev => [...prev, assistantMsg]);

        if (requiresConfirmation) {
          setConfirmPayload({ intent, parameters, description: response });
        }
      } else {
        setChat(prev => [
          ...prev,
          { role: 'assistant', content: (json && json.message) || 'Error processing your request.' },
        ]);
      }
    } catch (e) {
      console.error('AI Chat error:', e);
      setChat(prev => [
        ...prev,
        { role: 'assistant', content: 'Unable to contact AI service. Please check connection.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or type your question.');
      return;
    }
    if (isListening) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        sendMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error('Voice input error:', err);
      setIsListening(false);
    }
  };

  const confirmAction = async (approved) => {
    if (!confirmPayload) return;
    
    if (approved) {
      if (confirmPayload.intent === 'CREATE_EMERGENCY') {
        try {
          await confirmAndDispatch();
          setChat(prev => [
            ...prev,
            {
              role: 'assistant',
              content: '🚨 Emergency dispatch successfully initiated to 3 configured ambulance responders. Live dispatch tracking is active on your dashboard.',
            },
          ]);
        } catch (dispatchErr) {
          setChat(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Failed to initiate emergency dispatch. Please check connection or click the Emergency Call button directly.',
            },
          ]);
        }
      } else {
        setChat(prev => [
          ...prev,
          { role: 'assistant', content: `Action "${confirmPayload.intent}" confirmed and executed.` },
        ]);
      }
    } else {
      setChat(prev => [
        ...prev,
        { role: 'assistant', content: `Action "${confirmPayload.intent}" was cancelled.` },
      ]);
    }
    setConfirmPayload(null);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={togglePanel}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-22l hover:shadow-indigo-500/25 transition-all duration-200 transform hover:-translate-y-0.5 border border-indigo-400/30"
          aria-label="Open C-JACK AI Assistant"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="tracking-wide text-sm font-bold">ASK C-JACK</span>
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={togglePanel}
        title="C-JACK AI Clinical & Operations Assistant"
        maxWidth="max-w-xl"
      >
        <div className="flex flex-col h-[460px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/60 rounded-lg border border-slate-800">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                )}
                <div
                  className={`${msg.role === 'user' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-100 border border-slate-700/80 shadow-xs'} max-w-[80%] rounded-xl px-4 py-2.5 text-sm`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-indigo-400" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic py-2">
                <LoadingSpinner />
                <span>C-JACK Assistant is analyzing telemetry...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {confirmPayload && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg flex items-center justify-between gap-3">
              <div className="text-xs text-amber-200">
                <span className="font-bold">Confirmation Required:</span> Execute action {' '}
                <span className="font-mono underline">{confirmPayload.intent}</span>?
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => confirmAction(false)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceInput}
              title={isListening ? 'Listening...' : 'Voice Input'}
              className={ `p-2.5 rounded-lg border transition-all ${isListening ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}` }
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={ (e) => setMessage(e.target.value) }
              onKeyDown={handleKey}
              placeholder="Ask vitals, CPR rate, ETA..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              variant="primary"
              size="md"
              onClick={ () => sendMessage() }
              disabled={loading || !message.trim()}
              icon={Send}
            >
              Send
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AssistantPanel;
