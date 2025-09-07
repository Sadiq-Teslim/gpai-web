/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

const UnsubscribePage = () => {
  // useSearchParams is the perfect React Router hook to read URL parameters
  const [searchParams] = useSearchParams();

  // State to manage the process
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const API_URL =
    "https://gpai-server-e7ar.onrender.com/api/newsletter/unsubscribe";

  // This useEffect hook runs automatically when the page loads
  useEffect(() => {
    const performUnsubscribe = async (email: string) => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        // The API returns 404 if the email isn't found, which is a success for the user
        if (response.ok || response.status === 404) {
          setIsError(false);
          setMessage(
            "You have been successfully unsubscribed. You will no longer receive emails from us."
          );
        } else {
          throw new Error(data.message || "An unknown error occurred.");
        }
      } catch (error: any) {
        setIsError(true);
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const token = searchParams.get("token");

    if (!token) {
      setIsError(true);
      setMessage("Invalid unsubscribe link. No token provided.");
      setIsLoading(false);
      return;
    }

    try {
      // Decode the Base64 token to get the user's email
      const decodedEmail = atob(token);
      setMessage(`Unsubscribing ${decodedEmail}...`);
      performUnsubscribe(decodedEmail);
    } catch (error) {
      setIsError(true);
      setMessage("Invalid or corrupted unsubscribe token.");
      setIsLoading(false);
    }
  }, [searchParams]); // The empty dependency array ensures this runs only once

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="w-12 h-12 border-4 border-t-primary border-gray-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold font-poppins text-dark-text mb-4">
            Processing...
          </h1>
          <p className="text-light-text">{message}</p>
        </>
      );
    }

    if (isError) {
      return (
        <>
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold font-poppins text-red-600 mb-4">
            Unsubscribe Failed
          </h1>
          <p className="text-light-text">{message}</p>
        </>
      );
    }

    return (
      <>
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold font-poppins text-secondary mb-4">
          Success!
        </h1>
        <p className="text-light-text">{message}</p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        {renderContent()}
        <Link
          to="/"
          className="inline-block mt-8 bg-primary text-white font-poppins font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          Return to GPAi Home
        </Link>
      </div>
    </div>
  );
};

export default UnsubscribePage;
