import React, { useState } from 'react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => Promise<void>;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSubscribe();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      data-testid="paywall-modal"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          data-testid="paywall-close-button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Muro de Pago (402 Payment Required)
          </span>
          <h2 className="text-2xl font-black text-white">Créditos de Prueba Agotados</h2>
          <p className="text-slate-300 text-sm">
            Has utilizado todos tus créditos gratuitos. Suscríbete para acceder de forma ilimitada a todos los cursos y evaluaciones orales con el Docente Virtual 3D.
          </p>
        </div>

        {/* Resumen del Plan */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">Plan Premium Mensual</p>
            <p className="text-xs text-slate-400">Acceso ilimitado + Tutoría 3D</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-white">$19.99</p>
            <p className="text-xs text-slate-400">USD / mes</p>
          </div>
        </div>

        {/* Formulario Stripe Sandbox */}
        <form onSubmit={handlePay} className="space-y-4">
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
            <span className="font-bold">Sandbox Stripe:</span>
            <span>Usa la tarjeta de prueba 4242 para continuar.</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Tarjeta (Stripe Test)
              </label>
              <input
                type="text"
                data-testid="stripe-card-number-input"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Expiración (MM/AA)
                </label>
                <input
                  type="text"
                  data-testid="stripe-expiry-input"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">CVC</label>
                <input
                  type="text"
                  data-testid="stripe-cvc-input"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-rose-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            data-testid="stripe-sandbox-pay-button"
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/25 transition disabled:opacity-50"
          >
            {isLoading ? 'Procesando pago en Stripe...' : 'Suscribirme con Tarjeta de Prueba Stripe'}
          </button>
        </form>
      </div>
    </div>
  );
};
