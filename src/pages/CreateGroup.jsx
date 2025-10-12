import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useGroups } from '../context/GroupsContext';

export default function CreateGroup({ onCancel, onCreated }) {
const [groupName, setGroupName] = useState('');
const [description, setDescription] = useState('');
const [members, setMembers] = useState(['']);           
const [availableUsers, setAvailableUsers] = useState([]); 
const [loadingUsers, setLoadingUsers] = useState(true);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const { createGroup, getAllUsers } = useGroups();

useEffect(() => {
    const load = async () => {
    try {
        setLoadingUsers(true);
        const users = await getAllUsers();
        setAvailableUsers(Array.isArray(users) ? users.map(u => u.username) : []);
    } catch (e) {
        console.error('Error cargando usuarios:', e);
    } finally {
        setLoadingUsers(false);
    }
    };
    load();
}, []); 

const handleAddMember = () => setMembers(prev => [...prev, '']);
const handleRemoveMember = (i) => {
    if (members.length > 1) setMembers(prev => prev.filter((_, idx) => idx !== i));
};
const handleMemberChange = (i, v) => {
    setMembers(prev => prev.map((m, idx) => (idx === i ? v : m)));
};

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) return setError('El nombre del grupo es requerido');

    const clean = members.map(m => m.trim()).filter(Boolean);
    const unique = [...new Set(clean)];
    if (unique.length === 0) return setError('Debe agregar al menos un miembro');

    setLoading(true);
    try {
    const res = await createGroup(groupName.trim(), description.trim(), unique);
    if (res.success) onCreated?.();
    else setError(res.message || 'Error creando el grupo');
    } catch {
    setError('Error inesperado');
    } finally {
    setLoading(false);
    }
};

const isChosen = (username, idx) =>
    members.some((m, i) => i !== idx && m === username);

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Crear nuevo grupo</h1>
        <button onClick={onCancel} className="text-blue-600 hover:text-blue-700 text-sm">
        ← Volver
        </button>
    </div>

    <div className="max-w-xl mx-auto w-full">
        <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow border border-gray-100 p-6 space-y-6"
        >
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
            </div>
        )}

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Grupo *
            </label>
            <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Viaje a la Playa"
            maxLength={100}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
            </label>
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del grupo…"
            maxLength={500}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Miembros del Grupo *
            </label>

            {loadingUsers ? (
            <div className="text-sm text-gray-500">Cargando usuarios…</div>
            ) : availableUsers.length === 0 ? (
            <div className="text-sm text-gray-500">
                No hay usuarios disponibles para seleccionar.
            </div>
            ) : (
            <>
                <div className="space-y-2">
                {members.map((member, i) => (
                    <div key={i} className="flex gap-2">
                    <select
                        value={member}
                        onChange={(e) => handleMemberChange(i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Seleccionar usuario…</option>
                        {availableUsers.map((u) => (
                        <option key={u} value={u} disabled={isChosen(u, i)}>
                            {u}{isChosen(u, i) ? ' (ya seleccionado)' : ''}
                        </option>
                        ))}
                    </select>

                    {members.length > 1 && (
                        <button
                        type="button"
                        onClick={() => handleRemoveMember(i)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                        title="Quitar"
                        >
                        <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                    </div>
                ))}
                </div>

                <button
                type="button"
                onClick={handleAddMember}
                className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                <Plus className="h-4 w-4 mr-1" />
                Agregar miembro
                </button>
            </>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
            <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
            Cancelar
            </button>
            <button
            type="submit"
            disabled={loading || loadingUsers}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
            {loading ? 'Creando…' : 'Crear Grupo'}
            </button>
        </div>
        </form>
    </div>
    </div>
);
}
