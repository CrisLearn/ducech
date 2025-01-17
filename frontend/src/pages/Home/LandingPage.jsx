import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import './LandingPage.css';

// Componente para cargar el modelo
const Model = () => {
  const { scene } = useGLTF('assets/car.glb');
  return <primitive object={scene} scale={0.8} />;
};

const LandingPage = () => {
  const [hovered, setHovered] = useState(false); // Estado para controlar el hover
  const navigate = useNavigate(); // Hook para redirigir al login

  const handleClick = () => {
    navigate('/login'); // Redirige al login
  };

  return (
    <div className="landing-page">
      <Header />
      <div className="main-content">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          {/* Luces para iluminar el modelo */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[100, 100, 100]} intensity={20} castShadow />
          <spotLight position={[5, 50, 5]} angle={0.3} intensity={2} castShadow />
          <Bounds fit clip margin={1}>
            <mesh
              onPointerOver={() => setHovered(true)} // Detecta cuando el mouse pasa encima
              onPointerOut={() => setHovered(false)} // Detecta cuando el mouse sale
              onClick={handleClick} // Redirige al login al hacer clic
            >
              <Model />
            </mesh>
          </Bounds>
          <OrbitControls />
        </Canvas>
        {hovered && (
          <div className="hover-text">
            Presiona
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
