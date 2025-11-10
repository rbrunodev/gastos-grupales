import React, { useState } from "react";
import { useGroups } from "../context/GroupsContext";
import { Users, DollarSign, TrendingUp, AlertCircle, MoreVertical,Trash2} from "lucide-react";
import { useAuth } from "../context/AuthContext";


function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mt-3 text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            No, conservar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700"
          >
            Sí, eliminar
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          * Esta acción quitará el gasto y recalculará balances y liquidaciones.
        </p>
      </div>
    </div>
  );
}
export default function GroupDetail({ group, onBack, onAddExpense }) {
const { calculateBalances, calculateSettlements, isGroupBalanced, addPayment, removePayment,deleteExpense } = useGroups();
const { user } = useAuth(); 

const [openMenu, setOpenMenu] = useState(null); 
const [confirmDel, setConfirmDel] = useState({ open: false, expense: null });
const openConfirmDeleteExpense = (expense) =>
  setConfirmDel({ open: true, expense });

const closeConfirmDeleteExpense = () =>
  setConfirmDel({ open: false, expense: null });

const handleConfirmDeleteExpense = async () => {
  if (confirmDel.expense) {
    const r = await deleteExpense(group.id, confirmDel.expense.id);
    if (!r.success) {
      console.log(r);
      alert(r.message || "No se pudo eliminar el gasto");
    }
  }
  closeConfirmDeleteExpense();
};

function toggleMenu(i) {
  setOpenMenu(openMenu === i ? null : i);
}
function closeMenu() {
  setOpenMenu(null);
}

  if (!group) return null;

    const balances = calculateBalances(group);
    const settlements = calculateSettlements(balances);
    const username = user?.username ?? "";                 
    const userBalance = balances?.[username] ?? 0;        
    const totalExpenses = group.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const balanced = isGroupBalanced(group);

function findMatchingPayment(s) {
  const pays = group.payments || [];
  return pays.find(p =>
    p.from === s.from &&
    p.to === s.to &&
    Math.abs(Number(p.amount) - Number(s.amount)) < 0.01
  );
}

async function handleMarkPaid(s) {
  await addPayment(group.id, s.from, s.to, s.amount);
}

async function handleUndoPaid(s) {
  const p = findMatchingPayment(s);
  if (p) await removePayment(group.id, p.id);
}

async function handleCopyAmount(amount) {
  const text = Number(amount).toFixed(2);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.prompt("Copiá el monto:", text);
  }
  setOpenMenu(null);
}

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 mb-2 text-sm"
          >
            ← Volver a grupos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600 mt-1">{group.description}</p>
          )}
        </div>
        <button
          onClick={onAddExpense}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Agregar Gasto
        </button>
      </div>

      {/* Banner para el usuario logueado */}
        <div
        className={`rounded-lg p-4 border ${
            userBalance > 0
            ? 'bg-green-50 border-green-200'
            : userBalance < 0
            ? 'bg-rose-50 border-rose-200'
            : 'bg-gray-50 border-gray-200'
        }`}
        >
        <div className="flex items-center justify-between">
            <div>
            <p className="text-sm font-medium text-gray-700">
                {userBalance > 0 && <>  <strong>Te deben</strong> </>}
                {userBalance < 0 && <><strong>Debes</strong> </>}
                {userBalance === 0 && <>Estás al día en este grupo</>}
            </p>
            {userBalance !== 0 && (
                <p className={`mt-1 text-2xl font-bold ${
                userBalance > 0 ? 'text-green-700' : 'text-rose-700'
                }`}>
                ${Math.abs(userBalance).toFixed(2)}
                </p>
            )}
            </div>

            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
            ${userBalance > 0
                ? 'bg-green-100 text-green-800'
                : userBalance < 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-gray-100 text-gray-700'}`}>
            {userBalance > 0 ? 'A favor' : userBalance < 0 ? 'Debes' : 'Balanceado'}
            </span>
        </div>
        </div>

        {/* Liquidaciones */}
      {settlements.length > 0 && (
  <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
      <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
      Liquidaciones
    </h2>

    <div className="space-y-3">
      {settlements.map((s, i) => {
  const already = findMatchingPayment(s);
  const iAmInvolved = (s.from === username || s.to === username);
  const showMenu = iAmInvolved && !already;

  return (
    <div
      key={i}
      className="grid items-center grid-cols-[1fr_auto_2.5rem] gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
    >
      <span className="text-gray-900">
        <strong className="text-blue-800">{s.from}</strong> debe pagar a{" "}
        <strong className="text-blue-800">{s.to}</strong>
      </span>

      <span className="font-bold text-lg text-blue-600 tabular-nums">
        ${s.amount.toFixed(2)}
      </span>

      {/* ACCIONES */}
      {already ? (
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 justify-self-end">
          Pagado ✓
        </span>
      ) : (
        <div className="relative justify-self-end w-10 h-10">
          <button
            onClick={() => setOpenMenu(openMenu === i ? null : i)}
            className={`w-10 h-10 rounded-full grid place-items-center hover:bg-blue-100 transition
                        ${showMenu ? 'visible' : 'invisible pointer-events-none'}`}
            aria-haspopup="menu"
            aria-expanded={openMenu === i}
          >
            <MoreVertical className="w-5 h-5 text-blue-700" />
          </button>

          {showMenu && openMenu === i && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10"
              role="menu"
            >
              <button
                onClick={() => handleMarkPaid(s)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-700"
                role="menuitem"
              >
                Marcar como pagado
              </button>
              <button
                onClick={() => handleCopyAmount(s.amount)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                role="menuitem"
              >
                Copiar monto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
})}

    </div>
  </div>
)}

      {/* Balances */}
      {Object.keys(balances).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            Balances
          </h2>
          <div className="space-y-3">
            {Object.entries(balances).map(([member, balance]) => (
              <div
                key={member}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">{member}</span>
                <span
                  className={`font-bold text-lg ${
                    balance > 0
                      ? "text-green-600"
                      : balance < 0
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  ${Math.abs(balance).toFixed(2)}{" "}
                  {balance > 0 ? "a favor" : balance < 0 ? "debe" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Pagos */}
        {(group.payments && group.payments.length > 0) && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de pagos</h2>
            <div className="space-y-2">
            {group.payments
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(p => (
                <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                    <span className="text-gray-800">
                    <strong>{p.from}</strong> pagó a <strong>{p.to}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                        ${Number(p.amount).toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleString()}
                    </span>
                    </div>
                </div>
                ))}
            </div>
        </div>
        )}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Miembros</p>
              <p className="text-xl font-semibold text-gray-900">
                {group.members?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gastos</p>
              <p className="text-xl font-semibold text-gray-900">
                ${totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <div className="flex items-center">
            {balanced ? (
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className="text-xl font-semibold text-gray-900">
                {balanced ? "Balanceado" : "Pendiente"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Miembros */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Miembros</h2>
        <div className="flex flex-wrap gap-2">
          {group.members?.map((member) => (
            <span
              key={member}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {member}
            </span>
          ))}
        </div>
      </div>

      {/* Gastos */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Gastos Recientes</h2>

  {group.expenses?.length === 0 ? (
    <p className="text-gray-500 text-center py-4">No hay gastos registrados</p>
  ) : (
    <div className="space-y-3">
      {group.expenses?.map((expense) => {
        // (Opcional) Solo el dueño o quien pagó puede borrar:
        // const canDelete = user?.username === expense.paid_by_username;
        const canDelete = true; // o tu regla

        return (
          <div
            key={expense.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">{expense.description}</p>
              <p className="text-sm text-gray-600">
                Pagado por {expense.paid_by_username} • Dividido entre{" "}
                {expense.splitBetween?.join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">
                ${expense.amount.toFixed(2)}
              </span>
              {canDelete && (
                <button
                  onClick={() => openConfirmDeleteExpense(expense)}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-1.5 text-rose-700 hover:bg-rose-50"
                  title="Eliminar gasto"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}

  <ConfirmDialog
    open={confirmDel.open}
    title="¿Eliminar este gasto?"
    message="Se removerá definitivamente y recalcularemos los balances. Si el gasto equilibraba deudas, podrían reabrirse liquidaciones."
    onCancel={closeConfirmDeleteExpense}
    onConfirm={handleConfirmDeleteExpense}
  />
</div>
    </div>
  );
}
