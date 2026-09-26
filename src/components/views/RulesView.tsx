import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Search,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Tag
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const RulesView: React.FC = () => {
  const { rules, categories, addRule, deleteRule, suggestCategoryForDescription } = useFinance();

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  // Interactive Test Box State
  const [testDescription, setTestDescription] = useState('Uber para o trabalho');

  const selectedCatObj = categories.find((c) => c.id === selectedCategory);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !selectedCategory) return;

    addRule({
      keyword: keyword.trim().toLowerCase(),
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory || undefined
    });

    setKeyword('');
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const testMatch = suggestCategoryForDescription(testDescription);
  const matchedCategory = categories.find((c) => c.id === testMatch.categoryId);
  const matchedSubcategory = matchedCategory?.subcategories.find(
    (s) => s.id === testMatch.subcategoryId
  );

  const filteredRules = rules.filter((r) =>
    r.keyword.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-[#0F4C81] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-sky-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Automação de Transações
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Regras de Categorização Automática
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            O Minhas Economias reconhece termos na descrição das transações ou extratos bancários e atribui a categoria correta automaticamente.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Add Rule / Test on Left, Rules Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create Rule & Interactive Tester (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Rule Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0F4C81]" />
              Nova Regra de Categorização
            </h2>

            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Palavra-chave da descrição *
                </label>
                <input
                  type="text"
                  required
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: uber, netflix, carrefour, farmacia"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Qualquer transação que contenha essa palavra será associada à categoria abaixo.
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Categoria Alvo *</label>
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('');
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
                >
                  <option value="">-- Selecione uma categoria --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === 'despesa' ? 'Despesa' : 'Receita'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCatObj && selectedCatObj.subcategories.length > 0 && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Subcategoria (Opcional)
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-[#0F4C81] focus:outline-none"
                  >
                    <option value="">Sem subcategoria específica</option>
                    {selectedCatObj.subcategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-[#0F4C81] text-white font-semibold rounded-lg hover:bg-[#0c3c66] transition-colors shadow-2xs cursor-pointer mt-2"
              >
                Cadastrar Regra
              </button>
            </form>
          </div>

          {/* Interactive Test Box */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F4C81]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Simulador de Reconhecimento
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Digite uma descrição qualquer para verificar qual categoria suas regras ativam:
            </p>

            <input
              type="text"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
              className="w-full border border-sky-300 rounded-lg p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
            />

            <div className="p-3 bg-white rounded-lg border border-sky-200/60 text-xs">
              {matchedCategory ? (
                <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Categoria identificada: <strong>{matchedCategory.name}</strong>
                    {matchedSubcategory && ` / ${matchedSubcategory.name}`}
                  </span>
                </div>
              ) : (
                <div className="text-slate-400 italic">
                  Nenhuma regra existente identificou esta descrição.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Existing Rules Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-800">
                Regras Ativas ({filteredRules.length})
              </h2>

              <div className="relative w-48 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filtrar palavra..."
                  className="w-full pl-8 pr-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredRules.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Nenhuma regra encontrada com esse filtro.
                </div>
              ) : (
                filteredRules.map((rule) => {
                  const cat = categories.find((c) => c.id === rule.categoryId);
                  const sub = cat?.subcategories.find((s) => s.id === rule.subcategoryId);

                  return (
                    <div
                      key={rule.id}
                      className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {rule.keyword}
                        </span>
                        <span className="text-slate-400">→</span>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat?.color || '#94A3B8' }}
                          />
                          <span className="font-medium text-slate-700">{cat?.name}</span>
                          {sub && <span className="text-slate-400 text-[11px]">/ {sub.name}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                        title="Excluir regra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
