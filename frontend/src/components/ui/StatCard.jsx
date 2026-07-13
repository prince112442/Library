/**
 * Dashboard stat card styled as a library index card (see .index-card in
 * index.css) — the small tab notch at the top echoes a card-catalog
 * drawer label, tying the data-dense dashboard back to the library theme.
 */
const StatCard = ({ label, value, icon: Icon, accent = 'navy' }) => {
  const accentClasses = {
    navy: 'text-navy bg-navy/5',
    brass: 'text-brass-dark bg-brass/10',
    sage: 'text-sage bg-sage-light',
    rust: 'text-rust bg-rust-light',
  };

  return (
    <div className="index-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-navy/50">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-navy-dark">{value}</p>
        </div>
        {Icon && (
          <span className={`rounded-sm p-2.5 ${accentClasses[accent]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
