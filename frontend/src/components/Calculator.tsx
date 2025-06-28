import React, { useState } from "react";

type Course = { id: number; name: string; units: string; score: string };

const getGradePoint = (score: number): number => {
  if (score >= 70) return 5.0;
  if (score >= 60) return 4.0;
  if (score >= 50) return 3.0;
  if (score >= 45) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
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

  return (
    <section id="calculator" className="bg-white py-20 px-4">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Instant GPA Calculator
        </h2>
        <p className="text-lg text-light-text mb-10">
          Enter your course details below to see your GPA in real-time.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-2 md:gap-4">
            <input
              type="text"
              placeholder="Course Code (e.g. MTH 101)"
              value={course.name}
              onChange={(e) =>
                handleCourseChange(course.id, "name", e.target.value)
              }
              className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Units"
              value={course.units}
              onChange={(e) =>
                handleCourseChange(course.id, "units", e.target.value)
              }
              className="w-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Score"
              value={course.score}
              onChange={(e) =>
                handleCourseChange(course.id, "score", e.target.value)
              }
              className="w-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={() => handleRemoveCourse(course.id)}
              className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full font-bold text-lg hover:bg-red-600 transition-colors"
            >
              -
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleAddCourse}
          className="font-poppins text-primary border-2 border-primary px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
        >
          + Add Course
        </button>
        <button
          onClick={calculateGPA}
          className="font-poppins bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Calculate GPA
        </button>
      </div>

      {error && <p className="text-center text-red-600 mt-6">{error}</p>}

      {gpa !== null && (
        <div className="mt-12 max-w-md mx-auto p-8 bg-green-50 border border-secondary rounded-lg text-center">
          <p className="text-lg text-green-800">Your Cumulative GPA is</p>
          <p className="font-poppins font-bold text-6xl text-secondary my-2">
            {gpa}
          </p>
          <button
            onClick={handleReset}
            className="font-poppins text-accent border-2 border-accent px-6 py-2 rounded-lg hover:bg-yellow-50 transition-colors mt-4"
          >
            Calculate Again
          </button>
        </div>
      )}
    </section>
  );
};

export default Calculator;
