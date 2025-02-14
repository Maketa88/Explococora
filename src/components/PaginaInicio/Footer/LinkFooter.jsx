export const LinkFooter = ({ href, children }) => (
    <a
      href={href}
      className="text-white font-medium hover:text-gray-950 transition-colors duration-200 text-lg "
    >
      {children}
    </a>
  );