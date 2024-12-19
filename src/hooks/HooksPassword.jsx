import React, { useState } from "react";
import { LockClosedIcon, EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

export const PasswordField = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="password"
        className="block text-gray-700 font-medium mb-2"
      >
        Contraseña
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <LockClosedIcon className="h-5 w-5 text-gray-400" />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="********"
          className="w-full pl-10 pr-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <span
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        >
          {showPassword ? (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeOffIcon className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </div>
    </div>
  );
};
