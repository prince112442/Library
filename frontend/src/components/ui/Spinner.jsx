const Spinner = ({ full = false }) => (
  <div className={full ? 'flex min-h-screen items-center justify-center bg-parchment' : 'flex items-center justify-center py-12'}>
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy/15 border-t-brass" />
  </div>
);

export default Spinner;
