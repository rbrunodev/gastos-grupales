import React, { useState } from "react";

export default function Help({ onBack }) {
const [expandedFaq, setExpandedFaq] = useState(null);

const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
};

// Soporte
const SUPPORT_EMAIL = "soportegastosgrupales@gmail.com";
const SUBJECT = encodeURIComponent("Ayuda / Consulta sobre Gastos Grupales");

function handleCopyEmail() {
    navigator.clipboard?.writeText(SUPPORT_EMAIL);
    alert("Correo copiado: " + SUPPORT_EMAIL);
}

const faqs = [
    {
    question: "¿Cómo funciona el cálculo de balances?",
    answer:
        "El sistema calcula automáticamente cuánto debe o le deben a cada miembro del grupo. Cuando agregas un gasto, se divide equitativamente entre los miembros seleccionados, y el balance muestra la diferencia entre lo que cada persona pagó y lo que debería pagar.",
    },
    {
    question: "¿Qué son las liquidaciones sugeridas?",
    answer:
        "Las liquidaciones sugeridas muestran la forma más eficiente de saldar las deudas del grupo con el mínimo de transferencias.",
    },
    {
    question: "¿Puedo agregar miembros después de crear un grupo?",
    answer:
        "Por ahora los miembros se agregan al crear el grupo. La edición de miembros llegará en futuras actualizaciones.",
    },
    {
    question: "¿Los datos están seguros?",
    answer:
        "Sí. Los datos se almacenan de forma segura y solo son accesibles por vos y los miembros de tus grupos.",
    },
    {
    question: "¿Puedo editar o eliminar gastos?",
    answer:
        "Próximamente. Mientras tanto podés crear un gasto de ajuste.",
    },
];

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Ayuda y Soporte</h1>
        {onBack && (
        <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 text-sm"
        >
            ← Volver
        </button>
        )}
    </div>

    {/* FAQ */}
    <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Preguntas Frecuentes</h2>

        <div className="space-y-4">
        {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
            <button
                onClick={() => toggleFaq(index)}
                className="w-full px-4 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    expandedFaq === index ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedFaq === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-gray-600 pt-3">{faq.answer}</p>
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>

    {/* Contacto */}
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">¿Necesitás más ayuda?</h2>
        <p className="text-blue-800 mb-4">
        Si tenés una pregunta fuera de las FAQ o encontrás un problema, escribinos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
        {/* Abre la app de correo por defecto */}
        <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${SUBJECT}`}
            className="inline-flex justify-center items-center bg-blue-600 !text-white px-4 py-2 rounded-lg"
        >
            Contactar soporte
        </a>

        </div>

        <p className="text-xs text-blue-700 mt-3">
        También podés escribirnos a <span className="font-mono">{SUPPORT_EMAIL}</span>
        </p>
    </div>
    </div>
);
}
