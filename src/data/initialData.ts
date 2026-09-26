import { Account, Category, CategoryRule, Dream, CategoryBudget, Transaction } from '../types/finance';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    name: 'Banco do Brasil',
    type: 'corrente',
    institution: 'Banco do Brasil',
    initialBalance: 3200.0,
    currentBalance: 4890.35,
    color: '#FACC15', // BB Yellow
    active: true
  },
  {
    id: 'acc-2',
    name: 'Nubank (Conta)',
    type: 'corrente',
    institution: 'Nubank',
    initialBalance: 1500.0,
    currentBalance: 2780.40,
    color: '#8B5CF6', // Purple
    active: true
  },
  {
    id: 'acc-3',
    name: 'Itaú Unibanco',
    type: 'corrente',
    institution: 'Itaú',
    initialBalance: 800.0,
    currentBalance: 1450.00,
    color: '#F97316', // Orange
    active: true
  },
  {
    id: 'acc-4',
    name: 'Reserva de Emergência (CDB)',
    type: 'investimento',
    institution: 'Sofisa Direto',
    initialBalance: 15000.0,
    currentBalance: 18650.00,
    color: '#10B981', // Emerald
    active: true
  },
  {
    id: 'acc-5',
    name: 'Carteira (Dinheiro)',
    type: 'carteira',
    institution: 'Dinheiro',
    initialBalance: 150.0,
    currentBalance: 240.00,
    color: '#64748B', // Slate
    active: true
  },
  {
    id: 'acc-card-1',
    name: 'Nubank Mastercard',
    type: 'cartao',
    institution: 'Nubank',
    creditLimit: 7500.0,
    closingDay: 20,
    dueDay: 27,
    initialBalance: 0,
    currentBalance: -1420.80,
    color: '#8B5CF6',
    active: true
  },
  {
    id: 'acc-card-2',
    name: 'Itaú Visa Platinum',
    type: 'cartao',
    institution: 'Itaú',
    creditLimit: 5000.0,
    closingDay: 10,
    dueDay: 17,
    initialBalance: 0,
    currentBalance: -580.00,
    color: '#EA580C',
    active: true
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-alimentacao',
    name: 'Alimentação',
    type: 'despesa',
    icon: 'Utensils',
    color: '#EF4444',
    subcategories: [
      { id: 'sub-supermercado', name: 'Supermercado', categoryId: 'cat-alimentacao' },
      { id: 'sub-restaurante', name: 'Restaurante', categoryId: 'cat-alimentacao' },
      { id: 'sub-padaria', name: 'Padaria / Café', categoryId: 'cat-alimentacao' },
      { id: 'sub-delivery', name: 'Lanches / Delivery', categoryId: 'cat-alimentacao' },
      { id: 'sub-feira', name: 'Feira / Sacolão', categoryId: 'cat-alimentacao' }
    ]
  },
  {
    id: 'cat-moradia',
    name: 'Casa / Habitação',
    type: 'despesa',
    icon: 'Home',
    color: '#3B82F6',
    subcategories: [
      { id: 'sub-aluguel', name: 'Aluguel', categoryId: 'cat-moradia' },
      { id: 'sub-condominio', name: 'Condomínio', categoryId: 'cat-moradia' },
      { id: 'sub-luz', name: 'Energia Elétrica (Luz)', categoryId: 'cat-moradia' },
      { id: 'sub-agua', name: 'Água e Esgoto', categoryId: 'cat-moradia' },
      { id: 'sub-gas', name: 'Gás', categoryId: 'cat-moradia' },
      { id: 'sub-internet', name: 'Internet / Wi-Fi', categoryId: 'cat-moradia' },
      { id: 'sub-manutencao', name: 'Manutenção da Casa', categoryId: 'cat-moradia' }
    ]
  },
  {
    id: 'cat-transporte',
    name: 'Transporte',
    type: 'despesa',
    icon: 'Car',
    color: '#F59E0B',
    subcategories: [
      { id: 'sub-combustivel', name: 'Combustível', categoryId: 'cat-transporte' },
      { id: 'sub-uber', name: 'Aplicativo (Uber/99)', categoryId: 'cat-transporte' },
      { id: 'sub-transp-publico', name: 'Metrô / Ônibus', categoryId: 'cat-transporte' },
      { id: 'sub-estacionamento', name: 'Estacionamento / Pedágio', categoryId: 'cat-transporte' },
      { id: 'sub-manut-auto', name: 'Manutenção do Carro', categoryId: 'cat-transporte' },
      { id: 'sub-ipva', name: 'IPVA / Seguro Auto', categoryId: 'cat-transporte' }
    ]
  },
  {
    id: 'cat-saude',
    name: 'Saúde & Cuidados',
    type: 'despesa',
    icon: 'Activity',
    color: '#10B981',
    subcategories: [
      { id: 'sub-plano-saude', name: 'Plano de Saúde', categoryId: 'cat-saude' },
      { id: 'sub-farmacia', name: 'Farmácia & Remédios', categoryId: 'cat-saude' },
      { id: 'sub-consultas', name: 'Consultas / Dentista', categoryId: 'cat-saude' },
      { id: 'sub-exames', name: 'Exames', categoryId: 'cat-saude' }
    ]
  },
  {
    id: 'cat-educacao',
    name: 'Educação',
    type: 'despesa',
    icon: 'GraduationCap',
    color: '#6366F1',
    subcategories: [
      { id: 'sub-cursos', name: 'Cursos & Treinamentos', categoryId: 'cat-educacao' },
      { id: 'sub-faculdade', name: 'Faculdade / Pós-graduação', categoryId: 'cat-educacao' },
      { id: 'sub-livros', name: 'Livros & Material', categoryId: 'cat-educacao' }
    ]
  },
  {
    id: 'cat-lazer',
    name: 'Lazer & Entretenimento',
    type: 'despesa',
    icon: 'Tv',
    color: '#EC4899',
    subcategories: [
      { id: 'sub-streaming', name: 'Streaming (Netflix, Spotify)', categoryId: 'cat-lazer' },
      { id: 'sub-cinema', name: 'Cinema, Teatro & Shows', categoryId: 'cat-lazer' },
      { id: 'sub-viagens', name: 'Viagens & Passeios', categoryId: 'cat-lazer' },
      { id: 'sub-bar', name: 'Bar & Balada', categoryId: 'cat-lazer' }
    ]
  },
  {
    id: 'cat-gastos-pessoais',
    name: 'Gastos Pessoais',
    type: 'despesa',
    icon: 'User',
    color: '#8B5CF6',
    subcategories: [
      { id: 'sub-roupas', name: 'Roupas e Calçados', categoryId: 'cat-gastos-pessoais' },
      { id: 'sub-beleza', name: 'Salão de Beleza / Barbearia', categoryId: 'cat-gastos-pessoais' },
      { id: 'sub-academia', name: 'Academia', categoryId: 'cat-gastos-pessoais' }
    ]
  },
  {
    id: 'cat-servicos-fin',
    name: 'Serviços Financeiros',
    type: 'despesa',
    icon: 'Landmark',
    color: '#64748B',
    subcategories: [
      { id: 'sub-tarifas', name: 'Tarifas Bancárias', categoryId: 'cat-servicos-fin' },
      { id: 'sub-anuidade', name: 'Anuidade de Cartão', categoryId: 'cat-servicos-fin' },
      { id: 'sub-iof', name: 'Juros e IOF', categoryId: 'cat-servicos-fin' }
    ]
  },
  // Receitas
  {
    id: 'cat-receitas-salario',
    name: 'Salário & Remuneração',
    type: 'receita',
    icon: 'DollarSign',
    color: '#059669',
    subcategories: [
      { id: 'sub-salario-mensal', name: 'Salário Mensal', categoryId: 'cat-receitas-salario' },
      { id: 'sub-adiantamento', name: 'Adiantamento', categoryId: 'cat-receitas-salario' },
      { id: 'sub-13-salario', name: '13º Salário', categoryId: 'cat-receitas-salario' },
      { id: 'sub-ferias', name: 'Férias', categoryId: 'cat-receitas-salario' }
    ]
  },
  {
    id: 'cat-receitas-investimentos',
    name: 'Rendimentos & Investimentos',
    type: 'receita',
    icon: 'TrendingUp',
    color: '#0D9488',
    subcategories: [
      { id: 'sub-dividendos', name: 'Dividendos / FIIs', categoryId: 'cat-receitas-investimentos' },
      { id: 'sub-juros-cdb', name: 'Rendimento CDB / Tesouro', categoryId: 'cat-receitas-investimentos' }
    ]
  },
  {
    id: 'cat-outras-receitas',
    name: 'Outras Receitas',
    type: 'receita',
    icon: 'PlusCircle',
    color: '#14B8A6',
    subcategories: [
      { id: 'sub-reembolso', name: 'Reembolso', categoryId: 'cat-outras-receitas' },
      { id: 'sub-vendas', name: 'Venda de Bens', categoryId: 'cat-outras-receitas' },
      { id: 'sub-presentes', name: 'Presentes / Bonificações', categoryId: 'cat-outras-receitas' }
    ]
  }
];

