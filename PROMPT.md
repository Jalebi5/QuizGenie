
# Prompt for Building an AI-Powered Quiz Generation App

## High-Level Goal

Create a modern, responsive web application called "QuizGenius" using Next.js and ShadCN/UI. The core functionality is to allow users to upload documents (images or PDFs), from which the app will use AI to extract text and generate a highly customizable, interactive quiz.

## Core Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **UI Library:** ShadCN/UI components
- **Styling:** Tailwind CSS
- **AI Integration:** Genkit with Google's Gemini models
- **State Management:** React Context API for the multi-step quiz creation process.
- **Icons:** `lucide-react`
- **Data Persistence:** Browser `localStorage` for quiz history.

---

## Detailed Feature Breakdown

### 1. Multi-Step User Flow for Quiz Creation

The main user journey is a 5-step process. A custom React hook `useQuizCreation` (using Context) should manage the state (uploaded files, extracted text, quiz configuration, quiz data, and results) across this entire flow.

-   **Step 1: Upload (`/upload`)**
    -   A component (`UploadStep`) with a drag-and-drop area for file uploads.
    -   Supports multiple files (PDFs, JPGs, PNGs).
    -   Shows a list of uploaded files with the ability to remove individual files or clear all.
    -   When the user proceeds, the app sends the files (as Base64 data URIs) to an AI flow to extract text.
    -   Show a loading state during text extraction.

-   **Step 2: Review & Edit Text (`/review`)**
    -   A component (`ReviewStep`) displays the extracted text in a large `<textarea>`.
    -   The user can edit the text.
    -   **Crucially**, the user can highlight a specific portion of the text. If text is highlighted, the quiz will be generated only from that selection. Otherwise, it uses the full text.
    -   The UI should indicate how many characters are selected.

-   **Step 3: Configure Quiz (`/configure`)**
    -   A component (`ConfigureStep`) with a form for quiz settings, organized into "Basic" and "Advanced" sections within an accordion.
    -   **Basic Settings:**
        -   Number of Questions (e.g., 5, 10, 20).
        -   Timing Style:
            -   "Per Question" (with a dropdown for seconds: 15, 30, 45, etc.).
            -   "Timed Challenge" (an input for total minutes).
    -   **Advanced Settings:**
        -   Difficulty Level (e.g., Easy, Medium, Hard).
        -   Question Type Focus (e.g., Facts & Figures, Concepts, Cause & Effect).
        -   Keyword Focus (a text input for comma-separated keywords).
        -   Explanation Delivery (show after each question or only on the final results page).
    -   On submission, the app calls the `generateQuiz` AI flow with the text and configurations. Show a loading state while the quiz is being generated.

-   **Step 4: Take the Quiz (`/quiz`)**
    -   A component (`QuizClient`) that presents the generated quiz one question at a time.
    -   Display a progress bar and the current question number (e.g., "Question 3 of 10").
    -   If timed, display the countdown timer.
    -   The UI must be clean, modern, and fully responsive, correctly wrapping long answer text without breaking the layout.
    -   When an answer is selected, provide immediate visual feedback if the user configured it that way (e.g., green for correct, red for incorrect).
    -   If an explanation is available and configured for immediate display, show it.
    -   Include an "Explain Like I'm 5" button that calls an AI flow to simplify the explanation.
    -   Provide "Next" and "Previous" buttons for navigation.
    -   On the last question, the "Next" button becomes a "Submit" button, which shows a confirmation dialog before finishing.

-   **Step 5: View Results (`/results`)**
    -   A component (`ResultsClient`) that displays after quiz submission.
    -   Show a success message (with confetti) for high scores (>60%) or an encouraging message for lower scores.
    -   Display key stats in cards: Accuracy %, Score (e.g., 8/10), and Topic.
    -   Provide a filterable (`all`, `correct`, `incorrect`) accordion to review each question, the user's answer, the correct answer, and the detailed explanation.
    -   Include a "Retake Incorrect" button that starts a new quiz with only the questions the user got wrong.
    -   Include a "Download PDF" button that uses `window.print()` to generate a printable version of the results.

### 2. General App Layout & Features

-   **Main Layout (`AppLayout`):**
    -   A collapsible sidebar for navigation (`Home`, `New Quiz`, `History`). The sidebar should be responsive, becoming a slide-out sheet on mobile.
    -   A header with a trigger for the mobile sidebar and a `ThemeSwitcher`.
-   **Theme Switcher:**
    -   Allow users to switch between `light`, `dark`, and `high-contrast` modes. The choice should be saved to `localStorage`.
-   **History Page (`/history`)**
    -   A component (`HistoryClient`) that retrieves quiz history from `localStorage`.
    -   Display history in a responsive layout: a table on desktop and a list of cards on mobile.
    -   Each entry should show the date, topic, and score.
    -   Provide buttons to "Review" or "Retake" each quiz from history.

---

## 3. Genkit AI Flows

Define and implement the following server-side AI flows using Genkit and Zod for schema validation.

-   **`extractTextFromImage`**
    -   **Input:** `{ photoDataUris: z.array(z.string()) }` (array of Base64 data URIs).
    -   **Output:** `{ text: z.string() }`.
    -   **Prompt:** Instruct Gemini to act as an OCR expert and extract all text from the provided images, concatenating the results.

-   **`generateQuiz`**
    -   **Input Schema:** `GenerateQuizInputSchema`
        -   `documentText: z.string()`
        -   `numberOfQuestions: z.number()`
        -   `optionsPerQuestion: z.number()` (default to 4)
        -   `enrichExplanations: z.boolean()`
        -   `difficulty: z.enum(["easy", "medium", "hard"])`
        -   `questionType: z.enum(["any", "facts", "concepts", "cause_effect"])`
        -   `keywords: z.string().optional()`
    -   **Output Schema:** `GenerateQuizOutputSchema`
        -   `quiz: z.array(z.object({ question: z.string(), options: z.array(z.string()), correctAnswerIndex: z.number(), explanation: z.string().optional() }))`
    -   **Prompt:** Instruct Gemini to act as an expert quiz generator. Use all the input parameters to craft a high-quality quiz from the `documentText`. Emphasize returning the data in the exact JSON format defined by the output schema.

-   **`simplifyExplanation`**
    -   **Input:** `{ textToSimplify: z.string() }`
    -   **Output:** `{ simplifiedText: z.string() }`
    -   **Prompt:** Instruct Gemini to explain the input text in simple terms, as if explaining to a 5-year-old.

---

## 4. Final Polish & Error Handling

-   Ensure all client-server communication (calling Genkit flows) has robust loading and error states handled with `try/catch` blocks.
-   Use `sonner` or a similar toast component to display user-facing error messages.
-   Pay close attention to solving React hydration errors by ensuring server-rendered and client-rendered HTML match, especially for components that depend on client-side information like screen size (`useIsMobile` hook).
-   Ensure all UI components are fully responsive and visually appealing on all screen sizes. Text should wrap correctly and not overflow containers.
