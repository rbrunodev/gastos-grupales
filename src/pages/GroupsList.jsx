import React from "react";
import { useGroups } from "../context/GroupsContext";
import { Users, DollarSign, TrendingUp } from "lucide-react";

export default function GroupsList({ onCreateGroup, onViewGroup }) {
  const {
    groups,
    loading: groupsLoading,
    calculateBalances,
    isGroupBalanced,
  } = useGroups();

  return (
    <div className="space-y-6 mt-6 md:mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mis Grupos</h1>
        <button
          onClick={onCreateGroup}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Crear Grupo
        </button>
      </div>

      {groupsLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando grupos...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes grupos aún
          </h3>
          <p className="text-gray-500 mb-4">
            Crea tu primer grupo para empezar a gestionar gastos compartidos
          </p>
          <button
            onClick={onCreateGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Crear mi primer grupo
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const balances = calculateBalances(group);
            const totalExpenses =
              group.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
            const balanced = isGroupBalanced(group);

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
                onClick={() => onViewGroup(group.id)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {group.name}
                    </h3>
                    {balanced ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Balanceado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.members?.length || 0} miembros</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Total: ${totalExpenses.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      <span>{group.expenses?.length || 0} gastos</span>
                    </div>
                  </div>

                  {group.description && (
                    <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