export const INITIAL_RULES: CategoryRule[] = [
  { id: 'rule-1', keyword: 'uber', categoryId: 'cat-transporte', subcategoryId: 'sub-uber' },
  { id: 'rule-2', keyword: '99app', categoryId: 'cat-transporte', subcategoryId: 'sub-uber' },
  { id: 'rule-3', keyword: 'supermercado', categoryId: 'cat-alimentacao', subcategoryId: 'sub-supermercado' },
  { id: 'rule-4', keyword: 'pao de acucar', categoryId: 'cat-alimentacao', subcategoryId: 'sub-supermercado' },
  { id: 'rule-5', keyword: 'carrefour', categoryId: 'cat-alimentacao', subcategoryId: 'sub-supermercado' },
  { id: 'rule-6', keyword: 'netflix', categoryId: 'cat-lazer', subcategoryId: 'sub-streaming' },
  { id: 'rule-7', keyword: 'spotify', categoryId: 'cat-lazer', subcategoryId: 'sub-streaming' },
  { id: 'rule-8', keyword: 'posto', categoryId: 'cat-transporte', subcategoryId: 'sub-combustivel' },
  { id: 'rule-9', keyword: 'ipiranga', categoryId: 'cat-transporte', subcategoryId: 'sub-combustivel' },
  { id: 'rule-10', keyword: 'drogasil', categoryId: 'cat-saude', subcategoryId: 'sub-farmacia' },
  { id: 'rule-11', keyword: 'raia', categoryId: 'cat-saude', subcategoryId: 'sub-farmacia' },
  { id: 'rule-12', keyword: 'aluguel', categoryId: 'cat-moradia', subcategoryId: 'sub-aluguel' },
  { id: 'rule-13', keyword: 'condominio', categoryId: 'cat-moradia', subcategoryId: 'sub-condominio' },
  { id: 'rule-14', keyword: 'salario', categoryId: 'cat-receitas-salario', subcategoryId: 'sub-salario-mensal' },
  { id: 'rule-15', keyword: 'smart fit', categoryId: 'cat-gastos-pessoais', subcategoryId: 'sub-academia' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // September 2026 transactions
  {
    id: 'tx-1',
    date: '2026-09-05',
    description: 'Salário Mensal - Tech Corp',
    amount: 8500.00,
    type: 'receita',
    accountId: 'acc-1',
    categoryId: 'cat-receitas-salario',
    subcategoryId: 'sub-salario-mensal',
    consolidated: true,
    notes: 'Depósito em conta corrente'
  },
  {
    id: 'tx-2',
    date: '2026-09-06',
    description: 'Aplicação Automática Reserva',
    amount: 1500.00,
    type: 'transferencia',
    accountId: 'acc-1',
    targetAccountId: 'acc-4',
    consolidated: true,
    notes: 'Aporte mensal planejado para CDB'
  },
  {
    id: 'tx-3',
    date: '2026-09-07',
    description: 'Aluguel do Apartamento',
    amount: 1950.00,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-moradia',
    subcategoryId: 'sub-aluguel',
    consolidated: true
  },
  {
    id: 'tx-4',
    date: '2026-09-08',
    description: 'Condomínio Residencial',
    amount: 580.00,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-moradia',
    subcategoryId: 'sub-condominio',
    consolidated: true
  },
  {
    id: 'tx-5',
    date: '2026-09-10',
    description: 'Supermercado Pão de Açúcar',
    amount: 642.80,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-alimentacao',
    subcategoryId: 'sub-supermercado',
    consolidated: true,
    notes: 'Compras de mantimentos do mês'
  },
  {
    id: 'tx-6',
    date: '2026-09-12',
    description: 'Posto Ipiranga - Abastecimento',
    amount: 220.00,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-transporte',
    subcategoryId: 'sub-combustivel',
    consolidated: true
  },
  {
    id: 'tx-7',
    date: '2026-09-13',
    description: 'Plano de Saúde Unimed',
    amount: 480.00,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-saude',
    subcategoryId: 'sub-plano-saude',
    consolidated: true
  },
  {
    id: 'tx-8',
    date: '2026-09-15',
    description: 'Conta de Energia (Enel)',
    amount: 195.40,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-moradia',
    subcategoryId: 'sub-luz',
    consolidated: true
  },
  {
    id: 'tx-9',
    date: '2026-09-16',
    description: 'Internet Fibra Óptica Vivo',
    amount: 139.90,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-moradia',
    subcategoryId: 'sub-internet',
    consolidated: true
  },
  {
    id: 'tx-10',
    date: '2026-09-18',
    description: 'Restaurante Outback Steakhouse',
    amount: 185.00,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-alimentacao',
    subcategoryId: 'sub-restaurante',
    consolidated: true
  },
  {
    id: 'tx-11',
    date: '2026-09-19',
    description: 'Netflix & Spotify Assinaturas',
    amount: 79.80,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-lazer',
    subcategoryId: 'sub-streaming',
    consolidated: true
  },
  {
    id: 'tx-12',
    date: '2026-09-20',
    description: 'Farmácia Drogasil - Vitaminas',
    amount: 114.50,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-saude',
    subcategoryId: 'sub-farmacia',
    consolidated: true
  },
  {
    id: 'tx-13',
    date: '2026-09-22',
    description: 'Uber Viagens Trabalho',
    amount: 68.40,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-transporte',
    subcategoryId: 'sub-uber',
    consolidated: true
  },
  {
    id: 'tx-14',
    date: '2026-09-24',
    description: 'Mensalidade Smart Fit',
    amount: 129.90,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-gastos-pessoais',
    subcategoryId: 'sub-academia',
    consolidated: true
  },
  {
    id: 'tx-15',
    date: '2026-09-25',
    description: 'Rendimento Líquido CDB 100% CDI',
    amount: 168.20,
    type: 'receita',
    accountId: 'acc-4',
    categoryId: 'cat-receitas-investimentos',
    subcategoryId: 'sub-juros-cdb',
    consolidated: true
  },
  {
    id: 'tx-16',
    date: '2026-09-26', // Today!
    description: 'Padaria da Esquina - Café e Pão',
    amount: 32.50,
    type: 'despesa',
    accountId: 'acc-5',
    categoryId: 'cat-alimentacao',
    subcategoryId: 'sub-padaria',
    consolidated: true
  },
  {
    id: 'tx-17',
    date: '2026-09-28', // Upcoming
    description: 'Supermercado Carrefour Reposição',
    amount: 380.00,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-alimentacao',
    subcategoryId: 'sub-supermercado',
    consolidated: false,
    hasReminder: true,
    notes: 'Compra semanal prevista'
  },
  {
    id: 'tx-18',
    date: '2026-09-29', // Upcoming
    description: 'Curso Especialização Online',
    amount: 250.00,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-educacao',
    subcategoryId: 'sub-cursos',
    consolidated: false,
    installment: { current: 3, total: 6 }
  },
  {
    id: 'tx-19',
    date: '2026-09-30', // Upcoming
    description: 'Fatura Cartão Nubank',
    amount: 980.00,
    type: 'transferencia',
    accountId: 'acc-1',
    targetAccountId: 'acc-2',
    consolidated: false,
    notes: 'Liquidação da fatura do mês'
  },
  // August 2026 history
  {
    id: 'tx-20',
    date: '2026-08-05',
    description: 'Salário Mensal - Tech Corp',
    amount: 8500.00,
    type: 'receita',
    accountId: 'acc-1',
    categoryId: 'cat-receitas-salario',
    subcategoryId: 'sub-salario-mensal',
    consolidated: true
  },
  {
    id: 'tx-21',
    date: '2026-08-07',
    description: 'Aluguel do Apartamento',
    amount: 1950.00,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-moradia',
    subcategoryId: 'sub-aluguel',
    consolidated: true
  },
  {
    id: 'tx-22',
    date: '2026-08-10',
    description: 'Supermercados do Mês',
    amount: 1120.00,
    type: 'despesa',
    accountId: 'acc-2',
    categoryId: 'cat-alimentacao',
    subcategoryId: 'sub-supermercado',
    consolidated: true
  },
  {
    id: 'tx-23',
    date: '2026-08-15',
    description: 'Contas de Consumo (Luz, Água, Net)',
    amount: 490.00,
    type: 'despesa',
    accountId: 'acc-1',
    categoryId: 'cat-moradia',
    subcategoryId: 'sub-luz',
    consolidated: true
  },
  {
    id: 'tx-24',
    date: '2026-08-25',
    description: 'Rendimento CDB',
    amount: 162.00,
    type: 'receita',
    accountId: 'acc-4',
    categoryId: 'cat-receitas-investimentos',
    subcategoryId: 'sub-juros-cdb',
    consolidated: true
  }
];

export const INITIAL_DREAMS: Dream[] = [
  {
    id: 'dream-1',
    title: 'Viagem de Férias para Europa',
    targetAmount: 25000.00,
    currentSaved: 16500.00,
    startDate: '2026-01-01',
    targetDate: '2026-12-20',
    monthlyYieldRate: 0.85, // % a.m.
    monthlySavingNeeded: 2800.00,
    category: 'Viagens & Turismo',
    notes: [
      'Passagens aéreas ida e volta pesquisadas para Lisboa / Paris.',
      'Hospedagem reservada com cancelamento grátis.',
      'Comprar euros aos poucos quando houver queda na cotação.'
    ],
    tasks: [
      { id: 'task-1', title: 'Renovar passaporte', dueDate: '2026-07-15', completed: true },
      { id: 'task-2', title: 'Comprar passagens aéreas', dueDate: '2026-09-10', completed: true },
      { id: 'task-3', title: 'Emitir seguro viagem internacional', dueDate: '2026-11-01', completed: false },
      { id: 'task-4', title: 'Comprar 1.500 Euros no cartão multimoedas', dueDate: '2026-11-20', completed: false },
      { id: 'task-5', title: 'Montar roteiro dos passeios e museus', dueDate: '2026-12-05', completed: false }
    ],
    completed: false
  },
  {
    id: 'dream-2',
    title: 'Entrada do Apartamento Próprio',
    targetAmount: 80000.00,
    currentSaved: 48500.00,
    startDate: '2025-06-01',
    targetDate: '2027-06-30',
    monthlyYieldRate: 0.85,
    monthlySavingNeeded: 3100.00,
    category: 'Bens & Imóveis',
    notes: [
      'Alvo de 20% do valor do imóvel (estimado em R$ 400.000).',
      'Investindo 100% no CDB com liquidez diária e Tesouro IPCA+.'
    ],
    tasks: [
      { id: 'task-21', title: 'Simular financiamento Caixa / Itaú', dueDate: '2026-10-15', completed: false },
      { id: 'task-22', title: 'Verificar saldo do FGTS para amortização', dueDate: '2026-11-01', completed: true },
      { id: 'task-23', title: 'Visitar 5 empreendimentos na região sul', dueDate: '2027-01-20', completed: false }
    ],
    completed: false
  },
  {
    id: 'dream-3',
    title: 'Reserva de Emergência (6 Meses)',
    targetAmount: 20000.00,
    currentSaved: 18650.00,
    startDate: '2025-01-01',
    targetDate: '2026-10-31',
    monthlyYieldRate: 0.85,
    monthlySavingNeeded: 1350.00,
    category: 'Segurança Financeira',
    notes: [
      'Cobre 6 meses do custo fixo essencial (R$ 3.300/mês).',
      'Faltam apenas R$ 1.350,00 para atingir a meta integral!'
    ],
    tasks: [
      { id: 'task-31', title: 'Abrir conta em banco com CDB 100% CDI diário', completed: true },
      { id: 'task-32', title: 'Alcançar os primeiros R$ 10.000', completed: true },
      { id: 'task-33', title: 'Aporte final de R$ 1.350 em Outubro', dueDate: '2026-10-10', completed: false }
    ],
    completed: false
  }
];

export const INITIAL_BUDGET: CategoryBudget[] = [
  {
    categoryId: 'cat-alimentacao',
    plannedMonthly: [1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 2000, 2200]
  },
  {
    categoryId: 'cat-moradia',
    plannedMonthly: [2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900, 2900]
  },
  {
    categoryId: 'cat-transporte',
    plannedMonthly: [650, 650, 650, 650, 650, 650, 650, 650, 650, 650, 700, 800]
  },
  {
    categoryId: 'cat-saude',
    plannedMonthly: [600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600, 600]
  },
  {
    categoryId: 'cat-educacao',
    plannedMonthly: [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300]
  },
  {
    categoryId: 'cat-lazer',
    plannedMonthly: [450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 600, 900]
  },
  {
    categoryId: 'cat-gastos-pessoais',
    plannedMonthly: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 500, 600]
  },
  {
    categoryId: 'cat-servicos-fin',
    plannedMonthly: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
  }
];

export const INVESTMENT_BENCHMARKS = [
  { name: 'CDI', annualRate: 10.75, monthlyRate: 0.85, type: 'benchmark', description: 'Taxa dos depósitos interfinanceiros da Cetip' },
  { name: 'Selic', annualRate: 10.75, monthlyRate: 0.85, type: 'benchmark', description: 'Taxa básica de juros do Banco Central' },
  { name: 'Poupança Nova (Regra Vigente)', annualRate: 6.17, monthlyRate: 0.50, type: 'poupanca', description: 'TR + 0,5% a.m. (isenta de IR)' },
  { name: 'CDB 100% do CDI', annualRate: 10.75, monthlyRate: 0.85, type: 'cdb', description: 'Rendimento de 100% da taxa DI' },
  { name: 'CDB 112% do CDI (Bancos Médios)', annualRate: 12.04, monthlyRate: 0.95, type: 'cdb', description: 'CDB emitido por bancos médios com FGC' },
  { name: 'Ibovespa (Acumulado 12M)', annualRate: 14.80, monthlyRate: 1.15, type: 'renda_variavel', description: 'Índice da Bolsa de Valores de São Paulo' }
];
