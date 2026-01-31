"use client";

import { EditorContent, type Editor as EditorInstance } from "@tiptap/react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface EditorProps {
    editor: EditorInstance | null;
}

export const Editor = ({ editor }: EditorProps) => {
    const [wordCount, setWordCount] = useState(0);
    const [lastMilestone, setLastMilestone] = useState(0);

    useEffect(() => {
        if (!editor) return;

        const updateHandler = () => {
            const text = editor.getText();
            const words = text.trim().split(/\s+/).filter(Boolean).length;

            setWordCount(words);

            // Trigger confetti every 50 words
            if (words > 0 && words % 50 === 0 && words !== lastMilestone) {
                setLastMilestone(words);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.8 },
                    colors: ['#6366f1', '#a855f7', '#f43f5e']
                });
            }
        };

        editor.on("update", updateHandler);
        return () => {
            editor.off("update", updateHandler);
        };
    }, [editor, lastMilestone]);

    if (!editor) {
        return <div className="animate-pulse h-[500px] bg-white/5 rounded-3xl" />;
    }

    return (
        <div className="w-full h-full pb-32 md:pb-40 relative">
            <div className="fixed bottom-20 md:bottom-24 right-4 md:right-12 z-40 flex flex-col items-end gap-0 md:gap-1 pointer-events-none select-none">
                <div className="text-2xl md:text-4xl font-black text-white/10">
                    {wordCount}
                </div>
                <div className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/30 mr-1">
                    Words
                </div>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};
