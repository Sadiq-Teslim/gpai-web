import { useState } from "react";

// --- Type Definitions ---
type Course = { id: number; name: string; units: string; score: string };
type Semester = { id: number; name: string; courses: Course[] };

// --- Helper Functions ---
const getGradePoint = (score: number): number => {
  if (score >= 70) return 5.0;
  if (score >= 60) return 4.0;
  if (score >= 50) return 3.0;
  if (score >= 45) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
};
const getGradeLetter = (score: number): string => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
};
const calculateGPAForCourses = (courses: Course[]): string | null => {
  let totalQualityPoints = 0,
    totalUnits = 0;
  for (const course of courses) {
    const units = parseInt(course.units),
      score = parseInt(course.score);
    if (
      !isNaN(units) &&
      !isNaN(score) &&
      units > 0 &&
      score >= 0 &&
      score <= 100
    ) {
      totalQualityPoints += getGradePoint(score) * units;
      totalUnits += units;
    }
  }
  return totalUnits > 0 ? (totalQualityPoints / totalUnits).toFixed(2) : null;
};
const getGPAColor = (gpaValue: string) => {
  const gpaNum = parseFloat(gpaValue);
  if (gpaNum >= 4.5) return "from-emerald-500 to-green-600";
  if (gpaNum >= 3.5) return "from-blue-500 to-cyan-600";
  if (gpaNum >= 2.5) return "from-yellow-500 to-orange-500";
  return "from-red-500 to-pink-600";
};

