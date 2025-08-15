export const Button = ({ className = "", children, ...props }) => (
  <button className={`px-4 py-2 rounded-2xl shadow-sm border bg-black text-white hover:opacity-90 disabled:opacity-50 ${className}`} {...props}>
    {children}
  </button>
);
