import React from "react";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupsContext";
import { Users, DollarSign, TrendingUp, AlertCircle, LucideHeading3 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { groups, calculateBalances } = useGroups();

  if (!user) return null;

  const calculateUserFinancialStats = () => {
    let totalOwed = 0;
    let totalOwes = 0;
    let totalExpenses = 0;
    let totalGroupsWithDebts = 0;

    groups.forEach((group) => {
      const balances = calculateBalances(group);
      const userBalance = balances[user.username] || 0;

      if (userBalance > 0) totalOwed += userBalance;
      else if (userBalance < 0) totalOwes += Math.abs(userBalance);

      if (userBalance !== 0) totalGroupsWithDebts++;

      totalExpenses += group.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    });

    return {
      totalOwed,
      totalOwes,
      totalExpenses,
      netBalance: totalOwed - totalOwes,
      totalGroupsWithDebts,
      totalGroups: groups.length,
      totalTransactions: groups.reduce((t, g) => t + (g.expenses?.length || 0), 0),
    };
  };

  const financialStats = calculateUserFinancialStats();

  return (
    <div className="space-y-6">
      <h3 className="text-3xl font-bold text-gray-900">Mi Perfil</h3>

      {/* Información del Usuario */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-white">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.full_name || user.username || "Usuario"}
            </h2>
            <p className="text-gray-600">@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Nombre de usuario:</span>
                <span className="text-sm text-gray-900">@{user.username}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">ID de usuario:</span>
                <span className="text-sm text-gray-500 font-mono">{user.id}</span>
              </div>
              {user.email && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Estadísticas Generales</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Grupos</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{financialStats.totalGroups}</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">Total en Gastos</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    ${financialStats.totalExpenses.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">Total Transacciones</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {financialStats.totalTransactions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximas funcionalidades */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Próximamente: Edición de Perfil</h3>
            <p className="text-blue-800 mb-4">
              Estamos trabajando en nuevas funcionalidades para tu perfil.
            </p>
            <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
              <li>Cambiar tu nombre e info personal</li>
              <li>Actualizar foto de perfil</li>
              <li>Preferencias de notificaciones</li>
              <li>Privacidad de la cuenta</li>
              <li>Historial detallado de gastos</li>
              <li>Exportar reportes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones de Cuenta</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
            Editar Perfil (Próximamente)
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
            Cambiar Contraseña (Próximamente)
          </button>
          <button className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
            Eliminar Cuenta (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
}
