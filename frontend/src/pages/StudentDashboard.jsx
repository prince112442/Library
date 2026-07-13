import { useEffect, useState } from 'react';
import { FiRepeat, FiAlertTriangle, FiDollarSign, FiBookmark } from 'react-icons/fi';
import api from '../services/api';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import useAuth from '../hooks/useAuth';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/borrow', { params: { status: 'borrowed,overdue', limit: 5, sort: 'dueDate' } }),
      api.get('/fines', { params: { status: 'unpaid' } }),
      api.get('/reservations', { params: { status: 'pending' } }),
    ]).then(([borrowRes, fineRes, resRes]) => {
      setData({
        active: borrowRes.data.data,
        overdueCount: borrowRes.data.data.filter((b) => b.status === 'overdue').length,
        unpaidFines: fineRes.data.data,
        reservations: resRes.data.data,
      });
    });
  }, []);

  if (!data) return <Spinner />;

  const totalFineOwed = data.unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-navy-dark">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-1 text-sm text-navy/60">Here's what's happening with your books.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Books Out" value={data.active.length} icon={FiRepeat} accent="navy" />
        <StatCard label="Overdue" value={data.overdueCount} icon={FiAlertTriangle} accent="rust" />
        <StatCard label="Fines Owed" value={`$${totalFineOwed}`} icon={FiDollarSign} accent={totalFineOwed > 0 ? 'rust' : 'sage'} />
        <StatCard label="Reservations" value={data.reservations.length} icon={FiBookmark} accent="brass" />
      </div>

      <div className="mt-6 index-card">
        <h3 className="font-serif text-base font-semibold text-navy-dark">Currently Borrowed</h3>
        <p className="mb-3 text-xs text-navy/50">Books due soonest appear first</p>
        {data.active.length === 0 ? (
          <p className="py-6 text-center text-sm text-navy/40">You don't have any books checked out.</p>
        ) : (
          <ul className="divide-y divide-navy/5">
            {data.active.map((b) => (
              <li key={b._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy-dark">{b.book?.title}</p>
                  <p className="text-xs text-navy/50">{b.book?.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-navy/50">Due</p>
                  <p className={`font-mono text-sm ${b.status === 'overdue' ? 'text-rust' : 'text-navy-dark'}`}>
                    {new Date(b.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
