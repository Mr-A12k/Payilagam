import { Button } from "@/components/ui/Button";
import { useSelector } from 'react-redux';
import { Sparkles, ArrowUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

const AIAssistant = () => {
    const { token } = useSelector((state: any) => state.auth);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [topic, setTopic] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<any>(null);
    const inputRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (event: React.SyntheticEvent<any>) => {
        event.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        
        // Reset textarea height
        if (inputRef.current) {
            inputRef.current.style.height = 'inherit';
        }

        setMessages((prev: any) => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        // Add placeholder for assistant response
        setMessages((prev: any) => [...prev, { role: 'assistant', content: '' }]);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: userMsg, topic })
            });

            if (!response.ok) {
                throw new Error('Failed to connect to AI server. Please ensure Redis and Ollama are running.');
            }

            const reader = response.body?.getReader();
            if (!reader) return;
            const decoder = new TextDecoder('utf-8');
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.replace('data: ', '');
                            if (data === '[DONE]') {
                                setIsLoading(false);
                                break;
                            }
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.token) {
                                    setMessages((prev: any) => {
                                        const newMsgs = [...prev];
                                        const lastMsg = newMsgs[newMsgs.length - 1];
                                        lastMsg.content += parsed.token;
                                        return newMsgs;
                                    });
                                } else if (parsed.error) {
                                    setMessages((prev: any) => {
                                        const newMsgs = [...prev];
                                        const lastMsg = newMsgs[newMsgs.length - 1];
                                        lastMsg.content += `\n\n**Error:** ${parsed.error}`;
                                        return newMsgs;
                                    });
                                }
                            } catch (error) {
                            console.error('Error parsing stream data', error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
        console.error('Chat error:', error);
            setMessages((prev: any) => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                lastMsg.content = `**Error:** ${(error as import('axios').AxiosError<{message?: string}>)?.message}`;
                return newMsgs;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'inherit';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
            
            {/* Top Navigation / Header */}
            <header className="sticky top-0 z-50 flex-between px-6 py-4 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/50 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex-center shadow-[0_0_15px_rgba(56,189,248,0.15)] ring-1 ring-slate-700/50">
                        <Sparkles className="icon-base text-sky-400" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-100">Intelligence</h1>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-900/60 px-4 py-1.5 rounded-full border border-slate-800/60 shadow-inner">
                    <span className="text-[13px] font-medium text-slate-400">Focus</span>
                    <select 
                        value={topic}
                        onChange={(event: React.SyntheticEvent<any>) => setTopic((event.target as HTMLInputElement).value)}
                        className="bg-transparent border-none text-[13px] font-semibold text-slate-200 focus:ring-0 cursor-pointer outline-none w-28 appearance-none"
                    >
                        <option className="bg-slate-900 text-slate-200" value="all">Everything</option>
                        <option className="bg-slate-900 text-slate-200" value="math">Mathematics</option>
                        <option className="bg-slate-900 text-slate-200" value="science">Science</option>
                        <option className="bg-slate-900 text-slate-200" value="history">History</option>
                        <option className="bg-slate-900 text-slate-200" value="programming">Programming</option>
                    </select>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth hide-scrollbar px-4 sm:px-6 md:px-8">
                <div className="max-w-3xl mx-auto py-12 flex flex-col gap-8">
                    
                    {messages.length === 1 && !isLoading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center justify-center py-20 text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-sky-400 rounded-2xl flex-center mb-6 shadow-[0_0_30px_rgba(56,189,248,0.3)] border border-sky-400/20">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-slate-50 drop-shadow-sm">
                                Good evening.
                            </h2>
                            <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-md mx-auto">
                                What would you like to learn today? Ask a question or search your documents.
                            </p>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {messages.map((message: any, index: any) => {
                            if (index === 0 && messages.length === 1) return null; // Skip initial greeting if it's the only message (we show the hero instead)
                            
                            const isUser = message.role === 'user';
                            
                            return (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className={cn(
                                        "flex w-full",
                                        isUser ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "max-w-[85%] sm:max-w-[75%]",
                                        isUser ? "" : "flex gap-4"
                                    )}>
                                        {!isUser && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex-center shadow-[0_0_15px_rgba(56,189,248,0.15)] mt-1">
                                                <Sparkles className="icon-base text-sky-400" />
                                            </div>
                                        )}
                                        
                                        <div className={cn(
                                            "px-5 py-3.5 rounded-3xl text-[15px] sm:text-[16px] leading-relaxed shadow-sm transition-all",
                                            isUser 
                                                ? "bg-slate-800 text-slate-100 rounded-br-sm border border-slate-700/50" 
                                                : "bg-slate-900 text-slate-300 rounded-tl-sm border border-slate-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)] ring-1 ring-white/5"
                                        )}>
                                            {isUser ? (
                                                <div className="whitespace-pre-wrap font-medium">{message.content}</div>
                                            ) : (
                                                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:p-4 prose-code:text-sky-300 prose-code:bg-sky-900/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-strong:font-semibold prose-strong:text-slate-200">
                                                    {message.content === '' ? (
                                                        <div className="flex items-center gap-1.5 h-6 px-2">
                                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 bg-sky-400 rounded-full" />
                                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 bg-sky-400 rounded-full" />
                                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 bg-sky-400 rounded-full" />
                                                        </div>
                                                    ) : (
                                                        <ReactMarkdown 
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({inline, className, children, ...props}: React.ComponentPropsWithoutRef<"code"> & { inline?: boolean }) {
                                                                    const match = /language-(\w+)/.exec(className || '');
                                                                    return !inline && match ? (
                                                                        <div className="rounded-md overflow-hidden my-2 border border-slate-700/50 shadow-sm relative group">
                                                                            <SyntaxHighlighter
                                                                                children={String(children).replace(/\n$/, '')}
                                                                                style={vscDarkPlus}
                                                                                language={match[1]}
                                                                                PreTag="div"
                                                                                className="!my-0 !bg-slate-950 !p-4 !font-mono text-[13px]"
                                                                                {...props}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-6" />
                </div>
            </main>

            {/* Input Container */}
            <div className="bg-slate-950/60 backdrop-blur-2xl border-t border-slate-800/60 pt-4 pb-6 px-4 sm:px-6 flex justify-center shrink-0">
                <div className="w-full max-w-3xl relative">
                    <form 
                        onSubmit={handleSubmit} 
                        className="relative flex items-end bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/40 transition-all duration-300"
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(event: React.SyntheticEvent<any>) => {
                                setInput((event.target as HTMLInputElement).value);
                                handleInput(event as any);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Intelligence..."
                            disabled={isLoading}
                            rows={1}
                            className="w-full resize-none py-4 pl-6 pr-14 border-0 bg-transparent rounded-3xl focus:outline-none text-[16px] text-slate-200 placeholder-slate-500 disabled:opacity-50 min-h-[56px] max-h-48 overflow-y-auto leading-relaxed"
                        />
                        <div className="absolute right-2 bottom-2">
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                 className="w-10 h-10 flex-center !rounded-full !p-0 disabled:bg-slate-800 disabled:text-slate-600 transition-colors active:scale-95 flex-shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <Loader2 className="icon-md animate-spin" />
                                ) : (
                                    <ArrowUp className="icon-md stroke-[2.5]" />
                                )}
                            </Button>
                        </div>
                    </form>
                    <div className="text-center mt-3 text-[12px] font-medium text-slate-500">
                        Intelligence can make mistakes. Check important info.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;


