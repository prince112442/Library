import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6 text-center">
    <FiBookOpen size={36} className="mb-4 text-brass" />
    <h1 className="font-serif text-3xl font-semibold text-navy-dark">Page not found in the catalog</h1>
    <p className="mt-2 max-w-sm text-sm text-navy/60">
      The page you're looking for isn't shelved here. It may have been moved or never existed.
    </p>
    <Link to="/dashboard" className="btn-primary mt-6">
      Return to Dashboard
    </Link>
  </div>
);

export default NotFound;
