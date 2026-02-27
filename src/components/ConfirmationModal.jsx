import React, { useEffect } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Confirm' }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onConfirm, onClose]);

    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative w-full max-w-md bg-[#0a0f1c] border ${isDanger ? 'border-red-500/20' : 'border-white/10'} rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100`}>
                <div className={`p-6 ${isDanger ? 'bg-red-500/5' : 'bg-white/5'} border-b ${isDanger ? 'border-red-500/10' : 'border-white/5'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            {isDanger ? <AlertTriangle size={24} /> : <Check size={24} />}
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="ml-auto text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-gray-300 leading-relaxed">
                        {message}
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            Cancel (Esc)
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-lg flex items-center gap-2 ${isDanger
                                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/20'
                                    : 'bg-gradient-to-r from-primary to-amber-300 text-black hover:opacity-90 shadow-amber-900/20'
                                }`}
                        >
                            {confirmText} <span className="text-[10px] opacity-60 ml-1 font-mono">↵</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
