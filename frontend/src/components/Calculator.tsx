import { useState } from "react";

type Course = { id: number; name: string; units: string; score: string };

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

const Calculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", units: "", score: "" },
  ]);
  const [gpa, setGpa] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const handleAddCourse = () =>
    setCourses([
      ...courses,
      { id: Date.now(), name: "", units: "", score: "" },
    ]);

  const handleCourseChange = (
    id: number,
    field: keyof Omit<Course, "id">,
    value: string
  ) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveCourse = (id: number) => {
    if (courses.length > 1) setCourses(courses.filter((c) => c.id !== id));
  };

  const calculateGPA = () => {
    setError("");
    let totalQualityPoints = 0,
      totalUnits = 0;
    for (const course of courses) {
      const units = parseInt(course.units),
        score = parseInt(course.score);
      if (
        isNaN(units) ||
        isNaN(score) ||
        units <= 0 ||
        score < 0 ||
        score > 100
      ) {
        setError(
          "Please fill all fields correctly. Units must be positive and score between 0-100."
        );
        setGpa(null);
        return;
      }
      totalQualityPoints += getGradePoint(score) * units;
      totalUnits += units;
    }
    if (totalUnits === 0) {
      setError("Cannot calculate GPA with zero units.");
      setGpa(null);
      return;
    }
    setGpa((totalQualityPoints / totalUnits).toFixed(2));
  };

  const handleReset = () => {
    setCourses([{ id: 1, name: "", units: "", score: "" }]);
    setGpa(null);
    setError("");
  };

  const getGPAColor = (gpaValue: string) => {
    const gpaNum = parseFloat(gpaValue);
    if (gpaNum >= 4.5) return "from-emerald-500 to-green-600";
    if (gpaNum >= 3.5) return "from-blue-500 to-cyan-600";
    if (gpaNum >= 2.5) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-600";
  };

  const totalUnits = courses.reduce((sum, course) => {
    const units = parseInt(course.units) || 0;
    return sum + units;
  }, 0);

  return (
    <section id="calculator" className="relative py-20 px-4 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-30 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-30 animate-float animation-delay-2000"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-medium mb-6">
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Smart GPA Calculator
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent">
            Calculate Your GPA
            <span className="block text-2xl md:text-3xl font-normal text-slate-600 mt-2">
              Instantly & Accurately
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Enter your course details below and watch your GPA calculate in
            real-time with our AI-powered system.
          </p>
        </div>

        {/* Course inputs */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-purple-500/10 border border-white/50">
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
                Course Details
              </h3>
              <div className="text-right">
                <div className="text-sm text-slate-500">Total Units</div>
                <div className="text-2xl font-bold text-purple-600">
                  {totalUnits}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 px-2">
                <div className="col-span-5">Course Code</div>
                <div className="col-span-2">Units</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-2">Grade</div>
                <div className="col-span-1"></div>
              </div>

              {courses.map((course, index) => {
                const score = parseInt(course.score) || 0;
                const gradeLetter = course.score ? getGradeLetter(score) : "";

                return (
                  <div
                    key={course.id}
                    className="group bg-gradient-to-r from-white to-slate-50 rounded-2xl p-4 border border-slate-200/50 hover:border-purple-300/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Course name */}
                      <div className="md:col-span-5">
                        <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden">
                          Course Code
                        </label>
                        <input
                          type="text"
                          placeholder={`Course ${index + 1} (e.g. MTH 101)`}
                          value={course.name}
                          onChange={(e) =>
                            handleCourseChange(
                              course.id,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80"
                        />
                      </div>

                      {/* Units */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden">
                          Units
                        </label>
                        <input
                          type="number"
                          placeholder="Units"
                          value={course.units}
                          onChange={(e) =>
                            handleCourseChange(
                              course.id,
                              "units",
                              e.target.value
                            )
                          }
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80"
                          min="1"
                          max="10"
                        />
                      </div>

                      {/* Score */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden">
                          Score
                        </label>
                        <input
                          type="number"
                          placeholder="Score"
                          value={course.score}
                          onChange={(e) =>
                            handleCourseChange(
                              course.id,
                              "score",
                              e.target.value
                            )
                          }
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80"
                          min="0"
                          max="100"
                        />
                      </div>

                      {/* Grade display */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1 md:hidden">
                          Grade
                        </label>
                        <div className="flex items-center justify-center h-12">
                          {gradeLetter && (
                            <div
                              className={`px-3 py-1 rounded-lg text-white font-bold text-lg ${
                                gradeLetter === "A"
                                  ? "bg-green-500"
                                  : gradeLetter === "B"
                                  ? "bg-blue-500"
                                  : gradeLetter === "C"
                                  ? "bg-yellow-500"
                                  : gradeLetter === "D"
                                  ? "bg-orange-500"
                                  : gradeLetter === "E"
                                  ? "bg-red-400"
                                  : "bg-red-600"
                              }`}
                            >
                              {gradeLetter}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remove button */}
                      <div className="md:col-span-1 flex justify-center">
                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          disabled={courses.length === 1}
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
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={handleAddCourse}
                className="group flex items-center justify-center px-8 py-4 text-purple-600 border-2 border-purple-300 rounded-2xl hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300"
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
                Add Course
              </button>

              <button
                onClick={calculateGPA}
                className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300"
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
                  Calculate GPA
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* GPA Result */}
        {gpa !== null && (
          <div className="mt-12 max-w-lg mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center overflow-hidden relative">
              {/* Animated background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${getGPAColor(
                  gpa
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
                    gpa
                  )} mb-6`}
                >
                  <p className="font-bold text-6xl md:text-7xl text-white mb-2">
                    {gpa}
                  </p>
                  <p className="text-white/90 text-lg">out of 5.0</p>
                </div>

                <div className="text-sm text-slate-500 mb-6">
                  Based on{" "}
                  {courses.filter((c) => c.name && c.units && c.score).length}{" "}
                  courses • {totalUnits} total units
                </div>

                <button
                  onClick={handleReset}
                  className="group px-8 py-3 text-slate-600 border-2 border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 font-medium"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Calculate Again
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default Calculator;
