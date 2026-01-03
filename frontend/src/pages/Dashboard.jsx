import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let fetchedProjects = [];
      let totalProjectsCount = 0;
      let totalTasksCount = 0;
      let completedTasksCount = 0;

      // 1. DATA FETCHING LOGIC
      if (user?.role === "super_admin") {
        // Super Admin: Fetch all data globally
        const projectsRes = await api.get("/projects");
        if (projectsRes.data.success) {
          fetchedProjects = projectsRes.data.data.projects || [];
        }
      } else {
        // Tenant Admin: Fetch organization-specific data
        const tId = user?.tenantId || user?.tenant?.id;
        if (tId) {
          const projectsRes = await api.get(`/projects?tenantId=${tId}`);
          if (projectsRes.data.success) {
            fetchedProjects = projectsRes.data.data.projects || [];
          }
        }
      }

      // 2. CALCULATION LOGIC (Using local variables to avoid race conditions)
      // We calculate based on the fresh 'fetchedProjects' array, NOT the 'projects' state
      totalProjectsCount = fetchedProjects.length;
      
      fetchedProjects.forEach((project) => {
        // We sum up the counts provided in the project objects
        totalTasksCount += (project.taskCount || 0);
        completedTasksCount += (project.completedTaskCount || 0);
      });

      // 3. UPDATE STATE ONCE
      setProjects(fetchedProjects);
      setStats({
        totalProjects: totalProjectsCount,
        totalTasks: totalTasksCount,
        completedTasks: completedTasksCount,
        pendingTasks: totalTasksCount - completedTasksCount,
      });

    } catch (error) {
      console.error("Dashboard calculation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, color }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-gray-800 mt-2">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="text-blue-600 font-semibold">{user?.fullName}</span>
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Projects" value={stats.totalProjects} color="blue" />
          <StatCard label="Total Tasks" value={stats.totalTasks} color="purple" />
          <StatCard label="Completed Tasks" value={stats.completedTasks} color="green" />
          <StatCard label="Pending Tasks" value={stats.pendingTasks} color="yellow" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Preview List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Recent Projects</h2>
                <Link to="/projects" className="text-sm font-bold text-blue-600 hover:underline">
                  View All Projects →
                </Link>
              </div>

              {loading ? (
                <div className="py-10 text-center text-gray-400">Loading your data...</div>
              ) : projects.length === 0 ? (
                <div className="py-10 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                  No projects available.
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-4 rounded-lg border border-gray-50 bg-gray-50/50 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-800">{p.name}</h3>
                        <p className="text-xs text-gray-500">{p.description || "No description"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold px-2 py-1 bg-white rounded shadow-sm text-blue-700">
                          {p.completedTaskCount || 0} / {p.taskCount || 0} Tasks
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Profile Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/projects" className="block w-full py-3 bg-blue-600 text-white rounded-lg text-center font-bold hover:bg-blue-700 transition">
                  Create New Project
                </Link>
                {(user?.role === "tenant_admin" || user?.role === "super_admin") && (
                  <Link to="/users" className="block w-full py-3 bg-gray-900 text-white rounded-lg text-center font-bold hover:bg-black transition">
                    User Management
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Email</p>
                  <p className="text-sm text-gray-700 font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Role</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-100">
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;