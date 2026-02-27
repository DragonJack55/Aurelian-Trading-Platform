import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const RejectionModal = ({ isOpen, onClose, onConfirm, title = 'Reject Item', message = 'Please provide a reason for this rejection:' }) => {
    const [reason, setReason] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setReason('');
            // Focus on input when opened
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(reason);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleConfirm();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#0a0f1c] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                <div className="p-6 bg-red-500/5 border-b border-red-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                            <AlertTriangle size={24} />
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
                    <p className="text-gray-300 mb-4 text-sm font-medium">
                        {message}
                    </p>

                    <textarea
                        ref={inputRef}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter rejection reason..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 outline-none resize-none min-h-[120px] mb-6"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!reason.trim()}
                            className="px-6 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-red-900/20"
                        >
                            Reject Investigation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;
