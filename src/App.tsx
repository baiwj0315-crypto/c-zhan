import { Navigate, Route, Routes } from "react-router-dom";
import { StudyProvider } from "@/components/study-provider";
import { HomePage } from "@/pages/Home";
import { LearnPage } from "@/pages/Learn";
import { QuizPage } from "@/pages/Quiz";
import { WrongsPage } from "@/pages/Wrongs";
import { MePage } from "@/pages/Me";

export default function App() {
  return (
    <StudyProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/wrongs" element={<WrongsPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StudyProvider>
  );
}
