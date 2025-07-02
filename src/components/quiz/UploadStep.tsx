"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { handleExtractText } from "@/lib/actions";

export default function UploadStep() {
  const router = useRouter();
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a JPG, PNG, or PDF file.",
        });
        return;
      }
      
      setIsExtracting(true);

      try {
        const photoDataUri = await fileToDataUri(file);
        const result = await handleExtractText({ photoDataUri });

        if (result.success && result.data) {
          sessionStorage.setItem("documentText", result.data.text);
          toast({
            title: "Text Extracted",
            description: "Text has been successfully extracted from your document.",
          });
          router.push('/review');
        } else {
          throw new Error(result.error || "Failed to extract text.");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Extraction Failed",
          description: "Could not extract text from the document. Please try again.",
        });
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Step 1: Upload Your Pages</CardTitle>
          <CardDescription>
            Drag & drop or click to select your book pages or notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          >
            {isExtracting ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Extracting text...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                <p>Drag & drop images, or click to select</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground pt-4">
          <p>Powered by Google Gemini.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
