"use client";

import { useState, useRef, useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// ─── 型定義 ────────────────────────────────────────────────
interface Citation {
  text: string;
  source: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isLoading?: boolean;
}

// ─── コンポーネント ────────────────────────────────────────
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "こんにちは！就労規則モデル Q&A アシスタントです。就業規則に関する質問をどうぞ。",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    // 読み込み中のバブルを追加
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isLoading: true },
    ]);

    try {
      const res = await fetch(`${BACKEND_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, sessionId }),
      });

      if (!res.ok) throw new Error(`サーバーエラー: ${res.status}`);

      const data = await res.json();

      // マルチターン会話のために sessionId を保存
      if (data.sessionId) setSessionId(data.sessionId);

      // 読み込み中のバブルを回答に置き換える
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: data.answer,
          citations: data.citations,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "⚠️ エラーが発生しました。もう一度お試しください。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setSessionId(undefined);
    setMessages([
      {
        role: "assistant",
        content:
          "こんにちは！就労規則モデル Q&A アシスタントです。就業規則に関する質問をどうぞ。",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold">
            ⚖
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              就労規則モデル Q&A
            </h1>
            <p className="text-xs text-gray-500">
              RAG · AWS Bedrock ナレッジベース
            </p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          会話をリセット
        </button>
      </header>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* アバター */}
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm mt-1 ${
                msg.role === "assistant"
                  ? "bg-green-700 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {msg.role === "assistant" ? "⚖" : "私"}
            </div>

            {/* 吹き出し */}
            <div className={`max-w-xl ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-green-700 text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.isLoading ? (
                  <span className="flex gap-1 items-center h-5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  </span>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {/* 参照元 */}
              {msg.citations && msg.citations.length > 0 && (
                <details className="text-xs text-gray-400 mt-1">
                  <summary className="cursor-pointer hover:text-gray-600">
                    📎 {msg.citations.length} 件の参照元
                  </summary>
                  <ul className="mt-2 space-y-1 pl-2">
                    {msg.citations.map((c, j) => (
                      <li key={j} className="text-gray-500">
                        <span className="font-medium text-gray-600">
                          {c.source.split("/").pop()}
                        </span>
                        ： {c.text.slice(0, 100)}…
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="質問を入力してください... （Shift+Enter で改行）"
            rows={2}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors flex-shrink-0"
          >
            送信
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">
          AWS Bedrock ナレッジベース · amazon.nova-lite-v1:0 搭載
        </p>
      </div>
    </div>
  );
}
