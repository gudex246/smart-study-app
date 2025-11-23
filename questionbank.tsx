import React, { useState, useRef } from 'react';
import { Question } from '../types';
import { generateAnswer } from '../services/geminiService';
import { Send, Sparkles, Trash2, ChevronDown, ChevronUp, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface QuestionBankProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ questions, setQuestions }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() && !selectedImage) return;

    const questionId = Date.now().toString();
    const tempQuestion: Question = {
      id: questionId,
      text: newQuestion,
      topic: topic || 'General',
      imageUrl: selectedImage || undefined,
      createdAt: Date.now(),
      aiAnswer: '',
    };

    // Optimistic update
    setQuestions(prev => [tempQuestion, ...prev]);
    setNewQuestion('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setIsGenerating(true);
    setExpandedId(questionId);

    // Call AI
    const answer = await generateAnswer(tempQuestion.text, tempQuestion.topic, tempQuestion.imageUrl);
    
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, aiAnswer: answer } : q
    ));
    setIsGenerating(false);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
          <Sparkles className="h-6 w-6 text-indigo-500 mr-2" />
          Ask AI Tutor
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Topic (e.g., Data Structures, Physics)"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          
          <div className="relative border border-slate-200 rounded-xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
            {selectedImage && (
              <div className="p-4 pb-0">
                <div className="relative inline-block">
                  <img src={selectedImage} alt="Upload preview" className="h-32 w-auto rounded-lg object-cover border border-slate-200" />
                  <button 
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
            
            <textarea
              placeholder="Type your question here or upload an image of the problem..."
              className="w-full p-4 rounded-xl border-none focus:ring-0 resize-none h-32 outline-none"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            
            <div className="flex items-center justify-between p-2 pl-4 bg-slate-50 rounded-b-xl border-t border-slate-100">
              <div className="flex items-center">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Image
                </button>
              </div>

              <button
                onClick={handleAddQuestion}
                disabled={isGenerating || (!newQuestion.trim() && !selectedImage)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-700">Recent Questions</h3>
        {questions.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No questions yet. Ask something or upload a problem!</p>
          </div>
        )}
        
        {questions.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden transition-all hover:shadow-md">
            <div 
              className="p-4 cursor-pointer flex justify-between items-start"
              onClick={() => toggleExpand(q.id)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                    {q.topic}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-4">
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt="Question context" className="h-16 w-16 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
                  )}
                  <h4 className="font-medium text-slate-800 pt-1">
                    {q.text || <span className="text-slate-400 italic">Image Only Question</span>}
                  </h4>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {expandedId === q.id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </div>
            </div>
            
            {(expandedId === q.id || q.id === questions[0]?.id && isGenerating && expandedId === q.id) && (
              <div className="px-4 pb-4 pt-0 border-t border-slate-50 bg-slate-50/50">
                <div className="mt-4">
                   {q.imageUrl && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Attached Image:</p>
                        <img src={q.imageUrl} alt="Full size context" className="max-h-64 rounded-lg border border-slate-200" />
                      </div>
                   )}

                  <h5 className="text-sm font-semibold text-indigo-600 mb-2 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Explanation
                  </h5>
                  {q.aiAnswer ? (
                     <div className="prose prose-sm prose-slate max-w-none text-slate-600">
                       {/* Simple markdown rendering simulation - in real app use react-markdown */}
                       {q.aiAnswer.split('\n').map((line, i) => (
                         <p key={i} className="mb-2">{line}</p>
                       ))}
                     </div>
                  ) : (
                    <div className="flex items-center text-slate-500 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing question...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionBank;
