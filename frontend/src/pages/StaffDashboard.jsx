import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { FiBook, FiCheckCircle, FiRepeat, FiUsers, FiUserCheck, FiAlertTriangle } from 'react-icons/fi';
import dashboardService from '../services/dashboardService';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <p className="text-sm text-rust">{error}</p>;
  if (!stats) return <Spinner />;

  const chartData = {
    labels: stats.monthlyBorrowStats.map((m) => MONTH_NAMES[m.month - 1]),
    datasets: [
      {
        label: 'Books Borrowed',
        data: stats.monthlyBorrowStats.map((m) => m.count),
        backgroundColor: '#B8860B',
        borderRadius: 2,
        maxBarThickness: 36,
      },
    ],
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-dark">Dashboard</h1>
      <p className="mt-1 text-sm text-navy/60">A day-at-a-glance view of the circulation desk.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Books" value={stats.totalBooks} icon={FiBook} accent="navy" />
        <StatCard label="Available" value={stats.availableBooks} icon={FiCheckCircle} accent="sage" />
        <StatCard label="Borrowed" value={stats.borrowedBooks} icon={FiRepeat} accent="brass" />
        <StatCard label="Students" value={stats.totalStudents} icon={FiUsers} accent="navy" />
        <StatCard label="Librarians" value={stats.totalLibrarians} icon={FiUserCheck} accent="navy" />
        <StatCard label="Overdue" value={stats.overdueBooks} icon={FiAlertTriangle} accent="rust" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="index-card lg:col-span-3">
          <h3 className="font-serif text-base font-semibold text-navy-dark">Monthly Borrowing</h3>
          <p className="mb-4 text-xs text-navy/50">Books checked out over the last 12 months</p>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#1B2A4A0D' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        <div className="index-card lg:col-span-2">
          <h3 className="font-serif text-base font-semibold text-navy-dark">Recent Transactions</h3>
          <p className="mb-3 text-xs text-navy/50">Latest borrow activity</p>
          <ul className="divide-y divide-navy/5">
            {stats.recentTransactions.length === 0 && (
              <li className="py-4 text-sm text-navy/40">No transactions yet.</li>
            )}
            {stats.recentTransactions.map((t) => (
              <li key={t._id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-dark">{t.book?.title}</p>
                  <p className="text-xs text-navy/50">{t.student?.name}</p>
                </div>
                <span
                  className={`badge shrink-0 ${
                    t.status === 'overdue'
                      ? 'bg-rust-light text-rust'
                      : t.status === 'returned'
                      ? 'bg-sage-light text-sage'
                      : 'bg-brass/10 text-brass-dark'
                  }`}
                >
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
