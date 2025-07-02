import HistoryClient from "@/components/quiz/HistoryClient";

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold font-headline mb-6">Quiz History</h1>
      <HistoryClient />
    </div>
  );
}
