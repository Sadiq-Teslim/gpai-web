import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  section: {
    backgroundColor: "#1E88E5", // Primary Blue
    color: "white",
    padding: "60px 20px",
    textAlign: "center",
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "32px",
    marginBottom: "16px",
    fontWeight: 700,
  },
  subheading: {
    fontSize: "18px",
    opacity: 0.9,
    maxWidth: "600px",
    margin: "0 auto",
  },
  highlight: {
    backgroundColor: "#FFC107", // Accent Amber/Yellow
    color: "#212121",
    padding: "2px 8px",
    borderRadius: "4px",
    fontWeight: 700,
  },
};

const SneakPeek = () => {
  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>Something Big is Coming...</h2>
      <p style={styles.subheading}>
        The full <span style={styles.highlight}>GPAi WhatsApp Bot</span> is
        launching soon, bringing AI-powered academic support right to your
        chats. Stay tuned!
      </p>
    </section>
  );
};

export default SneakPeek;
