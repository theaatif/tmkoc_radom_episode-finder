"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Question {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export function TriviaSection() {
  const questions: Question[] = [
    {
      question: "What is the name of Aatmaram Bhide Master's beloved green scooter?",
      options: ["Cheetak", "Sakharam", "Dhanno", "Basanti"],
      answerIndex: 1,
      explanation: "Bhide treats his green scooter Sakharam like a family member, polishing it daily and keeping it covered!",
    },
    {
      question: "Which breakfast dish is Jethalal absolutely obsessed with?",
      options: ["Dhokla", "Khandvi", "Jalebi Fafda", "Poha"],
      answerIndex: 2,
      explanation: "Sunday mornings are incomplete for Jethalal without a fresh batch of hot Jalebi Fafda from Gada Sweets.",
    },
    {
      question: "Where does Jethalal's mischievous brother-in-law Sundar Lal live?",
      options: ["Baroda", "Ahmedabad", "Surat", "Rajkot"],
      answerIndex: 1,
      explanation: "Sundar lives in Ahmedabad and frequently visits Mumbai, almost always charging his heavy taxi fares directly to Jethalal.",
    },
    {
      question: "What is the famous catchphrase of Gokuldham's beloved Inspector Chalu Pandey?",
      options: [
        "Daya Darwaza Todo",
        "Hum hain Inspector Chalu Pandey, jhoot bologe toh padenge dande!",
        "Gokuldham ka niyam hai",
        "Chai-pani milega?"
      ],
      answerIndex: 1,
      explanation: "Inspector Chalu Pandey is known for his strict posture, quick action, and his legendary rhyming catchphrase.",
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleOptionClick = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(optionIdx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || isSubmitted) return;
    setIsSubmitted(true);
    if (selectedIdx === questions[currentIdx].answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIdx(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const currentQuestion = questions[currentIdx];

  return (
    <section className="w-full py-16 md:py-24 px-6 sm:px-8 max-w-4xl mx-auto flex flex-col space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
          TRIVIA CHALLENGE
        </span>
        <h2 className="font-display text-3xl md:text-5xl text-ink font-semibold tracking-[-0.02em] mt-3">
          Gokuldham Trivia Corner
        </h2>
        <p className="text-sm text-muted-text mt-2 font-normal">
          Test your TMKOC knowledge! Are you a true fan or just a casual viewer?
        </p>
      </div>

      <div className="bg-brand-white border border-slate-200/50 rounded-clay-xl p-8 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden min-h-[420px] flex flex-col justify-between">
        {/* Background Decors */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-brand-yellow/5 blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {!quizFinished ? (
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 flex-1 flex flex-col justify-between z-10"
            >
              {/* Question Header & Scorecard */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-xs font-bold text-ink uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                  Score: {score}
                </span>
              </div>

              {/* Question Text */}
              <h3 className="text-lg md:text-xl font-bold text-ink leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-3.5 my-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrect = idx === currentQuestion.answerIndex;
                  
                  let optionStyles = "border-slate-200 hover:border-brand-cyan hover:bg-slate-50 text-ink";
                  if (isSelected && !isSubmitted) {
                    optionStyles = "border-brand-cyan bg-brand-cyan/5 text-brand-cyan font-semibold";
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      optionStyles = "border-green-500 bg-green-50 text-green-700 font-bold shadow-[0_2px_8px_rgba(34,197,94,0.1)]";
                    } else if (isSelected) {
                      optionStyles = "border-red-500 bg-red-50 text-red-700 font-semibold";
                    } else {
                      optionStyles = "border-slate-100 bg-slate-50/55 text-muted-text opacity-70";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-clay-md border text-sm transition-all duration-150 cursor-pointer ${optionStyles} flex items-center justify-between`}
                    >
                      <span>{option}</span>
                      {isSubmitted && isCorrect && <span className="text-green-600 font-bold">✓</span>}
                      {isSubmitted && isSelected && !isCorrect && <span className="text-red-600 font-bold">✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Action Row */}
              <div className="pt-4 border-t border-slate-100 flex flex-col space-y-4">
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-clay-md text-xs sm:text-sm text-body leading-relaxed"
                  >
                    <span className="font-bold text-brand-cyan">Fact check: </span>
                    {currentQuestion.explanation}
                  </motion.div>
                )}

                <div className="flex justify-end">
                  {!isSubmitted ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedIdx === null}
                      variant="cyan"
                      className="px-6 font-bold text-xs"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="cyan"
                      className="px-6 font-bold text-xs"
                    >
                      {currentIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 flex flex-col items-center justify-center space-y-6 z-10 flex-1"
            >
              <div className="text-5xl">🏆</div>
              <div>
                <h3 className="text-2xl font-bold text-ink">Quiz Completed!</h3>
                <p className="text-sm text-muted-text mt-2 font-normal">
                  You scored <span className="font-bold text-brand-cyan">{score}</span> out of <span className="font-bold">{questions.length}</span>.
                </p>
                <p className="text-xs text-body-text mt-4 max-w-sm mx-auto font-normal leading-relaxed">
                  {score === questions.length 
                    ? "Wow! You are a certified Gokuldham resident. Champak Chacha would be proud!" 
                    : score >= 2 
                    ? "Not bad! You watch TMKOC regularly, but Jethalal thinks you need to pay more attention."
                    : "Aiyyo! You need to watch more random episodes to brush up your knowledge!"}
                </p>
              </div>

              <Button
                onClick={handleRestart}
                variant="cyan"
                className="px-8 font-bold text-xs"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
