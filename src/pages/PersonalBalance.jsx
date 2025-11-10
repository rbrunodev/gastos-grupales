import React from "react";
import { useAuth } from "../context/AuthContext";
import { useGroups } from "../context/GroupsContext";

export default function PersonalBalance({ onBack, onViewGroup }) {
  const { user } = useAuth();
  const { groups = [], calculateBalances, calculateSettlements } = useGroups();

  if (!user) return null;

  const personalBalance = { owedToMe: [], iOwe: [] };

  const calculateUserFinancialStats = () => {
    let totalOwed = 0;
    let totalOwes = 0
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

  groups.forEach((group) => {
    const balances = calculateBalances(group);
    const settlements = calculateSettlements(balances);

    settlements.forEach((s) => {
      if (s.to === user.username) {
        personalBalance.owedToMe.push({
          groupName: group.name,
          groupId: group.id,
          person: s.from,
          amount: s.amount,
        });
      } else if (s.from === user.username) {
        personalBalance.iOwe.push({
          groupName: group.name,
          groupId: group.id,
          person: s.to,
          amount: s.amount,
        });
      }
    });
  });

  const totalOwedToMe = personalBalance.owedToMe.reduce((a, d) => a + d.amount, 0);
  const totalIOwe = personalBalance.iOwe.reduce((a, d) => a + d.amount, 0);

  return (
    
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Balance Personal</h2>
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 text-sm">
          ← Volver a grupos
        </button>
      </div>

       {/* Resumen Financiero */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Resumen Financiero</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Te deben */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Te deben</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${financialStats.totalOwed.toFixed(2)}
            </div>
            <p className="text-xs text-green-600 mt-1">A tu favor</p>
          </div>

          {/* Debes */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Debes</span>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              ${financialStats.totalOwes.toFixed(2)}
            </div>
            <p className="text-xs text-red-600 mt-1">Pendiente de pago</p>
          </div>

          {/* Balance neto */}
          <div
            className={`bg-gradient-to-br rounded-lg p-4 border ${
              financialStats.netBalance > 0
                ? "from-blue-50 to-indigo-50 border-blue-200"
                : financialStats.netBalance < 0
                ? "from-orange-50 to-amber-50 border-orange-200"
                : "from-gray-50 to-slate-50 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  financialStats.netBalance > 0
                    ? "text-blue-700"
                    : financialStats.netBalance < 0
                    ? "text-orange-700"
                    : "text-gray-700"
                }`}
              >
                Balance Neto
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  financialStats.netBalance > 0
                    ? "bg-blue-500"
                    : financialStats.netBalance < 0
                    ? "bg-orange-500"
                    : "bg-gray-500"
                }`}
              />
            </div>
            <div
              className={`text-2xl font-bold ${
                financialStats.netBalance > 0
                  ? "text-blue-600"
                  : financialStats.netBalance < 0
                  ? "text-orange-600"
                  : "text-gray-600"
              }`}
            >
              {financialStats.netBalance >= 0 ? "+" : ""}${financialStats.netBalance.toFixed(2)}
            </div>
          </div>

          {/* Grupos con deudas */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Grupos Activos</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {financialStats.totalGroupsWithDebts}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              de {financialStats.totalGroups} total
            </p>
          </div>
        </div>

        {/* Estado general */}
        <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Estado Financiero General</p>
              <p className="text-xs text-gray-600 mt-1">Basado en todos tus grupos</p>
            </div>
            <div className="flex items-center">
              {financialStats.netBalance > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm font-medium text-green-700">Favorable</span>
                </>
              ) : financialStats.netBalance < 0 ? (
                <>
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
                  <span className="text-sm font-medium text-orange-700">Debes dinero</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
                  <span className="text-sm font-medium text-gray-700">Balanceado</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Te deben */}
      {personalBalance.owedToMe.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
            Te deben dinero ({personalBalance.owedToMe.length})
          </h2>
          <div className="space-y-3">
            {personalBalance.owedToMe.map((debt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">
                        <strong>{debt.person}</strong> te debe
                      </p>
                      <p className="text-sm text-green-700">En el grupo: {debt.groupName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ${debt.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onViewGroup(debt.groupId)}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Ver Grupo
                    </button>
                    {/* <button className="text-xs border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1 rounded-full transition-colors">
                      Enviar Recordatorio
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debes */}
      {personalBalance.iOwe.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-3" />
            Debes dinero ({personalBalance.iOwe.length})
          </h2>
          <div className="space-y-3">
            {personalBalance.iOwe.map((debt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">
                        Le debes a <strong>{debt.person}</strong>
                      </p>
                      <p className="text-sm text-red-700">En el grupo: {debt.groupName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">
                        ${debt.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onViewGroup(debt.groupId)}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Ver Grupo
                    </button>
                    <button className="text-xs border border-red-600 text-red-600 hover:bg-red-50 px-3 py-1 rounded-full transition-colors">
                      Marcar como Pagado
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado sin deudas */}
      {personalBalance.owedToMe.length === 0 && personalBalance.iOwe.length === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">¡Todo al día! 🎉</h3>
            <p className="text-gray-600">No tienes deudas pendientes en ninguno de tus grupos.</p>
          </div>
        </div>
      )}

      {/* Consejos */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          💡 Consejos para mantener las cuentas al día
        </h3>
        <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
          <li>Revisa regularmente tus recordatorios para evitar que se acumulen las deudas</li>
          <li>Comunícate con los miembros del grupo sobre los pagos pendientes</li>
          <li>Utiliza las liquidaciones sugeridas para minimizar las transferencias</li>
          <li>Registra los pagos tan pronto como se realicen</li>
        </ul>
      </div>
    </div>
  );
}
