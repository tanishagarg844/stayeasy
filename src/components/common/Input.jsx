export const Input = ({ className = "", ...props }) => (
  <input className={`w-full border rounded-xl px-3 py-2 outline-none focus:ring ${className}`} {...props} />
);
