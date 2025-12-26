
import React, { useState } from 'react';
import { X, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePlaylist: (name: string, description?: string) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
    isOpen,
    onClose,
    onCreatePlaylist,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreatePlaylist(name.trim(), description.trim() || undefined);
            setName('');
            setDescription('');
            onClose();
        }
    };

    const handleClose = () => {
        setName('');
        setDescription('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[500]"
                        onClick={handleClose}
                    />

                    {/* Modal Container - Flex centering for reliable positioning */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[550] flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="relative p-8 pb-6 border-b border-white/10">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-6 right-6 p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center">
                                        <Music className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-sync font-bold">New Playlist</h2>
                                        <p className="text-sm text-neutral-500">Create your own collection</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="mb-6">
                                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">
                                        Playlist Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Awesome Playlist"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all placeholder:text-neutral-600"
                                        autoFocus
                                    />
                                </div>

                                <div className="mb-8">
                                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-3">
                                        Description
                                        <span className="text-neutral-600 ml-2">(optional)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a description..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all placeholder:text-neutral-600 resize-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!name.trim()}
                                        className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed rounded-2xl font-bold text-sm transition-all"
                                    >
                                        Create Playlist
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreatePlaylistModal;
