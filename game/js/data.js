// =============================================
//  ANDRIOTTI — data.js
//  Gerencia todos os dados com localStorage
// =============================================

const DB = (() => {

  const KEYS = { equipes: 'and_equipes', agendamentos: 'and_agendamentos' };

  // Cores disponíveis para equipes
  const TEAM_COLORS = [
    '#2563EB','#7C3AED','#DB2777','#DC2626',
    '#D97706','#16A34A','#0891B2','#4F46E5',
  ];

  // ── SEED: dados iniciais baseados na planilha ──
  const SEED_EQUIPES = [
    { id: 'eq1', nome: 'Equipe Elisandra', cor: '#2563EB', criada: '2026-04-08', operadores: ['PAULO','leticia','igor','viviane','enzo','Willian','Pablo','Nicole','kethellen','VITORIA','Renato','Franciele','TÂNIA','IGOR'] },
    { id: 'eq2', nome: 'Equipe Kamily',   cor: '#16A34A', criada: '2026-04-01', operadores: ['kamily','leonardo','marcos','tayna','cassio'] },
  ];

  const SEED_AGENDAMENTOS = [
    { id:'a1',  equipeId:'eq1', carimbo:'2026/04/08 11:08:00', nome:'VERA REGINA BETTIO LAGO',           cpf:'007.404.570-98', numero:'51999563892',  dia:'2026/04/14', horario:'09:30', margem:'',  operador:'PAULO'    },
    { id:'a2',  equipeId:'eq1', carimbo:'2026/04/10 14:03:58', nome:'JOAO LUIZ DE CARVALHO GONCALVES',   cpf:'349.544.900-06', numero:'51992474763',  dia:'2026/04/14', horario:'16:00', margem:'',  operador:'leticia'  },
    { id:'a3',  equipeId:'eq1', carimbo:'2026/04/10 15:28:14', nome:'MAXIMINO ROCHA',                    cpf:'461.535.350-20', numero:'51991887853',  dia:'2026/04/14', horario:'13:00', margem:'',  operador:'igor'     },
    { id:'a4',  equipeId:'eq1', carimbo:'2026/04/10 16:48:42', nome:'PAULO ROBERTO MARTINS SOUZA',       cpf:'612.972.830-15', numero:'51992088263',  dia:'2026/04/14', horario:'09:30', margem:'',  operador:'leticia'  },
    { id:'a5',  equipeId:'eq1', carimbo:'2026/04/10 17:11:43', nome:'NELSI MARTINS DOS SANTOS',          cpf:'495035960-68',   numero:'51993569047',  dia:'2026/04/14', horario:'',     margem:'',  operador:'viviane'  },
    { id:'a6',  equipeId:'eq1', carimbo:'2026/04/13 10:12:34', nome:'TEREZINHA MONTEIRO SCHMITZ',        cpf:'567.568.520-00', numero:'51994136390',  dia:'2026/04/14', horario:'15:00', margem:'',  operador:'leticia'  },
    { id:'a7',  equipeId:'eq1', carimbo:'2026/04/13 10:31:15', nome:'LUCIANA BUENO KULMANN',             cpf:'62806157072',    numero:'51984135304',  dia:'2026/04/14', horario:'10:30', margem:'',  operador:'viviane'  },
    { id:'a8',  equipeId:'eq1', carimbo:'2026/04/13 10:36:33', nome:'VERA LUCIA FLORES DA SILVA',        cpf:'212.587.160-20', numero:'51984010785',  dia:'2026/04/14', horario:'',     margem:'',  operador:'enzo'     },
    { id:'a9',  equipeId:'eq1', carimbo:'2026/04/13 11:25:33', nome:'MARIA ELIZABETE DA ROCHA VARANTE',  cpf:'46969829049',    numero:'51986863275',  dia:'2026/04/14', horario:'15:00', margem:'',  operador:'Willian'  },
    { id:'a10', equipeId:'eq1', carimbo:'2026/04/13 12:31:54', nome:'MARCIA REGINA BELARMINO',           cpf:'747.901.100-87', numero:'51992506835',  dia:'2026/04/14', horario:'14:00', margem:'',  operador:'leticia'  },
    { id:'a11', equipeId:'eq1', carimbo:'2026/04/13 13:48:09', nome:'JOANA SEVERO DOS SANTOS',           cpf:'40723275068',    numero:'51995990123',  dia:'2026/04/14', horario:'17:30', margem:'',  operador:'viviane'  },
    { id:'a12', equipeId:'eq1', carimbo:'2026/04/13 13:48:48', nome:'SANDRA ELIZABETH DE OLIVEIRA',      cpf:'243644360-20',   numero:'51999405335',  dia:'2026/04/14', horario:'',     margem:'',  operador:'Pablo'    },
    { id:'a13', equipeId:'eq1', carimbo:'2026/04/13 13:49:27', nome:'OLMIRO GONCALVES SANTOS',           cpf:'50605437068',    numero:'51996591808',  dia:'2026/04/14', horario:'16:00', margem:'',  operador:'viviane'  },
    { id:'a14', equipeId:'eq1', carimbo:'2026/04/13 14:09:48', nome:'MARCIA REGINA BELARMINO',           cpf:'747.901.100-87', numero:'51992506835',  dia:'2026/04/14', horario:'15:30', margem:'',  operador:'TÂNIA'    },
    { id:'a15', equipeId:'eq1', carimbo:'2026/04/13 14:38:39', nome:'MARLENE ZIMER RODRIGUES',           cpf:'21757275053',    numero:'51995753553',  dia:'2026/04/14', horario:'09:30', margem:'',  operador:'Pablo'    },
    { id:'a16', equipeId:'eq1', carimbo:'2026/04/13 15:24:14', nome:'CLOVIS TADEU MAGALHAES',            cpf:'320.527.230-72', numero:'51993655835',  dia:'2026/04/14', horario:'10:00', margem:'',  operador:'Pablo'    },
    { id:'a17', equipeId:'eq1', carimbo:'2026/04/13 15:25:34', nome:'VERA LUCIA FLORES DA SILVA',        cpf:'212.587.160-20', numero:'51984010785',  dia:'2026/04/14', horario:'',     margem:'',  operador:'enzo'     },
    { id:'a18', equipeId:'eq1', carimbo:'2026/04/13 15:25:41', nome:'MARLENE ZIMER RODRIGUES',           cpf:'21757275053',    numero:'51995753553',  dia:'2026/04/14', horario:'09:30', margem:'',  operador:'Pablo'    },
    { id:'a19', equipeId:'eq1', carimbo:'2026/04/13 15:26:22', nome:'REGINA CARVALHO DA SILVA',          cpf:'47678399049',    numero:'51992137186',  dia:'2026/04/14', horario:'15:30', margem:'',  operador:'Pablo'    },
    { id:'a20', equipeId:'eq1', carimbo:'2026/04/13 15:27:26', nome:'NILSON JORGE SELAU COSTA',          cpf:'607.562.680-87', numero:'51999474855',  dia:'2026/04/14', horario:'',     margem:'',  operador:'enzo'     },
    { id:'a21', equipeId:'eq1', carimbo:'2026/04/13 15:27:51', nome:'ROBERTO LOSEKANN',                  cpf:'675.754.980-87', numero:'51984854180',  dia:'2026/04/14', horario:'13:30', margem:'',  operador:'Pablo'    },
    { id:'a22', equipeId:'eq1', carimbo:'2026/04/13 15:36:25', nome:'JORGE LUIZ FERNANDES MEDEIROS',     cpf:'176.179.790-53', numero:'51982981900',  dia:'2026/04/14', horario:'',     margem:'',  operador:'Nicole'   },
    { id:'a23', equipeId:'eq1', carimbo:'2026/04/13 15:40:17', nome:'ERLI ROIS DE OLIVEIRA',             cpf:'266.613.140-87', numero:'51998368932',  dia:'2026/04/14', horario:'17:30', margem:'',  operador:'kethellen'},
    { id:'a24', equipeId:'eq1', carimbo:'2026/04/13 15:41:01', nome:'LENISE ACOSTA GOMES MARTINS',       cpf:'29509238015',    numero:'51983213014',  dia:'2026/04/14', horario:'13:30', margem:'',  operador:'kethellen'},
    { id:'a25', equipeId:'eq1', carimbo:'2026/04/13 15:42:02', nome:'MARI VIRGINIA DA SILVA ALVES',      cpf:'80736254072',    numero:'51998444533',  dia:'2026/04/14', horario:'13:30', margem:'',  operador:'kethellen'},
    { id:'a26', equipeId:'eq1', carimbo:'2026/04/13 15:42:32', nome:'MARIA LUCIA RODRIGUES MIRANDA',     cpf:'477.543.620-15', numero:'(51) 983346725',dia:'2026/04/14',horario:'11:00', margem:'',  operador:'VITORIA'  },
    { id:'a27', equipeId:'eq1', carimbo:'2026/04/13 15:43:51', nome:'Jadir Trindade',                    cpf:'273.414.370-49', numero:'51 9668-1638', dia:'2026/04/14', horario:'11:00', margem:'',  operador:'Renato'   },
    { id:'a28', equipeId:'eq1', carimbo:'2026/04/13 15:44:03', nome:'MARLENE TERESINHA DA SILVA',        cpf:'267.222.910-49', numero:'(51) 980270056',dia:'2026/04/14',horario:'14:00', margem:'',  operador:'VITORIA'  },
    { id:'a29', equipeId:'eq1', carimbo:'2026/04/13 15:45:42', nome:'MARCIA REGINA ROSA LOPES',          cpf:'606644525091',   numero:'51994709053',  dia:'2026/04/14', horario:'09:30', margem:'',  operador:'Willian'  },
    { id:'a30', equipeId:'eq1', carimbo:'2026/04/13 15:48:46', nome:'NELI BARBOZA TRINDADE',             cpf:'250.718.580-53', numero:'1',            dia:'2026/04/14', horario:'10:00', margem:'67',operador:'Franciele'},
    { id:'a31', equipeId:'eq1', carimbo:'2026/04/13 15:48:47', nome:'JOAO ELI DA SILVA',                 cpf:'236.944.670-68', numero:'(51) 995064893',dia:'2026/04/14',horario:'11:00', margem:'',  operador:'VITORIA'  },
    { id:'a32', equipeId:'eq1', carimbo:'2026/04/13 15:50:52', nome:'VERA LUCIA FARIAS GOMES',           cpf:'470.007.910-04', numero:'470.007.910-04',dia:'2026/04/14',horario:'11:00', margem:'',  operador:'VITORIA'  },
    { id:'a33', equipeId:'eq1', carimbo:'2026/04/13 15:51:45', nome:'ANTONIO ULISSES FERREIRA DE MOURA', cpf:'955.235.100-68', numero:'51993931788',  dia:'2026/04/14', horario:'10:00', margem:'',  operador:'TÂNIA'    },
    { id:'a34', equipeId:'eq1', carimbo:'2026/04/13 16:36:07', nome:'LUIZ FERNANDO PINHEIRO RODRIGUES',  cpf:'226.029.090-68', numero:'(51) 995543224',dia:'2026/04/14',horario:'11:30', margem:'',  operador:'VITORIA'  },
    { id:'a35', equipeId:'eq1', carimbo:'2026/04/13 16:36:59', nome:'JULIANA MARIA DOS SANTOS PINTO',    cpf:'547.660.100-78', numero:'51984802497',  dia:'2026/04/13', horario:'09:30', margem:'',  operador:'IGOR'     },
  ];

  // ── INIT ──
  function init() {
    if (!localStorage.getItem(KEYS.equipes)) {
      localStorage.setItem(KEYS.equipes, JSON.stringify(SEED_EQUIPES));
    }
    if (!localStorage.getItem(KEYS.agendamentos)) {
      localStorage.setItem(KEYS.agendamentos, JSON.stringify(SEED_AGENDAMENTOS));
    }
  }

  // ── GETTERS ──
  function getEquipes() {
    return JSON.parse(localStorage.getItem(KEYS.equipes) || '[]');
  }
  function getAgendamentos() {
    return JSON.parse(localStorage.getItem(KEYS.agendamentos) || '[]');
  }
  function getEquipe(id) {
    return getEquipes().find(e => e.id === id) || null;
  }
  function getAgendamentosByEquipe(equipeId) {
    return getAgendamentos().filter(a => a.equipeId === equipeId);
  }

  // ── EQUIPES ──
  function saveEquipe(equipe) {
    const list = getEquipes();
    const idx  = list.findIndex(e => e.id === equipe.id);
    if (idx >= 0) list[idx] = equipe;
    else list.push(equipe);
    localStorage.setItem(KEYS.equipes, JSON.stringify(list));
  }
  function deleteEquipe(id) {
    const equipes = getEquipes().filter(e => e.id !== id);
    const agends  = getAgendamentos().filter(a => a.equipeId !== id);
    localStorage.setItem(KEYS.equipes, JSON.stringify(equipes));
    localStorage.setItem(KEYS.agendamentos, JSON.stringify(agends));
  }
  function newEquipe(nome, cor) {
    const eq = {
      id: 'eq_' + Date.now(),
      nome, cor,
      criada: new Date().toISOString().slice(0,10),
      operadores: [],
    };
    saveEquipe(eq);
    return eq;
  }

  // ── AGENDAMENTOS ──
  function saveAgendamento(agend) {
    const list = getAgendamentos();
    const idx  = list.findIndex(a => a.id === agend.id);
    if (idx >= 0) list[idx] = agend;
    else list.push(agend);
    localStorage.setItem(KEYS.agendamentos, JSON.stringify(list));
  }
  function deleteAgendamento(id) {
    const list = getAgendamentos().filter(a => a.id !== id);
    localStorage.setItem(KEYS.agendamentos, JSON.stringify(list));
  }
  function newAgendamento(data) {
    const agend = { id: 'agd_' + Date.now(), ...data };
    saveAgendamento(agend);
    return agend;
  }

  // ── STATS ──
  function getStats() {
    const equipes = getEquipes();
    const agends  = getAgendamentos();
    const hoje    = new Date().toISOString().slice(0,10).replace(/-/g,'/');
    return {
      totalEquipes:   equipes.length,
      totalAgends:    agends.length,
      agendHoje:      agends.filter(a => a.dia && a.dia.replace(/-/g,'/').startsWith(hoje)).length,
      totalOperadores: [...new Set(agends.map(a=>a.operador).filter(Boolean))].length,
    };
  }

  function getColors()      { return TEAM_COLORS; }
  function generateId()     { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }

  return { init, getEquipes, getAgendamentos, getEquipe, getAgendamentosByEquipe,
           saveEquipe, deleteEquipe, newEquipe,
           saveAgendamento, deleteAgendamento, newAgendamento,
           getStats, getColors, generateId };
})();