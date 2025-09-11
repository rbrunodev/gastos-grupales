import React, { useState } from 'react';
import { Users, Plus, ArrowLeft, DollarSign, Calendar, Bell, Check, Trash2, UserPlus, Menu, X, Home, Settings, HelpCircle, User } from 'lucide-react';
import Sidebar from "./components/Sidebar";
import CreateGroupModal from "./modals/CreateGroupModal";
import AddExpenseModal from "./modals/AddExpenseModal";

const GroupExpenseApp = () => {
    const [currentScreen, setCurrentScreen] = useState('home');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showReminders, setShowReminders] = useState(false);
    const [showGroupClosed, setShowGroupClosed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        paidBy: '',
        splitWith: []
    });

    // Datos de ejemplo
    const [groups, setGroups] = useState([
        {
        id: 1,
        name: "Asado con amigos",
        date: "2 días atrás",
        members: ["Ana", "Bruno", "Carlos", "Diana"],
        balance: 850,
        expenses: [
            { id: 1, description: "Carne y choripán", amount: 2400, paidBy: "Bruno", splitWith: ["Ana", "Bruno", "Carlos", "Diana"] },
            { id: 2, description: "Bebidas", amount: 1800, paidBy: "Ana", splitWith: ["Ana", "Bruno", "Carlos", "Diana"] },
            { id: 3, description: "Carbón", amount: 600, paidBy: "Carlos", splitWith: ["Ana", "Bruno", "Carlos", "Diana"] }
        ]
        },
        {
        id: 2,
        name: "Viaje a Bariloche",
        date: "1 semana atrás",
        members: ["Laura", "Martín", "Sofia", "Pablo", "Elena"],
        balance: 2340,
        expenses: [
            { id: 4, description: "Hospedaje", amount: 8000, paidBy: "Laura", splitWith: ["Laura", "Martín", "Sofia", "Pablo", "Elena"] },
            { id: 5, description: "Nafta", amount: 3500, paidBy: "Martín", splitWith: ["Laura", "Martín", "Sofia", "Pablo"] },
            { id: 6, description: "Cena restaurante", amount: 4200, paidBy: "Sofia", splitWith: ["Laura", "Martín", "Sofia", "Pablo", "Elena"] }
        ]
        },
        {
        id: 3,
        name: "Regalo",
        date: "2 semana atrás",
        members: ["Paula", "Florencia", "Renata"],
        balance: 0,
        expenses: [
            { id: 7, description: "Regalo", amount: 50000, paidBy: "Florencia", splitWith: ["Florencia", "Renata", "Paula"] },
            { id: 8, description: "Transferencia", amount: 16667, paidBy: "Renata", splitWith: ["Florencia"] },
            { id: 9, description: "Transferencia", amount: 16667, paidBy: "Paula", splitWith: ["Florencia"] }
        ]
        }
    ]);

    const [recentActivity, setRecentActivity] = useState([
        { id: 1, text: "Carlos pagó $18.000", group: "Asado Amigos", time: "hace 2 horas" },
        { id: 2, text: "Laura agregó 'Hospedaje' $8.000", group: "Viaje Bariloche", time: "ayer" },
    ]);

    const calculateIndividualBalance = (group) => {
        const balances = {};
        group.members.forEach(member => (balances[member] = 0));

        group.expenses.forEach(expense => {
            const splitAmount = expense.amount / expense.splitWith.length;
            balances[expense.paidBy] += expense.amount;
            expense.splitWith.forEach(member => {
            balances[member] -= splitAmount;
            });
        });

        Object.keys(balances).forEach(member => {
            balances[member] = Math.round(balances[member] * 100) / 100;
        });

        return balances;
    };


    const addExpense = () => {
        if (!newExpense.description || !newExpense.amount || !newExpense.paidBy || !selectedGroup) return;

        const expense = {
        id: Date.now(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        paidBy: newExpense.paidBy,
        splitWith: newExpense.splitWith.length > 0 ? newExpense.splitWith : selectedGroup.members
        };

        setGroups(groups.map(group => 
        group.id === selectedGroup.id 
            ? { ...group, expenses: [...group.expenses, expense] }
            : group
        ));

        setNewExpense({ description: '', amount: '', paidBy: '', splitWith: [] });
        setShowAddExpense(false);
    };

  
    const calculatePairwiseDebts = (group) => {
        if (!group) return [];

        const totals = new Map(); // clave "deudor->pagador" -> monto (float)

        for (const exp of group.expenses) {
            const { amount, paidBy, splitWith } = exp;
            if (!splitWith?.length) continue;

            const share = amount / splitWith.length; // sin redondear; redondeamos al mostrar

            for (const member of splitWith) {
            if (member === paidBy) continue; // el pagador no se debe a sí mismo
            const key = `${member}->${paidBy}`;
            totals.set(key, (totals.get(key) || 0) + share);
            }
        }

        const rows = [];
            for (const [key, amt] of totals.entries()) {
                if (Math.abs(amt) < 0.5) continue; // filtra residuos de redondeo
                const [from, to] = key.split("->");
                rows.push({ from, to, amount: amt });
            }

            // Opcional: ordená por deudor y luego por pagador
            rows.sort((a, b) => (a.from + a.to).localeCompare(b.from + b.to));
            return rows;
        };

        const consolidateMutualDebts = (rows, epsilon = 0.5) => {
        const acc = new Map(); // clave canónica "a|b" (orden alfabético) -> suma con signo

        for (const { from, to, amount } of rows) {
            if (!amount) continue;
            const a = from < to ? from : to;
            const b = from < to ? to   : from;
            const key = `${a}|${b}`;

            // Si el orden canónico es (a,b), un "from=a → to=b" suma +amount,
            // y un "from=b → to=a" suma -amount. Así se netean.
            const signed = (from === a) ? amount : -amount;
            acc.set(key, (acc.get(key) || 0) + signed);
        }

        const net = [];
        for (const [key, sum] of acc.entries()) {
            if (Math.abs(sum) < epsilon) continue; // ignora residuos de redondeo
            const [a, b] = key.split("|");
            if (sum > 0) {
            // a le debe a b
            net.push({ from: a, to: b, amount: sum });
            } else {
            // b le debe a a
            net.push({ from: b, to: a, amount: -sum });
            }
        }

        // Opcional: ordená por deudor y pagador
        net.sort((x, y) => (x.from + x.to).localeCompare(y.from + y.to));
        return net;
    };

    const closeGroup = () => {
        setShowGroupClosed(true);
        setTimeout(() => {
        setGroups(groups.filter(g => g.id !== selectedGroup.id));
        setShowGroupClosed(false);
        setCurrentScreen('home');
        setSelectedGroup(null);
        }, 3000);
    };

    return (
        <div className="min-h-dvh flex">
            <Sidebar
                isOpen={isSidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 768} // fijo en md+
                onToggle={() => setIsSidebarOpen(false)}
                currentScreen={currentScreen}
                onNavigate={(s) => setCurrentScreen(s)}
                onCreateGroup={() => setShowCreateGroup(true)}
                onShowReminders={() => setShowReminders(true)}
            />

            <main className="flex-1 min-w-0 overflow-x-hidden">
                {/* Header sticky solo en mobile con botón de menú */}
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Botón abrir SOLO si el sidebar está cerrado */}
                    {currentScreen === 'detail' ? (
                        <button
                            onClick={() => setCurrentScreen("home")}
                            className="p-2 rounded-xl hover:bg-gray-100"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    ) : (
                        !isSidebarOpen && ( <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-xl bg-white shadow hover:bg-gray-50"
                            aria-label="Abrir menú"
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>)
                    )}

                    <h2 className="text-base font-semibold text-gray-800 truncate">
                        {currentScreen === 'detail' ? (selectedGroup?.name || 'Detalle') : 'Mis Grupos'}
                    </h2>

                    {/* Espaciador para centrar el título */}
                    <span className="w-9" />
                </div>

                {/* Contenedor central responsive: evita desbordes y centra el contenido */}
                <div className="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-3xl px-4 md:px-6 py-4 space-y-6">
                    {currentScreen === 'home' && (
                        <div className="space-y-6">
                            {/* lista de grupos */}
                            <div className="grid gap-4">
                                {groups.map(group => (
                                    <div
                                        key={group.id}
                                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                                        onClick={() => { setSelectedGroup(group); setCurrentScreen('detail'); }}
                                    >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-400 grid place-items-center shrink-0">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{group.name}</h3>
                                            <p className="text-xs text-gray-500 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1 shrink-0" /> {group.date}
                                            </p>
                                        </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-orange-600 font-bold">${group.balance}</p>
                                            <p className="text-[11px] text-gray-500">pendiente</p>
                                        </div>
                                    </div>
                                    </div>
                                ))}
                                {/* Crear nuevo grupo */}
                                <button
                                    onClick={() => setShowCreateGroup(true)}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-dashed border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2 text-gray-600"
                                >
                                    <Plus className="w-5 h-5" />
                                    Crear nuevo grupo
                                </button>
                            </div>

                            {/* Actividad reciente */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-gray-800 mb-3">Actividad Reciente</h3>
                                <div className="space-y-3">
                                    {recentActivity.map(a => (
                                        <div key={a.id} className="flex items-center justify-between">
                                            <div className="min-w-0">
                                            <p className="text-sm text-gray-800 truncate">{a.text}</p>
                                            <p className="text-xs text-gray-500">{a.group} • {a.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {recentActivity.length === 0 && (
                                        <p className="text-sm text-gray-500">No hay actividad por ahora.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentScreen === 'detail' && selectedGroup && (
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            {(() => {
                                const balances = calculateIndividualBalance(selectedGroup);
                                const isGroupBalanced = Object.values(balances).every(b => Math.abs(b) < 1);
                                return isGroupBalanced ? (
                                    <div className="bg-green-100 border border-green-200 rounded-xl p-3 text-center">
                                    <p className="text-green-800 font-medium">¡Grupo equilibrado! 🎉</p>
                                    </div>
                                ) : (
                                    <div className="bg-orange-100 border border-orange-200 rounded-xl p-3 text-center">
                                    <p className="text-orange-800 font-medium">${selectedGroup.balance} pendientes</p>
                                    </div>
                                );
                            })()}

                            {/* Balances */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-blue-500" /> Balances
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(calculateIndividualBalance(selectedGroup)).map(([member, balance]) => (
                                <div key={member} className="flex items-center justify-between">
                                    <span className="text-gray-700">{member}</span>
                                    <span
                                    className={`font-medium ${
                                        balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}
                                    >
                                    {balance > 0 ? `+$${balance.toFixed(0)}` : balance < 0 ? `-$${Math.abs(balance).toFixed(0)}` : '$0'}
                                    </span>
                                </div>
                                ))}
                            </div>
                            </div>

                            {/* Quién paga a quién (Neteado) */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-purple-500" /> Quién paga a quién
                            </h3>

                            {(() => {
                                const pairwise = calculatePairwiseDebts(selectedGroup); // la que ya agregaste
                                const netted   = consolidateMutualDebts(pairwise);

                                return netted.length ? (
                                <div className="space-y-2">
                                    {netted.map((r, i) => (
                                    <p key={i} className="text-sm text-gray-700">
                                        <span className="font-medium">{r.from}</span> le tiene que pagar{" "}
                                        <span className="font-medium">
                                        ${Math.round(r.amount).toLocaleString("es-AR")}
                                        </span>{" "}
                                        a <span className="font-medium">{r.to}</span>
                                    </p>
                                    ))}
                                </div>
                                ) : (
                                <p className="text-sm text-green-600">🎉 Todos están saldados</p>
                                );
                            })()}
                            </div>




                            {/* Gastos */}
                            <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-800 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-green-500" /> Gastos
                                </h3>
                                <button
                                onClick={() => setShowAddExpense(true)}
                                className="p-2 bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-full"
                                >
                                <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {selectedGroup.expenses.map(expense => (
                                <div key={expense.id} className="border-l-4 border-blue-400 pl-3 py-2">
                                    <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-800 break-words">{expense.description}</p>
                                        <p className="text-sm text-gray-500">Pagó {expense.paidBy}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-gray-800">${expense.amount}</p>
                                        <p className="text-xs text-gray-500">
                                        ${(expense.amount / expense.splitWith.length).toFixed(0)} c/u
                                        </p>
                                    </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                            </div>

                            {/* Cerrar grupo si corresponde */}
                            {Object.values(calculateIndividualBalance(selectedGroup)).every(b => Math.abs(b) < 1) && (
                            <button
                                onClick={closeGroup}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-md"
                            >
                                🎉 Cerrar Grupo
                            </button>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Otras pantallas */}
                    {currentScreen === 'profile' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <p className="text-gray-700">Nombre: Renata Bruno</p>
                        <p className="text-gray-700">Email: renata@example.com</p>
                        <p className="text-gray-500 text-sm mt-2">Acá podés sumar el formulario de perfil.</p>
                    </div>
                    )}

                    {currentScreen === 'settings' && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <p className="text-gray-700">Preferencias y ajustes (tema, moneda, idioma…)</p>
                        </div>
                    )}

                    {currentScreen === 'help' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <p className="text-gray-700">Centro de ayuda • FAQs • Contacto</p>
                    </div>
                    )}
                </div>

                {/* ---------- MODALES ---------- */}

                {/* Recordatorios */}
                {showReminders && (
                    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Recordatorios</h3>
                        <button onClick={() => setShowReminders(false)} className="text-gray-400">×</button>
                        </div>
                        <div className="space-y-3">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                            <p className="text-sm font-medium text-orange-800">Carlos te debe $600</p>
                            <p className="text-xs text-orange-600">Asado con amigos</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-sm font-medium text-blue-800">Pablo te debe $700</p>
                            <p className="text-xs text-blue-600">Viaje a Bariloche</p>
                        </div>
                        </div>
                        <button className="w-full mt-4 bg-gradient-to-r from-green-400 to-blue-400 text-white py-3 rounded-xl font-medium">
                        Enviar recordatorios amigables
                        </button>
                    </div>
                    </div>
                )}

                {/* Agregar gasto (permite sin grupo) */}
                <AddExpenseModal
                    open={showAddExpense}
                    onClose={() => setShowAddExpense(false)}
                    group={selectedGroup}               // 👈 se usa para miembros
                    onAdd={(expense) => {
                        // 1) actualizar groups
                        setGroups((prev) => {
                        const next = prev.map((g) =>
                            g.id === selectedGroup.id
                            ? { ...g, expenses: [...g.expenses, expense] }
                            : g
                        );
                        // 2) refrescar selectedGroup con la versión actualizada
                        const updated = next.find((g) => g.id === selectedGroup.id);
                        setSelectedGroup(updated);
                        return next;
                        });
                    }}
                />

                {showCreateGroup && (
                    <CreateGroupModal
                        open={showCreateGroup}
                        onClose={() => setShowCreateGroup(false)}
                        onCreate={(newGroup) => {
                        setGroups((prev) => [...prev, newGroup]);
                        // Navegar al detalle del grupo recién creado (opcional)
                        setSelectedGroup(newGroup);
                        setCurrentScreen("detail");
                        }}
                    />
                )}
            </main>

        </div>
    );
};

export default GroupExpenseApp