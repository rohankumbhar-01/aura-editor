"use client";

import { useState, useEffect } from 'react';

export interface AppDocument {
    id: string;
    title: string;
    content: string;
    updatedAt: number;
}

export const useDocuments = () => {
    const [documents, setDocuments] = useState<AppDocument[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('aura_docs');
        if (saved) {
            const parsed = JSON.parse(saved);
            setDocuments(parsed);
            if (parsed.length > 0) setActiveId(parsed[0].id);
        } else {
            const initialDoc: AppDocument = {
                id: '1',
                title: 'Welcome to Aura',
                content: '<h1>Welcome to your new writing sanctuary.</h1><p>Start typing here...</p>',
                updatedAt: Date.now(),
            };
            setDocuments([initialDoc]);
            setActiveId(initialDoc.id);
            localStorage.setItem('aura_docs', JSON.stringify([initialDoc]));
        }
    }, []);

    const saveDocument = (id: string, content: string, title?: string) => {
        setDocuments(prev => {
            const next = prev.map(doc =>
                doc.id === id
                    ? { ...doc, content, title: title ?? doc.title, updatedAt: Date.now() }
                    : doc
            );
            localStorage.setItem('aura_docs', JSON.stringify(next));
            return next;
        });
    };

    const createDocument = () => {
        const newDoc: AppDocument = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Untitled Masterpiece',
            content: '',
            updatedAt: Date.now(),
        };
        const next = [newDoc, ...documents];
        setDocuments(next);
        setActiveId(newDoc.id);
        localStorage.setItem('aura_docs', JSON.stringify(next));
        return newDoc;
    };

    const deleteDocument = (id: string) => {
        const next = documents.filter(doc => doc.id !== id);
        setDocuments(next);
        if (activeId === id) setActiveId(next[0]?.id || null);
        localStorage.setItem('aura_docs', JSON.stringify(next));
    };

    const activeDocument = documents.find(doc => doc.id === activeId) || null;

    return {
        documents,
        activeDocument,
        setActiveId,
        saveDocument,
        createDocument,
        deleteDocument,
    };
};
