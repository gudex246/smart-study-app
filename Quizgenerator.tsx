import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { BrainCircuit, CheckCircle2, XCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

const QuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuestions([]);
    setShowResult(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    
    const quizData = await generateQuiz(topic);
    setQuestions(quizData);
    setLoading(false);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentQuestionIndex];
    if (selectedOption === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
    setIsAnswerChecked(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-slate-700">Generating Quiz...</h3>
        <p className="text-slate-500">Analysing topic "{topic}"</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-100 mt-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
          <BrainCircuit className="h-10 w-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completed!</h2>
        <p className="text-slate-500 mb-8">Topic: {topic}</p>
        
        <div className="text-5xl font-black text-indigo-600 mb-8">
          {score} <span className="text-2xl text-slate-400 font-medium">/ {questions.length}</span>
        </div>

        <button
          onClick={() => { setQuestions([]); setTopic(''); }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center mx-auto"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Create New Quiz
        </button>
      </div>
    );
  }

  if (questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    return (
      <div className="max-w-2xl mx-auto mt-8">
        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full mb-6">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-2 mb-6">
              {currentQ.question}
            </h3>

            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
                
                if (isAnswerChecked) {
                  if (option === currentQ.correctAnswer) {
                    btnClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (option === selectedOption) {
                    btnClass += "border-red-500 bg-red-50 text-red-700";
                  } else {
                    btnClass += "border-slate-100 text-slate-400 opacity-50";
                  }
                } else {
                  if (selectedOption === option) {
                    btnClass += "border-indigo-600 bg-indigo-50 text-indigo-700";
                  } else {
                    btnClass += "border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    className={btnClass}
                    disabled={isAnswerChecked}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {isAnswerChecked && option === currentQ.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {isAnswerChecked && option === selectedOption && option !== currentQ.correctAnswer && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {isAnswerChecked && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium">Explanation:</p>
                <p className="text-sm text-blue-600 mt-1">{currentQ.explanation}</p>
              </div>
            )}
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
            {!isAnswerChecked ? (
              <button
                onClick={checkAnswer}
                disabled={!selectedOption}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium flex items-center"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Initial State
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6">
        <BrainCircuit className="h-8 w-8 text-purple-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">Quiz Generator</h2>
      <p className="text-slate-500 mb-8">
        Enter a subject or topic, and our AI will generate a tailored multiple-choice quiz to test your knowledge.
      </p>
      
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter topic (e.g. Molecular Biology, Calculus II)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button
          onClick={handleGenerateQuiz}
          disabled={!topic.trim()}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
        >
          Generate Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizGenerator;
