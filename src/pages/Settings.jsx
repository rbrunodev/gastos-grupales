import React from "react";

export default function Settings({ theme, setTheme, onBack }) {
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-bold text-gray-900">Configuración</h3>
        {onBack && (
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700 text-sm">
            ← Volver
          </button>
        )}
      </div>

      {/* Personalización */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personalización</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tema de la aplicación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Claro */}
              <div
                className={`relative rounded-lg border-2 cursor-pointer transition-all p-4 ${
                  theme === "light" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleThemeChange("light")}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Tema Claro</h4>
                    <p className="text-sm text-gray-500">Interfaz brillante y clara</p>
                  </div>
                  {theme === "light" && (
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293L9 13.414 7.293 11.707 6 13l3 3 6-6-1.293-1.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Oscuro */}
              <div
                className={`relative rounded-lg border-2 cursor-pointer transition-all p-4 ${
                  theme === "dark" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleThemeChange("dark")}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707 8 8 0 1017.293 13.293z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Tema Oscuro</h4>
                    <p className="text-sm text-gray-500">Reduce la fatiga visual</p>
                  </div>
                  {theme === "dark" && (
                    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293L9 13.414 7.293 11.707 6 13l3 3 6-6-1.293-1.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              {theme === "light"
                ? "Actualmente usando el tema claro."
                : "Actualmente usando el tema oscuro."}
            </p>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Notificaciones</h2>
        <div className="space-y-4">
          <Row label="Recordatorios de pago" />
          <Row label="Nuevos gastos en grupos" />
          <Row label="Resumen semanal" />
        </div>
      </div>

      {/* Privacidad */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacidad</h2>
        <div className="space-y-4">
          <Row label="Visibilidad del perfil" />
          <Row label="Compartir estadísticas" />
        </div>
      </div>

      {/* Información */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Versión de la aplicación:</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Última actualización:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <button className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs cursor-not-allowed" disabled>
        Próximamente
      </button>
    </div>
  );
}
