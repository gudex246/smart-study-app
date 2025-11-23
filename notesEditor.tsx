import React, { useState } from 'react';
import { Note } from '../types';
import { elaborateNote, summarizeNote } from '../services/geminiService';
import { FileText, Plus, Save, Wand2, Loader2, Tag, Book, FileMinus } from 'lucide-react';

interface NotesEditorProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ notes, setNotes }) => {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Note State (for the form)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      lastModified: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setTitle('Untitled Note');
    setContent('');
    setTagInput('');
  };

  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTagInput(note.tags.join(', '));
  };

  const saveNote = () => {
    if (!activeNoteId) return;
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    
    setNotes(prev => prev.map(n => 
      n.id === activeNoteId 
        ? { ...n, title, content, tags, lastModified: Date.now() }
        : n
    ));
  };

  const handleAIExpand = async () => {
    if (!content.trim()) return;
    setIsProcessing(true);
    const expandedContent = await elaborateNote(title, content);
    setContent(expandedContent);
    setIsProcessing(false);
  };

  const handleAISummarize = async () => {
    if (!content.trim()) return;
    setIsProcessing(true);
    const summary = await summarizeNote(title, content);
    setContent(summary);
    setIsProcessing(false);
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-6">
      {/* Notes List */}
      <div className="w-full md:w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 flex items-center">
            <Book className="h-5 w-5 mr-2 text-indigo-500" />
            My Notes
          </h2>
          <button 
            onClick={createNewNote}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar p-3 space-y-2">
          {notes.length === 0 && (
            <p className="text-center text-slate-400 text-sm mt-10">Create your first note!</p>
          )}
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => selectNote(note)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                activeNoteId === note.id 
                  ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                  : 'hover:bg-slate-50 border border-transparent'
              }`}
            >
              <h3 className={`font-semibold text-sm truncate ${activeNoteId === note.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                {note.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 truncate">
                {note.content || "No content yet..."}
              </p>
              <div className="flex gap-1 mt-2">
                 {note.tags.slice(0, 2).map((tag, idx) => (
                   <span key={idx} className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">
                     {tag}
                   </span>
                 ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {activeNoteId ? (
          <>
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-xl font-bold text-slate-800 outline-none placeholder:text-slate-300 w-full"
                placeholder="Note Title"
              />
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={handleAISummarize}
                  disabled={isProcessing || !content}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors text-sm font-medium"
                  title="Make shorter"
                >
                  <FileMinus className="h-4 w-4" />
                  <span className="hidden sm:inline">Summarize</span>
                </button>
                 <button
                  onClick={handleAIExpand}
                  disabled={isProcessing || !content}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  title="Expand notes"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  <span className="hidden sm:inline">Expand</span>
                </button>
                <button
                  onClick={saveNote}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
              </div>
            </div>
            
            <div className="flex items-center px-4 py-2 bg-slate-50 border-b border-slate-100">
               <Tag className="h-4 w-4 text-slate-400 mr-2" />
               <input
                 type="text"
                 value={tagInput}
                 onChange={(e) => setTagInput(e.target.value)}
                 className="flex-1 bg-transparent outline-none text-sm text-slate-600 placeholder:text-slate-400"
                 placeholder="Tags (comma separated, e.g., Biology, Chapter 1)"
               />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-6 resize-none outline-none text-slate-700 leading-relaxed font-mono text-sm custom-scrollbar"
              placeholder="# Start typing your notes here..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <FileText className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesEditor;
