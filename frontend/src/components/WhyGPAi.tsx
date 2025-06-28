import React from "react";

// Define styles based on your style guide
const styles: { [key: string]: React.CSSProperties } = {
  section: {
    backgroundColor: "#F5F5F5", // Soft Light Grey background
    padding: "80px 20px",
    textAlign: "center",
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "36px",
    color: "#212121",
    marginBottom: "40px",
  },
  featuresGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    flexWrap: "wrap", // Allows cards to stack on smaller screens
    maxWidth: "1000px",
    margin: "0 auto",
  },
  featureCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    flex: 1,
    minWidth: "280px", // Ensures cards don't get too squished
    textAlign: "center",
  },
  icon: {
    fontSize: "48px",
    color: "#43A047", // Fresh Green
    marginBottom: "20px",
  },
  cardTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "22px",
    color: "#212121",
    marginBottom: "10px",
  },
  cardText: {
    fontSize: "16px",
    color: "#757575",
    lineHeight: "1.6",
  },
};

const WhyGPAi = () => {
  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>Why Choose GPAi?</h2>
      <div style={styles.featuresGrid}>
        <div style={styles.featureCard}>
          <div style={styles.icon}>✅</div>
          <h3 style={styles.cardTitle}>No-Stress Calculation</h3>
          <p style={styles.cardText}>
            A clean, simple interface designed to give you instant and accurate
            GPA results without any confusion.
          </p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.icon}>🧠</div>
          <h3 style={styles.cardTitle}>Smart AI Suggestions</h3>
          <p style={styles.cardText}>
            Our upcoming AI will provide insights to help you improve your
            grades and plan your academic journey.
          </p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.icon}>📈</div>
          <h3 style={styles.cardTitle}>Track Your Progress</h3>
          <p style={styles.cardText}>
            The future WhatsApp bot will allow you to save your history and
            track your GPA semester by semester.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyGPAi;
