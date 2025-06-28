import React from 'react';

// Define styles based on your style guide for a clean, modern look
const styles: { [key: string]: React.CSSProperties } = {
  heroContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '120px 20px',
    backgroundColor: '#FFFFFF', // A clean white background for the hero to stand out
    borderBottom: '1px solid #E0E0E0',
  },
  mainHeading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '48px',
    fontWeight: 700,
    color: '#212121', // Dark Text
    lineHeight: '1.2',
    maxWidth: '800px',
    marginBottom: '16px',
  },
  aiPoweredText: {
    color: '#1E88E5', // Primary Tech Blue
  },
  subHeading: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '20px',
    color: '#757575', // Light Text
    maxWidth: '600px',
    marginBottom: '32px',
  },
  ctaButton: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: '18px',
    backgroundColor: '#1E88E5', // Primary Tech Blue
    color: '#FFFFFF',
    padding: '16px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
};

// A little trick for the hover effect without needing a CSS file
const handleMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.backgroundColor = '#1565C0'; // A darker blue on hover
  e.currentTarget.style.transform = 'translateY(-2px)';
};

const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.currentTarget.style.backgroundColor = '#1E88E5'; // Back to primary blue
  e.currentTarget.style.transform = 'translateY(0)';
};

const Hero = () => {
  return (
    <section style={styles.heroContainer}>
      <h1 style={styles.mainHeading}>
        Your Smart GPA Calculator —{' '}
        <span style={styles.aiPoweredText}>Powered by AI</span>
      </h1>
      <p style={styles.subHeading}>
        GPA tracking made effortless. Instantly calculate your GPA without the stress.
      </p>
      <a
        href="#calculator" // This will scroll to the section with id="calculator"
        style={styles.ctaButton}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        Start Calculating Now
      </a>
    </section>
  );
};

export default Hero;