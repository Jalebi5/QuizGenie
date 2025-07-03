import QuizClient from "@/components/quiz/QuizClient";
import { Suspense } from "react";

export default function QuizPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading Quiz...</div>}>
        <QuizClient />
      </Suspense>
    </div>
  );
}
