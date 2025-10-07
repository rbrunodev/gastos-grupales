import { useEffect, useRef } from "react";
import { Home, UserPlus, Bell, Settings, HelpCircle, User, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({
  isOpen,             // 👈 controla visibilidad en mobile
  onToggle,           // 👈 abre/cierra
  currentScreen,
  onNavigate,
  onCreateGroup,
  onShowReminders,
  className = "",
}) {
  const closeBtnRef = useRef(null);
  const { user, logout } = useAuth();

  // Cerrar con ESC en mobile y enfocar el botón cerrar al abrir
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onToggle?.(); };
    window.addEventListener("keydown", onKey);
    if (isOpen) closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onToggle]);

  const itemBase = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition";
  const active   = "bg-gray-900 text-white border-gray-900";
  const idle     = "bg-white/90 border-gray-200 hover:bg-gray-50";

  return (
    <>
      {/* Overlay solo en mobile cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        // Drawer en mobile (slide), fijo en md+
        className={[
          "fixed inset-y-0 left-0 z-40",
          "transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "w-80 bg-white/80 backdrop-blur border-r border-gray-100",
          "md:static md:translate-x-0 md:z-auto md:w-80 lg:w-96 xl:w-[420px]",
          "grow-0 shrink-0",
          className,
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Menú lateral"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Menú</h3>
              <p className="text-sm text-gray-500">Acciones rápidas</p>
            </div>

            {/* Botón cerrar: visible en mobile, oculto en md+ (opcional) */}
            <button
              onClick={onToggle}
              ref={closeBtnRef}
              className="p-2 rounded-full hover:bg-gray-100 transition md:hidden"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Items */}
          <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
            <button
              onClick={() => { onNavigate?.("home"); onToggle?.(); }}
              className={`${itemBase} ${currentScreen === "home" ? active : idle}`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 grid place-items-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Inicio</p>
                <p className={`text-xs ${currentScreen === "home" ? "text-white/70" : "text-gray-500"}`}>
                  Ver todos mis grupos
                </p>
              </div>
            </button>

            <button
              onClick={() => { onCreateGroup?.(); onToggle?.(); }}
              className={`${itemBase} ${idle}`}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 grid place-items-center">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Crear Grupo</p>
                <p className="text-xs text-gray-500">Nuevo grupo de gastos</p>
              </div>
            </button>

            <button
              onClick={() => { onShowReminders?.(); onToggle?.(); }}
              className={`${itemBase} ${idle}`}
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 grid place-items-center">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Recordatorios</p>
                <p className="text-xs text-gray-500">Deudas pendientes</p>
              </div>
            </button>

            <div className="border-t border-gray-100 my-2 mx-2" />

            <button
              onClick={() => { onNavigate?.("profile"); onToggle?.(); }}
              className={`${itemBase} ${currentScreen === "profile" ? active : idle}`}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 grid place-items-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Mi Perfil</p>
                <p className={`text-xs ${currentScreen === "profile" ? "text-white/70" : "text-gray-500"}`}>
                  Configurar cuenta
                </p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate?.("settings"); onToggle?.(); }}
              className={`${itemBase} ${currentScreen === "settings" ? active : idle}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 grid place-items-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Configuración</p>
                <p className={`text-xs ${currentScreen === "settings" ? "text-white/70" : "text-gray-500"}`}>
                  Preferencias y ajustes
                </p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate?.("help"); onToggle?.(); }}
              className={`${itemBase} ${currentScreen === "help" ? active : idle}`}
            >
              <div className="w-10 h-10 rounded-full bg-cyan-100 grid place-items-center">
                <HelpCircle className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-left">
                <p className="font-medium">Ayuda y Soporte</p>
                <p className={`text-xs ${currentScreen === "help" ? "text-white/70" : "text-gray-500"}`}>
                  ¿Necesitas ayuda?
                </p>
              </div>
            </button>

            <div className="border-t border-gray-100 my-2 mx-2" />

            {/* User info and logout */}
            <div className="px-2 py-2 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 grid place-items-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-800 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">@{user?.username}</p>
                </div>
              </div>
              
              <button
                onClick={() => { logout(); onToggle?.(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4">
            <div className="rounded-2xl bg-gray-50 text-gray-600 text-xs px-4 py-3 text-center">
              Versión 1.0 • Prototipo de prueba
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
