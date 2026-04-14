// =============================================
//  ANDRIOTTI — app.js
//  Navegação, views e lógica principal
// =============================================

const App = (() => {

  let currentView   = 'dashboard';
  let currentTeamId = null;
  let searchTerm    = '';

  // ── INIT ──
  function init() {
    DB.init();
    navigate('dashboard');
    updateSidebarBadges();
    updateSidebarTeams();
  }

  // ── NAVIGATION ──
  function navigate(view, extra) {
    currentView = view;
    currentTeamId = extra || null;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === view);
    });
    document.querySelectorAll('.team-nav-item').forEach(el => {
      el.classList.toggle('active', view === 'equipe-detalhe' && el.dataset.teamid === currentTeamId);
    });

    const titles = {
      dashboard:      ['Dashboard',     'Visão geral do sistema'],
      equipes:        ['Equipes',        'Gerencie suas equipes'],
      agendamentos:   ['Agendamentos',   'Todos os agendamentos'],
      'equipe-detalhe': ['', ''],
    };

    if (view === 'equipe-detalhe') {
      const eq = DB.getEquipe(currentTeamId);
      document.getElementById('topbar-title').textContent    = eq ? `Equipe ${eq.nome}` : 'Equipe';
      document.getElementById('topbar-bc').textContent       = 'Agendamentos da equipe';
      document.getElementById('topbar-btn').innerHTML        = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Novo Agendamento`;
    } else {
      document.getElementById('topbar-title').textContent    = titles[view]?.[0] || '';
      document.getElementById('topbar-bc').textContent       = titles[view]?.[1] || '';
      const btnLabels = { dashboard:'Nova Equipe', equipes:'Nova Equipe', agendamentos:'Novo Agendamento' };
      document.getElementById('topbar-btn').innerHTML        = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ${btnLabels[view] || 'Novo'}`;
    }

    const renders = { dashboard, equipes, agendamentos, 'equipe-detalhe': equipeDetalhe };
    const fn = renders[view];
    if (fn) document.getElementById('content').innerHTML = fn();
    bindEvents();
    updateSidebarBadges();
  }

  function primaryAction() {
    if (currentView === 'equipe-detalhe' || currentView === 'agendamentos') {
      openNovoAgendamento(currentTeamId);
    } else {
      openNovaEquipe();
    }
  }

  function globalSearch(val) {
    searchTerm = val.toLowerCase();
    if (currentView === 'agendamentos' || currentView === 'equipe-detalhe') {
      document.getElementById('content').innerHTML =
        currentView === 'agendamentos' ? agendamentos() : equipeDetalhe();
      bindEvents();
    }
  }

  // ── SIDEBAR ──
  function updateSidebarBadges() {
    const equipes = DB.getEquipes();
    const agends  = DB.getAgendamentos();
    document.getElementById('badge-equipes').textContent = equipes.length;
    document.getElementById('badge-agend').textContent   = agends.length;
  }

  function updateSidebarTeams() {
    const container = document.getElementById('sidebar-teams');
    const equipes   = DB.getEquipes();
    if (!equipes.length) {
      container.innerHTML = '<div style="padding:0.3rem 0.5rem;font-size:0.72rem;color:rgba(255,255,255,0.2)">Nenhuma equipe</div>';
      return;
    }
    container.innerHTML = equipes.map(eq => {
      const count = DB.getAgendamentosByEquipe(eq.id).length;
      return `
        <div class="team-nav-item ${currentTeamId === eq.id && currentView === 'equipe-detalhe' ? 'active' : ''}"
          data-teamid="${eq.id}"
          onclick="App.navigate('equipe-detalhe','${eq.id}')">
          <div class="team-dot" style="background:${eq.cor}"></div>
          <span class="team-nav-name">${eq.nome}</span>
          <span class="team-nav-count">${count}</span>
        </div>`;
    }).join('');
  }

  function bindEvents() {
    updateSidebarTeams();
    // Filtros da view de agendamentos
    ['filterSearch','filterEquipe','filterOperador','filterData'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', applyFilters);
      if (el) el.addEventListener('change', applyFilters);
    });
  }

  // ── VIEW: DASHBOARD ──
  function dashboard() {
    const stats   = DB.getStats();
    const equipes = DB.getEquipes();
    const agends  = DB.getAgendamentos();
    const hoje    = new Date().toISOString().slice(0,10).replace(/-/g,'/');

    // Próximos agendamentos
    const proximos = [...agends]
      .filter(a => a.dia)
      .sort((a,b) => (a.dia+a.horario).localeCompare(b.dia+b.horario))
      .slice(0, 6);

    // Top operadores
    const opCount = {};
    agends.forEach(a => { if (a.operador) opCount[a.operador] = (opCount[a.operador]||0)+1; });
    const topOps = Object.entries(opCount).sort((a,b)=>b[1]-a[1]).slice(0,5);

    return `
    <div class="kpi-row">
      <div class="kpi-card" style="--kpi-color:var(--blue);--kpi-bg:var(--blue-light)">
        <div class="kpi-icon">🏢</div>
        <div class="kpi-val">${stats.totalEquipes}</div>
        <div class="kpi-label">Equipes ativas</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--green);--kpi-bg:var(--green-bg)">
        <div class="kpi-icon">📅</div>
        <div class="kpi-val">${stats.totalAgends}</div>
        <div class="kpi-label">Total de agendamentos</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--amber);--kpi-bg:var(--amber-bg)">
        <div class="kpi-icon">⏰</div>
        <div class="kpi-val">${stats.agendHoje}</div>
        <div class="kpi-label">Agendamentos hoje</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--purple);--kpi-bg:var(--purple-bg)">
        <div class="kpi-icon">👤</div>
        <div class="kpi-val">${stats.totalOperadores}</div>
        <div class="kpi-label">Operadores</div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-title">
          Próximos Agendamentos
          <span style="font-size:0.72rem;color:var(--text3);font-weight:400">mais recentes</span>
        </div>
        ${proximos.length ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${proximos.map(a => {
            const eq = DB.getEquipe(a.equipeId);
            return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--radius-sm);background:var(--surface2);cursor:pointer"
              onclick="App.navigate('equipe-detalhe','${a.equipeId}')">
              <div style="width:8px;height:8px;border-radius:50%;background:${eq?.cor||'#ccc'};flex-shrink:0"></div>
              <div style="flex:1;overflow:hidden">
                <div style="font-size:0.8rem;font-weight:600;color:var(--navy);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.nome}</div>
                <div style="font-size:0.7rem;color:var(--text3)">${a.dia||'—'} ${a.horario ? '· '+a.horario : ''}</div>
              </div>
              <span style="font-size:0.7rem;color:var(--text3);white-space:nowrap">${a.operador||'—'}</span>
            </div>`;
          }).join('')}
        </div>` : '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Sem agendamentos</div></div>'}
      </div>

      <div class="dash-card">
        <div class="dash-card-title">
          Equipes
          <button class="btn-primary" style="padding:0.3rem 0.75rem;font-size:0.74rem" onclick="App.openNovaEquipe()">+ Nova</button>
        </div>
        ${equipes.length ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${equipes.map(eq => {
            const count = DB.getAgendamentosByEquipe(eq.id).length;
            return `
            <div style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:var(--radius-sm);border:1px solid var(--border);cursor:pointer;transition:all 0.15s"
              onclick="App.navigate('equipe-detalhe','${eq.id}')"
              onmouseover="this.style.borderColor='${eq.cor}'" onmouseout="this.style.borderColor='var(--border)'">
              ${avatarDiv(eq.nome, eq.cor, 36)}
              <div style="flex:1">
                <div style="font-size:0.84rem;font-weight:600;color:var(--navy)">${eq.nome}</div>
                <div style="font-size:0.7rem;color:var(--text3)">${count} agendamentos</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text4)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>`;
          }).join('')}
        </div>` : `
        <div class="empty-state">
          <div class="empty-icon">🏢</div>
          <div class="empty-title">Nenhuma equipe</div>
          <div class="empty-sub">Crie sua primeira equipe para começar</div>
        </div>`}
      </div>
    </div>`;
  }

  // ── VIEW: EQUIPES ──
  function equipes() {
    const list = DB.getEquipes();
    if (!list.length) return `
      <div class="empty-state" style="margin-top:4rem">
        <div class="empty-icon">🏢</div>
        <div class="empty-title">Nenhuma equipe cadastrada</div>
        <div class="empty-sub">Clique em "Nova Equipe" para criar a primeira</div>
        <button class="btn-primary" style="margin-top:1.5rem" onclick="App.openNovaEquipe()">+ Nova Equipe</button>
      </div>`;

    return `
    <div class="teams-grid">
      ${list.map(eq => {
        const agends = DB.getAgendamentosByEquipe(eq.id);
        const ops    = [...new Set(agends.map(a=>a.operador).filter(Boolean))];
        return `
        <div class="team-card">
          <div class="team-card-header">
            ${avatarDiv(eq.nome, eq.cor)}
            <div style="flex:1;overflow:hidden">
              <div class="team-card-name">${eq.nome}</div>
              <div class="team-card-meta">Criada em ${fmtDate(eq.criada)}</div>
            </div>
          </div>
          <div class="team-card-body">
            <div class="team-card-stat">
              <span class="team-card-stat-label">Agendamentos</span>
              <span class="team-card-stat-val">${agends.length}</span>
            </div>
            <div class="team-card-stat">
              <span class="team-card-stat-label">Operadores</span>
              <span class="team-card-stat-val">${ops.length}</span>
            </div>
            <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">
              ${ops.slice(0,4).map(o=>`<span class="badge badge-gray">${o}</span>`).join('')}
              ${ops.length > 4 ? `<span class="badge badge-gray">+${ops.length-4}</span>` : ''}
            </div>
          </div>
          <div class="team-card-footer">
            <button class="btn-primary" style="flex:1;justify-content:center;font-size:0.78rem;padding:0.4rem"
              onclick="App.navigate('equipe-detalhe','${eq.id}')">Ver agendamentos</button>
            <button class="btn-secondary" style="font-size:0.78rem;padding:0.4rem 0.7rem"
              onclick="App.openEditEquipe('${eq.id}')">✏️</button>
            <button class="btn-danger" style="font-size:0.78rem;padding:0.4rem 0.7rem"
              onclick="App.confirmDeleteEquipe('${eq.id}')">🗑️</button>
          </div>
        </div>`;
      }).join('')}
      <div class="team-card" style="border:2px dashed var(--border2);box-shadow:none;display:flex;align-items:center;justify-content:center;min-height:200px;cursor:pointer"
        onclick="App.openNovaEquipe()">
        <div style="text-align:center;color:var(--text4)">
          <div style="font-size:2rem;margin-bottom:8px">＋</div>
          <div style="font-size:0.84rem;font-weight:600">Nova Equipe</div>
        </div>
      </div>
    </div>`;
  }

  // ── VIEW: AGENDAMENTOS (TODOS) ──
  function agendamentos() {
    const equipes = DB.getEquipes();
    let   list    = DB.getAgendamentos();
    if (searchTerm) list = list.filter(a =>
      [a.nome,a.cpf,a.operador,a.numero].join(' ').toLowerCase().includes(searchTerm));

    return `
    <div class="section-header">
      <div>
        <div class="section-title">Todos os Agendamentos</div>
        <div class="section-sub">${list.length} registros</div>
      </div>
      <div class="section-actions">
        <button class="btn-secondary" onclick="App.exportCSV()">↓ Exportar CSV</button>
        <button class="btn-primary" onclick="App.openNovoAgendamento(null)">+ Novo</button>
      </div>
    </div>
    <div class="filter-row">
      <div class="filter-group">
        <label class="filter-label">Buscar</label>
        <input class="filter-input" id="filterSearch" placeholder="Nome, CPF, operador..." value="${searchTerm}" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Equipe</label>
        <select class="filter-select" id="filterEquipe">
          <option value="">Todas</option>
          ${equipes.map(e=>`<option value="${e.id}">${e.nome}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Data</label>
        <input type="date" class="filter-input" id="filterData" style="min-width:140px" />
      </div>
      <button class="btn-secondary" onclick="App.clearFilters()" style="align-self:flex-end">✕ Limpar</button>
    </div>
    ${tableHtml(list, true)}`;
  }

  // ── VIEW: EQUIPE DETALHE ──
  function equipeDetalhe() {
    const eq = DB.getEquipe(currentTeamId);
    if (!eq) return '<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-title">Equipe não encontrada</div></div>';

    let list = DB.getAgendamentosByEquipe(currentTeamId);
    if (searchTerm) list = list.filter(a =>
      [a.nome,a.cpf,a.operador,a.numero].join(' ').toLowerCase().includes(searchTerm));

    const ops = [...new Set(list.map(a=>a.operador).filter(Boolean))];

    return `
    <div class="detail-header">
      <button class="detail-back" onclick="App.navigate('equipes')">← Equipes</button>
      ${avatarDiv(eq.nome, eq.cor, 40)}
      <div>
        <div style="font-size:1.1rem;font-weight:800;color:var(--navy)">${eq.nome}</div>
        <div style="font-size:0.74rem;color:var(--text3)">Criada em ${fmtDate(eq.criada)} · ${list.length} agendamentos</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:0.5rem">
        <button class="btn-secondary" onclick="App.openEditEquipe('${eq.id}')">✏️ Editar equipe</button>
        <button class="btn-secondary" onclick="App.exportCSVEquipe('${eq.id}')">↓ Exportar</button>
        <button class="btn-primary" onclick="App.openNovoAgendamento('${eq.id}')">+ Novo agendamento</button>
      </div>
    </div>

    <div style="display:flex;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap">
      ${[
        ['Agendamentos', list.length, 'var(--blue)'],
        ['Operadores',   ops.length,  'var(--purple)'],
        ['Com horário',  list.filter(a=>a.horario).length, 'var(--green)'],
        ['Com margem',   list.filter(a=>a.margem).length,  'var(--amber)'],
      ].map(([l,v,c])=>`
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:0.75rem 1.2rem;border-top:3px solid ${c}">
          <div style="font-size:1.4rem;font-weight:800;color:var(--navy)">${v}</div>
          <div style="font-size:0.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em">${l}</div>
        </div>`).join('')}
    </div>

    <div class="filter-row">
      <div class="filter-group">
        <label class="filter-label">Buscar</label>
        <input class="filter-input" id="filterSearch" placeholder="Nome, CPF..." value="${searchTerm}" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Operador</label>
        <select class="filter-select" id="filterOperador">
          <option value="">Todos</option>
          ${ops.map(o=>`<option value="${o}">${o}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Data</label>
        <input type="date" class="filter-input" id="filterData" style="min-width:140px" />
      </div>
      <button class="btn-secondary" onclick="App.clearFilters()" style="align-self:flex-end">✕ Limpar</button>
    </div>

    ${list.length ? tableHtml(list, false) : `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">Nenhum agendamento</div>
        <div class="empty-sub">Adicione o primeiro agendamento desta equipe</div>
        <button class="btn-primary" style="margin-top:1.5rem" onclick="App.openNovoAgendamento('${eq.id}')">+ Novo agendamento</button>
      </div>`}`;
  }

  // ── TABLE HTML ──
  function tableHtml(rows, showEquipe) {
    return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome do cliente</th>
            <th>CPF</th>
            <th>Nº do cliente</th>
            <th>Dia</th>
            <th>Horário</th>
            <th>Margem</th>
            <th>Operador</th>
            ${showEquipe ? '<th>Equipe</th>' : ''}
            <th>Carimbo</th>
            <th style="text-align:center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(a => {
            const eq = DB.getEquipe(a.equipeId);
            const nm = searchTerm ? highlight(a.nome, searchTerm) : (a.nome || '—');
            const cp = searchTerm ? highlight(a.cpf, searchTerm)  : (a.cpf  || '—');
            return `
            <tr>
              <td class="td-name">${nm}</td>
              <td class="td-mono">${cp}</td>
              <td class="td-mono">${a.numero||'—'}</td>
              <td>${a.dia||'—'}</td>
              <td>${horarioBadge(a.horario)}</td>
              <td>${margemBadge(a.margem)}</td>
              <td><span class="badge badge-purple">${a.operador||'—'}</span></td>
              ${showEquipe ? `<td>${eq ? `<span class="badge" style="background:${eq.cor}22;color:${eq.cor};border-color:${eq.cor}55">${eq.nome}</span>` : '—'}</td>` : ''}
              <td class="td-mono" style="font-size:0.7rem">${a.carimbo||'—'}</td>
              <td style="text-align:center;white-space:nowrap">
                <button class="btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.74rem;margin-right:4px"
                  onclick="App.openEditAgend('${a.id}')">✏️</button>
                <button class="btn-danger" style="padding:0.3rem 0.6rem;font-size:0.74rem"
                  onclick="App.confirmDeleteAgend('${a.id}')">🗑️</button>
              </td>
            </tr>`;
          }).join('') : `
          <tr><td colspan="10" style="text-align:center;padding:3rem;color:var(--text4)">Nenhum registro encontrado</td></tr>`}
        </tbody>
      </table>
      <div class="table-footer">
        <span>${rows.length} registro${rows.length!==1?'s':''}</span>
        <span style="font-size:0.7rem;color:var(--text4)">Clique em ✏️ para editar</span>
      </div>
    </div>`;
  }

  function applyFilters() {
    const s  = (document.getElementById('filterSearch')  ||{}).value?.toLowerCase()||'';
    const eq = (document.getElementById('filterEquipe')  ||{}).value||'';
    const op = (document.getElementById('filterOperador')||{}).value||'';
    const dt = (document.getElementById('filterData')    ||{}).value||'';
    searchTerm = s;

    let list = currentView === 'equipe-detalhe'
      ? DB.getAgendamentosByEquipe(currentTeamId)
      : DB.getAgendamentos();

    if (s)  list = list.filter(a => [a.nome,a.cpf,a.operador,a.numero].join(' ').toLowerCase().includes(s));
    if (eq) list = list.filter(a => a.equipeId === eq);
    if (op) list = list.filter(a => a.operador === op);
    if (dt) list = list.filter(a => (a.dia||'').replace(/\//g,'-').startsWith(dt));

    const tbody = document.querySelector('#main-table tbody') || document.querySelector('tbody');
    if (tbody) {
      const showEq = currentView === 'agendamentos';
      const tmp = document.createElement('table');
      tmp.innerHTML = tableHtml(list, showEq);
      const newTbody = tmp.querySelector('tbody');
      if (newTbody) tbody.innerHTML = newTbody.innerHTML;
      const footer = document.querySelector('.table-footer span');
      if (footer) footer.textContent = `${list.length} registro${list.length!==1?'s':''}`;
    }
  }

  function clearFilters() {
    searchTerm = '';
    document.getElementById('globalSearch').value = '';
    ['filterSearch','filterEquipe','filterOperador','filterData'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    navigate(currentView, currentTeamId);
  }

  // ── MODAL: NOVA / EDIT EQUIPE ──
  function openNovaEquipe() {
    const colors = DB.getColors();
    Modal.open('Nova Equipe', `
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Nome da equipe *</label>
          <input class="form-input" id="eq-nome" placeholder="Ex: Equipe Elisandra" autofocus />
        </div>
        <div class="form-group full">
          <label class="form-label">Cor da equipe</label>
          ${colorPickerHtml(colors[0])}
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn-primary" onclick="App.saveNovaEquipe()">Criar equipe</button>
      </div>`);
  }

  function saveNovaEquipe() {
    const nome = document.getElementById('eq-nome').value.trim();
    const cor  = document.getElementById('selected-color').value;
    if (!nome) { Toast.show('Informe o nome da equipe', 'error'); return; }
    DB.newEquipe(nome, cor);
    Modal.close();
    Toast.show(`Equipe "${nome}" criada!`, 'success');
    navigate('equipes');
  }

  function openEditEquipe(id) {
    const eq = DB.getEquipe(id);
    if (!eq) return;
    Modal.open('Editar Equipe', `
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Nome da equipe *</label>
          <input class="form-input" id="eq-nome" value="${eq.nome}" />
        </div>
        <div class="form-group full">
          <label class="form-label">Cor da equipe</label>
          ${colorPickerHtml(eq.cor)}
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn-primary" onclick="App.saveEditEquipe('${id}')">Salvar</button>
      </div>`);
  }

  function saveEditEquipe(id) {
    const eq   = DB.getEquipe(id);
    const nome = document.getElementById('eq-nome').value.trim();
    const cor  = document.getElementById('selected-color').value;
    if (!nome) { Toast.show('Informe o nome', 'error'); return; }
    DB.saveEquipe({ ...eq, nome, cor });
    Modal.close();
    Toast.show('Equipe atualizada!', 'success');
    navigate(currentView, currentTeamId);
  }

  function confirmDeleteEquipe(id) {
    const eq = DB.getEquipe(id);
    confirmDelete(
      `Tem certeza que deseja excluir a equipe <strong>${eq?.nome}</strong>? Todos os agendamentos desta equipe também serão removidos.`,
      () => { DB.deleteEquipe(id); Toast.show('Equipe excluída', 'success'); App.navigate('equipes'); }
    );
  }

  // ── MODAL: NOVO / EDIT AGENDAMENTO ──
  function openNovoAgendamento(equipeId) {
    const equipes = DB.getEquipes();
    const hoje    = new Date().toISOString().slice(0,10);
    const agora   = new Date().toLocaleString('pt-BR').replace(',','');

    Modal.open('Novo Agendamento', `
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Equipe *</label>
          <select class="form-select" id="ag-equipe">
            <option value="">Selecione uma equipe</option>
            ${equipes.map(e=>`<option value="${e.id}" ${e.id===equipeId?'selected':''}>${e.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full">
          <label class="form-label">Nome do cliente *</label>
          <input class="form-input" id="ag-nome" placeholder="Nome completo" />
        </div>
        <div class="form-group">
          <label class="form-label">CPF</label>
          <input class="form-input" id="ag-cpf" placeholder="000.000.000-00" />
        </div>
        <div class="form-group">
          <label class="form-label">Número do cliente</label>
          <input class="form-input" id="ag-numero" placeholder="51 9 0000-0000" />
        </div>
        <div class="form-group">
          <label class="form-label">Dia do agendamento</label>
          <input type="date" class="form-input" id="ag-dia" value="${hoje}" />
        </div>
        <div class="form-group">
          <label class="form-label">Horário</label>
          <input type="time" class="form-input" id="ag-horario" />
        </div>
        <div class="form-group">
          <label class="form-label">Margem</label>
          <input class="form-input" id="ag-margem" placeholder="Ex: 67" />
        </div>
        <div class="form-group">
          <label class="form-label">Operador</label>
          <input class="form-input" id="ag-operador" placeholder="Nome do operador" />
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn-primary" onclick="App.saveNovoAgend()">Salvar agendamento</button>
      </div>`, { wide: false });
  }

  function saveNovoAgend() {
    const equipeId = document.getElementById('ag-equipe').value;
    const nome     = document.getElementById('ag-nome').value.trim();
    if (!equipeId) { Toast.show('Selecione uma equipe', 'error'); return; }
    if (!nome)     { Toast.show('Informe o nome do cliente', 'error'); return; }
    const dia = document.getElementById('ag-dia').value.replace(/-/g,'/');
    const agend = {
      equipeId,
      carimbo:  new Date().toLocaleString('pt-BR').replace(',',''),
      nome,
      cpf:      document.getElementById('ag-cpf').value.trim(),
      numero:   document.getElementById('ag-numero').value.trim(),
      dia,
      horario:  document.getElementById('ag-horario').value,
      margem:   document.getElementById('ag-margem').value.trim(),
      operador: document.getElementById('ag-operador').value.trim(),
    };
    DB.newAgendamento(agend);
    Modal.close();
    Toast.show(`Agendamento de "${nome}" salvo!`, 'success');
    navigate(currentView, currentTeamId || equipeId);
  }

  function openEditAgend(id) {
    const a       = DB.getAgendamentos().find(x=>x.id===id);
    const equipes = DB.getEquipes();
    if (!a) return;
    const diaVal = (a.dia||'').replace(/\//g,'-');
    Modal.open('Editar Agendamento', `
      <div class="form-grid">
        <div class="form-group full">
          <label class="form-label">Equipe *</label>
          <select class="form-select" id="ag-equipe">
            ${equipes.map(e=>`<option value="${e.id}" ${e.id===a.equipeId?'selected':''}>${e.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-group full">
          <label class="form-label">Nome do cliente *</label>
          <input class="form-input" id="ag-nome" value="${a.nome||''}" />
        </div>
        <div class="form-group">
          <label class="form-label">CPF</label>
          <input class="form-input" id="ag-cpf" value="${a.cpf||''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Número do cliente</label>
          <input class="form-input" id="ag-numero" value="${a.numero||''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Dia do agendamento</label>
          <input type="date" class="form-input" id="ag-dia" value="${diaVal}" />
        </div>
        <div class="form-group">
          <label class="form-label">Horário</label>
          <input type="time" class="form-input" id="ag-horario" value="${a.horario||''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Margem</label>
          <input class="form-input" id="ag-margem" value="${a.margem||''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Operador</label>
          <input class="form-input" id="ag-operador" value="${a.operador||''}" />
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn-primary" onclick="App.saveEditAgend('${id}')">Salvar</button>
      </div>`, { wide: false });
  }

  function saveEditAgend(id) {
    const a        = DB.getAgendamentos().find(x=>x.id===id);
    const equipeId = document.getElementById('ag-equipe').value;
    const nome     = document.getElementById('ag-nome').value.trim();
    if (!nome) { Toast.show('Informe o nome', 'error'); return; }
    const dia = document.getElementById('ag-dia').value.replace(/-/g,'/');
    DB.saveAgendamento({ ...a, equipeId, nome,
      cpf:      document.getElementById('ag-cpf').value.trim(),
      numero:   document.getElementById('ag-numero').value.trim(),
      dia,
      horario:  document.getElementById('ag-horario').value,
      margem:   document.getElementById('ag-margem').value.trim(),
      operador: document.getElementById('ag-operador').value.trim(),
    });
    Modal.close();
    Toast.show('Agendamento atualizado!', 'success');
    navigate(currentView, currentTeamId);
  }

  function confirmDeleteAgend(id) {
    const a = DB.getAgendamentos().find(x=>x.id===id);
    confirmDelete(
      `Excluir o agendamento de <strong>${a?.nome}</strong>?`,
      () => { DB.deleteAgendamento(id); Toast.show('Excluído!', 'success'); App.navigate(currentView, currentTeamId); }
    );
  }

  // ── EXPORT CSV ──
  function exportCSV() { _csv(DB.getAgendamentos()); }
  function exportCSVEquipe(id) { _csv(DB.getAgendamentosByEquipe(id)); }

  function _csv(rows) {
    const H = ['Carimbo','Nome','CPF','Número','Dia','Horário','Margem','Operador','Equipe'];
    const lines = rows.map(a => {
      const eq = DB.getEquipe(a.equipeId);
      return [a.carimbo,a.nome,a.cpf,a.numero,a.dia,a.horario,a.margem,a.operador,eq?.nome||'']
        .map(v=>`"${(v||'').replace(/"/g,'""')}"`).join(',');
    });
    const csv  = [H.join(','),...lines].join('\n');
    const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'andriotti_agendamentos.csv'; a.click();
    URL.revokeObjectURL(url);
    Toast.show('CSV exportado!', 'success');
  }

  return {
    init, navigate, primaryAction, globalSearch, clearFilters,
    openNovaEquipe, saveNovaEquipe, openEditEquipe, saveEditEquipe, confirmDeleteEquipe,
    openNovoAgendamento, saveNovoAgend, openEditAgend, saveEditAgend, confirmDeleteAgend,
    exportCSV, exportCSVEquipe,
  };
})();

document.addEventListener('DOMContentLoaded', () => App.init());