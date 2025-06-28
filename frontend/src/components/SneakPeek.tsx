import React from "react";

const SneakPeek = () => {
  return (
    <section
      id="sneak-peek"
      className="bg-primary text-white text-center py-16 px-4"
    >
      <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
        Something Big is Coming...
      </h2>
      <p className="text-lg max-w-2xl mx-auto opacity-90">
        The full{" "}
        <span className="bg-accent text-dark-text font-bold px-2 py-1 rounded">
          GPAi WhatsApp Bot
        </span>{" "}
        is launching soon, bringing AI support right to your chats!
      </p>
    </section>
  );
};
export default SneakPeek;
