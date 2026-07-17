"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Menu,
  Grid,
  LogOut,
  CheckSquare,
  User,
  FileText,
  Target,
  Trophy,
  Timer,
  Eye,
  EyeOff,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/useAuth";
import { API_BASE, TEST_PATHS } from "@/lib/api";

interface QuestionDetail {
  id: number;
  questionText: string;
  questionType: string;
  answer?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  marks: number;
}

interface TestData {
  submissionId: number;
  testId: number;
  studentId: string;
  attemptNumber: number;
  answers: any[] | null;
  obtainedMarks: number;
  percentage: number;
  status: string;
  submittedAt: string | null;
  createdAt: string;
  test: {
    title: string;
    description: string | null;
    totalMarks: number;
    durationMinutes: number;
    startTime: string;
    endTime: string;
    maxAttempts: number;
    isPublished: boolean;
    courseCode: string;
    questionDetails: QuestionDetail[];
  };
  teacher: {
    teacherId: string;
    teacherName: string;
  } | null;
}

interface Answer {
  questionId: number;
  selectedAnswer: string;
}

export default function TestAttemptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const submissionId = searchParams.get("submissionId");

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const studentId =
    user?.studentId ||
    (typeof window !== "undefined" && localStorage.getItem("studentId")) ||
    "";
  const studentName =
    user?.name ||
    (typeof window !== "undefined"
      ? localStorage.getItem("studentName")
      : null) ||
    "Student";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cp_token") : "";

  useEffect(() => {
    if (submissionId && token && studentId) {
      fetchTest();
    }
  }, [submissionId, token, studentId]);

  useEffect(() => {
    if (
      test &&
      timeRemaining > 0 &&
      !isSubmitted &&
      test.status !== "SUBMITTED"
    ) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [test, isSubmitted]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowQuestionPalette(true);
      } else {
        setShowQuestionPalette(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `${API_BASE}${TEST_PATHS.getTestsByStudent(studentId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const testsArray = Array.isArray(res.data.tests) ? res.data.tests : [];
      const foundTest = testsArray.find(
        (t: TestData) => String(t.submissionId) === String(submissionId),
      );
      if (!foundTest) {
        setError("Test not found");
        return;
      }
      setTest(foundTest);

      if (foundTest.answers && Array.isArray(foundTest.answers)) {
        setAnswers(foundTest.answers);
      }

      if (foundTest.status === "SUBMITTED" || foundTest.status === "GRADED") {
        setIsSubmitted(true);
      } else {
        const durationSeconds = foundTest.test.durationMinutes * 60;
        setTimeRemaining(durationSeconds);
      }
    } catch (err: any) {
      console.error("Failed to fetch test:", err);
      setError(err.response?.data?.message || "Failed to load test.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (
    questionId: number,
    value: string,
    optionLabel?: string,
  ) => {
    const question = questions.find((q) => q.id === questionId);

    let selectedValue: string;

    if (question?.questionType === "MCQ" && optionLabel) {
      selectedValue = optionLabel;
    } else {
      selectedValue = value;
    }

    const existingIndex = answers.findIndex((a) => a.questionId === questionId);
    if (existingIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId, selectedAnswer: selectedValue };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId, selectedAnswer: selectedValue }]);
    }
  };

  const getAnswerForQuestion = (questionId: number): string | undefined => {
    const answer = answers.find((a) => a.questionId === questionId);
    return answer?.selectedAnswer;
  };

  const getAnswerTextForDisplay = (questionId: number): string => {
    const question = questions.find((q) => q.id === questionId);
    const selectedValue = getAnswerForQuestion(questionId);

    if (!question || !selectedValue) return "";

    if (question.questionType === "MCQ") {
      const optionMap: Record<string, string> = {
        A: question.optionA || "",
        B: question.optionB || "",
        C: question.optionC || "",
        D: question.optionD || "",
      };
      return optionMap[selectedValue] || selectedValue;
    }
    return selectedValue;
  };

  const handleAutoSubmit = async () => {
    await submitTest();
  };

  const submitTest = async () => {
    if (!submissionId || !token) return;
    try {
      setSubmitting(true);

      const formattedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
      }));

      // console.log("Submitting answers:", JSON.stringify(formattedAnswers));

      await axios.post(
        `${API_BASE}${TEST_PATHS.submitTest}`,
        {
          submissionId: parseInt(submissionId),
          answers: formattedAnswers,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setIsSubmitted(true);
      alert("Test submitted successfully!");
      fetchTest();
    } catch (err: any) {
      console.error("Failed to submit test:", err);
      alert(err.response?.data?.message || "Failed to submit test.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isAnswerCorrect = (
    question: QuestionDetail,
    selectedValue: string | undefined,
  ): boolean => {
    if (!selectedValue) return false;

    if (question.questionType === "MCQ") {
      const correctLetter = question.answer || "";
      return selectedValue.toUpperCase() === correctLetter.toUpperCase();
    } else {
      return (
        selectedValue.trim().toLowerCase() ===
        (question.answer || "").trim().toLowerCase()
      );
    }
  };

  const getCorrectAnswerLetter = (question: QuestionDetail): string => {
    return question.answer || "";
  };

  const getCorrectAnswerText = (question: QuestionDetail): string => {
    if (question.questionType === "MCQ") {
      const letter = question.answer || "";
      const optionMap: Record<string, string> = {
        A: question.optionA || "",
        B: question.optionB || "",
        C: question.optionC || "",
        D: question.optionD || "",
      };
      return optionMap[letter.toUpperCase()] || letter;
    }
    return question.answer || "";
  };

  const scrollToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    if (questionRefs.current[index]) {
      questionRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-blue-400/30 border-t-blue-400 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-10 w-10 text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="text-blue-200 font-medium text-xl">
            Loading your test...
          </p>
          <p className="text-sm text-blue-400/60 mt-2">
            Please wait while we prepare your exam
          </p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-lg w-full shadow-2xl border-0 overflow-hidden rounded-2xl">
          <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <CardContent className="p-10 text-center">
            <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-14 w-14 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Test Not Found
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              {error || "Unable to load the test. Please try again."}
            </p>
            <Button
              onClick={() => router.push("/tests")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = test.test.questionDetails || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = answers.length;
  const maxMarks = test.test.totalMarks || 0;

  // Guard: Don't render if no questions
  if (!currentQuestion) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-lg w-full shadow-2xl border-0 overflow-hidden rounded-2xl">
          <CardContent className="p-10 text-center">
            <div className="w-28 h-28 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-14 w-14 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No Questions
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              This test has no questions available.
            </p>
            <Button
              onClick={() => router.push("/tests")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results View
  if (isSubmitted) {
    const totalMarks = test.obtainedMarks || 0;
    const maxMarks = test.test.totalMarks || 0;
    const percentage = test.percentage || 0;
    const correctCount = answers.filter((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      if (!question) return false;
      return isAnswerCorrect(question, a.selectedAnswer);
    }).length;

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50">
        {/* Professional Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 shadow-lg sticky top-0 z-10">
          <div className="w-full px-4 lg:px-8 py-3 lg:py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 lg:gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/tests")}
                  className="text-slate-600 hover:bg-slate-100 p-2 lg:px-4"
                >
                  <ArrowLeft className="h-5 w-5 lg:mr-2" />
                  <span className="hidden lg:inline">Exit</span>
                </Button>
                <div className="h-8 w-px bg-slate-300 hidden lg:block"></div>
                <div className="min-w-0">
                  <h1 className="font-bold text-gray-900 text-lg lg:text-xl truncate">
                    {test.test.title}
                  </h1>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <BarChart3 className="h-3 w-3" />
                    Results Summary • Attempt #{test.attemptNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-8">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Your Score</p>
                  <p
                    className={`text-2xl lg:text-4xl font-bold ${percentage >= 50 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {totalMarks}{" "}
                    <span className="text-lg lg:text-xl text-slate-400">
                      / {maxMarks}
                    </span>
                  </p>
                </div>
                <div className="w-14 h-14 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-xl lg:text-2xl font-bold text-white">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 lg:px-8 py-6 lg:py-10">
          <div className="flex flex-col xl:flex-row gap-6 xl:gap-10">
            {/* Stats Cards */}
            <div className="xl:w-72 flex-shrink-0">
              <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-lg rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-emerald-600 font-medium">
                          Correct
                        </p>
                        <p className="text-2xl font-bold text-emerald-700">
                          {correctCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white shadow-lg rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-red-600 font-medium">
                          Incorrect
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {questions.length - correctCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 border-slate-200 bg-white shadow-lg rounded-2xl col-span-2 xl:col-span-1">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 font-medium">
                          Total Questions
                        </p>
                        <p className="text-2xl font-bold text-slate-700">
                          {questions.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Question Navigation */}
              <Card className="mt-4 border-0 shadow-xl overflow-hidden rounded-2xl">
                <CardHeader className="border-b bg-slate-50 p-4">
                  <h3 className="font-semibold text-gray-900">Questions</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    <span className="text-emerald-600 font-semibold">
                      {correctCount}
                    </span>{" "}
                    Correct /
                    <span className="text-slate-700 font-semibold">
                      {" "}
                      {questions.length}
                    </span>{" "}
                    Total
                  </p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {questions.map((q, index) => {
                      const studentAns = getAnswerForQuestion(q.id);
                      const isCorrect = isAnswerCorrect(q, studentAns);
                      const isCurrent = index === currentQuestionIndex;
                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={`
                            w-9 h-9 lg:w-10 lg:h-10 rounded-lg text-sm font-medium transition-all
                            ${isCurrent ? "ring-2 ring-indigo-600 ring-offset-2" : ""}
                            ${
                              studentAns
                                ? isCorrect
                                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500 hover:bg-emerald-200"
                                  : "bg-red-100 text-red-700 border-2 border-red-500 hover:bg-red-200"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent"
                            }
                          `}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Display */}
            <div className="flex-1">
              <Card
                className={`border-2 shadow-2xl overflow-hidden transition-all rounded-2xl ${
                  isAnswerCorrect(
                    currentQuestion,
                    getAnswerForQuestion(currentQuestion.id),
                  )
                    ? "border-emerald-500"
                    : getAnswerForQuestion(currentQuestion.id)
                      ? "border-red-500"
                      : "border-slate-200"
                }`}
              >
                <CardHeader className="border-b bg-slate-50 p-5 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <Badge
                        variant="outline"
                        className="text-base px-4 py-1.5 bg-white border-2"
                      >
                        Q{currentQuestionIndex + 1}
                      </Badge>
                      {getAnswerForQuestion(currentQuestion.id) &&
                        (isAnswerCorrect(
                          currentQuestion,
                          getAnswerForQuestion(currentQuestion.id),
                        ) ? (
                          <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1.5">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 px-3 py-1.5">
                            <XCircle className="h-4 w-4 mr-1" />
                            Incorrect
                          </Badge>
                        ))}
                    </div>
                    <Badge
                      variant="secondary"
                      className="px-4 py-1.5 w-fit text-base"
                    >
                      {currentQuestion.marks}{" "}
                      {currentQuestion.marks === 1 ? "Mark" : "Marks"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 lg:p-10">
                  {/* Question Text */}
                  <div className="mb-6 lg:mb-10">
                    <h2 className="text-lg lg:text-2xl font-medium text-gray-900 leading-relaxed">
                      {currentQuestion.questionText}
                    </h2>
                  </div>

                  {/* Options */}
                  {currentQuestion.questionType === "MCQ" ? (
                    <div className="space-y-3 lg:space-y-4">
                      {[
                        {
                          key: "optionA",
                          label: "A",
                          value: currentQuestion.optionA,
                        },
                        {
                          key: "optionB",
                          label: "B",
                          value: currentQuestion.optionB,
                        },
                        {
                          key: "optionC",
                          label: "C",
                          value: currentQuestion.optionC,
                        },
                        {
                          key: "optionD",
                          label: "D",
                          value: currentQuestion.optionD,
                        },
                      ].map(({ key, label, value }) => {
                        const isSelected =
                          getAnswerForQuestion(currentQuestion.id) === label;
                        const isCorrect =
                          getCorrectAnswerLetter(
                            currentQuestion,
                          ).toUpperCase() === label;
                        if (!value) return null;

                        let optionClass = "border-slate-200";
                        if (isCorrect)
                          optionClass = "border-emerald-500 bg-emerald-50";
                        else if (isSelected && !isCorrect)
                          optionClass = "border-red-500 bg-red-50";

                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-4 p-4 lg:p-6 border-2 rounded-xl transition-all ${optionClass}`}
                          >
                            <div
                              className={`
                              w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0
                              ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : isSelected
                                    ? "bg-red-600 text-white"
                                    : "bg-slate-200 text-slate-700"
                              }
                            `}
                            >
                              {label}
                            </div>
                            <span className="text-gray-800 flex-1 text-base lg:text-lg">
                              {value}
                            </span>
                            {isCorrect && (
                              <CheckCircle2 className="h-6 w-6 lg:h-7 lg:w-7 text-emerald-600 flex-shrink-0" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="h-6 w-6 lg:h-7 lg:w-7 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4 lg:space-y-6">
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2 lg:mb-3">
                          Your Answer:
                        </p>
                        <div
                          className={`p-4 lg:p-6 border-2 rounded-xl text-base lg:text-lg ${
                            isAnswerCorrect(
                              currentQuestion,
                              getAnswerForQuestion(currentQuestion.id),
                            )
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-red-500 bg-red-50"
                          }`}
                        >
                          <p className="text-gray-900 break-words">
                            {getAnswerTextForDisplay(currentQuestion.id) ||
                              "No answer provided"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2 lg:mb-3">
                          Correct Answer:
                        </p>
                        <div className="p-4 lg:p-6 border-2 border-emerald-500 bg-emerald-50 rounded-xl">
                          <p className="text-gray-900 text-base lg:text-lg break-words">
                            {getCorrectAnswerText(currentQuestion) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-5 lg:mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="px-6 lg:px-8 py-3 text-base border-2"
                >
                  <ChevronLeft className="h-5 w-5 lg:mr-2" />
                  <span className="hidden lg:inline">Previous</span>
                  <span className="lg:hidden">Prev</span>
                </Button>
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1),
                    )
                  }
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-6 lg:px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base"
                >
                  <span className="hidden lg:inline">Next</span>
                  <span className="lg:hidden">Next</span>
                  <ChevronRight className="h-5 w-5 lg:ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Professional Test Taking View
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Professional Exam Header */}
      <div className="bg-white/98 backdrop-blur-md border-b-2 border-blue-500/30 shadow-2xl sticky top-0 z-20">
        <div className="w-full px-3 lg:px-6 py-2 lg:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/tests")}
                className="text-slate-600 hover:bg-slate-100 p-2 sm:px-4"
              >
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
              <div className="h-8 w-px bg-slate-300 hidden sm:block"></div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <h1 className="font-bold text-slate-900 text-sm sm:text-lg truncate max-w-[180px] sm:max-w-[300px] lg:max-w-none">
                  {test.test.title}
                </h1>
                <p className="text-xs text-slate-500 flex items-center gap-1 sm:gap-2">
                  <Target className="h-3 w-3" />
                  <span>Mentor Hub • Practice Test</span>
                </p>
              </div>

              {/* Student Info - Desktop */}
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {studentName}
                  </p>
                  <p className="text-xs text-slate-500">ID: {studentId}</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
              {/* Test Info Pills */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {questions.length} Qs
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Trophy className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {maxMarks} Marks
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-3 lg:px-5 py-2 rounded-xl ${timeRemaining < 300 ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-100 text-blue-700"}`}
              >
                <Timer className="h-4 w-4 lg:h-5 lg:w-5" />
                <span className="font-mono font-bold text-sm lg:text-xl">
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                onClick={submitTest}
                disabled={submitting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-3 sm:px-6 py-2 rounded-xl text-sm sm:text-base shadow-lg"
              >
                {submitting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Submit</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 sm:mt-4">
            <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">
              <span className="flex items-center gap-1 sm:gap-2">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  Progress: {answeredCount}/{questions.length}
                </span>
              </span>
              <span className="hidden sm:inline">
                {Math.round((answeredCount / questions.length) * 100)}% Complete
              </span>
              <span className="sm:hidden">
                {Math.round((answeredCount / questions.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                style={{
                  width: `${(answeredCount / questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{studentName}</p>
                  <p className="text-xs text-slate-500">ID: {studentId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs">Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <span className="text-xs">Not Visited</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = answers.some((a) => a.questionId === q.id);
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => scrollToQuestion(index)}
                      className={`
                        w-10 h-10 rounded-lg text-sm font-medium transition-all
                        ${isCurrent ? "ring-2 ring-indigo-600 ring-offset-2" : ""}
                        ${
                          isAnswered
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-3 lg:px-6 py-4 lg:py-8">
        <div className="flex flex-col xl:flex-row gap-5 lg:gap-8">
          {/* Question Navigation Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
            <Card className="sticky top-28 border-0 shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                <h3 className="font-semibold text-slate-900 text-lg">
                  Question Palette
                </h3>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-lg"></div>
                    <span className="text-sm text-slate-600">
                      Answered ({answeredCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded-lg"></div>
                    <span className="text-sm text-slate-600">
                      Not Answered ({questions.length - answeredCount})
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-5 gap-3">
                  {questions.map((q, index) => {
                    const isAnswered = answers.some(
                      (a) => a.questionId === q.id,
                    );
                    const isCurrent = index === currentQuestionIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                          w-11 h-11 rounded-xl text-base font-medium transition-all transform hover:scale-105
                          ${isCurrent ? "ring-2 ring-indigo-600 ring-offset-2" : ""}
                          ${
                            isAnswered
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md"
                              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Display */}
          <div className="flex-1">
            <Card className="border-2 border-blue-100/50 bg-white/95 backdrop-blur shadow-2xl overflow-hidden rounded-2xl">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-5 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge
                      variant="outline"
                      className="text-base px-4 py-1.5 bg-white border-2 border-blue-200"
                    >
                      Question {currentQuestionIndex + 1}
                    </Badge>
                    <Badge
                      className={
                        currentQuestion.questionType === "MCQ"
                          ? "bg-blue-100 text-blue-700 px-3 py-1.5"
                          : "bg-purple-100 text-purple-700 px-3 py-1.5"
                      }
                    >
                      {currentQuestion.questionType === "MCQ"
                        ? "MCQ"
                        : "Descriptive"}
                    </Badge>
                  </div>
                  <Badge
                    variant="secondary"
                    className="px-4 py-1.5 w-fit text-base bg-slate-100"
                  >
                    {currentQuestion.marks}{" "}
                    {currentQuestion.marks === 1 ? "Mark" : "Marks"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 lg:p-10">
                {/* Question Text */}
                <div className="mb-6 lg:mb-10">
                  <h2 className="text-lg lg:text-2xl font-medium text-slate-900 leading-relaxed">
                    {currentQuestion.questionText}
                  </h2>
                </div>

                {/* Options */}
                {currentQuestion.questionType === "MCQ" ? (
                  <div className="space-y-3 lg:space-y-4">
                    {[
                      {
                        key: "optionA",
                        label: "A",
                        value: currentQuestion.optionA,
                      },
                      {
                        key: "optionB",
                        label: "B",
                        value: currentQuestion.optionB,
                      },
                      {
                        key: "optionC",
                        label: "C",
                        value: currentQuestion.optionC,
                      },
                      {
                        key: "optionD",
                        label: "D",
                        value: currentQuestion.optionD,
                      },
                    ].map(({ key, label, value }) => {
                      const isSelected =
                        getAnswerForQuestion(currentQuestion.id) === label;
                      if (!value) return null;

                      return (
                        <label
                          key={key}
                          className={`
                            flex items-center gap-4 p-4 lg:p-6 border-2 rounded-xl cursor-pointer transition-all
                            ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/80 shadow-lg transform scale-[1.01]"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-md"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={value}
                            checked={isSelected}
                            onChange={() =>
                              handleAnswerChange(
                                currentQuestion.id,
                                value,
                                label,
                              )
                            }
                            className="sr-only"
                          />
                          <div
                            className={`
                            w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0
                            ${
                              isSelected
                                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }
                          `}
                          >
                            {label}
                          </div>
                          <span className="text-slate-800 flex-1 text-base lg:text-lg">
                            {value}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="h-6 w-6 lg:h-7 lg:w-7 text-blue-600 flex-shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={getAnswerForQuestion(currentQuestion.id) || ""}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      placeholder="Type your answer here..."
                      className="w-full p-4 lg:p-6 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[180px] lg:min-h-[220px] text-base lg:text-lg resize-y bg-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-5 lg:mt-8">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
                className="px-6 lg:px-10 py-3 border-2 text-base hover:bg-slate-50"
              >
                <ChevronLeft className="h-5 w-5 lg:mr-2" />
                <span className="hidden lg:inline">Previous</span>
                <span className="lg:hidden">Prev</span>
              </Button>

              {/* Question Numbers for Tablet */}
              <div className="hidden md:flex lg:hidden items-center gap-1 overflow-x-auto max-w-[300px] px-2">
                {questions.map((_, index) => {
                  const isAnswered = answers.some(
                    (a) => a.questionId === questions[index].id,
                  );
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`
                        w-9 h-9 rounded-lg text-xs font-medium transition-all flex-shrink-0
                        ${isCurrent ? "ring-2 ring-indigo-600 ring-offset-2" : ""}
                        ${
                          isAnswered
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1),
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-6 lg:px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base shadow-lg"
              >
                <span className="hidden lg:inline">Next</span>
                <span className="lg:hidden">Next</span>
                <ChevronRight className="h-5 w-5 lg:ml-2" />
              </Button>
            </div>

            {/* Mobile Question Palette Toggle */}
            <div className="lg:hidden mt-5">
              <Button
                variant="outline"
                onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                className="w-full py-4 border-2 border-blue-200 bg-white hover:bg-blue-50 text-base font-medium"
              >
                <Grid className="h-5 w-5 mr-2" />
                {showQuestionPalette ? "Hide" : "Show"} Question Palette
                <span className="ml-2 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                  {answeredCount}/{questions.length}
                </span>
              </Button>

              {showQuestionPalette && (
                <Card className="mt-4 border-2 border-blue-100 shadow-xl rounded-xl">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, index) => {
                        const isAnswered = answers.some(
                          (a) => a.questionId === q.id,
                        );
                        const isCurrent = index === currentQuestionIndex;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentQuestionIndex(index);
                              setShowQuestionPalette(false);
                            }}
                            className={`
                              w-12 h-12 rounded-xl text-base font-medium transition-all
                              ${isCurrent ? "ring-2 ring-indigo-600 ring-offset-2" : ""}
                              ${
                                isAnswered
                                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }
                            `}
                          >
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t-2 border-blue-100 shadow-2xl p-3 z-10">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-medium">
                {answeredCount} answered
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <span className="text-xs font-medium">
                {questions.length - answeredCount} left
              </span>
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-600">
            {Math.round((answeredCount / questions.length) * 100)}% Complete
          </p>
        </div>
      </div>
    </div>
  );
}
