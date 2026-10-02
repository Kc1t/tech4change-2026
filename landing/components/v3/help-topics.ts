export interface HelpLink {
  label: string
  href: string
}

export interface HelpTopic {
  id: string
  question: string
  keywords: string[]
  answer: string
  links?: HelpLink[]
  next: string[]
}

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'como-funciona',
    question: 'Como o eilo funciona?',
    keywords: ['como funciona', 'como ele funciona', 'como o eilo funciona', 'funciona como', 'como usa', 'como usar', 'o que faz', 'pra que serve', 'para que serve', 'explica', 'passo a passo', 'como e', 'o que e o eilo'],
    answer:
      'Você toca uma vez e eu começo a ouvir a conversa junto. Quando a palavra some no meio da frase, eu percebo a pausa e dou uma pista de cada vez, da mais distante à mais próxima. Quando a palavra sai, eu reconheço sozinho e volto a ouvir.',
    links: [{ label: 'Ver o passo a passo', href: '#na-pratica' }],
    next: ['pistas', 'grava', 'experimentar']
  },
  {
    id: 'pistas',
    question: 'Que pistas ele dá?',
    keywords: ['pista', 'pistas', 'dica', 'dicas', 'degrau', 'degraus', 'escada', 'ajuda a lembrar', 'lembrar'],
    answer:
      'Primeiro a mais distante, como “é da família”. Depois a relação (“a neta”), o lugar (“mora em Sorocaba”) e só no fim o começo do som (“Le…”). A ideia é a palavra sair de você, e não de mim.',
    next: ['fala-por-mim', 'onde-chega', 'mapa']
  },
  {
    id: 'grava',
    question: 'Ele grava as conversas?',
    keywords: ['grava*', 'gravacao', 'escuta o que', 'ouve o que', 'ouve tudo', 'escuta tudo', 'ouvindo tudo', 'espiona', 'microfone', 'audio', 'privacidade', 'seguro', 'seguranca', 'dados'],
    answer:
      'Não. Eu só ouço depois que você toca, e outro toque pausa. O som vira texto na hora, num serviço de transcrição, e é descartado. Nenhum áudio fica guardado, nem no celular nem no servidor.',
    next: ['nomes-ia', 'internet', 'voz']
  },
  {
    id: 'nomes-ia',
    question: 'A IA fica sabendo dos nomes?',
    keywords: ['ia', 'inteligencia artificial', 'nome', 'nomes', 'sabe quem', 'chatgpt', 'modelo', 'robo'],
    answer:
      'A IA que escolhe a ordem das pistas recebe só códigos, como n_1fd17c, e as ligações entre eles. Os nomes ficam no aparelho. Só no primeiro acesso o que você conta passa uma vez por uma IA, para separar nome, parentesco e cidade, sem ficar guardado no servidor. Toda pista precisa citar uma ligação real do mapa da família; se não cita, eu uso uma escada pronta.',
    links: [{ label: 'Ver por dentro', href: '#como-funciona' }],
    next: ['grava', 'mapa']
  },
  {
    id: 'fala-por-mim',
    question: 'Ele fala a palavra por mim?',
    keywords: ['fala por mim', 'fala a palavra', 'diz a palavra', 'responde por mim', 'adivinha', 'completa'],
    answer:
      'Não de primeira. Eu começo pela pista mais distante e só no fim dou o começo do som. Quando a palavra sai de você, ela volta mais fácil da próxima vez, e por isso a próxima pista já começa mais longe.',
    next: ['pistas', 'fono']
  },
  {
    id: 'fono',
    question: 'Substitui a fonoaudióloga?',
    keywords: ['fono', 'fonoaudiologa', 'fonoaudiologo', 'fonoaudiologia', 'terapeuta', 'terapia', 'substitui', 'tratamento', 'medico'],
    answer:
      'Não. Eu levo para os outros dias da semana uma técnica que a fono já usa na sessão. E devolvo para ela um painel com o que aconteceu, palavra por palavra, para ela decidir o próximo passo.',
    links: [{ label: 'Ver o painel da fono', href: '/fono' }],
    next: ['painel', 'pistas']
  },
  {
    id: 'painel',
    question: 'O que a fono vê no painel?',
    keywords: ['painel*', 'fono ve', 'fono vê', 'a fono acompanha', 'relatorio', 'acompanhar', 'acompanha', 'evolucao', 'progresso', 'graficos', 'grafico'],
    answer:
      'Ela vê quantas vezes a palavra travou fora da sessão, quantas pistas cada palavra precisou e se isso está caindo semana a semana. Um assistente resume a semana e sugere o que levar para a sessão, e a decisão é sempre dela.',
    links: [{ label: 'Abrir o painel', href: '/fono' }],
    next: ['fono', 'nomes-ia']
  },
  {
    id: 'mapa',
    question: 'Como ele sabe quem é quem?',
    keywords: ['quem e quem', 'familia', 'parentes', 'neta', 'neto', 'filho', 'filha', 'mapa', 'cadastro', 'cadastrar', 'configurar', 'primeira vez', 'conhece'],
    answer:
      'Na primeira vez, é uma conversa curta: você conta do seu jeito quem você mais vê, o que essa pessoa é sua e onde ela mora, e eu só pergunto o que faltar. Com isso eu monto o mapa da vida, e daí em diante ele se mantém sozinho.',
    next: ['idoso', 'pistas']
  },
  {
    id: 'idoso',
    question: 'Serve para quem não mexe bem no celular?',
    keywords: ['idoso', 'idosa', 'vo', 'vovo', 'mexer', 'consegue', 'conseguir', 'consegue usar', 'velho', 'velha', 'avo', 'mae', 'pai', 'nao mexe', 'nao sabe mexer', 'dificil', 'facil', 'complicado', 'tecnologia', 'anos'],
    answer:
      'Serve, foi pensado para isso. Depois que a família monta o mapa, o uso é um toque para ouvir e outro para pausar. Não tem menu para navegar nem botão de “lembrei”: eu percebo sozinho quando a palavra sai.',
    next: ['mapa', 'onde-chega']
  },
  {
    id: 'onde-chega',
    question: 'A pista aparece onde?',
    keywords: ['relogio*', 'smartwatch*', 'apple watch', 'fone', 'ouvido', 'vibra', 'vibracao', 'tela', 'onde aparece', 'onde chega', 'aparece'],
    answer:
      'Na tela do celular, no fone de ouvido, com uma voz que você escolhe, ou como vibração no relógio, um pulso por sílaba. Assim a conversa não para para ninguém olhar o celular.',
    links: [{ label: 'Ver os aparelhos', href: '#gadgets' }],
    next: ['voz', 'pistas']
  },
  {
    id: 'voz',
    question: 'Posso escolher a voz?',
    keywords: ['voz', 'vozes', 'falar alto', 'som', 'volume', 'sem voz'],
    answer:
      'Pode. São quatro vozes calmas, e dá para usar sem voz também. Se escolher uma voz, só o texto da pista vai para o serviço de voz, para virar áudio.',
    next: ['tempo', 'onde-chega']
  },
  {
    id: 'tempo',
    question: 'Quanto tempo ele espera a pausa?',
    keywords: ['quanto tempo', 'tempo', 'pausa', 'espera', 'demora', 'rapido', 'devagar', 'calma', 'segundos', 'paciencia', 'interrompe'],
    answer:
      'Você escolhe: com calma (3 segundos), no meio (2 segundos) ou mais rápido (1,3 segundo). Eu nunca corto a fala, só apareço quando a pausa passa desse tempo.',
    next: ['como-funciona', 'voz']
  },
  {
    id: 'internet',
    question: 'Funciona sem internet?',
    keywords: ['internet*', 'offline*', 'sem rede', 'wifi', 'wi fi', 'conexao', 'dados moveis', '4g'],
    answer:
      'Sem conexão, eu ainda percebo a pausa e dou as pistas com uma escada montada no próprio aparelho. Com internet, a transcrição e a ordem das pistas ficam mais precisas.',
    next: ['grava', 'experimentar']
  },
  {
    id: 'afasia',
    question: 'O que é afasia?',
    keywords: ['afasia*', 'avc*', 'derrame*', 'anomia', 'esquece palavra', 'esquecer palavras', 'some a palavra', 'palavra some', 'trava'],
    answer:
      'Afasia é quando, depois de uma lesão como um AVC, a pessoa sabe o que quer dizer, mas a palavra não sai. Ela sabe quem é a neta, só o nome não vem. É nesse segundo que eu ajudo. Para diagnóstico e tratamento, o caminho é a fonoaudióloga.',
    next: ['como-funciona', 'fono']
  },
  {
    id: 'experimentar',
    question: 'Já dá para usar?',
    keywords: ['usar', 'baixar', 'baixo', 'onde baixo', 'onde acho', 'link', 'download', 'instalar', 'experimentar', 'testar', 'teste', 'disponivel', 'quando', 'app store', 'play store', 'android', 'iphone'],
    answer:
      'O eilo é um protótipo acadêmico. Dá para experimentar agora no navegador, com uma família de exemplo, e ver o painel da fono com dados de demonstração.',
    links: [
      { label: 'Experimentar agora', href: '/experimentar' },
      { label: 'Ver o painel', href: '/fono' }
    ],
    next: ['preco', 'quem-fez']
  },
  {
    id: 'preco',
    question: 'Quanto custa?',
    keywords: ['preco*', 'quanto e', 'quanto sai', 'quanto custa', 'custa', 'custo', 'valor', 'pagar', 'pago', 'gratis', 'gratuito', 'assinatura', 'plano'],
    answer:
      'Por enquanto não tem preço: é um protótipo acadêmico, ainda sem uso fora do grupo. Experimentar no navegador é de graça.',
    links: [{ label: 'Experimentar agora', href: '/experimentar' }],
    next: ['experimentar', 'quem-fez']
  },
  {
    id: 'quem-fez',
    question: 'Quem fez o eilo?',
    keywords: ['quem fez', 'quem criou', 'equipe', 'grupo', 'fiap', 'tech4change', 'faculdade', 'projeto', 'contato'],
    answer:
      'O eilo foi feito pelo grupo 24 no FIAP Tech4Change 2026, como protótipo acadêmico.',
    next: ['experimentar', 'como-funciona']
  }
]

export const STARTERS = ['como-funciona', 'grava', 'fono', 'idoso']

export function topicById(id: string) {
  return HELP_TOPICS.find(topic => topic.id === id)
}
