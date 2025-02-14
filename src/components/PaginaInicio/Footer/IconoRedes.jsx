export const IconoRedes = ({ Icon, href, label, color }) => (
    <a
      href={href}
      aria-label={label}
      className="p-2 bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
    >
      <Icon size={32} color={color} />
    </a>
  );