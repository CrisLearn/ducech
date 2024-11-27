import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/AuthService"; // Asegúrate de importar el servicio de autenticación

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!AuthService.getToken(); // Verifica si hay un token válido

  return isAuthenticated ? children : <Navigate to="/ducech/login" />;
};

export default PrivateRoute;
