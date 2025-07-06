import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, Filter, BookOpen, Target, Plus, FileDown, ListChecks, Check, X,
  ChevronRight, ChevronLeft, Loader2, Sparkles, BarChart2, Clock, UploadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  level?: string;
  type?: string;
  class_?: string;
  language?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
}

const Index = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [filters, setFilters] = useState({
    class: '',
    language: '',
    subject: '',
    level: '',
    chapter: '',
    type: '',
    topic: '',
  });
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 1250,
    physics: 420,
    chemistry: 380,
    mathematics: 300,
    biology: 150
  });

  // Simulate loading stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalQuestions: prev.totalQuestions + Math.floor(Math.random() * 10),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleQuestionSelection = (questionId: number) => {
    const isSelected = selectedQuestions.some(q => q.id === questionId);
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
    } else {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        setSelectedQuestions(prev => [...prev, question]);
      }
    }
  };

  const retrieveQuestions = async () => {
    setIsLoading(true);
    const requestBody: Record<string, string> = {};
    for (const key in filters) {
      const value = filters[key as keyof typeof filters];
      if (value) {
        const filterKey = key === 'class' ? 'class_' : key;
        requestBody[filterKey] = value;
      }
    }

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const res = await fetch("http://localhost:8000/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data);
      setActiveQuestionId(data.length ? data[0].id : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const downloadDocx = async () => {
    setIsLoading(true);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: selectedQuestions.map((q, idx) => {
              const questionParagraphs: Paragraph[] = [
                new Paragraph({
                  children: [new TextRun({ text: `Q${idx + 1}. ${q.text}`, bold: true })],
                  spacing: { after: 200 },
                }),
              ];

              if (q.type === 'mcq') {
                questionParagraphs.push(
                  new Paragraph(`A. ${q.option_a || ''}`),
                  new Paragraph(`B. ${q.option_b || ''}`),
                  new Paragraph(`C. ${q.option_c || ''}`),
                  new Paragraph(`D. ${q.option_d || ''}`),
                  new Paragraph({}),
                );
              }

              return questionParagraphs;
            }).flat(),
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'Selected_Questions.docx');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateQuestion = (direction: 'next' | 'prev') => {
    if (!activeQuestionId || questions.length === 0) return;
    
    const currentIndex = questions.findIndex(q => q.id === activeQuestionId);
    if (direction === 'next' && currentIndex < questions.length - 1) {
      setActiveQuestionId(questions[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveQuestionId(questions[currentIndex - 1].id);
    }
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectColor = (subject?: string) => {
    switch (subject) {
      case 'physics': return 'bg-purple-100 text-purple-800';
      case 'chemistry': return 'bg-blue-100 text-blue-800';
      case 'mathematics': return 'bg-indigo-100 text-indigo-800';
      case 'biology': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <div className="text-sm text-gray-600 flex items-center space-x-4">
      <motion.div 
        className="flex items-center space-x-2"
        whileHover={{ scale: 1.05 }}
      >
        <Target className="h-4 w-4 text-orange-500 animate-pulse" />
        <span className="font-medium">TEST GENERATOR</span>
      </motion.div>
    </div>
    <Button 
      asChild 
      variant="ghost" 
      className="text-orange-600 hover:bg-orange-50"
    >
      <Link to="/upload">
        <UploadCloud className="h-4 w-4 mr-2" />
        Upload Questions
      </Link>
    </Button>
  </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selected Questions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Selected Questions
                  </CardTitle>
                  {selectedQuestions.length > 0 && (
                    <Button
                      onClick={downloadDocx}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-8 shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileDown className="h-4 w-4 mr-2" />
                      )}
                      Export
                    </Button>
                  )}
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  {selectedQuestions.length} {selectedQuestions.length === 1 ? 'question' : 'questions'} selected
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {selectedQuestions.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-orange-100">
                    {selectedQuestions.map((q) => (
                      <motion.div 
                        key={q.id} 
                        className="px-4 py-3 hover:bg-orange-50 flex items-center justify-between group"
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => toggleQuestionSelection(q.id)}
                            className="p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors shadow-sm"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div>
                            <p className="text-sm font-medium text-gray-800 line-clamp-1">Q{q.id}. {q.text.split('.')[0]}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getSubjectColor(q.subject)}`}>
                                {q.subject}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getLevelColor(q.level)}`}>
                                {q.level}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveQuestionId(q.id)}
                          className="text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3 shadow-inner">
                      <BookOpen className="h-5 w-5 text-orange-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-700">No questions selected</h4>
                    <p className="text-xs text-gray-500 mt-1">Select questions from the list</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Question List Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 py-3">
                <CardTitle className="text-lg font-semibold text-orange-800 flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Question Bank
                </CardTitle>
                <div className="text-xs text-orange-600">
                  {questions.length} {questions.length === 1 ? 'question' : 'questions'} found
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto divide-y divide-orange-100">
                  {questions.length > 0 ? (
                    questions.map((q) => {
                      const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                      const isActive = activeQuestionId === q.id;
                      
                      return (
                        <motion.div 
                          key={q.id} 
                          className={`flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors ${
                            isActive ? 'bg-orange-100' : ''
                          }`}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <button
                            onClick={() => setActiveQuestionId(q.id)}
                            className={`text-left flex-1 text-sm font-medium flex items-center gap-3 ${
                              isActive ? 'text-orange-700' : 'text-gray-700'
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleQuestionSelection(q.id);
                              }}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm ${
                                isSelected 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-orange-300 hover:border-orange-400'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                            </button>
                            <span className="truncate">Q{q.id}. {q.text.split('.')[0]}</span>
                          </button>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${getLevelColor(q.level)} whitespace-nowrap`}>
                              {q.type}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3 shadow-inner">
                        <Search className="h-5 w-5 text-orange-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700">No questions found</h4>
                      <p className="text-xs text-gray-500 mt-1">Apply filters to search questions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filter Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-orange-800">
                    <Filter className="h-5 w-5" />
                    <span>Filter Questions</span>
                  </CardTitle>
                  <Button
                    onClick={retrieveQuestions}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Retrieve Questions
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, class: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jee-main">JEE Main</SelectItem>
                        <SelectItem value="neet">NEET</SelectItem>
                        <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, language: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, subject: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, level: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Principles of inheritance">Principles of inheritance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">MCQ</SelectItem>
                        <SelectItem value="numerical">Numerical</SelectItem>
                        <SelectItem value="subjective">Subjective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                    <Select onValueChange={v => setFilters(prev => ({ ...prev, topic: v }))}>
                      <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300 shadow-sm">
                        <SelectValue placeholder="Select Topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mechanics">Mechanics</SelectItem>
                        <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
                        <SelectItem value="organic">Organic Chemistry</SelectItem>
                        <SelectItem value="algebra">Algebra</SelectItem>
                        <SelectItem value="calculus">Calculus</SelectItem>
                        <SelectItem value="Introduction">Introduction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-generate"
                      checked={autoGenerate}
                      onCheckedChange={(checked) => setAutoGenerate(checked === true)}
                      className="border-orange-300 data-[state=checked]:bg-orange-500 shadow-sm"
                    />
                    <label htmlFor="auto-generate" className="text-sm font-medium text-gray-700">
                      Auto Generate Questions
                    </label>
                  </div>
                  {autoGenerate && (
                    <Button variant="ghost" className="text-orange-600 hover:bg-orange-50">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Smart Paper
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Question Display */}
          <AnimatePresence mode="wait">
            {activeQuestion ? (
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-xl border-orange-200">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-orange-800">Question #{activeQuestion.id}</CardTitle>
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(activeQuestion.subject)}`}>
                          {activeQuestion.subject}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(activeQuestion.level)}`}>
                          {activeQuestion.level}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {activeQuestion.type}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="prose prose-orange max-w-none">
                      <p className="text-gray-800 text-lg leading-relaxed">{activeQuestion.text}</p>
                      {activeQuestion.type === 'mcq' && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-start">
                            <span className="font-medium mr-2 mt-0.5">A.</span>
                            <span>{activeQuestion.option_a}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-medium mr-2 mt-0.5">B.</span>
                            <span>{activeQuestion.option_b}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-medium mr-2 mt-0.5">C.</span>
                            <span>{activeQuestion.option_c}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="font-medium mr-2 mt-0.5">D.</span>
                            <span>{activeQuestion.option_d}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-4 border-t border-orange-100 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          onClick={() => navigateQuestion('prev')}
                          disabled={questions.findIndex(q => q.id === activeQuestionId) === 0}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          onClick={() => navigateQuestion('next')}
                          disabled={questions.findIndex(q => q.id === activeQuestionId) === questions.length - 1}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className={`border-orange-300 ${
                          selectedQuestions.some(q => q.id === activeQuestion.id) 
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                            : 'text-orange-600 hover:bg-orange-50'
                        } shadow-sm`}
                        onClick={() => toggleQuestionSelection(activeQuestion.id)}
                      >
                        {selectedQuestions.some(q => q.id === activeQuestion.id) ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Remove from Test
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Test
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="no-question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="shadow-xl border-orange-200">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto max-w-md text-gray-500">
                      <BookOpen className="h-10 w-10 mx-auto text-orange-200 mb-3" />
                      <h3 className="text-lg font-medium text-gray-600">No question selected</h3>
                      <p className="mt-1 text-sm">
                        {questions.length === 0 
                          ? "Apply filters and retrieve questions to get started." 
                          : "Select a question from the list to view details."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Index;