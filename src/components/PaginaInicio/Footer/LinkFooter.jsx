import { Link } from "react-router-dom";

export const LinkFooter = ({ href, children }) => (
    <Link
      to={href}
      className="text-white font-medium hover:text-gray-950  transition-colors duration-200 text-lg hover:underline "
    >
      {children}
    </Link>
  );