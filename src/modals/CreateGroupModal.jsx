import { useEffect, useMemo, useRef, useState } from "react";
import { X, Users, CalendarPlus, Plus, Trash2 } from "lucide-react";

export default function CreateGroupModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => nameInputRef.current?.focus(), 0);
    } else {
      // limpiar cuando se cierre
      setName("");
      setDate(new Date().toISOString().slice(0, 10));
      setMemberInput("");
      setMembers([]);
      setSubmitting(false);
    }
  }, [open]);

  // helpers
  const addMember = () => {
    const v = memberInput.trim();
    if (!v) return;
    if (members.includes(v)) return;
    setMembers((m) => [...m, v]);
    setMemberInput("");
  };

  const removeMember = (m) => setMembers((arr) => arr.filter((x) => x !== m));

  const canSubmit = useMemo(() => {
    return name.trim().length > 2 && members.length >= 2 && !submitting;
  }, [name, members, submitting]);

  const humanDate = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (date === today) return "hoy";
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" })
      .format(new Date(date))
      .replace(".", "");
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    // construir el grupo nuevo
    const newGroup = {
      id: Date.now(),
      name: name.trim(),
      date: humanDate,               // p.ej. "10 sept. 2025" o "hoy"
      members: members,
      balance: 0,
      expenses: [],
    };

    onCreate?.(newGroup);
    setSubmitting(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* modal */}
      <div className="absolute inset-x-0 top-10 mx-auto w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-xl">
          {/* header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Crear nuevo grupo</h2>
              <p className="text-sm text-gray-500">Configura el nombre, fecha y miembros</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Nombre del grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del grupo
              </label>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Almuerzo oficina"
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 pr-10 focus:outline-none focus:border-blue-400"
                />
                <Users className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {name.trim().length > 0 && name.trim().length <= 2 && (
                <p className="text-sm text-red-600 mt-1">El nombre debe tener al menos 3 caracteres.</p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 pr-10 focus:outline-none focus:border-blue-400"
                />
                <CalendarPlus className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Se mostrará como: <span className="font-medium">{humanDate}</span></p>
            </div>

            {/* Miembros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Miembros</label>
                <div className="flex gap-2 flex-col sm:flex-row">
                    <input
                        type="text"
                        value={memberInput}
                        onChange={(e) => setMemberInput(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addMember();
                        }
                        }}
                        placeholder="Nombre de la persona (Enter para agregar)"
                        className="flex-1 min-w-0 rounded-xl border border-gray-200 px-3 py-3
                                focus:outline-none focus:border-blue-400"
                    />

                    <button
                        type="button"
                        onClick={addMember}
                        className="sm:w-auto w-full h-[48px] px-4 rounded-xl bg-gray-900 text-white
                                hover:bg-gray-800 flex items-center justify-center gap-2 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Agregar</span>
                    </button>
                </div>

                {/* chips con scroll */}
                <div className="mt-3 max-h-40 overflow-y-auto pr-1">
                <div className="flex flex-wrap gap-2">
                    {members.map((m) => (
                    <span
                        key={m}
                        className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 rounded-full px-3 py-1"
                    >
                        {m}
                        <button
                        type="button"
                        onClick={() => removeMember(m)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label={`Quitar ${m}`}
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </span>
                    ))}
                </div>
                </div>

                {/* regla de validación */}
                {members.length > 0 && members.length < 2 && (
                    <p className="text-sm text-red-600 mt-1">Agregá al menos 2 miembros.</p>
                )}
            </div>
          </form>
          <div className="px-6 py-4 border-t border-gray-100 bg-white
                sticky bottom-0 shrink-0">
                <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancelar
                    </button>
                    <button type="submit" form="create-group-form" 
                            disabled={!canSubmit}
                            className={`px-4 py-2 rounded-xl text-white ${
                            canSubmit ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-95'
                                        : 'bg-gray-300 cursor-not-allowed'}`}>
                    Crear grupo
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
