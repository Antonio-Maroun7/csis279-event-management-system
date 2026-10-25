/**
 * Small colored label.
 * color: purple | green | amber | red | slate | blue
 */
const Badge = ({ color = "slate", children }) => {
  return <span className={`badge ${color}`}>{children}</span>;
};

export default Badge;
