import React, { useState } from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  ChevronRight,
  DollarSign,
  PiggyBank,
  Check,
  ListTodo,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  formatCurrency,
  formatDateBR,
  calculateMonthsDifference,
  calculateRequiredMonthlySaving
} from '../../utils/formatters';
import { Dream } from '../../types/finance';

interface DreamsViewProps {
  onOpenNewDream: () => void;
  onEditDream: (dream: Dream) => void;
}

export const DreamsView: React.FC<DreamsViewProps> = ({
  onOpenNewDream,
  onEditDream
}) => {
  const {
    dreams,
    deleteDream,
    toggleDreamTask,
    addDreamTask,
    deleteDreamTask,
    addDreamNote,
    depositToDream,
    accounts
  } = useFinance();

  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(
    dreams.length > 0 ? dreams[0].id : null
  );

  // Deposit modal state
  const [depositDreamId, setDepositDreamId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSourceAccount, setDepositSourceAccount] = useState(
    accounts.length > 0 ? accounts[0].id : ''
  );

  // New task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // New note state
  const [newNoteText, setNewNoteText] = useState('');

  const selectedDream = dreams.find((d) => d.id === selectedDreamId) || dreams[0] || null;

  // Global calculations
  const totalTarget = dreams.reduce((acc, d) => acc + d.targetAmount, 0);
  const totalSaved = dreams.reduce((acc, d) => acc + d.currentSaved, 0);
  const totalMonthlyNeeded = dreams.reduce(
    (acc, d) => (d.completed ? acc : acc + d.monthlySavingNeeded),
    0
  );

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0 || !depositDreamId) return;

    depositToDream(depositDreamId, val, depositSourceAccount);
    setDepositAmount('');
    setDepositDreamId(null);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedDream) return;
    addDreamTask(selectedDream.id, newTaskTitle.trim(), newTaskDueDate || undefined);
    setNewTaskTitle('');
    setNewTaskDueDate('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedDream) return;
    addDreamNote(selectedDream.id, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Planejamento Financeiro de Metas
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">Gerenciador de Sonhos</h1>
          <p className="text-xs text-emerald-100 mt-1">
            Economize com método, taxa de rendimento e prazos claros para conquistar o que deseja.
          </p>
        </div>

        <button
          onClick={onOpenNewDream}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Adicionar Novo Sonho
        </button>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Já Economizado</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {formatCurrency(totalSaved)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            De uma meta combinada de {formatCurrency(totalTarget)}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Aporte Mensal Recomendado</div>
          <div className="text-2xl font-bold font-mono text-teal-800 mt-1">
            {formatCurrency(totalMonthlyNeeded)}
            <span className="text-xs text-slate-500 font-normal"> /mês</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Para realizar os {dreams.filter((d) => !d.completed).length} sonho(s) ativos no prazo
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Progresso Geral das Metas</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Dream Cards List on Left, Selected Dream Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dreams List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
            Seus Sonhos ({dreams.length})
          </div>

          {dreams.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="font-semibold text-slate-700 text-sm">Você ainda não tem sonhos</div>
              <p className="text-xs text-slate-500 mt-1">
                Comece planejando sua próxima viagem, carro ou reserva financeira!
              </p>
              <button
                onClick={onOpenNewDream}
                className="mt-3 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Criar Meu Primeiro Sonho
              </button>
            </div>
          ) : (
            dreams.map((dream) => {
              const isSelected = selectedDream?.id === dream.id;
              const progress = Math.min(
                100,
                Math.round((dream.currentSaved / dream.targetAmount) * 100)
              );
              const monthsLeft = calculateMonthsDifference(
                new Date().toISOString().split('T')[0],
                dream.targetDate
              );

              return (
                <div
                  key={dream.id}
                  onClick={() => setSelectedDreamId(dream.id)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer relative shadow-2xs ${
                    isSelected
                      ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {dream.category}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">{dream.title}</h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Alvo: {formatDateBR(dream.targetDate)} ({monthsLeft} meses)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-emerald-700">
                        {progress}%
                      </div>
                      {dream.completed && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                          Conquistado!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dream.completed ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="text-slate-600">
                      Juntei: <span className="font-bold text-slate-900">{formatCurrency(dream.currentSaved)}</span>
                    </div>
                    <div className="text-slate-400">
                      Meta: {formatCurrency(dream.targetAmount)}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-emerald-800 font-semibold text-[11px]">
                      Aporte: {formatCurrency(dream.monthlySavingNeeded)}/mês
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDepositDreamId(dream.id);
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-md transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <PiggyBank className="w-3 h-3" />
                      Guardar Dinheiro
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Dream Detail Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDream ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                <div>
                  <div className="text-xs font-semibold text-emerald-700">
                    Detalhes do Sonho
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedDream.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDepositDreamId(selectedDream.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PiggyBank className="w-3.5 h-3.5" />
                    Adicionar Aporte
                  </button>

                  <button
                    onClick={() => onEditDream(selectedDream)}
                    className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                    title="Editar informações do sonho"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir o sonho "${selectedDream.title}"?`)) {
                        deleteDream(selectedDream.id);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Excluir este sonho"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {selectedDream.completed ? (
                <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-3 text-xs text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Parabéns! Meta 100% Alcançada!</span>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Você já acumulou todo o montante necessário para realizar este sonho com tranquilidade.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-sky-50/70 border-b border-sky-100 flex items-center gap-3 text-xs text-sky-900">
                  <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="font-bold">Planejamento em Andamento</span>
                    <p className="text-[11px] text-sky-700 mt-0.5">
                      Economizando{' '}
                      <span className="font-bold font-mono text-slate-900">
                        {formatCurrency(selectedDream.monthlySavingNeeded)}/mês
                      </span>{' '}
                      a um rendimento estimado de {selectedDream.monthlyYieldRate}% a.m., você chega lá na data prevista!
                    </p>
                  </div>
                </div>
              )}

              {/* Financial Metrics Breakdown */}
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400">Valor da Meta</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">
                    {formatCurrency(selectedDream.targetAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Guardado</div>
                  <div className="font-bold font-mono text-emerald-700 mt-0.5">
                    {formatCurrency(selectedDream.currentSaved)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Data de Realização</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {formatDateBR(selectedDream.targetDate)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Rendimento Mensal</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">
                    {selectedDream.monthlyYieldRate}% a.m.
                  </div>
                </div>
              </div>

              {/* Tasks / Steps Section */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-[#0F4C81]" />
                    <h3 className="font-bold text-sm text-slate-800">
                      Plano de Ação & Tarefas ({selectedDream.tasks.filter((t) => t.completed).length}/
                      {selectedDream.tasks.length})
                    </h3>
                  </div>
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTaskSubmit} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Adicionar novo passo ou tarefa..."
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  />
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none text-slate-600"
                    title="Data limite opcional"
                  />
                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-3 py-1.5 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0c3c66] disabled:opacity-50 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </form>

                {/* Tasks List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {selectedDream.tasks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Nenhuma tarefa cadastrada. Adicione os passos para realizar este sonho!
                    </div>
                  ) : (
                    selectedDream.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-colors ${
                          task.completed
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                          onClick={() => toggleDreamTask(selectedDream.id, task.id)}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span
                            className={`truncate ${
                              task.completed ? 'line-through text-slate-400' : 'font-medium'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          {task.dueDate && (
                            <span className="text-[11px] text-slate-400 font-mono">
                              {formatDateBR(task.dueDate)}
                            </span>
                          )}
                          <button
                            onClick={() => deleteDreamTask(selectedDream.id, task.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            title="Excluir tarefa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes / Diário do Sonho */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-sm text-slate-800">Anotações & Dicas</h3>
                </div>

                <form onSubmit={handleAddNoteSubmit} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Adicionar nota sobre cotações, ideias ou roteiro..."
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 cursor-pointer"
                  >
                    Salvar Nota
                  </button>
                </form>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {selectedDream.notes.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Nenhuma nota registrada ainda.
                    </div>
                  ) : (
                    selectedDream.notes.map((note, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-slate-700"
                      >
                        {note}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Deposit to Dream Modal */}
      {depositDreamId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">Guardar Dinheiro no Sonho</h3>
              </div>
              <button
                onClick={() => setDepositDreamId(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Valor a Economizar (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Ex: 500,00"
                  className="w-full text-base font-bold font-mono border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Deduzir da Conta (Opcional):
                </label>
                <select
                  value={depositSourceAccount}
                  onChange={(e) => setDepositSourceAccount(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="">Apenas atualizar saldo do sonho (sem transação)</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: {formatCurrency(acc.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositDreamId(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
