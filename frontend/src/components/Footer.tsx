import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    backgroundColor: "#212121", // Dark Text color for background
    color: "#BDBDBD",
    padding: "30px 20px",
    textAlign: "center",
    fontSize: "14px",
  },
  link: {
    color: "#F5F5F5",
    textDecoration: "none",
    margin: "0 10px",
  },
};

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>© {new Date().getFullYear()} GPAi. All Rights Reserved.</p>
      <div>
        <a href="#hero" style={styles.link}>
          Home
        </a>
        <a href="mailto:sadiqadetola08@gmail.com" style={styles.link}>
          Contact
        </a>
        {/* Add social links here if you want */}
      </div>
    </footer>
  );
};

export default Footer;
