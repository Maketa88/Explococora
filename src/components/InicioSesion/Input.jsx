import React from "react";

export const InputRegistro = ({
  label,
  type = "text",
  id,
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
}) => {
  return (
    <div className="mb-2">
      <label htmlFor={id} className="block font-medium mb-2 text-emerald-800">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-5 w-5 text-emerald-400" />
          </span>
        )}
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${
            Icon ? "pl-10" : ""
          } placeholder-emerald-300 px-4 py-2 border border-emerald-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
        />
      </div>
    </div>
  );
};
