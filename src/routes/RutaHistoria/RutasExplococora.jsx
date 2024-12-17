import React from "react";
import { PaginaInicio } from "../../pages/PaginaInicio/PaginaInicio";
import {Carta} from "../../components/HistoriaCultura/Main/HistoriaCultura";
import { Routes, Route } from "react-router-dom";

export const RutasExplococora = () => {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicio />} />
      <Route path="/Historia" element={<Carta />} />
    </Routes>
  );
};
