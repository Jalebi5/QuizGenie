import ResultsClient from "@/components/quiz/ResultsClient";
import { Suspense } from "react";

export default function ResultsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading Results...</div>}>
        <ResultsClient />
      </Suspense>
    </div>
  );
}
