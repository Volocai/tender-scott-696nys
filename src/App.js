import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const CONFIG = {
    nombreApp: "LinkVenta",
    logoUrl: "https://i.ibb.co/LD9zfYv5/logo.png",
    colorPrincipal: "#10B981",
    whatsappVendedor: "34623946626",
    moneda: "€",
  };

  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [productoComprador, setProductoComprador] = useState(null);
  const [vista, setVista] = useState("vendedor");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idProducto = params.get("vender");
    if (idProducto) {
      obtenerProductoParaCliente(idProducto);
      setVista("cliente");
    } else {
      cargarDatosVendedor();
    }
  }, []);

  const obtenerProductoParaCliente = async (id) => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("id", id)
      .single();
    if (data) setProductoComprador(data);
    setCargando(false);
  };

  const cargarDatosVendedor = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });
    setProductos(data || []);
    setCargando(false);
  };

  const agregar = async (e) => {
    e.preventDefault();
    await supabase
      .from("productos")
      .insert([{ nombre, precio: parseFloat(precio) }]);
    setNombre("");
    setPrecio("");
    cargarDatosVendedor();
  };

  const copiarLink = (id) => {
    const link = `${window.location.origin}${window.location.pathname}?vender=${id}`;
    navigator.clipboard.writeText(link);
    alert("✅ ¡Enlace copiado! Ya puedes usarlo en linkventa.com");
  };

  const finalizarCompra = () => {
    const msg = encodeURIComponent(
      `¡Hola! 👋 Me interesa comprar: ${productoComprador.nombre} (${productoComprador.precio}${CONFIG.moneda}) en linkventa.com`
    );
    window.location.href = `https://wa.me/${CONFIG.whatsappVendedor}?text=${msg}`;
  };

  if (vista === "cliente") {
    if (cargando) return <div style={loaderStyle}>Cargando catálogo...</div>;
    return (
      <div style={clienteContainer}>
        <div style={cardCliente}>
          <div style={headerBanner}>
            <img src={CONFIG.logoUrl} style={imgStyle} alt="Logo" />
          </div>
          <h1 style={{ fontSize: "2.2rem", margin: "15px 0" }}>
            {productoComprador?.nombre}
          </h1>
          <div style={precioCliente}>
            {productoComprador?.precio}
            {CONFIG.moneda}
          </div>
          <button
            onClick={finalizarCompra}
            style={{ ...btnBig, backgroundColor: CONFIG.colorPrincipal }}
          >
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={vendedorContainer}>
      <header style={headerBanner}>
        <img src={CONFIG.logoUrl} style={imgStyle} alt="LinkVenta Banner" />
      </header>

      <div style={gridStats}>
        <div style={statBox}>
          <small>PRODUCTOS</small>
          <div style={statVal}>{productos.length}</div>
        </div>
        <div style={statBox}>
          <small>VALOR CARTERA</small>
          <div style={statVal}>
            {productos
              .reduce((acc, p) => acc + (Number(p.precio) || 0), 0)
              .toFixed(2)}
            {CONFIG.moneda}
          </div>
        </div>
      </div>

      <div style={formCard}>
        <form
          onSubmit={agregar}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            placeholder="Precio (€)"
            type="number"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            style={inputStyle}
            required
          />
          <button
            type="submit"
            style={{ ...btnAction, backgroundColor: CONFIG.colorPrincipal }}
          >
            Subir a mi Tienda
          </button>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {productos.map((p) => (
          <div key={p.id} style={itemProducto}>
            <div style={{ flex: 1 }}>
              <strong>{p.nombre}</strong>
              <br />
              {p.precio}
              {CONFIG.moneda}
            </div>
            <button onClick={() => copiarLink(p.id)} style={btnLink}>
              Copiar Link
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ESTILOS LIMPIOS (SIN FONDO DE CUADRITOS) ---
const headerBanner = {
  width: "100%",
  height: "160px",
  backgroundColor: "#ffffff", // Fondo blanco sólido para ocultar el fondo "feo"
  borderRadius: "20px",
  marginBottom: "20px",
  overflow: "hidden",
  display: "flex",
  justifyContent: "center",
};

const imgStyle = { width: "100%", height: "100%", objectFit: "contain" };

const inputStyle = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
};
const loaderStyle = {
  display: "flex",
  height: "100vh",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "sans-serif",
};
const vendedorContainer = {
  maxWidth: "450px",
  margin: "0 auto",
  padding: "20px",
  fontFamily: "sans-serif",
  backgroundColor: "#f8f9fa",
  minHeight: "100vh",
};
const gridStats = { display: "flex", gap: "10px", marginBottom: "20px" };
const statBox = {
  flex: 1,
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  textAlign: "center",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};
const statVal = { fontSize: "22px", fontWeight: "bold" };
const formCard = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};
const btnAction = {
  color: "white",
  border: "none",
  padding: "14px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};
const itemProducto = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
};
const btnLink = {
  background: "#eee",
  border: "none",
  padding: "8px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};
const clienteContainer = {
  backgroundColor: "#111",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};
const cardCliente = {
  backgroundColor: "white",
  padding: "40px 25px",
  borderRadius: "35px",
  textAlign: "center",
  maxWidth: "400px",
  width: "100%",
};
const precioCliente = {
  fontSize: "48px",
  fontWeight: "bold",
  margin: "25px 0",
};
const btnBig = {
  width: "100%",
  color: "white",
  border: "none",
  padding: "20px",
  borderRadius: "15px",
  fontWeight: "bold",
  fontSize: "18px",
  cursor: "pointer",
};
