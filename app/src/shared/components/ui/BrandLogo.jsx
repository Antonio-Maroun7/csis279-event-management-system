import { Link } from "react-router-dom";

/**
 * EventFlow logo (gradient square + name). Links to the home page.
 */
const BrandLogo = ({ to = "/" }) => {
  return (
    <Link to={to} className="brand">
      <span className="brand-mark">E</span>
      <span>EventFlow</span>
    </Link>
  );
};

export default BrandLogo;
