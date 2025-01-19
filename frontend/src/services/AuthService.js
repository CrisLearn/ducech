const apiUrl = process.env.REACT_APP_API_URL;

const AuthService = {
  // Función de login que intenta autenticar al usuario en diferentes endpoints
  login: async (email, password) => {
    const endpoints = [
      `${apiUrl}/api/admin/login-admin`,
      `${apiUrl}/api/tecnico/login-tecnico`,
      `${apiUrl}/api/cliente/login-cliente`,
    ];

    // Validar entradas
    if (!email || !password) {
      return { success: false, message: 'Email y contraseña son requeridos.' };
    }

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

          // Verificar que el token exista en la respuesta
          if (data.token) {
            localStorage.setItem('token', data.token);
            return {
              success: true,
              role: data.role || 'user', // Rol por defecto si no está presente
              endpoint,
              token: data.token,
            };
          } else {
            console.error(`Error: No se recibió un token en ${endpoint}`);
          }
        } else {
          // Manejo de errores de respuesta
          const errorData = await response.json();
          console.error(`Error en ${endpoint}: ${errorData.message || 'Error desconocido'}`);
        }
      } catch (error) {
        // Errores de conexión o problemas con la petición
        console.error(`Error de red o servidor en ${endpoint}:`, error.message);
      }
    }

    // Si ninguna autenticación tuvo éxito
    return {
      success: false,
      message: 'Credenciales inválidas o error en la autenticación.',
    };
  },

  // Obtener el token almacenado en localStorage
  getToken: () => localStorage.getItem('token'),

  // Verificar si el usuario está autenticado
  isAuthenticated: () => !!AuthService.getToken(),

  // Cerrar sesión y eliminar el token
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default AuthService;
