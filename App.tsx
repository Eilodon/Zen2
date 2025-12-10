import React, { useEffect, useState } from 'react';
import { db } from './shared/lib/db';
import { useStore } from './entities/store';
import { analyzeInput } from './features/GeminiService';
import { Loader2, Brain } from 'lucide-react';

export default function App() {
  const { isProcessing, setProcessing, currentResponse, setResponse } = useStore();
  const [inputText, setInputText] = useState('');
  const [initStatus, setInitStatus] = useState('Initializing Brain...');

  useEffect(() => {
    // Verify Brain Connectivity
    const checkBrain = async () => {
      try {
        // Trigger DB open by accessing a table.
        // Explicit db.open() is not required and can cause type issues if types are mismatched.
        await db.moods.limit(1).toArray();
        console.log("Brain Ready: Database connected");
        setInitStatus("MindfulOS Quantum Ready");
      } catch (e) {
        setInitStatus("System Error: DB Failed");
      }
    };
    checkBrain();
  }, []);

  const handleAnalysis = async () => {
    if (!inputText.trim()) return;
    setProcessing(true);
    const result = await analyzeInput(inputText);
    setResponse(result);
    setProcessing(false);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-screen bg-ricePaper text-zenDark p-6">
      <header className="flex items-center gap-2 mb-8 opacity-70">
        <Brain className="w-5 h-5 text-clayOrange" />
        <span className="font-semibold tracking-widest text-xs uppercase">{initStatus}</span>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {currentResponse && (
          <div className="mb-8 animate-[fadeIn_0.5s]">
            <div className="text-xs font-mono text-clayOrange mb-2">
              Trace: {currentResponse.thought_trace}
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border-l-4 border-clayOrange shadow-sm">
              <h2 className="text-sm font-bold uppercase mb-2 text-stone-400 tracking-wider">{currentResponse.realm}</h2>
              <p className="font-serif text-xl leading-relaxed">{currentResponse.advice}</p>
              {currentResponse.action_intent !== 'NONE' && (
                <div className="mt-4 inline-block px-3 py-1 bg-quantumBlue/10 text-quantumBlue rounded-full text-xs font-bold">
                  Suggested Action: {currentResponse.action_intent}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="How are you feeling right now?"
            className="w-full bg-white p-4 pr-12 rounded-xl shadow-sm border border-transparent focus:border-clayOrange focus:ring-0 resize-none transition-all outline-none font-serif text-lg placeholder:text-stone-300 h-32"
          />
          <button
            onClick={handleAnalysis}
            disabled={isProcessing || !inputText.trim()}
            className="absolute bottom-4 right-4 p-2 bg-clayOrange text-white rounded-full shadow-md hover:bg-orange-600 disabled:opacity-50 transition-all"
          >
            {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <div className="w-5 h-5 flex items-center justify-center font-bold">→</div>}
          </button>
        </div>
      </main>
    </div>
  );
}