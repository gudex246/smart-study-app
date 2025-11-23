import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import QuestionBank from './components/QuestionBank';
import NotesEditor from './components/NotesEditor';
import QuizGenerator from './components/QuizGenerator';
import { ViewState, Question, Note } from './types';
import { Menu, BookOpen, HelpCircle, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // App State
  // In a real app, these would persist to database or localStorage
  const [questions, setQuestions] = useState<Question[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const renderContent = () => {
    switch (currentView) {
      case 'questions':
        return <QuestionBank questions={questions} setQuestions={setQuestions} />;
      case 'notes':
        return <NotesEditor notes={notes} setNotes={setNotes} />;
      case 'quiz':
        return <QuizGenerator />;
      case 'dashboard':
      default:
        return (
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800">Tutorial Dashboard</h1>
              <p className="text-slate-500 mt-2">Welcome to your university companion app. Manage questions and notes efficiently.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold">{questions.length}</span>
                </div>
                <h3 className="font-semibold text-lg">Questions Uploaded</h3>
                <p className="text-indigo-100 text-sm mt-1">Review your Q&A bank</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold">{notes.length}</span>
                </div>
                <h3 className="font-semibold text-lg">Short Notes</h3>
                <p className="text-cyan-100 text-sm mt-1">Notes created & summarized</p>
              </div>

              <div className="bg-white rounded-2xl p-6 text-slate-800 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Tutorial Status</h3>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 mb-1">
                  <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-slate-400 text-xs">Based on activity</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setCurrentView('questions')}
                  className="px-6 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Upload Question
                </button>
                <button 
                   onClick={() => setCurrentView('notes')}
                   className="px-6 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Create Short Note
                </button>
                <button 
                   onClick={() => setCurrentView('quiz')}
                   className="px-6 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  Take a Quiz
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
           <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <span className="font-bold text-slate-800">UniTutor</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