// --- CourseRow Component (Extracted for reusability) ---
type CourseRowProps = {
  course: Course;
  index: number;
  onCourseChange: (field: keyof Omit<Course, "id">, value: string) => void;
  onRemoveCourse: () => void;
  isRemoveDisabled: boolean;
};
const CourseRow = ({
  course,
  index,
  onCourseChange,
  onRemoveCourse,
  isRemoveDisabled,
}: CourseRowProps) => {
  const score = parseInt(course.score);
  const gradeLetter =
    course.score && !isNaN(score) ? getGradeLetter(score) : "";
  return (
    <div className="group bg-gradient-to-r from-white to-slate-50 rounded-2xl p-4 border border-slate-200/50 hover:border-purple-300/50 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
        <div className="md:col-span-5 mb-4 md:mb-0">
          <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden">
            Course Code
          </label>
          <input
            type="text"
            placeholder={`Course ${index + 1}`}
            value={course.name}
            onChange={(e) => onCourseChange("name", e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80"
          />
        </div>
        <div className="flex items-center gap-2 md:contents">
          <div className="flex-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden text-center">
              Units
            </label>
            <input
              type="number"
              placeholder="Units"
              value={course.units}
              onChange={(e) => onCourseChange("units", e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80"
              min="1"
              max="10"
            />
          </div>
          <div className="flex-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden text-center">
              Score
            </label>
            <input
              type="number"
              placeholder="Score"
              value={course.score}
              onChange={(e) => onCourseChange("score", e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80"
              min="0"
              max="100"
            />
          </div>
          <div className="flex-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden text-center">
              Grade
            </label>
            <div className="flex items-center justify-center h-12">
              {gradeLetter && (
                <div
                  className={`px-3 py-1 rounded-lg text-white font-bold text-lg ${
                    getGradeLetter(score) === "A"
                      ? "bg-green-500"
                      : getGradeLetter(score) === "B"
                      ? "bg-blue-500"
                      : getGradeLetter(score) === "C"
                      ? "bg-yellow-500"
                      : getGradeLetter(score) === "D"
                      ? "bg-orange-500"
                      : getGradeLetter(score) === "E"
                      ? "bg-red-400"
                      : "bg-red-600"
                  }`}
                >
                  {gradeLetter}
                </div>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 md:col-span-1 flex justify-center">
            <button
              onClick={onRemoveCourse}
              disabled={isRemoveDisabled}
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main SemesterCalculator Component ---
const SemesterCalculator = () => {
  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: 1,
      name: "First Semester",
      courses: [{ id: 1, name: "", units: "", score: "" }],
    },
  ]);
  const [cgpa, setCgpa] = useState<string | null>(null);

  const addSemester = () => {
    setSemesters([
      ...semesters,
      {
        id: Date.now(),
        name: `Semester ${semesters.length + 1}`,
        courses: [{ id: 1, name: "", units: "", score: "" }],
      },
    ]);
  };
  const handleSemesterNameChange = (semesterId: number, newName: string) => {
    setSemesters(
      semesters.map((s) => (s.id === semesterId ? { ...s, name: newName } : s))
    );
  };
  const addCourseToSemester = (semesterId: number) => {
    setSemesters(
      semesters.map((s) =>
        s.id === semesterId
          ? {
              ...s,
              courses: [
                ...s.courses,
                { id: Date.now(), name: "", units: "", score: "" },
              ],
            }
          : s
      )
    );
  };
  const handleCourseChange = (
    semesterId: number,
    courseId: number,
    field: keyof Omit<Course, "id">,
    value: string
  ) => {
    setSemesters(
      semesters.map((s) =>
        s.id === semesterId
          ? {
              ...s,
              courses: s.courses.map((c) =>
                c.id === courseId ? { ...c, [field]: value } : c
              ),
            }
          : s
      )
    );
  };
  const removeCourseFromSemester = (semesterId: number, courseId: number) => {
    setSemesters(
      semesters.map((s) =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      )
    );
  };

  const calculateCGPA = () => {
    const allCourses = semesters.flatMap((s) => s.courses);
    const result = calculateGPAForCourses(allCourses);
    setCgpa(result);
  };

  const allCourses = semesters.flatMap((s) => s.courses);
  const totalUnits = allCourses.reduce(
    (sum, course) => sum + (parseInt(course.units) || 0),
    0
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 sm:p-8 shadow-2xl shadow-purple-500/10 border border-white/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <svg
            className="w-6 h-6 mr-3 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          Semester Tracking
        </h3>
        <div className="text-right">
          <div className="text-sm text-slate-500">Total Units</div>
          <div className="text-2xl font-bold text-purple-600">{totalUnits}</div>
        </div>
      </div>

      <div className="space-y-6">
        {semesters.map((semester) => (
          <details
            key={semester.id}
            className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200"
            open
          >
            <summary className="font-bold text-xl cursor-pointer text-gray-700 flex justify-between items-center">
              <input
                type="text"
                value={semester.name}
                onChange={(e) =>
                  handleSemesterNameChange(semester.id, e.target.value)
                }
                className="bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded-md p-1"
              />
              <span className="text-base font-medium text-slate-500">
                SGP:{" "}
                <span className="font-bold text-slate-700">
                  {calculateGPAForCourses(semester.courses) || "N/A"}
                </span>
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 px-2">
                <div className="col-span-5">Course Code</div>
                <div className="col-span-2 text-center">Units</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Grade</div>
                <div className="col-span-1"></div>
              </div>
              {semester.courses.map((course, index) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  index={index}
                  onCourseChange={(field, value) =>
                    handleCourseChange(semester.id, course.id, field, value)
                  }
                  onRemoveCourse={() =>
                    removeCourseFromSemester(semester.id, course.id)
                  }
                  isRemoveDisabled={semester.courses.length === 1}
                />
              ))}
              <button
                onClick={() => addCourseToSemester(semester.id)}
                className="w-full mt-2 py-2 text-purple-600 border-2 border-dashed border-purple-300 rounded-xl hover:bg-purple-50 font-medium"
              >
                + Add Course to Semester
              </button>
            </div>
          </details>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <button
          onClick={addSemester}
          className="group flex items-center justify-center px-8 py-4 text-purple-600 border-2 border-purple-300 rounded-2xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Semester
        </button>
        <button
          onClick={calculateCGPA}
          className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-xl"
        >
          <span className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2 group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Calculate CGPA
          </span>
        </button>
      </div>

      {cgpa && (
        <div className="mt-12 max-w-lg mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center overflow-hidden relative">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getGPAColor(
                cgpa
              )} opacity-5`}
            ></div>
            <div className="relative z-10">
              <div className="mb-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-medium mb-4">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Calculation Complete
                </div>
              </div>
              <p className="text-lg text-slate-600 mb-2">
                Your Cumulative GPA is
              </p>
              <div
                className={`inline-block p-6 rounded-2xl bg-gradient-to-r ${getGPAColor(
                  cgpa
                )} mb-6`}
              >
                <p className="font-bold text-6xl md:text-7xl text-white mb-2">
                  {cgpa}
                </p>
                <p className="text-white/90 text-lg">out of 5.0</p>
              </div>
              <div className="text-sm text-slate-500 mb-6">
                Based on{" "}
                {allCourses.filter((c) => c.name && c.units && c.score).length}{" "}
                courses • {totalUnits} total units
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterCalculator;
