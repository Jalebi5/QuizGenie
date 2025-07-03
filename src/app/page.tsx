import { BookOpenCheck, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "AI-Powered Quizzes",
    description: "Upload your notes or book pages, and let our AI generate challenging quizzes for you in seconds.",
  },
  {
    icon: <Settings className="h-8 w-8 text-primary" />,
    title: "Customize Everything",
    description: "Fine-tune your quizzes with advanced settings for difficulty, question types, timers, and more.",
  },
  {
    icon: <BookOpenCheck className="h-8 w-8 text-primary" />,
    title: "Review and Revise",
    description: "Track your progress, review your answers with detailed explanations, and retake incorrect questions.",
  },
];

export default function Home() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center">
      <div className="max-w-4xl w-full">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 bg-gradient-to-r from-primary via-blue-500 to-accent inline-block text-transparent bg-clip-text">
              The Ultimate BookQuiz Genie
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Transform any document into a dynamic learning experience. Upload, generate, and conquer your exams with AI-powered quizzes tailored just for you.
            </p>
            <Button asChild size="lg" className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow">
              <Link href="/upload">Get Started Now</Link>
            </Button>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-secondary/50 rounded-xl">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold font-headline mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center transform hover:-translate-y-2 transition-transform duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
