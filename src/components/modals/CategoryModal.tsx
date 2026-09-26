import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, addSubcategory } = useFinance();

  const [mode, setMode] = useState<'main' | 'sub'>('main');
  const [name, setName] = useState('');
  const [type, setType] = useState<'despesa' | 'receita'>('despesa');
  const [selectedParentId, setSelectedParentId] = useState(categories[0]?.id || '');
  const [color, setColor] = useState('#EF4444');

  const colorPresets = [
    '#EF4444',
    '#F97316',
    '#F59E0B',
    '#10B981',
    '#059669',
    '#0F4C81',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#64748B'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'main') {
      addCategory({
        name: name.trim(),
        type,
        color,
        icon: 'Tag'
      });
    } else {
      if (!selectedParentId) return;
      addSubcategory(selectedParentId, name.trim());
    }

    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0F4C81]" />
            <h3 className="font-bold text-sm text-slate-800">Nova Categoria</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setMode('main')}
            className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              mode === 'main' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Categoria Principal
          </button>
          <button
            type="button"
            onClick={() => setMode('sub')}
            className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
              mode === 'sub' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Subcategoria
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'sub' ? (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Categoria Pai (Superior) *
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'despesa' ? 'Despesa' : 'Receita'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Tipo da Categoria</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('despesa')}
                  className={`py-1.5 px-3 rounded-lg border font-semibold cursor-pointer ${
                    type === 'despesa'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setType('receita')}
                  className={`py-1.5 px-3 rounded-lg border font-semibold cursor-pointer ${
                    type === 'receita'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Receita
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Nome da {mode === 'main' ? 'Categoria' : 'Subcategoria'} *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === 'main' ? 'Ex: Lazer, Pet Shop...' : 'Ex: Ração, Veterinário...'}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
            />
          </div>

          {mode === 'main' && (
            <div>
              <label className="block text-slate-600 font-semibold mb-1.5">Cor</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'scale-125 ring-2 ring-slate-800' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] cursor-pointer shadow-xs"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
