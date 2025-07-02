import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-grow items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-8 text-center">
            <Sparkles className="h-16 w-16 mx-auto text-primary mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              Turn Any Book into a Quiz!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Snap a photo of your notes or a book page, and I'll magically
              generate a practice quiz for you.
            </p>
            <Button asChild size="lg">
              <Link href="/upload">Let's Get Started</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
