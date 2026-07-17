import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion';
import { RutaProtegida } from './componentes/RutaProtegida';
import { IniciarSesion } from './paginas/IniciarSesion';
import { Panel } from './paginas/Panel';
import { UsuariosAdmin } from './paginas/UsuariosAdmin';
import './componentes/interfaz.css';

function Aplicacion() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route
            path="/"
            element={
              <RutaProtegida>
                <Panel />
              </RutaProtegida>
            }
          />
          <Route
            path="/usuarios"
            element={
              <RutaProtegida soloAdmin>
                <UsuariosAdmin />
              </RutaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  );
}

export default Aplicacion;
