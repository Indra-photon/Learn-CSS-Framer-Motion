"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { QuestionDialog } from "../components/question-dialog/QuestionDialog";
import type { QuestionDraft } from "../components/question-dialog/forms";
import { getQuestionType } from "../components/question-dialog/question-types";

export default function QuestionDialogPage() {
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/40 p-6">
      <div className="w-full max-w-md space-y-3">
        <h1 className="text-lg font-semibold text-foreground">Registration</h1>
        <p className="text-sm text-muted-foreground">
          Guests answer the following questions when they register for the event.
        </p>

        {questions.length > 0 && (
          <ul className="space-y-2 pt-2">
            {questions.map((question, index) => {
              const type = getQuestionType(question.type);
              return (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
                >
                  <HugeiconsIcon
                    icon={type.icon}
                    size={20}
                    strokeWidth={1.6}
                    className="text-muted-foreground"
                  />
                  <span className="truncate text-sm text-foreground">
                    {question.question || `Untitled ${type.label} question`}
                  </span>
                  {question.required && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      Required
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <QuestionDialog
          onAddQuestion={(draft) =>
            setQuestions((current) => [...current, draft])
          }
        >
          <Button
            variant="outline"
            className="h-11 w-full rounded-2xl focus-visible:ring-2 focus-visible:ring-foreground/15 focus-visible:ring-offset-0"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
            Add Question
          </Button>
        </QuestionDialog>
      </div>
    </main>
  );
}
