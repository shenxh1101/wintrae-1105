import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import HomePage from "@/pages/HomePage";
import CoursesPage from "@/pages/CoursesPage";
import CourseDetailPage from "@/pages/CourseDetailPage";
import TrainingPage from "@/pages/TrainingPage";
import RecordsPage from "@/pages/RecordsPage";
import PetsPage from "@/pages/PetsPage";
import AddPetPage from "@/pages/AddPetPage";
import RemindersPage from "@/pages/RemindersPage";
import WeeklyReviewPage from "@/pages/WeeklyReviewPage";
import FamilyPage from "@/pages/FamilyPage";
import RecordDetailPage from "@/pages/RecordDetailPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 有底部导航的页面 */}
        <Route path="/" element={
          <PageLayout>
            <HomePage />
          </PageLayout>
        } />
        <Route path="/courses" element={
          <PageLayout>
            <CoursesPage />
          </PageLayout>
        } />
        <Route path="/records" element={
          <PageLayout>
            <RecordsPage />
          </PageLayout>
        } />
        <Route path="/pets" element={
          <PageLayout>
            <PetsPage />
          </PageLayout>
        } />
        <Route path="/reminders" element={
          <PageLayout>
            <RemindersPage />
          </PageLayout>
        } />

        {/* 无底部导航的页面 */}
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/training/:id" element={<TrainingPage />} />
        <Route path="/pets/add" element={<AddPetPage />} />
        <Route path="/weekly-review" element={<WeeklyReviewPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
      </Routes>
    </Router>
  );
}
