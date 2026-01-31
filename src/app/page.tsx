"use client";
import { PlusIcon, RightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface MessageType {
  id: number;
  text: string;
  createdAt: Date;
  system: "user" | "bot";
}

export default function Home() {
  const [messages, setMessages] = useState<Array<MessageType>>([]);
  const [inputValue, setInputValue] = useState("");
  const [isBotLoading, setIsBotLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim() || isBotLoading) return;

    // Add user message
    const userMessage: MessageType = {
      id: Date.now(),
      text: inputValue,
      createdAt: new Date(),
      system: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsBotLoading(true);

    // Add loading message
    const loadingMessageId = Date.now() + 1;
    const loadingMessage: MessageType = {
      id: loadingMessageId,
      text: "...",
      createdAt: new Date(),
      system: "bot",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    // Simulate bot response after a delay
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                text: "Thanks for your message! I'm here to help you with that.",
                createdAt: new Date(),
              }
            : msg
        )
      );
      setIsBotLoading(false);
    }, 1000);
  };

  return (
    <div className="w-screen h-screen bg-[#333] flex justify-center items-center">
      <div className="w-[400px] h-[670px] bg-white flex flex-col">
        <div className="bg-[#4D484512] w-full h-15 mb-8 flex justify-center items-center py-2.5">
          <div className="bg-white w-[125px] h-full rounded-full" />
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col px-5 ">
          <div className="flex-1 min-h-0"></div>
          <div className="flex flex-col gap-2">
            {messages.map((message) => {
              const isLastMessage =
                messages[messages.length - 1].id === message.id;
              return (
                <div
                  key={message.id}
                  className={cn("flex flex-col", {
                    "self-end items-end": message.system === "user",
                    "self-start items-start": message.system === "bot",
                  })}
                >
                  {isBotLoading && message.system === "bot" && isLastMessage ? (
                    <div className="pb-2">
                      <p className="text-xs text-[#C3C3C5]">Analyaing</p>
                    </div>
                  ) : null}
                  <div></div>
                  <div className="bg-[#F1F1F1] px-3 py-2 w-fit rounded-2xl">
                    <p className="text-[#333333] text-xs">{message.text}</p>
                  </div>
                  <p className="text-xs text-[#C3C3C5] pt-1 text-[8px]">
                    <span className="font-medium">Read</span>{" "}
                    {message.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="px-5 pb-8 mt-4 w-full">
          <form
            onSubmit={handleSendMessage}
            className="w-full h-full flex items-end gap-2"
          >
            <div className="bg-[#F1F1F1] rounded-full mb-2 size-8 flex justify-center items-center">
              <PlusIcon />
            </div>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isBotLoading}
                className="rounded-2xl bg-[#F1F1F1] pr-10 w-full px-3 py-2.5 placeholder:text-[#C3C3C5] text-[#404040] placeholder:text-xs text-xs outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-hidden min-h-[36px] max-h-[120px]"
                placeholder="Your message..."
                rows={1}
              />

              <div
                className={cn(
                  "absolute right-[6px] top-1/2 -translate-y-1/2 transition-all rounded-xl duration-200 h-9 p-3",
                  {
                    "bg-white shadow-[0px_1px_2px_0px_#82828240]": inputValue.trim().length > 0,
                  }
                )}
              >
                <div
                  className={cn("transition-transform duration-200", {
                    "-rotate-90": inputValue.trim().length > 0,
                  })}
                >
                  <RightIcon className="size-2.5" pathClassName="" />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
