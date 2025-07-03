"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, CheckCircle, FileText } from "lucide-react";

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
import { Button } from "../ui/button";

export default function UploadStep() {
  const router = useRouter();
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          return true;
        }
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: `Skipping ${file.name}. Please upload JPG, PNG, or PDF files.`,
        });
        return false;
      });
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const processFiles = async () => {
      if(uploadedFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "No Files",
          description: "Please upload at least one file.",
        });
        return;
      }
      
      setIsExtracting(true);

      try {
        const photoDataUris = await Promise.all(uploadedFiles.map(fileToDataUri));
        const result = await handleExtractText({ photoDataUris });

        if (result.success && result.data) {
          sessionStorage.setItem("documentText", result.data.text);
          toast({
            title: "Text Extracted",
            description: "Text has been successfully extracted from your documents.",
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
        setIsExtracting(false);
      }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  }
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files) {
          handleFileChange({ target: { files: e.dataTransfer.files } } as any);
      }
  }


  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Step 1: Upload Your Pages</CardTitle>
          <CardDescription>
            Drag & drop or click to select your book pages or notes. You can upload multiple files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
          />
          <div
            onClick={handleUploadClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          >
            {isExtracting ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Extracting text from {uploadedFiles.length} file(s)...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                <p>Drag & drop images, or click to select</p>
              </div>
            )}
          </div>
          {uploadedFiles.length > 0 && !isExtracting && (
            <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Selected files:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {uploadedFiles.map((file, index) => (
                        <li key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{file.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-4 items-center justify-center pt-4">
          {uploadedFiles.length > 0 && !isExtracting && (
            <Button onClick={processFiles} size="lg" className="w-full">
                <CheckCircle /> Extract Text from {uploadedFiles.length} file(s)
            </Button>
          )}
          <p className="text-sm text-muted-foreground">Powered by Google Gemini.</p>
        </CardFooter>
      </Card>
    </div>
  );
}