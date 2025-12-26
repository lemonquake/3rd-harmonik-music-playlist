
import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ShortcutItem {
    key: string;
    description: string;
    keyDisplay?: string;
}

const shortcuts: { category: string; items: ShortcutItem[] }[] = [
    {
        category: 'Playback',
        items: [
            { key: 'Space', description: 'Play / Pause', keyDisplay: '␣' },
            { key: 'ArrowRight', description: 'Next Track', keyDisplay: '→' },
            { key: 'ArrowLeft', description: 'Previous Track', keyDisplay: '←' },
            { key: 'S', description: 'Toggle Shuffle' },
            { key: 'R', description: 'Toggle Repeat' },
        ],
    },
    {
        category: 'Volume',
        items: [
            { key: 'ArrowUp', description: 'Volume Up', keyDisplay: '↑' },
            { key: 'ArrowDown', description: 'Volume Down', keyDisplay: '↓' },
            { key: 'M', description: 'Mute / Unmute' },
        ],
    },
    {
        category: 'Navigation',
        items: [
            { key: 'Q', description: 'Toggle Queue' },
            { key: 'P', description: 'Toggle Playlists' },
            { key: 'L', description: 'Toggle Library (Vault)' },
            { key: 'Escape', description: 'Close Panels', keyDisplay: 'Esc' },
            { key: '?', description: 'Show Shortcuts' },
        ],
    },
    {
        category: 'Special',
        items: [
            { key: 'G', description: 'Toggle Setlist (Gig) Mode' },
            { key: 'F', description: 'Favorite Current Song' },
        ],
    },
];

const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[600]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-[3rem] z-[650] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl p-8 pb-6 border-b border-white/10 z-10">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Keyboard className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-sync font-bold">Keyboard Shortcuts</h2>
                                    <p className="text-sm text-neutral-500">Control your music like a pro</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto max-h-[calc(80vh-120px)] custom-scrollbar">
                            <div className="grid md:grid-cols-2 gap-8">
                                {shortcuts.map((section) => (
                                    <div key={section.category}>
                                        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">
                                            {section.category}
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            {section.items.map((shortcut) => (
                                                <div
                                                    key={shortcut.key}
                                                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                                                >
                                                    <span className="text-sm text-neutral-300">
                                                        {shortcut.description}
                                                    </span>
                                                    <kbd className="min-w-[40px] px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-mono font-bold text-center">
                                                        {shortcut.keyDisplay || shortcut.key}
                                                    </kbd>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Tip */}
                            <div className="mt-8 p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl">
                                <p className="text-sm text-pink-400 text-center">
                                    <span className="font-bold">Pro Tip:</span> Press{' '}
                                    <kbd className="px-2 py-0.5 bg-pink-500/20 rounded text-xs font-mono">?</kbd>{' '}
                                    anytime to toggle this overlay
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default KeyboardShortcutsOverlay;
