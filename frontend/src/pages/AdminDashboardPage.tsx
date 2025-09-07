/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Type Definitions for API Responses ---
type Stats = {
  totalSubscribers: number;
  subscribedToday: number;
  // Add any other stats your backend provides
};

type Subscriber = {
  id: string;
  email: string;
  source: string;
  createdAt: string;
};

// --- IMPORTANT: Get this key from your backend team ---
const ADMIN_API_KEY = "your_backend_admin_api_key"; // <-- CHANGE THIS

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const headers = {
          "Content-Type": "application/json",
          "X-Admin-API-Key": ADMIN_API_KEY, // <-- Custom header for auth
        };

        // Fetch stats and subscribers in parallel
        const [statsRes, subsRes] = await Promise.all([
          fetch("https://gpai-server-e7ar.onrender.com/api/newsletter/stats", {
            headers,
          }),
          fetch(
            "https://gpai-server-e7ar.onrender.com/api/newsletter/subscribers",
            { headers }
          ),
        ]);

        if (!statsRes.ok || !subsRes.ok) {
          throw new Error(
            "Failed to fetch admin data. Check API key or server status."
          );
        }

        const statsData = await statsRes.json();
        const subsData = await subsRes.json();

        setStats(statsData.stats);
        setSubscribers(subsData.subscribers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("gpai-admin-auth");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-poppins text-dark-text">
            GPAi Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="font-medium text-primary hover:text-blue-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {isLoading && <p>Loading dashboard...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}

        {!isLoading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Total Subscribers
                </h3>
                <p className="text-3xl font-bold text-dark-text">
                  {stats?.totalSubscribers ?? "N/A"}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">New Today</h3>
                <p className="text-3xl font-bold text-dark-text">
                  {stats?.subscribedToday ?? "N/A"}
                </p>
              </div>
              {/* Add more stat cards as needed */}
            </div>

            {/* Subscribers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <h3 className="text-xl font-bold p-6">Subscriber List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sub.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
