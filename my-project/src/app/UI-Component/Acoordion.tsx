"use client";

import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";

const AccordionDemo = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <Accordion.Root
      className="w-full max-w-md rounded-sm border border-slate-700 bg-slate-800 shadow-2xl"
      type="single"
      defaultValue="item-1"
      collapsible
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger>Is it unstyled?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s unstyled by default, giving you freedom over the look
          and feel.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>Can it be animated?</AccordionTrigger>
        <AccordionContent>
          Yes! You can animate the Accordion with CSS or JavaScript.
        </AccordionContent>
      </AccordionItem>
    </Accordion.Root>
  </div>
);

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof Accordion.Item>,
  React.ComponentPropsWithoutRef<typeof Accordion.Item>
>(function AccordionItem({ children, className, ...props }, forwardedRef) {
  return (
    <Accordion.Item
      className={`border-b border-slate-700 first:rounded-t-lg last:rounded-b-lg last:border-b-0 focus-within:relative focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none ${className || ""}`}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  );
});

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof Accordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof Accordion.Trigger>
>(function AccordionTrigger({ children, className, ...props }, forwardedRef) {
  return (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={`group flex h-14 flex-1 cursor-pointer items-center justify-between px-5 text-left text-base font-semibold text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-none ${className || ""}`}
        {...props}
        ref={forwardedRef}
      >
        {children}
        <motion.div
          animate={{ rotate: undefined }}
          className="transition-transform duration-300"
          initial={false}
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={20}
            className="text-slate-400 transition-transform duration-300 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </motion.div>
      </Accordion.Trigger>
    </Accordion.Header>
  );
});

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof Accordion.Content>,
  React.ComponentPropsWithoutRef<typeof Accordion.Content>
>(function AccordionContent({ children, className, ...props }, forwardedRef) {
  return (
    <Accordion.Content
      className={`data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown overflow-hidden ${className || ""}`}
      {...props}
      ref={forwardedRef}
      asChild
    >
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-slate-700/50 px-5 py-4 text-slate-300"
      >
        {children}
      </motion.div>
    </Accordion.Content>
  );
});

export default AccordionDemo;
