"use client";

import { useState, useEffect } from "react";
import { Sidebar, SidebarTab } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { Toolbar } from "@/components/Toolbar";
import { AuraBackground } from "@/components/AuraBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, MoreVertical, CloudCheck, Menu, X } from "lucide-react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useDocuments } from "@/hooks/useDocuments";
import { cn } from "@/lib/utils";

export default function AuraEditorApp() {
  const { documents, activeDocument, setActiveId, saveDocument, createDocument, deleteDocument } = useDocuments();
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("documents");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your masterpiece...",
      }),
    ],
    content: activeDocument?.content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-lg focus:outline-none max-w-none min-h-[500px]",
      },
    },
  });

  // Handle Auto-save logic
  useEffect(() => {
    if (!editor || !activeDocument) return;

    const onUpdate = () => {
      setSaveStatus("saving");
      const content = editor.getHTML();

      // Debounce saving to localStorage
      const timeout = setTimeout(() => {
        saveDocument(activeDocument.id, content);
        setSaveStatus("saved");
      }, 500);

      return () => clearTimeout(timeout);
    };

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, activeDocument?.id, saveDocument]);

  // Update editor content when active document changes
  useEffect(() => {
    if (editor && activeDocument && editor.getHTML() !== activeDocument.content) {
      editor.commands.setContent(activeDocument.content);
    }
  }, [activeDocument?.id, editor]);

  const handleNewDocument = () => {
    const newDoc = createDocument();
    if (editor) editor.commands.setContent("");
    setActiveTab("documents");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeDocument) {
      saveDocument(activeDocument.id, activeDocument.content, e.target.value);
    }
  };

  const manualSave = () => {
    if (editor && activeDocument) {
      setSaveStatus("saving");
      saveDocument(activeDocument.id, editor.getHTML());
      setTimeout(() => setSaveStatus("saved"), 300);
    }
  };

  return (
    <main className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <AuraBackground />

      <AnimatePresence>
        {(!isFocusMode || isMobileSidebarOpen) && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={cn(
              "z-50 shrink-0",
              "fixed inset-y-0 left-0 md:relative md:block",
              isMobileSidebarOpen ? "block" : "hidden md:block"
            )}
          >
            <Sidebar
              onNewDocument={handleNewDocument}
              documents={documents}
              activeDocId={activeDocument?.id || null}
              onSelectDoc={(id) => { setActiveId(id); setIsMobileSidebarOpen(false); }}
              onDeleteDoc={deleteDocument}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-10 transition-all shrink-0">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg text-slate-400"
            >
              <Menu size={20} />
            </button>

            <input
              value={activeDocument?.title || ""}
              onChange={handleTitleChange}
              placeholder="Untitled Masterpiece"
              className="bg-transparent text-lg md:text-xl font-semibold focus:outline-none border-b border-transparent focus:border-indigo-500/50 transition-all w-full max-w-[150px] md:max-w-[400px] truncate"
            />

            <button
              onClick={manualSave}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-medium",
                saveStatus === "saving"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {saveStatus === "saving" ? (
                <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CloudCheck size={14} className="text-emerald-400" />
              )}
              <span>{saveStatus === "saving" ? "Saving..." : "Saved"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"
            >
              {isFocusMode ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
            </button>
            <button className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white">
              <MoreVertical size={22} />
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-4 scrollbar-hide">
          <motion.div
            layout
            className="max-w-4xl mx-auto mt-8"
          >
            <Editor editor={editor} />
          </motion.div>
        </div>

        <Toolbar editor={editor} title={activeDocument?.title} />

        {/* Focus Mode Overlays */}
        <AnimatePresence>
          {isFocusMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none border-[60px] border-slate-950/40 z-40 backdrop-blur-[1px]"
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
