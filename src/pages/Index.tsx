
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, FileText, BookOpen, Target } from 'lucide-react';

const Index = () => {
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(false);

  const questions = [
    { id: 1, usedCount: 2, topic: "Mechanics", difficulty: "Medium", subject: "Physics" },
    { id: 2, usedCount: 0, topic: "Organic Chemistry", difficulty: "Hard", subject: "Chemistry" },
    { id: 3, usedCount: 5, topic: "Algebra", difficulty: "Easy", subject: "Mathematics" },
    { id: 4, usedCount: 1, topic: "Thermodynamics", difficulty: "Medium", subject: "Physics" },
    { id: 5, usedCount: 3, topic: "Calculus", difficulty: "Hard", subject: "Mathematics" },
  ];

  const handleQuestionSelect = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedQuestions(selectedQuestions.length === questions.length ? [] : questions.map(q => q.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Question Bank
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>GYANAM TEST GENERATOR</span>
              <span className="font-semibold">CONTACT: +91</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Section */}
        <Card className="mb-6 shadow-lg border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Filter className="h-5 w-5" />
              <span>Filter Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <Select>
                  <SelectTrigger className="bg-white border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="JEE Main + NEET + JEE Advanced" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jee-main">JEE Main</SelectItem>
                    <SelectItem value="neet">NEET</SelectItem>
                    <SelectItem value="jee-advanced">JEE Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <Select>
                  <SelectTrigger className="bg-white border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="ENGLISH" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select>
                  <SelectTrigger className="bg-white border-orange-200 focus:border-orange-400">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Level</label>
                <Select>
                  <SelectTrigger className="bg-white border-orange-200 focus:border-orange-400">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Chapter</label>
                <Input placeholder="Search chapter..." className="bg-white border-orange-200 focus:border-orange-400" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <Select>
                  <SelectTrigger className="bg-white border-orange-200 focus:border-orange-400">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <Select>
                  <SelectTrigger className="bg-white border-orange-200 focus:border-orange-400">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Used Questions:</label>
                  <Select>
                    <SelectTrigger className="w-20 bg-white border-orange-200">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="unused">Unused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="auto-generate" 
                    checked={autoGenerate}
                    onCheckedChange={(checked) => setAutoGenerate(checked === true)}
                  />
                  <label htmlFor="auto-generate" className="text-sm font-medium text-gray-700">
                    Auto Generate?
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Retrieve Questions
                </Button>
                <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-orange-800">Questions</CardTitle>
                  <div className="text-sm text-gray-600">
                    Selected: {selectedQuestions.length} | Total: {questions.length} | Used: {questions.filter(q => q.usedCount > 0).length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex space-x-2 mb-4">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Add To Paper
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-300">
                    Unmark
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-orange-300 text-orange-600"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 pb-2 border-b">
                    <span>ID</span>
                    <span>Used Count</span>
                    <span>Select</span>
                  </div>
                  
                  {questions.map((question) => (
                    <div key={question.id} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-gray-100 hover:bg-orange-50 rounded px-2">
                      <span className="text-sm font-medium">{question.id}</span>
                      <span className="text-sm">
                        <Badge variant={question.usedCount > 0 ? "default" : "secondary"} className="text-xs">
                          {question.usedCount}
                        </Badge>
                      </span>
                      <Checkbox 
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => handleQuestionSelect(question.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Preview */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100">
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <FileText className="h-5 w-5" />
                  <span>Question Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {selectedQuestions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
                          Question {selectedQuestions[0]}
                        </Badge>
                        <div className="flex space-x-2">
                          <Badge variant="outline">Physics</Badge>
                          <Badge variant="outline">Medium</Badge>
                        </div>
                      </div>
                      <div className="prose max-w-none">
                        <p className="text-gray-800 leading-relaxed">
                          A particle of mass 2 kg is moving with a velocity of 10 m/s. What is the kinetic energy of the particle?
                        </p>
                        <div className="mt-4 space-y-2">
                          <p className="font-medium text-gray-700">Options:</p>
                          <div className="ml-4 space-y-1">
                            <p>(A) 50 J</p>
                            <p>(B) 100 J</p>
                            <p>(C) 150 J</p>
                            <p>(D) 200 J</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected
                      </Button>
                      <Button variant="outline" className="border-orange-300 text-orange-600">
                        Preview All
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Select questions to preview them here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
