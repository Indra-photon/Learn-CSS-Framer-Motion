"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Cancel01Icon,
  HelpSquareIcon,
} from "@hugeicons/core-free-icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { QUESTION_FORMS, type QuestionDraft } from "./forms";
import {
  Divider,
  FADE,
  Section,
  SPRING,
  TypeSummary,
  TypeTile,
} from "./primitives";
import {
  QUESTION_TYPES,
  getQuestionType,
  type QuestionTypeId,
} from "./question-types";

type View = "picker" | QuestionTypeId;

export function QuestionDialog({
  children,
  open,
  onOpenChange,
  onAddQuestion,
}: {
  /** Optional trigger. Omit it and drive the dialog with `open`. */
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAddQuestion?: (draft: QuestionDraft) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [view, setView] = useState<View>("picker");

  // The measured element is *inside* the animated one, so its height is always
  // the natural height of the current view and never chases its own animation.
  const [contentRef, bounds] = useMeasure();

  const isOpen = open ?? uncontrolledOpen;
  const isPicker = view === "picker";

  function handleOpenChange(next: boolean) {
    onOpenChange?.(next);
    if (open === undefined) setUncontrolledOpen(next);
    // Reset only after the close animation, so the last screen doesn't flash
    // back to the picker on the way out.
    if (!next) window.setTimeout(() => setView("picker"), 180);
  }

  function handleSubmit(draft: QuestionDraft) {
    onAddQuestion?.(draft);
    handleOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent
        showCloseButton={false}
        className="bg-card block gap-0 overflow-hidden rounded-[28px] border-none p-0 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28)] ring-black/5 sm:max-w-[min(700px,calc(100%-2rem))]"
      >
        <DialogTitle className="sr-only">Add Question</DialogTitle>
        <DialogDescription className="sr-only">
          Ask guests custom questions when they register.
        </DialogDescription>

        <MotionConfig reducedMotion="user">
          <motion.div
            initial={false}
            animate={{
              height: bounds.height || "auto",
              transition: {
                duration: 0.27,
                ease: [0.25, 1, 0.5, 1],
              },
            }}
          >
            <div ref={contentRef} className="">
              {/* ---- persistent chrome: lives outside AnimatePresence so the
                   corner element can morph rather than crossfade ---- */}
              <header className="relative flex items-start justify-between px-7 pt-6">
                <motion.button
                  layoutId="question-dialog-corner"
                  transition={SPRING}
                  type="button"
                  // Disabled rather than aria-hidden: on the picker it is just
                  // a badge, and a hidden-but-focusable control fails a11y.
                  disabled={isPicker}
                  aria-label="Back to question types"
                  onClick={() => setView("picker")}
                  className={cn(
                    "bg-muted text-muted-foreground z-10 flex shrink-0 items-center justify-center outline-none",
                    isPicker
                      ? "size-14 cursor-default rounded-[20px]"
                      : "hover:bg-accent hover:text-foreground focus-visible:ring-foreground/15 size-8 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-0",
                  )}
                >
                  {/* `layout` here counter-scales the glyph while the box morphs. */}
                  <motion.span
                    layout
                    transition={SPRING}
                    className="flex items-center justify-center"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isPicker ? "add" : "back"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="flex"
                      >
                        <HugeiconsIcon
                          icon={isPicker ? HelpSquareIcon : ArrowLeft01Icon}
                          size={isPicker ? 28 : 17}
                          strokeWidth={1.7}
                        />
                      </motion.span>
                    </AnimatePresence>
                  </motion.span>
                </motion.button>

                <AnimatePresence initial={false}>
                  {!isPicker && (
                    <motion.span
                      key="step-title"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={FADE}
                      className="text-foreground pointer-events-none absolute inset-x-20 top-6 flex h-8 items-center justify-center text-[17px] font-semibold"
                    >
                      Add Question
                    </motion.span>
                  )}
                </AnimatePresence>

                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-foreground/15 z-10 rounded-full focus-visible:ring-2 focus-visible:ring-offset-0"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={16}
                      strokeWidth={2.2}
                    />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </header>

              {/* ---- swapping body ---- */}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  key={view}
                  transition={{
                    duration: 0.27,
                    ease: [0.26, 0.08, 0.25, 1],
                  }}
                >
                  {isPicker ? (
                    <Section className="pt-4 pb-5">
                      <h2 className="text-foreground text-[26px] leading-tight font-bold tracking-tight">
                        Add Question
                      </h2>
                      <p className="text-muted-foreground mt-1.5 text-[15px]">
                        Ask guests custom questions when they register.
                      </p>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {QUESTION_TYPES.map((type) => (
                          <TypeTile
                            key={type.id}
                            type={type}
                            onSelect={() => setView(type.id)}
                          />
                        ))}
                      </div>
                    </Section>
                  ) : (
                    <StepView typeId={view} onSubmit={handleSubmit} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      </DialogContent>
    </Dialog>
  );
}

/** Everything below the header for a single question type. */
function StepView({
  typeId,
  onSubmit,
}: {
  typeId: QuestionTypeId;
  onSubmit: (draft: QuestionDraft) => void;
}) {
  const type = getQuestionType(typeId);
  const Form = QUESTION_FORMS[typeId];

  return (
    <>
      <Section className="pt-4 pb-4">
        <TypeSummary type={type} />
      </Section>
      <Divider />
      <Form type={type} onSubmit={onSubmit} />
    </>
  );
}
