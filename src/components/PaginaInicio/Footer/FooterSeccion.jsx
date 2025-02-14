export const FooterSeccion = ({ title, children }) => (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold text-white  mb-3">{title}</h3>
      {children}
    </div>
  );
  