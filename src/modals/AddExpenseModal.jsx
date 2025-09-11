import { useEffect, useMemo, useState } from "react";
import { X, DollarSign, Users } from "lucide-react";

export default function AddExpenseModal({ open, onClose, group, onAdd }) {
  const members = group?.members ?? [];

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitWith, setSplitWith] = useState(members); // por defecto todos
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && group) {
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitWith(group.members);
      setSubmitting(false);
    }
  }, [open, group]);

  const valid = useMemo(() => {
    const a = Number(amount);
    return (
      description.trim().length > 0 &&
      !Number.isNaN(a) &&
      a > 0 &&
      paidBy &&
      splitWith.length > 0
    );
  }, [description, amount, paidBy, splitWith]);

  const toggleMember = (m) => {
    setSplitWith((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const selectAll = () => setSplitWith(members);
  const selectNone = () => setSplitWith([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid || !group) return;
    setSubmitting(true);

    const expense = {
      id: Date.now(),
      description: description.trim(),
      amount: Math.round(Number(amount) * 100) / 100,
      paidBy,
      splitWith: splitWith.slice(),
    };

    onAdd?.(expense);
    setSubmitting(false);
    onClose?.();
  };

  if (!open) return null;

  const perHead = splitWith.length
    ? (Number(amount || 0) / splitWith.length).toFixed(0)
    : "0";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-start justify-center overscroll-contain">
      {/* overlay */}
        <div className="relative w-full md:max-w-lg">
        {/* márgenes laterales en mobile para que no toque bordes */}
            <div className="mx-4 md:mx-0 bg-white rounded-t-3xl md:rounded-2xl shadow-xl
                            max-h-[85vh] overflow-y-auto">
                <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            {/* sheet modal bottom en mobile */}
            <div className="absolute inset-x-0 bottom-0 md:top-10 md:bottom-auto md:mx-auto w-full md:max-w-lg px-4">
                <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-xl">
                    {/* header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Agregar Gasto</h3>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* form */}
                    <form id="add-expense-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                        {/* descripción */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                        <input
                            inputMode="numeric"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full rounded-xl border border-gray-200 px-3 py-3 focus:outline-none focus:border-blue-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {splitWith.length > 0 ? `$${perHead} c/u (${splitWith.length} personas)` : `Seleccioná al menos 1 persona`}
                        </p>
                        </div>

                        {/* quién pagó */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">¿Quién pagó?</label>
                        <div className="relative">
                            <select
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-3 pr-10 focus:outline-none focus:border-blue-400"
                            >
                            <option value="">Seleccioná una persona</option>
                            {members.map((m) => (
                                <option key={m} value={m}>{m}</option>
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
                            <button type="button" onClick={selectAll} className="text-xs text-blue-600 hover:underline">Todos</button>
                            <button type="button" onClick={selectNone} className="text-xs text-gray-500 hover:underline">Nadie</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {members.map((m) => {
                            const checked = splitWith.includes(m);
                            return (
                                <label key={m} className="flex items-center gap-2 text-sm">
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
                    </form>
                    {/* acciones */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancelar
                        </button>
                        <button
                        type="submit" form="add-expense-form" 
                        disabled={!valid || submitting}
                        className={`px-4 py-2 rounded-xl text-white ${valid ? "bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-95" : "bg-gray-300 cursor-not-allowed"}`}
                        >
                        Agregar gasto
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
  );
}
