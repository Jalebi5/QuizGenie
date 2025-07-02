import QuizClient from "@/components/quiz/QuizClient";
import { Suspense } from "react";

export default function QuizPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<div>Loading Quiz...</div>}>
        <QuizClient />
      </Suspense>
    </div>
  );
}
