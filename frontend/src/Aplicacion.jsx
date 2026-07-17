import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion';
import { RutaProtegida } from './componentes/RutaProtegida';
import { IniciarSesion } from './paginas/IniciarSesion';
import { Panel } from './paginas/Panel';
import { UsuariosAdmin } from './paginas/UsuariosAdmin';
import { Gastos } from './paginas/Gastos';
import { Ingresos } from './paginas/Ingresos';
import { CategoriasAdmin } from './paginas/CategoriasAdmin';
import { EtiquetasAdmin } from './paginas/EtiquetasAdmin';
import { Deudas } from './paginas/Deudas';
import { PresupuestosAdmin } from './paginas/PresupuestosAdmin';
import { ConfiguracionAdmin } from './paginas/ConfiguracionAdmin';
import { Metas } from './paginas/Metas';
import { Reportes } from './paginas/Reportes';
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
            path="/gastos"
            element={
              <RutaProtegida>
                <Gastos />
              </RutaProtegida>
            }
          />
          <Route
            path="/ingresos"
            element={
              <RutaProtegida>
                <Ingresos />
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
          <Route
            path="/categorias"
            element={
              <RutaProtegida soloAdmin>
                <CategoriasAdmin />
              </RutaProtegida>
            }
          />
          <Route
            path="/etiquetas"
            element={
              <RutaProtegida soloAdmin>
                <EtiquetasAdmin />
              </RutaProtegida>
            }
          />
          <Route
            path="/deudas"
            element={
              <RutaProtegida>
                <Deudas />
              </RutaProtegida>
            }
          />
          <Route
            path="/presupuestos"
            element={
              <RutaProtegida soloAdmin>
                <PresupuestosAdmin />
              </RutaProtegida>
            }
          />
          <Route
            path="/configuracion"
            element={
              <RutaProtegida soloAdmin>
                <ConfiguracionAdmin />
              </RutaProtegida>
            }
          />
          <Route
            path="/metas"
            element={
              <RutaProtegida>
                <Metas />
              </RutaProtegida>
            }
          />
          <Route
            path="/reportes"
            element={
              <RutaProtegida>
                <Reportes />
              </RutaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  );
}

export default Aplicacion;
