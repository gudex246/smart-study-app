import React from 'react';
import { ViewState } from '../types';
import { 
  BookOpen, 
  HelpCircle, 
  LayoutDashboard, 
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions', label: 'Question Bank', icon: HelpCircle },
    { id: 'notes', label: 'Smart Notes', icon: BookOpen },
    { id: 'quiz', label: 'Quiz Mode', icon: BrainCircuit },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="flex items-center justify-center h-20 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              UniTutor
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id as ViewState);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-800/50">
            <p className="text-xs text-slate-400">Powered by</p>
            <p className="text-sm font-semibold text-slate-200">Google Gemini 2.5</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
