import React, { useState } from 'react';

// Define a type for a single course
type Course = {
  id: number;
  name: string;
  units: string; // Use string to handle empty inputs
  score: string;
};

// --- Helper Function: Converts score to grade points (Nigerian Uni Scale) ---
const getGradePoint = (score: number): number => {
  if (score >= 70) return 5.0;
  if (score >= 60) return 4.0;
  if (score >= 50) return 3.0;
  if (score >= 45) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
};

// --- Component Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  calculatorSection: {
    padding: '80px 20px',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '36px',
    color: '#212121',
    marginBottom: '16px',
  },
  subheading: {
    fontSize: '18px',
    color: '#757575',
    marginBottom: '40px',
  },
  courseList: {
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'left',
  },
  courseRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  input: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '16px',
    padding: '12px',
    border: '1px solid #BDBDBD',
    borderRadius: '6px',
    flex: 1,
  },
  nameInput: { flex: 2 },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  primaryButton: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#1E88E5',
    color: 'white',
    padding: '14px 28px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  secondaryButton: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: 'transparent',
    color: '#1E88E5',
    border: '2px solid #1E88E5',
    padding: '12px 26px',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  removeButton: {
    backgroundColor: '#EF5350',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '16px',
    cursor: 'pointer',
    lineHeight: '30px',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: '40px',
    padding: '30px',
    backgroundColor: '#E8F5E9', // Light green background
    border: '1px solid #43A047',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '40px auto 0',
  },
  gpaText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '48px',
    fontWeight: 700,
    color: '#43A047', // Success Green
  },
  gpaLabel: {
    fontSize: '18px',
    color: '#2E7D32',
  },
  errorMessage: {
    color: '#D32F2F',
    marginTop: '20px',
  },
};

const Calculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: '', units: '', score: '' },
  ]);
  const [gpa, setGpa] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: courses.length + 1,
      name: '',
      units: '',
      score: '',
    };
    setCourses([...courses, newCourse]);
  };

  const handleCourseChange = (id: number, field: keyof Omit<Course, 'id'>, value: string) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const handleRemoveCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter((course) => course.id !== id));
    }
  };

  const calculateGPA = () => {
    setError('');
    let totalQualityPoints = 0;
    let totalUnits = 0;

    for (const course of courses) {
      const units = parseInt(course.units, 10);
      const score = parseInt(course.score, 10);

      if (isNaN(units) || isNaN(score) || units <= 0 || score < 0 || score > 100) {
        setError('Please fill all fields correctly. Units must be positive and score between 0-100.');
        setGpa(null);
        return;
      }

      totalQualityPoints += getGradePoint(score) * units;
      totalUnits += units;
    }

    if (totalUnits === 0) {
      setError('Cannot calculate GPA with zero units.');
      setGpa(null);
      return;
    }

    const finalGpa = (totalQualityPoints / totalUnits).toFixed(2);
    setGpa(finalGpa);
  };
  
  const handleReset = () => {
    setCourses([{ id: 1, name: '', units: '', score: '' }]);
    setGpa(null);
    setError('');
  };


  return (
    <section id="calculator" style={styles.calculatorSection}>
      <h2 style={styles.heading}>Instant GPA Calculator</h2>
      <p style={styles.subheading}>Enter your course details below to see your GPA in real-time.</p>

      <div style={styles.courseList}>
        {courses.map((course) => (
          <div key={course.id} style={styles.courseRow}>
            <input
              type="text"
              placeholder={`Course Code (e.g. MTH 101)`}
              value={course.name}
              onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
              style={{ ...styles.input, ...styles.nameInput }}
            />
            <input
              type="number"
              placeholder="Units"
              value={course.units}
              onChange={(e) => handleCourseChange(course.id, 'units', e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Score (0-100)"
              value={course.score}
              onChange={(e) => handleCourseChange(course.id, 'score', e.target.value)}
              style={styles.input}
            />
            <button
              onClick={() => handleRemoveCourse(course.id)}
              style={styles.removeButton}
              aria-label="Remove Course"
            >
              -
            </button>
          </div>
        ))}
      </div>

      <div style={styles.actionButtons}>
        <button onClick={handleAddCourse} style={styles.secondaryButton}>
          + Add Course
        </button>
        <button onClick={calculateGPA} style={styles.primaryButton}>
          Calculate GPA
        </button>
      </div>
      
      {error && <p style={styles.errorMessage}>{error}</p>}

      {gpa !== null && (
        <div style={styles.resultContainer}>
          <p style={styles.gpaLabel}>Your Cumulative GPA is</p>
          <p style={styles.gpaText}>{gpa}</p>
          <button onClick={handleReset} style={{...styles.secondaryButton, borderColor: '#FFC107', color: '#FFC107'}}>
            Calculate Again
          </button>
        </div>
      )}
    </section>
  );
};

export default Calculator;