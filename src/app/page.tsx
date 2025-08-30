"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Download, LoaderCircle, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type ChatMessage = {
  id: string;
  role: "user";
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const handleEditorDidMount = (editor: any, monaco: any) => {
        monaco.editor.defineTheme('purple-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '#6a9955' },
          { token: 'keyword', foreground: '#c586c0' },
          { token: 'variable', foreground: '#9cdcfe' },
          { token: 'string', foreground: '#ce9178' },
          { token: 'number', foreground: '#b5cea8' },
          { token: 'type', foreground: '#4ec9b0' },
          { token: 'operator', foreground: '#d4d4d4' },
        ],
        colors: {
            "editor.foreground": "#d4d4d4",
            "editor.background": "#1e0950",
            "editorCursor.foreground": "#ffffff",
            "editor.lineHighlightBackground": "#3b0976",
            "editorLineNumber.foreground": "#b1a7c1",
            "editor.selectionBackground": "#6a4c9c",
            "editor.inactiveSelectionBackground": "#3a2a63"
        }
      });
      monaco.editor.setTheme('purple-theme');
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ext = 
      language === "python" ? "py" :
      language === "typescript" ? "ts" :
      language === "javascript" ? "js" :
      language === "html" ? "html" :
      language === "css" ? "css" :
      language === "sql" ? "sql" :
      language === "bash" ? "sh" :
      language === "powershell" ? "ps1" :
      language === "ruby" ? "rb" :
      language === "swift" ? "swift" :
      language === "go" ? "go" :
      language === "rust" ? "rs" :
      language === "java" ? "java" :
      language === "csharp" ? "cs" :
      language === "php" ? "php" : "txt";
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Code Downloaded!', {
      style: {
        background: '#7c3aed',
        color: '#ffffff',
        border: '1px solid #a78bfa',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#7c3aed',
      },
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!', {
      style: {
        background: '#7c3aed',
        color: '#ffffff',
        border: '1px solid #a78bfa',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#7c3aed',
      },
    });
  };

  const onSubmit = useCallback(async () => {
    if (!canSend) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage.text, language }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = data?.error || `Request failed (${res.status})`;
        setCode(`// Error: ${err}`);
      } else {
        const data = (await res.json()) as { code?: string };
        setCode(data.code ?? "");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setCode(`// Error: ${message}`);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [canSend, input, language]);

  return (
    <div className="font-sans h-dvh w-dvw grid grid-rows-[auto_1fr]">
      <div className="border-b border-black/10 dark:border-white/10 flex items-center justify-between px-4 py-2">
        <div className="text-base md:text-lg font-semibold">
          <p>Artificially Intelligent Programmer</p>
          <p className="text-sm text-gray-400">Built by Adharv Arun, Powered by Gemini</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white border border-purple-700/40 transition-colors" onClick={copyCode}><Copy /></button>
          <button className="rounded-md px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white border border-purple-700/40 transition-colors" onClick={downloadCode}><Download /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2">
      <section className="border-r border-black/10 dark:border-white/10 flex flex-col h-full p-4 gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Chat</h1>
          <select
            className="px-2 py-1 rounded-md bg-[#1a1028] border border-purple-700/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/70"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="powershell">PowerShell</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>  
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
          </select>
        </header>
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <div className="font-medium opacity-70">You</div>
              <div className="whitespace-pre-wrap break-words">{m.text}</div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-sm opacity-70">
              Type a request and press Enter. The AI will respond with code
              only. You can edit the code on the right. AI Chat History is not
              saved. The AI cannot modify currently existing code.
            </div>
          )}
        </div>
        {loading && <div className="text-xs opacity-70 flex items-center gap-2"><LoaderCircle className="animate-spin" /> Generating code...</div>}
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder="Describe the code you want..."
            className="flex-1 rounded-md bg-[#1a1028] border border-purple-700/40 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/70"
          />
          
          <button
            className="rounded-md bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 disabled:opacity-50 border border-purple-700/40 transition-colors"
            disabled={!canSend}
            onClick={onSubmit}
          >
            {loading ? "Generating..." : <Send />}
          </button>
        </div>
        
      </section>
      <section className="glass h-full flex flex-col">
        <div className={language === "html" ? "h-1/2" : "h-full"}>
          <MonacoEditor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
            }}
            onMount={handleEditorDidMount}
          />
        </div>
        {language === "html" && (
          <div className="h-1/2 border-t border-black/10 dark:border-white/10">
            <iframe
              title="HTML Preview"
              className="w-full h-full bg-white"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={code}
            />
          </div>
        )}
      </section>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#7c3aed',
            color: '#ffffff',
          },
        }}
      />
    </div>
  );
}
