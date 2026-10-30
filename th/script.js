/**
 * ==============================================================================
 * PORTFÓLIO PESSOAL — MATHEUS ISMÉRIO DA SILVA
 * Estudante do 2º ano do Ensino Médio Técnico em Desenvolvimento de Sistemas
 * Script JavaScript Puro (Vanilla JS Moderno)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     0. MOTOR DO FUNDO DIGITAL INTERATIVO (CANVAS 2D + ONDAS + PARTÍCULAS)
     Substitui a grade de quadrados por um universo tecnológico vivo e imersivo
     ========================================================================== */
  let setBackgroundSection = () => {};

  const initDigitalUniverse = () => {
    const canvas = document.getElementById('universe-canvas');
    const cursorAura = document.getElementById('cursor-glow-aura');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let ripples = [];
    let animFrameId = null;
    let lastTime = performance.now();

    // Estado do mouse / cursor
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      currentAuraX: -1000,
      currentAuraY: -1000,
      lastMoveX: -1000,
      lastMoveY: -1000,
      active: false,
      idleTimer: null
    };

    // Parâmetros de atmosfera reativa às seções
    const atmosphere = {
      speedFactor: 1.0,
      waveAmpFactor: 1.0,
      connectionDistance: 110,
      upwardBias: 0,
      targetSpeedFactor: 1.0,
      targetWaveAmpFactor: 1.0,
      targetConnectionDistance: 110,
      targetUpwardBias: 0
    };

    setBackgroundSection = (sectionId) => {
      switch (sectionId) {
        case 'inicio':
          atmosphere.targetSpeedFactor = 1.0;
          atmosphere.targetWaveAmpFactor = 1.0;
          atmosphere.targetConnectionDistance = 110;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'sobre':
          atmosphere.targetSpeedFactor = 0.65;
          atmosphere.targetWaveAmpFactor = 0.55;
          atmosphere.targetConnectionDistance = 90;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'trajetoria':
          atmosphere.targetSpeedFactor = 0.85;
          atmosphere.targetWaveAmpFactor = 0.8;
          atmosphere.targetConnectionDistance = 105;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'evolucao':
          atmosphere.targetSpeedFactor = 1.15;
          atmosphere.targetWaveAmpFactor = 1.1;
          atmosphere.targetConnectionDistance = 115;
          atmosphere.targetUpwardBias = -0.22; // Movimento ascendente contínuo
          break;
        case 'habilidades':
          atmosphere.targetSpeedFactor = 0.95;
          atmosphere.targetWaveAmpFactor = 0.85;
          atmosphere.targetConnectionDistance = 135; // Constelação de conexões mais densa
          atmosphere.targetUpwardBias = 0;
          break;
        case 'projetos':
          atmosphere.targetSpeedFactor = 0.9;
          atmosphere.targetWaveAmpFactor = 0.95;
          atmosphere.targetConnectionDistance = 110;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'terminal':
          atmosphere.targetSpeedFactor = 1.1;
          atmosphere.targetWaveAmpFactor = 1.0;
          atmosphere.targetConnectionDistance = 120;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'galeria':
          atmosphere.targetSpeedFactor = 0.6;
          atmosphere.targetWaveAmpFactor = 0.5;
          atmosphere.targetConnectionDistance = 85;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'interativo':
          atmosphere.targetSpeedFactor = 1.2;
          atmosphere.targetWaveAmpFactor = 1.25;
          atmosphere.targetConnectionDistance = 120;
          atmosphere.targetUpwardBias = 0;
          break;
        case 'objetivos':
          atmosphere.targetSpeedFactor = 1.0;
          atmosphere.targetWaveAmpFactor = 0.9;
          atmosphere.targetConnectionDistance = 115;
          atmosphere.targetUpwardBias = -0.15;
          break;
        case 'contato':
          atmosphere.targetSpeedFactor = 0.8;
          atmosphere.targetWaveAmpFactor = 0.7;
          atmosphere.targetConnectionDistance = 100;
          atmosphere.targetUpwardBias = 0;
          break;
        default:
          atmosphere.targetSpeedFactor = 1.0;
          atmosphere.targetWaveAmpFactor = 1.0;
          atmosphere.targetConnectionDistance = 110;
          atmosphere.targetUpwardBias = 0;
      }
    };

    // Paleta de partículas luminosas
    const colorPalette = [
      { r: 56, g: 189, b: 248, glow: 'rgba(56, 189, 248, 0.45)' },  // Cyan elétrico
      { r: 96, g: 165, b: 250, glow: 'rgba(96, 165, 250, 0.4)' },   // Azul celeste
      { r: 168, g: 85, b: 247, glow: 'rgba(168, 85, 247, 0.45)' },  // Roxo neon
      { r: 192, g: 132, b: 252, glow: 'rgba(192, 132, 252, 0.35)' }, // Violeta suave
      { r: 255, g: 255, b: 255, glow: 'rgba(255, 255, 255, 0.35)' }  // Branco puro translúcido
    ];

    // Redimensionamento do Canvas de Alta Resolução
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Quantidade de partículas balanceada para desempenho de 60fps
      let targetCount = 85;
      if (width < 768) targetCount = 38;
      else if (width < 1200) targetCount = 65;

      createParticles(targetCount);
    };

    // Geração de partículas multi-camadas
    const createParticles = (count) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        const layerRand = Math.random();
        let layer = 1;
        let radius = 2.0;
        let baseAlpha = 0.45;
        let speed = 0.4;

        if (layerRand < 0.4) {
          layer = 0; // Fundo distante
          radius = 0.8 + Math.random() * 0.8;
          baseAlpha = 0.15 + Math.random() * 0.25;
          speed = 0.15 + Math.random() * 0.2;
        } else if (layerRand < 0.8) {
          layer = 1; // Plano médio
          radius = 1.6 + Math.random() * 1.2;
          baseAlpha = 0.35 + Math.random() * 0.35;
          speed = 0.3 + Math.random() * 0.35;
        } else {
          layer = 2; // Primeiro plano brilhante
          radius = 2.8 + Math.random() * 1.5;
          baseAlpha = 0.55 + Math.random() * 0.35;
          speed = 0.45 + Math.random() * 0.35;
        }

        const colorObj = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        const angle = Math.random() * Math.PI * 2;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          layer,
          baseAlpha,
          currentAlpha: baseAlpha,
          color: colorObj,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.025,
          waveOffset: Math.random() * 100
        });
      }
    };

    // Ouvintes de movimento do mouse (passivos)
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      if (cursorAura) {
        cursorAura.classList.add('active');
      }

      // Micro-ondulação (ripple) no movimento do mouse
      const moveDist = Math.hypot(e.clientX - mouse.lastMoveX, e.clientY - mouse.lastMoveY);
      if (moveDist > 24 && ripples.length < 6) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 8,
          maxRadius: 55,
          alpha: 0.28
        });
        mouse.lastMoveX = e.clientX;
        mouse.lastMoveY = e.clientY;
      }

      if (mouse.idleTimer) clearTimeout(mouse.idleTimer);
      mouse.idleTimer = setTimeout(() => {
        mouse.active = false;
        if (cursorAura) {
          cursorAura.classList.remove('active');
        }
      }, 3000);
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
      if (cursorAura) {
        cursorAura.classList.remove('active');
      }
    });

    // Loop de Animação Principal
    const render = (time) => {
      lastTime = time;

      // Interpolação suave dos parâmetros de atmosfera
      atmosphere.speedFactor += (atmosphere.targetSpeedFactor - atmosphere.speedFactor) * 0.05;
      atmosphere.waveAmpFactor += (atmosphere.targetWaveAmpFactor - atmosphere.waveAmpFactor) * 0.05;
      atmosphere.connectionDistance += (atmosphere.targetConnectionDistance - atmosphere.connectionDistance) * 0.05;
      atmosphere.upwardBias += (atmosphere.targetUpwardBias - atmosphere.upwardBias) * 0.05;

      // Interpolação suave do mouse
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.12;
        mouse.y += (mouse.targetY - mouse.y) * 0.12;
      } else {
        mouse.x = -1000;
        mouse.y = -1000;
      }

      // Interpolação do halo luminoso do cursor
      if (cursorAura && mouse.active) {
        mouse.currentAuraX += (mouse.targetX - mouse.currentAuraX) * 0.08;
        mouse.currentAuraY += (mouse.targetY - mouse.currentAuraY) * 0.08;
        cursorAura.style.transform = `translate3d(${mouse.currentAuraX}px, ${mouse.currentAuraY}px, 0) translate(-50%, -50%)`;
      }

      // Limpeza do Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. RENDERIZAÇÃO DAS ONDAS E FLUXOS DE DADOS DIGITAIS
      drawDigitalWaves(time);

      // 2. RENDERIZAÇÃO DOS MICRO-RIPPLES DO MOUSE
      drawRipples();

      // 3. ATUALIZAÇÃO E DESENHO DAS PARTÍCULAS
      drawParticles(time);

      // 4. LINHAS DE CONEXÃO / CONSTELAÇÕES ENTRE PARTÍCULAS
      drawConnections();

      if (!prefersReducedMotion) {
        animFrameId = requestAnimationFrame(render);
      }
    };

    // Desenha ondas fluídas de dados com deflexão ao mouse
    const drawDigitalWaves = (time) => {
      const t = time * 0.001;
      const ampMult = atmosphere.waveAmpFactor;

      // Onda 1: Cyan Suave (Fluxo Superior/Médio)
      ctx.beginPath();
      const wave1Y = height * 0.35;
      for (let x = 0; x <= width; x += 10) {
        let mouseDeflect = 0;
        if (mouse.active) {
          const dx = x - mouse.x;
          if (Math.abs(dx) < 220) {
            mouseDeflect = Math.exp(-(dx * dx) / 14000) * (mouse.y - wave1Y) * 0.28;
          }
        }
        const y = wave1Y +
          Math.sin(x * 0.0022 + t * 0.7) * (26 * ampMult) +
          Math.cos(x * 0.0011 + t * 0.4) * (16 * ampMult) +
          mouseDeflect;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.075)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Onda 2: Violeta Harmônica (Fluxo Médio/Inferior)
      ctx.beginPath();
      const wave2Y = height * 0.68;
      for (let x = 0; x <= width; x += 10) {
        let mouseDeflect = 0;
        if (mouse.active) {
          const dx = x - mouse.x;
          if (Math.abs(dx) < 220) {
            mouseDeflect = Math.exp(-(dx * dx) / 14000) * (mouse.y - wave2Y) * 0.25;
          }
        }
        const y = wave2Y +
          Math.sin(x * 0.0028 - t * 0.8) * (30 * ampMult) +
          Math.sin(x * 0.0009 + t * 0.5) * (18 * ampMult) +
          mouseDeflect;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.07)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Onda 3: Linha de Dados de Acento
      ctx.beginPath();
      const wave3Y = height * 0.2;
      for (let x = 0; x <= width; x += 12) {
        const y = wave3Y + Math.sin(x * 0.0018 + t * 0.9) * (20 * ampMult);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.045)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    // Desenha anéis luminosos gerados pelo movimento do mouse
    const drawRipples = () => {
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.4;
        r.alpha -= 0.009;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    };

    // Atualiza posições e desenha as partículas com profundidade
    const drawParticles = (time) => {
      const speedMult = atmosphere.speedFactor;
      const upwardBias = atmosphere.upwardBias;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulso de brilho orgânico
        p.pulsePhase += p.pulseSpeed;
        const pulse = Math.sin(p.pulsePhase) * 0.2;
        p.currentAlpha = Math.max(0.08, Math.min(1, p.baseAlpha + pulse));

        // Interação de repulsão suave com o cursor do mouse
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 135;

          if (dist < maxDist && dist > 0.1) {
            const force = (1 - dist / maxDist) * (p.layer === 0 ? 1.0 : p.layer === 1 ? 2.2 : 3.0);
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;

            // Feixe de luz sutil conectando o cursor às partículas próximas
            if (p.layer >= 1 && dist < 115) {
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(p.x, p.y);
              const laserAlpha = (1 - dist / 115) * 0.28;
              ctx.strokeStyle = `rgba(56, 189, 248, ${laserAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        // Movimento orgânico contínuo
        const organicX = Math.sin(time * 0.0006 + p.waveOffset) * 0.18;
        const organicY = Math.cos(time * 0.0006 + p.waveOffset) * 0.18;

        p.x += (p.vx + organicX) * speedMult;
        p.y += (p.vy + organicY + upwardBias) * speedMult;

        // Reposicionamento suave ao ultrapassar bordas
        const pad = 20;
        if (p.x < -pad) p.x = width + pad;
        if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        if (p.y > height + pad) p.y = -pad;

        // Desenho da partícula
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        // Brilho suave em partículas de primeiro plano
        if (p.layer === 2) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color.glow;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.currentAlpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    // Desenha linhas de conexão entre partículas próximas
    const drawConnections = () => {
      const maxDist = atmosphere.connectionDistance;
      const count = particles.length;

      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        if (p1.layer === 0) continue; // Camada distante não cria linhas para manter leveza

        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          if (p2.layer === 0) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    };

    // Inicialização e Resize
    resizeCanvas();
    window.addEventListener('resize', () => {
      resizeCanvas();
    }, { passive: true });

    // Inicia renderização
    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(render);
    } else {
      render(1000);
    }
  };

  initDigitalUniverse();

  /* ==========================================================================
     1. ANO ATUAL NO RODAPÉ
     ========================================================================== */
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     2. SISTEMA DE NOTIFICAÇÃO TOAST
     ========================================================================== */
  const uiToast = document.getElementById('ui-toast');
  const uiToastMsg = document.getElementById('ui-toast-msg');
  let toastTimer = null;

  const showToast = (message, duration = 3200) => {
    if (!uiToast || !uiToastMsg) return;
    uiToastMsg.textContent = message;
    uiToast.classList.add('active');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      uiToast.classList.remove('active');
    }, duration);
  };

  /* ==========================================================================
     3. BARRA DE PROGRESSO DE ROLAGEM, CABEÇALHO SCROLLED E VOLTAR AO TOPO
     ========================================================================== */
  const progressBar = document.getElementById('scroll-progress-bar');
  const siteHeader = document.getElementById('site-header');
  const backToTopBtn = document.getElementById('btn-back-to-top');

  const onScrollHandler = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Atualiza barra de progresso no topo
    if (progressBar && docHeight > 0) {
      const progressPercent = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      progressBar.style.width = `${progressPercent}%`;
    }

    // Cabeçalho com fundo e sombra dinâmica
    if (siteHeader) {
      if (scrollY > 30) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Botão Voltar ao Topo
    if (backToTopBtn) {
      if (scrollY > 360) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', onScrollHandler, { passive: true });
  onScrollHandler();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     4. NAVEGAÇÃO MOBILE (DRAWER & BACKDROP)
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const openDrawer = () => {
    if (!mobileDrawer || !drawerBackdrop) return;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.classList.add('active');
    drawerBackdrop.setAttribute('aria-hidden', 'false');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (!mobileDrawer || !drawerBackdrop) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.classList.remove('active');
    drawerBackdrop.setAttribute('aria-hidden', 'true');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  /* ==========================================================================
     5. DESTAQUE DO LINK ATIVO NA NAVEGAÇÃO (INTERSECTION OBSERVER)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          desktopNavLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
          if (typeof setBackgroundSection === 'function') {
            setBackgroundSection(currentId);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-25% 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(sec => navObserver.observe(sec));
  }

  /* ==========================================================================
     6. HERO DEV HUD — SELETOR DE ABAS INTERATIVO
     ========================================================================== */
  const hudTabs = document.querySelectorAll('.hud-tab');
  const hudPanels = {
    'perfil': document.getElementById('hud-panel-perfil'),
    'stack': document.getElementById('hud-panel-stack'),
    'rotina': document.getElementById('hud-panel-rotina')
  };

  hudTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      hudTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      Object.keys(hudPanels).forEach(key => {
        if (hudPanels[key]) {
          hudPanels[key].classList.remove('active');
        }
      });

      if (hudPanels[target]) {
        hudPanels[target].classList.add('active');
      }
    });
  });

  /* ==========================================================================
     7. SEÇÃO EVOLUÇÃO (TOTALMENTE ESTÁVEL — CONTROLE DE ETAPAS)
     ========================================================================== */
  const evoTabBtns = document.querySelectorAll('.evo-tab-btn');
  const evoCards = document.querySelectorAll('.evo-card');

  evoTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const stepTarget = btn.getAttribute('data-step-target');

      // Atualiza abas
      evoTabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Atualiza cartões
      evoCards.forEach(card => {
        const cardStep = card.getAttribute('data-step');
        if (cardStep === stepTarget) {
          card.classList.add('active-card');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          card.classList.remove('active-card');
        }
      });
    });
  });

  /* ==========================================================================
     8. DETALHAMENTO DE HABILIDADES / MODAL INTERATIVO
     ========================================================================== */
  const skillsData = {
    'html': {
      title: 'HTML5 (HyperText Markup Language)',
      badgeClass: 'icon-html',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      description: 'O HTML é a base de todas as páginas da internet. Ele organiza a estrutura do documento, define títulos, parágrafos, formulários e elementos com significado semântico e acessibilidade.',
      learning: 'No curso técnico, comecei aprendendo a estruturar tags semânticas (<header>, <main>, <section>, <article>), garantindo que o conteúdo seja interpretado perfeitamente por navegadores e leitores de tela.'
    },
    'css': {
      title: 'CSS3 (Cascading Style Sheets)',
      badgeClass: 'icon-css',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>',
      description: 'O CSS é o que dá vida e identidade ao site: gerencia cores, tipografia, espaçamentos, sombras, gradientes, animações e responsividade para dispositivos móveis.',
      learning: 'Estudo propriedades modernas de alinhamento como Flexbox e CSS Grid, além de variáveis CSS (Custom Properties) e media queries para criar layouts adaptáveis a computadores e celulares.'
    },
    'javascript': {
      title: 'JavaScript Moderno',
      badgeClass: 'icon-js',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
      description: 'Linguagem fundamental da web que adiciona interatividade e lógica às aplicações. Permite capturar cliques, manipular elementos da tela em tempo real e tratar dados.',
      learning: 'É a linguagem que pratico com muito interesse nas aulas: aprendendo manipulação do DOM, funções, tratamento de eventos, arrays, objetos e validações de formulários.'
    },
    'logica': {
      title: 'Lógica de Programação & Algoritmos',
      badgeClass: 'icon-logica',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
      description: 'O raciocínio estruturado que antecede qualquer linha de código. É a habilidade de decompor um problema complexo em etapas claras, ordenadas e lógicas.',
      learning: 'Desenvolvo a base necessária em variáveis, tipos de dados, estruturas condicionais (if/else) e laços de repetição (for/while), aprendendo a pensar antes de programar.'
    },
    'banco-dados': {
      title: 'Banco de Dados & SQL',
      badgeClass: 'icon-db',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
      description: 'Sistemas criados para armazenar, consultar e organizar grandes volumes de informações com integridade, segurança e alta velocidade.',
      learning: 'Estou aprendendo conceitos de modelagem de dados, tabelas, chaves primárias e estrangeiras, além das primeiras consultas estruturadas com a linguagem SQL.'
    },
    'informatica': {
      title: 'Informática & Fundamentos de Sistemas',
      badgeClass: 'icon-info',
      iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      description: 'Compreensão ampla da máquina: arquitetura de computadores, componentes internos de hardware, sistemas operacionais e noções de redes.',
      learning: 'Essa matéria me proporciona a visão completa sobre como o computador processa as instruções dos programas, diagnosticar falhas e entender o ecossistema tecnológico.'
    }
  };

  const skillCards = document.querySelectorAll('.skill-card');
  const techModal = document.getElementById('tech-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalIconBadge = document.getElementById('modal-icon-badge');
  const modalDescription = document.getElementById('modal-description');
  const modalLearning = document.getElementById('modal-learning');
  let lastActiveElement = null;

  const openTechModal = (techKey, triggerElement) => {
    const data = skillsData[techKey];
    if (!data || !techModal) return;

    lastActiveElement = triggerElement;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalIconBadge) {
      modalIconBadge.className = `tech-modal-icon-badge ${data.badgeClass}`;
      modalIconBadge.innerHTML = data.iconSvg;
    }
    if (modalDescription) modalDescription.textContent = data.description;
    if (modalLearning) modalLearning.textContent = data.learning;

    techModal.classList.add('active');
    techModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    }, 100);
  };

  const closeTechModal = () => {
    if (!techModal) return;
    techModal.classList.remove('active');
    techModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  };

  skillCards.forEach(card => {
    const techKey = card.getAttribute('data-tech');

    card.addEventListener('click', () => openTechModal(techKey, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTechModal(techKey, card);
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeTechModal);
  if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', closeTechModal);

  if (techModal) {
    techModal.addEventListener('click', (e) => {
      if (e.target === techModal) closeTechModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && techModal && techModal.classList.contains('active')) {
      closeTechModal();
    }
  });

  /* ==========================================================================
     9. TERMINAL INTERATIVO COM COMANDOS SEGUROS E HISTÓRICO
     ========================================================================== */
  const terminalScreen = document.getElementById('terminal-screen');
  const terminalForm = document.getElementById('terminal-form');
  const terminalInput = document.getElementById('terminal-cli-input');
  const clearTermBtn = document.getElementById('btn-clear-term');
  const termChips = document.querySelectorAll('.term-chip');

  const commandResponses = {
    'sobre': 'Matheus Ismério da Silva — Estudante do 2º ano do Ensino Médio Técnico em Desenvolvimento de Sistemas em Campinas, SP.\nApaixonado por tecnologia e focado em construir bases sólidas em lógica e programação.',
    'trajetoria': 'Formação Escolar:\n  1. Colégio Vivendo e Aprendendo (Campinas, SP) — Ensino Fundamental e bases pessoais.\n  2. Colégio Raphael Di Santo (Unidade Garcia, Campinas, SP) — Ensino Médio Técnico em Desenvolvimento de Sistemas.',
    'habilidades': 'Conhecimentos em Desenvolvimento:\n  • HTML5 e CSS3 (Estrutura e estilização de interfaces)\n  • JavaScript (Lógica de programação e manipulação de DOM)\n  • Lógica e Algoritmos (Estruturas de repetição e condicionais)\n  • Banco de Dados (Modelagem e noções de SQL)\n  • Informática e Sistemas Operacionais',
    'evolucao': 'Linha de Evolução:\n  [Fase 1] Onde estou: Aprendendo fundamentos e ferramentas essenciais.\n  [Fase 2] Próximo passo: Praticar nas aulas técnicas e desenvolver projetos de estudo.\n  [Fase 3] Onde quero chegar: Criar meus próprios sistemas e consolidar minha vocação.',
    'projetos': 'Laboratório de Projetos:\n  Ainda estou no início dos estudos e não possuo projetos profissionais publicados.\n  Este portfólio já está preparado para receber repositórios e demonstrações práticas assim que forem desenvolvidas!',
    'objetivos': 'Metas Pessoais:\n  1. Aprofundar conceitos de computação e lógica.\n  2. Aprender novas linguagens de programação.\n  3. Desenvolver sites e sistemas funcionais.\n  4. Descobrir a área de especialização em TI que mais combina comigo.',
    'contato': 'Contatos:\n  • Localização: Campinas, SP — Brasil\n  • E-mail: matheus.ismerio.dev@gmail.com\n  • Status: Estudante Técnico disponível para aprendizado e estágios.',
    'ajuda': 'Comandos disponíveis:\n  • sobre       : Apresentação pessoal resumida\n  • trajetoria  : Histórico das escolas de formação\n  • habilidades : Matérias e tecnologias em estudo\n  • evolucao    : Etapas de progresso no aprendizado\n  • projetos    : Informações sobre os projetos futuros\n  • objetivos   : Minhas metas para a carreira\n  • contato     : Dados de contato e localização\n  • limpar      : Limpa o histórico de comandos da tela\n  • ajuda       : Exibe esta lista de instruções'
  };

  const commandHistory = [];
  let historyIndex = -1;

  const appendToTerminal = (command, response) => {
    if (!terminalScreen) return;

    const entry = document.createElement('div');
    entry.className = 'term-entry';

    const cmdRow = document.createElement('div');
    cmdRow.className = 'term-cmd-row';
    cmdRow.innerHTML = `<span class="term-prompt-user">matheus</span>@<span class="term-prompt-host">portfolio</span>:~$ <span class="term-cmd-text">${escapeHtml(command)}</span>`;

    const resRow = document.createElement('div');
    resRow.className = 'term-res-text';
    resRow.textContent = response;

    entry.appendChild(cmdRow);
    entry.appendChild(resRow);
    terminalScreen.appendChild(entry);

    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  };

  const executeCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    commandHistory.push(cmd);
    historyIndex = commandHistory.length;

    if (cmd === 'limpar' || cmd === 'clear') {
      clearTerminal();
      return;
    }

    if (commandResponses.hasOwnProperty(cmd)) {
      appendToTerminal(cmd, commandResponses[cmd]);
    } else {
      appendToTerminal(cmd, `Comando não reconhecido: "${cmd}". Digite "ajuda" para consultar os comandos disponíveis.`);
    }
  };

  const clearTerminal = () => {
    if (!terminalScreen) return;
    terminalScreen.innerHTML = `
      <div class="terminal-welcome">
        <p class="t-dim">Terminal limpo. Digite um comando ou use os atalhos acima.</p>
        <p class="t-dim">Dica: Digite <span class="t-hl">ajuda</span> para ver todos os comandos.</p>
        <br>
      </div>
    `;
  };

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = terminalInput.value;
      if (val.trim()) {
        executeCommand(val);
        terminalInput.value = '';
      }
    });

    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        if (historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = '';
        }
      }
    });
  }

  termChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd) {
        executeCommand(cmd);
        if (terminalInput) terminalInput.focus();
      }
    });
  });

  if (clearTermBtn) clearTermBtn.addEventListener('click', clearTerminal);

  /* ==========================================================================
     10. GALERIA VISUAL INTERATIVA (SLIDER CINEMATOGRÁFICO)
     ========================================================================== */
  const slides = document.querySelectorAll('.galeria-slide');
  const galeriaDots = document.querySelectorAll('.galeria-dot');
  const counterDisplay = document.getElementById('galeria-counter');
  const prevBtn = document.getElementById('galeria-prev');
  const nextBtn = document.getElementById('galeria-next');
  let currentSlideIndex = 0;

  const updateSlideView = (index) => {
    if (!slides.length) return;
    currentSlideIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      if (idx === currentSlideIndex) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });

    galeriaDots.forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
      }
    });

    if (counterDisplay) {
      const currentFormatted = String(currentSlideIndex + 1).padStart(2, '0');
      const totalFormatted = String(slides.length).padStart(2, '0');
      counterDisplay.textContent = `${currentFormatted} / ${totalFormatted}`;
    }
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => updateSlideView(currentSlideIndex - 1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => updateSlideView(currentSlideIndex + 1));
  }

  galeriaDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => updateSlideView(idx));
  });

  // Navegação por Teclado na Galeria
  const galeriaViewer = document.getElementById('galeria-viewer');
  if (galeriaViewer) {
    galeriaViewer.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') updateSlideView(currentSlideIndex - 1);
      if (e.key === 'ArrowRight') updateSlideView(currentSlideIndex + 1);
    });
  }

  // Suporte a Touch Swipe
  let touchStartX = 0;
  let touchEndX = 0;
  const slidesWrapper = document.getElementById('galeria-slides-wrapper');

  if (slidesWrapper) {
    slidesWrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slidesWrapper.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  const handleSwipe = () => {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        updateSlideView(currentSlideIndex + 1);
      } else {
        updateSlideView(currentSlideIndex - 1);
      }
    }
  };

  /* ==========================================================================
     11. COMPUTADOR INTERATIVO (ALTERNÂNCIA DE FRASES)
     ========================================================================== */
  const screenQuotes = [
    'Todo conhecimento começa com curiosidade.',
    'Um passo de cada vez também é evolução.',
    'Aprender, praticar e melhorar constantemente.',
    'O próximo grande sistema começa com um algoritmo simples.',
    'Errar na programação faz parte do aprendizado para acertar.',
    'Constância e dedicação superam qualquer dificuldade inicial.'
  ];

  let currentScreenQuoteIndex = 0;
  const screenDynamicText = document.getElementById('screen-dynamic-text');
  const clickableScreen = document.getElementById('clickable-screen');
  const btnNextScreenQuote = document.getElementById('btn-next-screen-quote');

  const advanceScreenQuote = () => {
    if (!screenDynamicText) return;
    currentScreenQuoteIndex = (currentScreenQuoteIndex + 1) % screenQuotes.length;

    screenDynamicText.style.opacity = '0';
    setTimeout(() => {
      screenDynamicText.textContent = screenQuotes[currentScreenQuoteIndex];
      screenDynamicText.style.opacity = '1';
    }, 180);
  };

  if (clickableScreen) {
    clickableScreen.addEventListener('click', advanceScreenQuote);
    clickableScreen.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advanceScreenQuote();
      }
    });
  }

  if (btnNextScreenQuote) {
    btnNextScreenQuote.addEventListener('click', advanceScreenQuote);
  }

  /* ==========================================================================
     12. UMA IDEIA PARA HOJE (GERADOR DE INSPIRAÇÃO)
     ========================================================================== */
  const inspirationQuotes = [
    'Aprender a programar é como aprender um novo idioma: a prática diária constrói a fluência.',
    'Cada linha de código que você escreve é um degrau a mais no seu conhecimento técnico.',
    'Grandes sistemas nasceram de pequenos testes e muita curiosidade.',
    'Entender a lógica por trás de um problema é metade da solução.',
    'A tecnologia se transforma rápido, mas a vontade de aprender é o que nos mantém em evolução.',
    'Não tenha medo de começar do início; todo especialista já foi um estudante iniciante.',
    'O código mais limpo é aquele construído com clareza, paciência e bons fundamentos.'
  ];

  let currentInspirationIndex = 0;
  const inspirationLiveText = document.getElementById('inspiration-live-text');
  const btnShuffleInspiration = document.getElementById('btn-shuffle-inspiration');

  const shuffleInspiration = () => {
    if (!inspirationLiveText) return;

    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * inspirationQuotes.length);
    } while (nextIndex === currentInspirationIndex && inspirationQuotes.length > 1);

    currentInspirationIndex = nextIndex;

    inspirationLiveText.style.opacity = '0';
    setTimeout(() => {
      inspirationLiveText.textContent = inspirationQuotes[currentInspirationIndex];
      inspirationLiveText.style.opacity = '1';
    }, 200);
  };

  if (btnShuffleInspiration) {
    btnShuffleInspiration.addEventListener('click', shuffleInspiration);
  }

  /* ==========================================================================
     13. COPIAR E-MAIL & ENVIO DO FORMULÁRIO DE CONTATO
     ========================================================================== */
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const contactEmailVal = document.getElementById('contact-email-val');

  if (btnCopyEmail && contactEmailVal) {
    btnCopyEmail.addEventListener('click', () => {
      const emailText = contactEmailVal.textContent.trim();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(emailText)
          .then(() => {
            showToast('✦ E-mail copiado para a área de transferência!');
          })
          .catch(() => {
            showToast(`E-mail: ${emailText}`);
          });
      } else {
        showToast(`E-mail: ${emailText}`);
      }
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');

      const name = nameInput ? nameInput.value.trim() : '';

      showToast(`✦ Obrigado, ${name || 'pelo contato'}! Mensagem registrada com sucesso.`);
      contactForm.reset();
    });
  }

  /* ==========================================================================
     14. UTILITÁRIO DE ESCAPE HTML SEGURO
     ========================================================================== */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
