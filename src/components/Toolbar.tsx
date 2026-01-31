"use client";

import { motion } from "framer-motion";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Code,
    Type,
    Share2,
    Download,
    Eye,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Editor as EditorInstance } from "@tiptap/react";

interface ToolbarProps {
    editor: EditorInstance | null;
    title?: string;
}

export const Toolbar = ({ editor, title = "Untitled" }: ToolbarProps) => {
    if (!editor) return null;

    const handleAIRefine = () => {
        const text = editor.getText();
        if (!text || text.trim().length < 2) return;

        // 0. Clean previous signatures to prevent duplicates
        const signatureText = "✨ Optimized by Aura AI for impact and clarity.";
        let cleanText = text.split(signatureText)[0].trim();

        // 1. Smart Heuristic Refinement Logic
        let refined = cleanText;

        // Fix lowercase 'i'
        refined = refined.replace(/\bi\b/g, 'I');

        // Capitalize first letter of sentences
        refined = refined.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

        // Replace common boring words with "refined" ones
        const replacements: Record<string, string> = {
            "good": "exceptional",
            "bad": "suboptimal",
            "happy": "elated",
            "sad": "melancholy",
            "big": "substantial",
            "small": "minimal",
            "run": "sprint",
            "think": "contemplate",
            "write": "compose",
            "helpful": "invaluable"
        };

        Object.keys(replacements).forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            refined = refined.replace(regex, replacements[word]);
        });

        // 2. Wrap in a clean structure with a SINGLE signature
        const finalHTML = `
            <p>${refined}</p>
            <p><em><small>${signatureText}</small></em></p>
        `;

        editor.chain().focus().setContent(finalHTML).run();
    };

    const handleDownload = () => {
        const content = editor.getText();
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = async () => {
        const text = editor.getText();
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title,
                    text: text,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(text);
                alert("Text copied to clipboard!");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    return (
        <div className="fixed bottom-4 md:bottom-8 left-0 right-0 md:left-1/2 md:-translate-x-1/2 z-50 px-4 md:px-0">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass-card px-3 md:px-6 py-2.5 md:py-3 rounded-2xl flex items-center gap-1 md:gap-2 backdrop-blur-2xl overflow-x-auto no-scrollbar max-w-full md:max-w-none shadow-2xl shadow-indigo-500/10"
            >
                <div className="flex items-center gap-0.5 md:gap-1 pr-2 md:pr-4 border-r border-white/10 shrink-0">
                    <ToolbarButton
                        icon={Bold}
                        active={editor.isActive("bold")}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    />
                    <ToolbarButton
                        icon={Italic}
                        active={editor.isActive("italic")}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    />
                    <ToolbarButton
                        icon={Type}
                        active={editor.isActive("heading", { level: 2 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    />
                </div>

                <div className="flex items-center gap-0.5 md:gap-1 px-2 md:px-4 border-r border-white/10 shrink-0">
                    <ToolbarButton
                        icon={List}
                        active={editor.isActive("bulletList")}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    />
                    <ToolbarButton
                        icon={ListOrdered}
                        active={editor.isActive("orderedList")}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    />
                    <ToolbarButton
                        icon={Quote}
                        active={editor.isActive("blockquote")}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    />
                    <ToolbarButton
                        icon={Code}
                        active={editor.isActive("codeBlock")}
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    />
                </div>

                <div className="flex items-center gap-1.5 md:gap-2 pl-2 md:pl-4 shrink-0">
                    <button
                        onClick={handleAIRefine}
                        className="flex items-center gap-1.5 md:gap-2 bg-indigo-500 hover:bg-indigo-600 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-white font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                    >
                        <Zap size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
                        <span className="text-sm md:text-base px-1">AI Refine</span>
                    </button>

                    <div className="h-6 md:h-8 w-[1px] bg-white/10 mx-0.5 md:mx-1" />

                    <ToolbarButton icon={Eye} onClick={() => alert("Preview mode coming soon!")} />
                    <ToolbarButton icon={Share2} onClick={handleShare} />
                    <ToolbarButton icon={Download} onClick={handleDownload} />
                </div>
            </motion.div>
        </div>
    );
};

const ToolbarButton = ({ icon: Icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-2.5 rounded-xl transition-all active:scale-90 hover:bg-white/5",
            active ? "text-indigo-400 bg-white/5" : "text-slate-300"
        )}
    >
        <Icon size={20} />
    </button>
);
