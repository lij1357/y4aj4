
import React, { useState, useRef, useCallback } from 'react';
import { generateSubtitles } from './services/geminiService';
import { ProcessingStatus, AppState } from './types';
import { GlossaryItem } from './components/GlossaryItem';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    file: null,
    glossary: ['Microsoft', 'Power Apps', 'Power Automate', 'Power BI', 'Copilot', 'Copilot Studio', 'Loop', 'Word', 'Excel', 'PowerPoint', 'Outlook', 'Calendar'],
    status: 'idle',
    resultSrt: null,
    error: null,
  });

  const [inputTerm, setInputTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setState(prev => ({ ...prev, file: selectedFile, resultSrt: null, error: null }));
    }
  };

  const addTerm = () => {
    if (inputTerm.trim() && !state.glossary.includes(inputTerm.trim())) {
      setState(prev => ({ ...prev, glossary: [...prev.glossary, inputTerm.trim()] }));
      setInputTerm('');
    }
  };

  const removeTerm = (term: string) => {
    setState(prev => ({ ...prev, glossary: prev.glossary.filter(t => t !== term) }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStartProcess = async () => {
    if (!state.file) return;

    setState(prev => ({ ...prev, status: 'processing', error: null }));
    
    try {
      const srtContent = await generateSubtitles(state.file, state.glossary);
      setState(prev => ({ 
        ...prev, 
        status: 'completed', 
        resultSrt: srtContent 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: err.message || '發生未知錯誤' 
      }));
    }
  };

  const downloadSrt = () => {
    if (!state.resultSrt) return;
    const blob = new Blob([state.resultSrt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.file?.name.split('.')[0] || 'subtitle'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setState(prev => ({ ...prev, status: 'idle', file: null, resultSrt: null, error: null }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          AI 字幕產生器
        </h1>
        <p className="text-slate-400 text-lg">
          精準識別，自動去除贅字，支援自訂專有名詞。
        </p>
      </div>

      <div className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Drop Zone */}
        <div 
          onClick={state.status === 'idle' || state.status === 'error' ? handleUploadClick : undefined}
          className={`relative p-12 border-b border-slate-800 flex flex-col items-center justify-center transition-all cursor-pointer group ${state.status === 'processing' ? 'opacity-50 cursor-wait' : 'hover:bg-slate-800/50'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="audio/*,video/*"
          />
          
          <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 border border-slate-700 group-hover:border-indigo-500/50 group-hover:bg-slate-700/50 transition-all">
            <i className={`fa-solid ${state.file ? 'fa-file-audio' : 'fa-cloud-arrow-up'} text-3xl text-indigo-400`}></i>
          </div>
          
          <div className="text-center">
            {state.file ? (
              <p className="text-indigo-300 font-medium text-lg">{state.file.name}</p>
            ) : (
              <>
                <p className="text-lg font-medium">
                  <span className="text-indigo-400">點擊此處上傳</span> 或拖放檔案
                </p>
                <p className="text-sm text-slate-500 mt-2">支援 MP3, WAV, FLAC, M4A 等格式</p>
              </>
            )}
          </div>

          {state.status === 'processing' && (
            <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-200 font-medium">AI 正在努力生成字幕中...</p>
              <p className="text-xs text-slate-400 mt-2">這可能需要幾分鐘，取決於音檔長度</p>
            </div>
          )}
        </div>

        {/* Glossary Management */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-tag text-indigo-400"></i>
              <h2 className="text-xl font-semibold">自訂專有名詞庫</h2>
            </div>
            <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-700">
              {state.glossary.length} 個詞彙
            </span>
          </div>
          
          <p className="text-sm text-slate-400 mb-6">
            AI 將優先識別列表中的人名與術語，您可以在此新增或移除詞彙。
          </p>

          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={inputTerm}
              onChange={(e) => setInputTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTerm()}
              placeholder="輸入名詞 (例如: Copilot Studio)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
            <button 
              onClick={addTerm}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              新增
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-slate-800/50 rounded-xl bg-slate-950/30">
            {state.glossary.map((term) => (
              <GlossaryItem key={term} name={term} onRemove={removeTerm} />
            ))}
            {state.glossary.length === 0 && (
              <p className="text-slate-600 text-sm italic py-4 w-full text-center">尚未新增任何專有名詞</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-10 w-full max-w-2xl flex flex-col gap-4">
        {state.status === 'completed' && (
          <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-3xl flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 text-emerald-400">
              <i className="fa-solid fa-circle-check text-2xl"></i>
              <p className="font-semibold text-lg">字幕生成成功！</p>
            </div>
            <div className="flex gap-4 w-full">
               <button 
                onClick={downloadSrt}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3"
              >
                <i className="fa-solid fa-download"></i>
                下載 SRT 字幕檔案
              </button>
              <button 
                onClick={reset}
                className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold transition-all"
              >
                重置
              </button>
            </div>
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-3xl text-center">
            <p className="text-red-400 mb-4">{state.error}</p>
            <button 
              onClick={reset}
              className="px-8 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all font-semibold"
            >
              重試
            </button>
          </div>
        )}

        {state.status === 'idle' && (
          <button 
            disabled={!state.file}
            onClick={handleStartProcess}
            className={`w-full py-5 rounded-3xl font-bold text-xl transition-all shadow-xl shadow-slate-950/40 ${state.file 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white hover:-translate-y-1' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-80'}`}
          >
            {state.file ? '立即產生 AI 字幕' : '請先上傳檔案'}
          </button>
        )}
      </div>

      {/* Preview Section (Optional scrollable preview of SRT) */}
      {state.resultSrt && state.status === 'completed' && (
        <div className="mt-12 w-full max-w-4xl bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-300">內容預覽</h3>
            <button 
               onClick={() => {
                 navigator.clipboard.writeText(state.resultSrt || '');
                 alert('已複製到剪貼簿');
               }}
               className="text-slate-500 hover:text-indigo-400 transition-colors text-sm flex items-center gap-2"
            >
              <i className="fa-regular fa-copy"></i>
              複製內容
            </button>
          </div>
          <div className="h-64 overflow-y-auto bg-slate-950/50 rounded-2xl p-6 font-mono text-sm text-slate-400 leading-relaxed custom-scrollbar border border-slate-800/50">
            <pre className="whitespace-pre-wrap">{state.resultSrt}</pre>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 py-8 text-slate-600 text-sm text-center">
        <p>© 2024 AI 字幕產生器 - Powered by Gemini 3.0 Flash</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
