import React, { useState, useCallback } from 'react';
import { GlossaryItem, ProcessingStatus } from './types';
import { DEFAULT_GLOSSARY } from './constants';
import { transcribeAudio } from './services/geminiService';
import { fileToBase64, downloadSrtFile } from './utils/fileUtils';
import Glossary from './components/Glossary';
import FileUploader from './components/FileUploader';
import SubtitlePreview from './components/SubtitlePreview';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [glossary, setGlossary] = useState<GlossaryItem[]>(
    DEFAULT_GLOSSARY.map(name => ({ id: crypto.randomUUID(), name }))
  );
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [resultSrt, setResultSrt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleAddTerm = (name: string) => {
    setGlossary(prev => [...prev, { id: crypto.randomUUID(), name }]);
  };

  const handleRemoveTerm = (id: string) => {
    setGlossary(prev => prev.filter(t => t.id !== id));
  };

  const handleStartProcessing = async () => {
    if (!file) return;

    try {
      setStatus('processing');
      setError(null);
      
      const base64 = await fileToBase64(file);
      const srt = await transcribeAudio(
        base64,
        file.type || 'audio/mpeg',
        glossary.map(t => t.name)
      );
      
      setResultSrt(srt);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || '處理過程中發生錯誤');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (resultSrt && file) {
      downloadSrtFile(resultSrt, file.name);
    }
  };

  const handleReset = () => {
    setResultSrt('');
    setFile(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 py-12 px-4 selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            AI 字幕產生器
          </h1>
          <p className="text-gray-400 text-lg">
            精準識別，自動去除贅字，支援自訂專有名詞。
          </p>
        </header>

        {/* Main Content Area */}
        <div className="space-y-8">
          {/* Step 1: Upload */}
          <section className="animate-in fade-in duration-700 delay-100">
            <FileUploader onFileSelect={setFile} selectedFile={file} />
          </section>

          {/* Step 2: Glossary */}
          <section className="animate-in fade-in duration-700 delay-200">
            <Glossary 
              terms={glossary} 
              onAdd={handleAddTerm} 
              onRemove={handleRemoveTerm} 
            />
          </section>

          {/* Action Button */}
          <section className="animate-in fade-in duration-700 delay-300">
            {status !== 'completed' && (
              <button
                disabled={!file || status === 'processing'}
                onClick={handleStartProcessing}
                className={`
                  w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-[0.98]
                  flex items-center justify-center gap-3 shadow-xl
                  ${!file 
                    ? 'bg-[#30363d] text-gray-500 cursor-not-allowed border border-[#484f58]' 
                    : status === 'processing'
                      ? 'bg-[#313b82]/50 text-blue-200 border border-blue-500/50 cursor-wait'
                      : 'bg-[#313b82] hover:bg-[#3b47a1] text-white border border-blue-400/30 hover:shadow-blue-900/20'
                  }
                `}
              >
                {status === 'processing' ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    AI 正在辨識中，請稍候...
                  </>
                ) : file ? (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    開始產生字幕
                  </>
                ) : (
                  "請先上傳檔案"
                )}
              </button>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center text-sm">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}
          </section>

          {/* Step 3: Result */}
          {status === 'completed' && resultSrt && (
            <SubtitlePreview 
              srtContent={resultSrt} 
              onDownload={handleDownload} 
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-8 border-t border-[#30363d] text-center text-gray-500 text-xs">
          <p>© 2024 AI Subtitle Generator - Powered by Gemini AI</p>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d1117;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-top {
          from { transform: translateY(-20px); }
          to { transform: translateY(0); }
        }
        @keyframes slide-in-from-bottom {
          from { transform: translateY(20px); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-top-4 {
          animation-name: slide-in-from-top;
        }
        .slide-in-from-bottom-4 {
          animation-name: slide-in-from-bottom;
        }
        .duration-500 { animation-duration: 500ms; }
        .duration-700 { animation-duration: 700ms; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
};

export default App;
