import React, { useEffect, useMemo, useState } from "react";
import { X, DollarSign, Users } from "lucide-react";
import { useGroups } from "../context/GroupsContext";

export default function AddExpenseModal({ open, onClose, group, onAdd }) {
  const members = group?.members ?? [];

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitWith, setSplitWith] = useState(members); // por defecto todos
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { addExpense } = useGroups();

  useEffect(() => {
    if (open && group) {
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitWith(group.members);
      setSubmitting(false);
      setError(""); // Reset error
    }
  }, [open, group]);

  const valid = useMemo(() => {
    const a = Number(amount);
    const descValid = description.trim().length > 0;
    const amountValid = !Number.isNaN(a) && a > 0;
    const paidByValid = !!paidBy;
    const splitValid = splitWith.length > 0;
    
    // Debug - esto te dirá exactamente qué está fallando
    console.log("🔍 Validation check:", {
      description: description,
      descValid,
      amount: amount,
      amountValid,
      paidBy: paidBy,
      paidByValid,
      splitWith: splitWith,
      splitValid,
      finalValid: descValid && amountValid && paidByValid && splitValid
    });
    
    return descValid && amountValid && paidByValid && splitValid;
  }, [description, amount, paidBy, splitWith]);

  // También agrega este debug para ver si el botón es clickeable
  const handleButtonClick = (e) => {
    console.log("🖱️ Button clicked!");
    console.log("Valid:", valid);
    console.log("Submitting:", submitting);
    if (!valid || submitting) {
      console.log("❌ Button disabled, not submitting");
      e.preventDefault();
      return;
    }
    // Si llegamos aquí, el form debería submit
  };

  const toggleMember = (m) => {
    setSplitWith((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const selectAll = () => setSplitWith(members);
  const selectNone = () => setSplitWith([]);

  const handleSubmit = async (e) => {
    e.preventDefault();    
    setError("");

    if (!description.trim()) {
      setError("La descripción es requerida");
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError("El monto debe ser un número mayor a 0");
      return;
    }

    if (!paidBy) {
      setError("Debe seleccionar quién pagó");
      return;
    }

    if (splitWith.length === 0) {
      setError("Debe seleccionar al menos una persona para dividir el gasto");
      return;
    }

    console.log("✅ Validaciones pasadas, enviando...");
    setSubmitting(true);

    try {
      let result;
      
      if (onAdd) {
        // Usar la función onAdd pasada como prop
        const expense = {
          id: Date.now(),
          description: description.trim(),
          amount: parseFloat(amount),
          paidBy,
          splitWith: splitWith.slice(),
        };
        result = await onAdd(expense);
      } else if (addExpense && group) {
        // Usar addExpense del contexto con los parámetros correctos
        result = await addExpense(
          group.id,
          description.trim(),
          parseFloat(amount),
          paidBy,
          splitWith
        );
      } else {
        throw new Error("No method available to add expense");
      }
      
      if (result && !result.success) {
        throw new Error(result.message || "Error al agregar el gasto");
      }
      
      console.log("✅ Expense added successfully");
      onClose?.();
    } catch (err) {
      console.error("💥 Error adding expense:", err);
      setError(err.message || "Error al agregar el gasto");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const perHead = splitWith.length
    ? (Number(amount || 0) / splitWith.length).toFixed(2)
    : "0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 dark:bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">
              Agregar Gasto
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Bebidas"
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 pr-10 focus:outline-none focus:border-blue-400"
                />
                <DollarSign className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto ($)
              </label>
              <input
                inputMode="numeric"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-gray-200 px-3 py-3 focus:outline-none focus:border-blue-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                {splitWith.length > 0
                  ? `$${perHead} c/u (${splitWith.length} personas)`
                  : `Seleccioná al menos 1 persona`}
              </p>
            </div>

            {/* quién pagó */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Quién pagó?
              </label>
              <div className="relative">
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 pr-10 focus:outline-none focus:border-blue-400"
                >
                  <option value="">Seleccioná una persona</option>
                  {members.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <Users className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* split */}
            <div className="border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Dividir entre</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={selectNone}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Nadie
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members.map((m) => {
                  const checked = splitWith.includes(m);
                  return (
                    <label
                      key={m}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(m)}
                      />
                      <span className="text-gray-700">{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* acciones */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={handleButtonClick}
                disabled={!valid || submitting}
                className={`px-4 py-2 rounded-xl text-white ${
                  valid && !submitting
                    ? "bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-95"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {submitting ? "Agregando..." : "Agregar gasto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}