import React, { useState } from 'react';
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
  Search, Filter, BookOpen, Target, Plus, FileDown, ListChecks, Check, X
} from 'lucide-react';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

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
    const requestBody: Record<string, string> = {};
    for (const key in filters) {
      const value = filters[key as keyof typeof filters];
      if (value) {
        const filterKey = key === 'class' ? 'class_' : key;
        requestBody[filterKey] = value;
      }
    }

    try {
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
    }
  };

  const activeQuestion = questions.find(q => q.id === activeQuestionId);

  const downloadDocx = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Question Bank
            </h1>
          </div>
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <Target className="h-4 w-4 text-orange-500" />
            <span className="font-medium">TEST GENERATOR</span>
            <span className="hidden md:inline font-semibold text-orange-600">CONTACT: +91</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Selected Questions Card */}
          <Card className="border-orange-200 shadow-sm">
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
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-8"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
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
                    <div 
                      key={q.id} 
                      className="px-4 py-3 hover:bg-orange-50 flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => toggleQuestionSelection(q.id)}
                          className="p-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">Q{q.id}. {q.text.split('.')[0]}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded">
                              {q.subject}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                    <BookOpen className="h-5 w-5 text-orange-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-700">No questions selected</h4>
                  <p className="text-xs text-gray-500 mt-1">Select questions from the list</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question List Card */}
          <Card className="border-orange-200 shadow-sm">
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
                      <div 
                        key={q.id} 
                        className={`flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors ${
                          isActive ? 'bg-orange-100' : ''
                        }`}
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
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
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
                          <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded whitespace-nowrap">
                            {q.type}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-orange-400" />
                    </div>
                    <h4 className="text-sm font-medium text-gray-700">No questions found</h4>
                    <p className="text-xs text-gray-500 mt-1">Apply filters to search questions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filter Card */}
          <Card className="shadow-lg border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <Filter className="h-5 w-5" />
                  <span>Filter Questions</span>
                </CardTitle>
                <Button
                  onClick={retrieveQuestions}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Retrieve Questions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <Select onValueChange={v => setFilters(prev => ({ ...prev, class: v }))}>
                    <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300">
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
                    <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <Select onValueChange={v => setFilters(prev => ({ ...prev, subject: v }))}>
                    <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300">
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
                    <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300">
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
                  <Input
                    placeholder="Enter chapter"
                    className="bg-white border-orange-200 hover:border-orange-300"
                    onChange={(e) => setFilters(prev => ({ ...prev, chapter: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Select onValueChange={v => setFilters(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300">
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
                    <SelectTrigger className="bg-white border-orange-200 hover:border-orange-300">
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mechanics">Mechanics</SelectItem>
                      <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
                      <SelectItem value="organic">Organic Chemistry</SelectItem>
                      <SelectItem value="algebra">Algebra</SelectItem>
                      <SelectItem value="calculus">Calculus</SelectItem>
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
                    className="border-orange-300 data-[state=checked]:bg-orange-500"
                  />
                  <label htmlFor="auto-generate" className="text-sm font-medium text-gray-700">
                    Auto Generate Questions
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Question Display */}
          {activeQuestion ? (
            <Card className="shadow-lg border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-orange-800">Question #{activeQuestion.id}</CardTitle>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {activeQuestion.subject}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
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
                <div className="pt-4 border-t border-orange-100">
                  <Button
                    variant="outline"
                    className={`border-orange-300 ${
                      selectedQuestions.some(q => q.id === activeQuestion.id) 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'text-orange-600 hover:bg-orange-50'
                    }`}
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
          ) : (
            <Card className="shadow-lg border-orange-200">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;