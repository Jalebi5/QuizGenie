import ResultsClient from "@/components/quiz/ResultsClient";
import { Suspense } from "react";

export default function ResultsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Suspense fallback={<div>Loading Results...</div>}>
        <ResultsClient />
      </Suspense>
    </div>
  );
}
