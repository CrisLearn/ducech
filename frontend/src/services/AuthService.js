const API_URL = 'http://localhost:5000/api';

const AuthService = {
  // Función de login que intenta autenticar al usuario en diferentes endpoints
  login: async (email, password) => {
    const endpoints = [
      `${API_URL}/admin/login-admin`,
      `${API_URL}/tecnico/login-tecnico`,
      `${API_URL}/cliente/login-cliente`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();

          // Guarda el token en localStorage
          localStorage.setItem('token', data.token);

          return {
            success: true,
            role: data.role,
            endpoint,
            token: data.token,
          };
        } else {
          // Maneja errores específicos de la respuesta
          const errorData = await response.json();
          console.error(`Error al autenticar: ${errorData.message}`);
        }
      } catch (error) {
        console.error(`Error con ${endpoint}:`, error);
      }
    }

    return { success: false, message: 'Credenciales inválidas o error en la autenticación.' };
  },

  // Método para obtener el token del almacenamiento local
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Método para verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = AuthService.getToken();
    return !!token; // Retorna true si hay un token
  },

  // Método para cerrar sesión y eliminar el token
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default AuthService;
