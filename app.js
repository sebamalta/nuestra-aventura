const screen = document.querySelector('#screen');

let stopGame = () => {};
let estadoPiecita = null;

const objetosPiecita = [
  { id: 'cajas', nombre: 'Cajas', icono: '📦', color: '#f28b39', celdas: [[0, 0], [0, 1], [0, 2], [1, 2], [1, 3]] },
  { id: 'bici', nombre: 'Bicicleta', icono: '🚲', color: '#1da4cf', celdas: [[0, 0], [0, 1], [1, 0], [2, 0], [3, 0]] },
  { id: 'valijas', nombre: 'Valijas', icono: '🧳', color: '#a92d96', celdas: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
  { id: 'estante', nombre: 'Estante', icono: '🗄️', color: '#49a930', celdas: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]] },
  { id: 'juguetes', nombre: 'Juguetes', icono: '🧸', color: '#ef2435', celdas: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]] },
  { id: 'reposera', nombre: 'Reposera', icono: '🪑', color: '#45add4', celdas: [[0, 0], [0, 1], [1, 1], [2, 0], [2, 1]] }
];

const solucionPiecita = {
  cajas: { fila: 0, columna: 0 },
  bici: { fila: 0, columna: 1 },
  juguetes: { fila: 1, columna: 2 },
  valijas: { fila: 2, columna: 2 },
  reposera: { fila: 3, columna: 0 },
  estante: { fila: 0, columna: 5 }
};

const pistasPiecita = {
  cajas: 'Las cajas arrancan en la esquina superior izquierda y bajan pegadas a esa pared.',
  bici: 'La bicicleta va arriba: empieza en la segunda casilla y se extiende hacia la derecha.',
  juguetes: 'Los juguetes empiezan en la segunda fila, tercera casilla, y forman una esquina hacia abajo.',
  valijas: 'Las valijas ocupan el centro: empiezan en la tercera fila, tercera casilla.',
  reposera: 'La reposera empieza abajo a la izquierda y se abre hacia la derecha.',
  estante: 'El estante va vertical, pegado a toda la pared derecha.'
};

const paginas = capitulos.flatMap((capitulo) =>
  capitulo.subcapitulos.map((subcapitulo, subindice) => ({ capitulo, subcapitulo, subindice }))
);

const primeraPaginaPorCapitulo = capitulos.map((_, indiceCapitulo) =>
  capitulos.slice(0, indiceCapitulo).reduce((total, capitulo) => total + capitulo.subcapitulos.length, 0)
);

function foto(id) {
  const [file, alt, date] = fotos[id];
  return `<figure><img decoding="async" src="fotos/${file}" alt="${alt}"><figcaption>${date}</figcaption></figure>`;
}

function pilaFotos(ids = [], relatos = []) {
  if (ids.length < 2) return ids.map(foto).join('');
  const narrado = relatos.length === ids.length;
  return `<section class="photo-stack${narrado ? ' photo-story' : ''}" aria-label="${narrado ? 'Historia contada foto a foto' : 'Álbum de fotos'}">
    <div class="photo-deck">
      <div class="photo-track" tabindex="0" aria-label="Deslizá para recorrer las fotos">
        ${ids.map((id, indice) => `<div class="photo-slide">${foto(id)}${narrado ? `<div class="photo-story-copy"><div class="photo-story-step">Momento ${indice + 1} de ${ids.length}</div><p>${relatos[indice]}</p></div>` : ''}</div>`).join('')}
      </div>
    </div>
    <div class="photo-controls">
      <button class="secondary" data-photo-step="-1" aria-label="Foto anterior">←</button>
      <small><span data-photo-current>1</span> de ${ids.length} · Deslizá para avanzar</small>
      <button class="secondary" data-photo-step="1" aria-label="Foto siguiente">→</button>
    </div>
  </section>`;
}

function actualizarIndicadorFotos(track) {
  const actual = Math.round(track.scrollLeft / track.clientWidth) + 1;
  const indicador = track.closest('.photo-stack')?.querySelector('[data-photo-current]');
  if (indicador) indicador.textContent = String(actual);
}

function indice() {
  return `<details class="index"><summary>Ver capítulos</summary>${capitulos.map((c, i) =>
    `<section class="index-year"><button data-chapter="${primeraPaginaPorCapitulo[i]}">Capítulo ${c.numero} · ${c.anio}</button>
      <ol>${c.subcapitulos.map((subcapitulo, j) => `<li><button class="index-subchapter" data-chapter="${primeraPaginaPorCapitulo[i] + j}">${c.numero}.${j + 1} · ${subcapitulo.titulo}</button></li>`).join('')}</ol>
    </section>`).join('')}</details>`;
}

function recuerdoParada(index) {
  const parada = paradas[index];
  return `<h3>${parada.nombre}</h3><p>${parada.texto}</p>${pilaFotos(parada.fotos)}`;
}

const actividades = {
  ruta: `<section class="memory-card" aria-label="Mapa del viaje de abril">
    <h2>El mapa del viaje</h2><p>Tocá una parada para ver los recuerdos del camino.</p>
    <ol class="route-map">${paradas.map((parada, i) => `<li><button data-stop="${i}" aria-pressed="${i === 0}"><span aria-hidden="true">${i + 1}</span>${parada.nombre}</button></li>`).join('')}</ol>
    <div id="route-memory" aria-live="polite">${recuerdoParada(0)}</div>
  </section>`,
  misterios: `<details class="memory-card"><summary>Abrir las fotos misteriosas</summary><p>¿Habrá sido en Casa Maíz? Por ahora, el lugar de los dinosaurios y el motivo del barbijo de Luis siguen siendo un misterio. Te dejo esas fotos junto a otras al azar, para recordar personas y momentos. 📷</p>${pilaFotos(['dino1', 'dino2', 'luis', 'extra1', 'extra2', 'extra3', 'extra4', 'extra5'])}</details>`,
  eleccion: `<section class="memory-card"><h2>¿Qué elegí?</h2>
    <div class="choice-options"><button data-choice="hijo"><span aria-hidden="true">♥</span>Un hijo</button><button data-choice="loro"><span aria-hidden="true">🦜</span>Un loro</button></div>
    <p id="choice-result" class="feedback" aria-live="polite"></p><section id="pregnancy" class="pregnancy" hidden><h3>Dos rayitas ♥</h3><p>El 18 de septiembre de 2008, dos rayitas nos dieron la noticia. El fruto de nuestro amor ya estaba en camino. En 2009 conoceríamos a nuestra hija.</p>${foto("test")}</section>
  </section>`,

  bahia: '<div class="sign"><span class="eyebrow" style="color:inherit">Sunchales</span><strong>Bahía</strong><span>14 · 02 · 2004</span></div>',
  novios: '<div class="quiz"><button class="secondary" data-answer="Para mí, ¡sí!">Ya éramos novios</button><button class="secondary" data-answer="Esa sigue siendo tu versión. 😄">Nos estábamos conociendo</button><button class="secondary" data-answer="¡Exacto! Depende de a quién le preguntes.">Depende de a quién le preguntes</button></div><p class="feedback" aria-live="polite"></p>',
  propuesta: '<div class="propuesta"><button id="yes">SÍ</button><button id="no">NO</button></div><div class="proposal-heart" aria-hidden="true" hidden>♥</div><p class="feedback" aria-live="polite"></p>',
  moto: '<section class="game" aria-label="Minijuego de la Zanellita"><p>Movete entre los tres carriles. Cargá nafta al menos dos veces antes de juntar 8 monedas.</p><div class="hud"><strong id="coins">Monedas 0 / 8</strong><span id="refills">Cargas 0 / 2</span><label>Nafta <progress id="fuel" max="100" value="80"></progress></label></div><canvas width="360" height="300" aria-label="Ruta de tres carriles"></canvas><div class="actions"><button id="left" aria-label="Ir a la izquierda">←</button><button id="start">Arrancar</button><button id="right" aria-label="Ir a la derecha">→</button></div><p id="result" class="feedback" aria-live="polite"></p></section>',
  sabroso: `<section class="memory-card music-memory" aria-labelledby="sabroso-question">
    <h2 id="sabroso-question">¿Cuál es tu canción favorita de Sabroso?</h2>
    <p>Elegí una entre estas diez canciones que ya formaban parte de su repertorio en 2011. Es una selección para recordar, no un ranking.</p>
    <div class="song-picker">
      ${['Por tu silencio', 'Bella idiota', 'Año tras año', 'Siempre tú', 'Antídoto', 'Quisiera amarte', 'Por fuera y por dentro', 'Almas gemelas', 'La amo', 'Llegó tu papi'].map(cancion => `<button class="secondary" data-song="${cancion}">${cancion}</button>`).join('')}
    </div>
    <p id="song-result" class="feedback" aria-live="polite"></p>
  </section>`,
  rosario: `<section class="memory-card hotel-memory hotel-search" aria-labelledby="hotel-search-title">
      <h2 id="hotel-search-title">¿Dónde se metió Vero?</h2>
      <p>Entraste a la habitación y Vero no aparece. Tocá la cama, el baño y el armario para buscarla.</p>
      <div class="hotel-room" aria-label="Habitación de hotel con una cama, un baño y un armario">
        <button class="hotel-spot hotel-bed" data-hotel-place="cama" aria-label="Buscar a Vero en la cama">
          <span class="bed-headboard" aria-hidden="true"></span>
          <span class="bed-pillows" aria-hidden="true"></span>
          <span class="bed-cover" aria-hidden="true"></span>
          <span class="room-label">Cama</span>
        </button>
        <button class="hotel-spot hotel-bathroom" data-hotel-place="baño" aria-label="Buscar a Vero en el baño">
          <span class="bath-mirror" aria-hidden="true"></span>
          <span class="bath-sink" aria-hidden="true"></span>
          <span class="bath-bidet" aria-hidden="true"></span>
          <span class="room-label">Baño</span>
        </button>
        <button class="hotel-spot hotel-closet" data-hotel-place="armario" aria-label="Buscar a Vero en el armario" aria-pressed="false">
          <span class="closet-frame" aria-hidden="true">
            <span class="closet-door closet-door-left"></span>
            <span class="closet-door closet-door-right"></span>
          </span>
          <span class="vero-reveal" hidden><span class="vero-icon" aria-hidden="true">👩</span><strong>¡Acá está Vero!</strong></span>
          <span class="room-label">Armario</span>
        </button>
      </div>
      <p class="feedback hotel-result" aria-live="polite">¿Dónde se habrá metido Vero?</p>
  </section>`,
  piecita: `<section class="memory-card packing-game" aria-labelledby="packing-title">
    <h2 id="packing-title">Acomodá la piecita</h2>
    <p>Las seis cosas ocupan exactamente todo el tablero. Arrastrá una pieza hasta su lugar o elegila y tocá la casilla donde querés apoyarla. Ya tienen la orientación correcta.</p>
    <div class="packing-layout">
      <div class="packing-board-frame">
        <div class="packing-board" role="grid" aria-label="Tablero fijo de seis por cinco casillas para encastrar todas las piezas">
          ${Array.from({length: 30}, (_, i) => `<button class="packing-cell" data-pack-cell="${i}" role="gridcell" aria-label="Fila ${Math.floor(i / 6) + 1}, columna ${(i % 6) + 1}"></button>`).join('')}
          <div class="packing-pieces"></div>
        </div>
      </div>
      <div class="packing-side">
        <div class="packing-tray" aria-label="Piezas por acomodar"></div>
        <div class="packing-actions"><button class="secondary" data-pack-hint>Pista útil</button><button class="secondary" data-pack-reset>Empezar de nuevo</button></div>
      </div>
    </div>
    <p class="feedback packing-result" aria-live="polite">Arrastrá una pieza al tablero. En celular también podés tocar una pieza y después una casilla.</p>
  </section>`
};

function mostrar(index) {
  stopGame();
  stopGame = () => {};

  if (index < 0) {
    screen.innerHTML = `<div class="hero"><section class="hero-copy"><div class="anniversary-mark" aria-hidden="true">♥</div><div class="eyebrow">18 de noviembre de 2026</div><h1>20 años<br><em>con vos.</em></h1><p>Desde aquella noche en Bahía hasta la decisión que cambió nuestra familia.</p><button data-chapter="0">Empezar la historia →</button></section>${foto('agosto2006')}</div>${indice()}`;
  } else if (index === paginas.length) {
    screen.innerHTML = `<section class="finish anniversary-letter"><div class="eyebrow">18 · 11 · 2006 — 18 · 11 · 2026</div><h1>Veinte años, y todavía te elijo</h1><div class="finish-copy"><p>Vero, mirá cuántas cosas hicimos en nuestros primeros diez años de matrimonio 🏡. Viajamos, construimos, nos reímos, agrandamos la familia y aprendimos a caminar juntos, incluso cuando el camino se puso difícil.</p><p>Esta primera versión llega hasta 2016 📖. Todavía me faltan contar nuestros segundos diez años, no porque hayan sido menos importantes, sino porque nuestra historia tiene demasiados recuerdos para apurarlos. Me comprometo a completar muy pronto esta aventura.</p><p>Hoy, al cumplir veinte años de casados, quiero decirte algo simple y enorme: te amo ❤️. Te quiero cada día más, te sigo eligiendo y quiero seguir sumando viajes, proyectos, anécdotas y sueños con vos ✨.</p><p>Gracias por estos veinte años, por nuestra familia y por la vida que construimos. Lo mejor de nuestra historia no es todo lo que ya vivimos: es saber que todavía nos queda muchísimo por vivir juntos 🥰.</p></div><div class="finish-signature">Con todo mi amor,<strong>Sebas</strong></div><button data-chapter="-1">Volver a la portada</button></section>${indice()}`;
  } else {
    const { capitulo, subcapitulo, subindice } = paginas[index];
    const actividadAntes = subcapitulo.actividad === 'bahia' ? actividades.bahia : '';
    const actividadDespues = subcapitulo.actividad && subcapitulo.actividad !== 'bahia'
      ? actividades[subcapitulo.actividad]
      : '';
    const siguiente = paginas[index + 1]?.subcapitulo;
    screen.innerHTML = `<article class="chapter"><div class="chapter-progress" aria-hidden="true">${paginas.map((_, step) => `<span class="${step <= index ? 'reached' : ''}"></span>`).join('')}</div><div class="eyebrow">Capítulo ${capitulo.numero} · ${capitulo.anio}</div><div class="subchapter-label">Subcapítulo ${capitulo.numero}.${subindice + 1}</div><h1>${subcapitulo.titulo}</h1>${subcapitulo.fecha ? `<div class="subchapter-date">${subcapitulo.fecha}</div>` : ''}<div class="chapter-story">${subcapitulo.texto ? `<p>${subcapitulo.texto}</p>` : ''}${(subcapitulo.parrafos ?? []).map(parrafo => `<p>${parrafo}</p>`).join('')}</div>${actividadAntes}${pilaFotos(subcapitulo.fotos, subcapitulo.relatos)}${actividadDespues}</article><nav aria-label="Navegación de subcapítulos"><button class="secondary" data-chapter="${index - 1}">← Atrás</button><button data-chapter="${index + 1}">${index === paginas.length - 1 ? 'Ver cierre' : ['moto', 'piecita'].includes(siguiente?.actividad) ? 'Jugar' : 'Siguiente'} →</button></nav>${indice()}`;
    if (subcapitulo.actividad === 'moto') stopGame = prepararMoto();
    if (subcapitulo.actividad === 'piecita') prepararPiecita();
  }
  const heading = screen.querySelector('h1');
  heading.tabIndex = -1;
  heading.focus({preventScroll:true});
  window.scrollTo(0, 0);
}

screen.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.packPiece && Date.now() < ignorarClickPiecitaHasta) return;
  if (button.dataset.photoStep) {
    const track = button.closest('.photo-stack').querySelector('.photo-track');
    const page = Math.round(track.scrollLeft / track.clientWidth);
    const next = Math.max(0, Math.min(track.children.length - 1, page + Number(button.dataset.photoStep)));
    track.scrollTo({ left: next * track.clientWidth });
    const indicador = track.closest('.photo-stack').querySelector('[data-photo-current]');
    if (indicador) indicador.textContent = String(next + 1);
  }
  if (button.dataset.stop !== undefined) {
    for (const parada of screen.querySelectorAll('[data-stop]')) {
      parada.setAttribute('aria-pressed', String(parada === button));
    }
    screen.querySelector('#route-memory').innerHTML = recuerdoParada(Number(button.dataset.stop));
  }
  if (button.dataset.choice) {
    screen.querySelector('#pregnancy').hidden = button.dataset.choice !== 'hijo';
    screen.querySelector('#choice-result').textContent = button.dataset.choice === 'hijo'
      ? 'Elegí tener un hijo con vos.'
      : 'El loro habría tenido mucho para decir. Probá la otra opción para ver qué elegí.';
  }
  if (button.dataset.song) {
    screen.querySelector('#song-result').textContent = `Elegiste “${button.dataset.song}”. ¡Que suene otra vez! 🎶`;
    for (const opcion of screen.querySelectorAll('[data-song]')) {
      opcion.setAttribute('aria-pressed', String(opcion === button));
    }
  }
  if (button.dataset.packPiece) {
    if (!estadoPiecita) return;
    estadoPiecita.seleccionado = button.dataset.packPiece;
    estadoPiecita.celdasPista = [];
    renderPiecita();
  }
  if (button.dataset.packReset !== undefined) {
    reiniciarPiecita();
  }
  if (button.dataset.packHint !== undefined) {
    mostrarPistaPiecita();
  }
  if (button.dataset.packCell !== undefined) {
    colocarEnPiecita(Number(button.dataset.packCell));
  }
  if (button.dataset.hotelPlace) {
    const game = button.closest('.hotel-search');
    const result = game.querySelector('.hotel-result');
    const place = button.dataset.hotelPlace;
    if (place === 'armario') {
      button.classList.add('is-found');
      button.setAttribute('aria-pressed', 'true');
      button.querySelector('.vero-reveal').hidden = false;
      result.textContent = '¡Encontraste a Vero adentro del armario! 😄';
    } else if (place === 'cama') {
      result.textContent = 'En la cama no está… seguí buscando.';
    } else {
      result.textContent = 'En el baño quedó el recuerdo del bidet, pero Vero no está ahí.';
    }
  }
  if (button.dataset.chapter !== undefined) mostrar(Number(button.dataset.chapter));
  if (button.dataset.answer) screen.querySelector('.feedback').textContent = button.dataset.answer;
  if (button.id === 'no') {
    const abajo = button.dataset.abajo !== 'true';
    button.dataset.abajo = String(abajo);
    button.style.top = abajo ? '84px' : '10px';
    button.style.right = abajo ? 'calc(50% - 37px)' : '10px';
  }
  if (button.id === 'yes') {
    screen.querySelector('.proposal-heart').hidden = false;
    screen.querySelector('.feedback').textContent = 'Me abrazaste y me dijiste que sí. Desde ese instante estábamos comprometidos.';
  }
});
screen.addEventListener('scroll', event => {
  const track = event.target.closest?.('.photo-track');
  if (track) actualizarIndicadorFotos(track);
}, true);
let arrastrePiecita = null;
let ignorarClickPiecitaHasta = 0;

function moverFantasmaPiecita(x, y) {
  if (!arrastrePiecita?.fantasma) return;
  arrastrePiecita.fantasma.style.left = `${x}px`;
  arrastrePiecita.fantasma.style.top = `${y}px`;
}

screen.addEventListener('pointerdown', event => {
  const boton = event.target.closest?.('[data-pack-piece]');
  if (!boton || !estadoPiecita || (event.pointerType === 'mouse' && event.button !== 0)) return;
  const id = boton.dataset.packPiece;
  arrastrePiecita = { id, pointerId: event.pointerId, inicioX: event.clientX, inicioY: event.clientY, fantasma: null };
  estadoPiecita.seleccionado = id;
  estadoPiecita.celdasPista = [];
  try { screen.setPointerCapture(event.pointerId); } catch (_) { /* No todos los navegadores lo requieren. */ }
});

screen.addEventListener('pointermove', event => {
  if (!arrastrePiecita || arrastrePiecita.pointerId !== event.pointerId) return;
  const distancia = Math.hypot(event.clientX - arrastrePiecita.inicioX, event.clientY - arrastrePiecita.inicioY);
  if (!arrastrePiecita.fantasma && distancia > 7) {
    const objeto = objetosPiecita.find(item => item.id === arrastrePiecita.id);
    const fantasma = document.createElement('div');
    fantasma.className = 'packing-drag-ghost';
    fantasma.innerHTML = vistaForma(objeto, celdasPiecita(objeto), 'piece-shape-drag');
    document.body.appendChild(fantasma);
    arrastrePiecita.fantasma = fantasma;
  }
  if (arrastrePiecita.fantasma) {
    event.preventDefault();
    moverFantasmaPiecita(event.clientX, event.clientY);
  }
});

function terminarArrastrePiecita(event) {
  if (!arrastrePiecita || arrastrePiecita.pointerId !== event.pointerId) return;
  const { id, fantasma } = arrastrePiecita;
  arrastrePiecita = null;
  if (!fantasma) return;
  fantasma.remove();
  ignorarClickPiecitaHasta = Date.now() + 350;
  const tablero = screen.querySelector('.packing-board');
  const limites = tablero?.getBoundingClientRect();
  const dentro = limites && event.clientX >= limites.left && event.clientX < limites.right
    && event.clientY >= limites.top && event.clientY < limites.bottom;
  estadoPiecita.seleccionado = id;
  if (dentro) {
    const columna = Math.min(5, Math.floor(((event.clientX - limites.left) / limites.width) * 6));
    const fila = Math.min(4, Math.floor(((event.clientY - limites.top) / limites.height) * 5));
    colocarEnPiecita((fila * 6) + columna);
  } else {
    const resultado = screen.querySelector('.packing-result');
    if (resultado) resultado.textContent = 'Soltá la pieza sobre una casilla del tablero.';
    renderPiecita();
  }
}

screen.addEventListener('pointerup', terminarArrastrePiecita);
screen.addEventListener('pointercancel', terminarArrastrePiecita);

document.querySelector('#home').addEventListener('click', () => mostrar(-1));


function celdasPiecita(objeto) {
  return objeto.celdas.map(([x, y]) => [x, y]);
}

function dimensionesPiecita(celdas) {
  return {
    ancho: Math.max(...celdas.map(([x]) => x)) + 1,
    alto: Math.max(...celdas.map(([, y]) => y)) + 1
  };
}

function prepararPiecita() {
  reiniciarPiecita();
}

function reiniciarPiecita() {
  estadoPiecita = {
    seleccionado: null,
    colocados: {},
    indicePista: 0,
    celdasPista: []
  };
  renderPiecita();
  const resultado = screen.querySelector('.packing-result');
  if (resultado) resultado.textContent = 'Arrastrá una pieza al tablero. En celular también podés tocar una pieza y después una casilla.';
}

function celdasAbsolutas(id, posicion) {
  const objeto = objetosPiecita.find(item => item.id === id);
  return celdasPiecita(objeto).map(([x, y]) => [x + posicion.columna, y + posicion.fila]);
}

function vistaForma(objeto, celdas, clase = '') {
  const dimensiones = dimensionesPiecita(celdas);
  const centro = Math.floor(celdas.length / 2);
  return `<span class="piece-shape ${clase}" style="--piece-columns:${dimensiones.ancho};--piece-rows:${dimensiones.alto};--piece-color:${objeto.color}" aria-hidden="true">${celdas.map(([x, y], indice) => `<span class="piece-square" style="grid-column:${x + 1};grid-row:${y + 1}">${indice === centro ? objeto.icono : ''}</span>`).join('')}</span>`;
}

function renderPiecita() {
  const juego = screen.querySelector('.packing-game');
  if (!juego || !estadoPiecita) return;
  const tablero = juego.querySelector('.packing-board');
  const capaPiezas = tablero.querySelector('.packing-pieces');
  capaPiezas.innerHTML = Object.entries(estadoPiecita.colocados).map(([id, posicion]) => {
    const objeto = objetosPiecita.find(item => item.id === id);
    const celdas = celdasPiecita(objeto);
    const dimensiones = dimensionesPiecita(celdas);
    const seleccionado = estadoPiecita.seleccionado === id;
    return `<button class="packed-piece piece-${id} ${seleccionado ? 'is-selected' : ''}" data-pack-piece="${id}" aria-label="Mover ${objeto.nombre}" style="--piece-left:${posicion.columna};--piece-top:${posicion.fila};--piece-width:${dimensiones.ancho};--piece-height:${dimensiones.alto}">${vistaForma(objeto, celdas, 'piece-shape-board')}</button>`;
  }).join('');
  const pistas = new Set(estadoPiecita.celdasPista.map(([x, y]) => y * 6 + x));
  tablero.querySelectorAll('[data-pack-cell]').forEach((celda, indice) => celda.classList.toggle('is-hint', pistas.has(indice)));
  const bandeja = juego.querySelector('.packing-tray');
  bandeja.innerHTML = objetosPiecita.map(objeto => {
    const colocado = Boolean(estadoPiecita.colocados[objeto.id]);
    const seleccionado = estadoPiecita.seleccionado === objeto.id;
    const celdas = celdasPiecita(objeto);
    return `<button class="pack-object ${colocado ? 'is-packed' : ''} ${seleccionado ? 'is-selected' : ''}" data-pack-piece="${objeto.id}" aria-pressed="${seleccionado}">${vistaForma(objeto, celdas, 'piece-shape-preview')}<span class="pack-object-copy"><strong>${objeto.nombre}</strong><small>${colocado ? 'Acomodada · tocá para mover' : seleccionado ? 'Ahora tocá el tablero' : 'Arrastrá o elegí'}</small></span></button>`;
  }).join('');
}

function estaEnSolucionPiecita(id) {
  const actual = estadoPiecita.colocados[id];
  const correcta = solucionPiecita[id];
  return Boolean(actual && actual.fila === correcta.fila && actual.columna === correcta.columna);
}

function mostrarPistaPiecita() {
  const juego = screen.querySelector('.packing-game');
  if (!juego || !estadoPiecita) return;
  const pendientes = objetosPiecita.filter(objeto => !estaEnSolucionPiecita(objeto.id));
  const resultado = juego.querySelector('.packing-result');
  if (!pendientes.length) {
    resultado.textContent = '¡Ya está todo en su lugar! La piecita quedó impecable 😄🎉';
    return;
  }
  const objeto = pendientes[estadoPiecita.indicePista % pendientes.length];
  estadoPiecita.indicePista += 1;
  estadoPiecita.seleccionado = objeto.id;
  const posicion = solucionPiecita[objeto.id];
  estadoPiecita.celdasPista = celdasPiecita(objeto).map(([x, y]) => [x + posicion.columna, y + posicion.fila]);
  resultado.textContent = `Pista para ${objeto.nombre}: ${pistasPiecita[objeto.id]} Las casillas marcadas muestran su lugar.`;
  renderPiecita();
}

function colocarEnPiecita(indice) {
  const juego = screen.querySelector('.packing-game');
  if (!juego || !estadoPiecita?.seleccionado) {
    const resultado = juego?.querySelector('.packing-result');
    if (resultado) resultado.textContent = 'Primero elegí o arrastrá una de las piezas.';
    return;
  }
  const id = estadoPiecita.seleccionado;
  const objeto = objetosPiecita.find(item => item.id === id);
  const celdas = celdasPiecita(objeto);
  const dimensiones = dimensionesPiecita(celdas);
  const fila = Math.floor(indice / 6);
  const columna = indice % 6;
  const resultado = juego.querySelector('.packing-result');
  if (columna + dimensiones.ancho > 6 || fila + dimensiones.alto > 5) {
    resultado.textContent = 'Esa forma se sale del tablero. Probá apoyarla desde una casilla más hacia adentro.';
    return;
  }
  const ocupadas = new Set();
  for (const [otroId, posicion] of Object.entries(estadoPiecita.colocados)) {
    if (otroId === id) continue;
    for (const [x, y] of celdasAbsolutas(otroId, posicion)) ocupadas.add(`${x},${y}`);
  }
  const nuevas = celdas.map(([x, y]) => [x + columna, y + fila]);
  if (nuevas.some(([x, y]) => ocupadas.has(`${x},${y}`))) {
    resultado.textContent = 'Ahí se superpone con otra pieza. Probá otra casilla o mové la que ya está puesta.';
    return;
  }
  estadoPiecita.colocados[id] = {fila, columna};
  estadoPiecita.celdasPista = [];
  const usados = Object.keys(estadoPiecita.colocados).length;
  const celdasOcupadas = new Set();
  for (const [piezaId, posicion] of Object.entries(estadoPiecita.colocados)) {
    for (const [x, y] of celdasAbsolutas(piezaId, posicion)) celdasOcupadas.add(`${x},${y}`);
  }
  const resuelto = usados === objetosPiecita.length && celdasOcupadas.size === 30;
  const correcta = estaEnSolucionPiecita(id);
  resultado.textContent = resuelto
    ? '¡Entró todo y no quedó ni un hueco! Milagro confirmado: la piecita se puede ordenar 😄🎉'
    : correcta
      ? `¡Perfecto! ${objeto.nombre} quedó en su lugar. Ya acomodaste ${usados} de ${objetosPiecita.length}.`
      : `${objeto.nombre} entró ahí. Si después falta lugar, podés tocarla y moverla.`;
  renderPiecita();
}

function dibujarZanellita(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.fillStyle = '#211a3290';
  ctx.beginPath();
  ctx.ellipse(0, 25, 39, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const rueda of [-26, 26]) {
    ctx.fillStyle = '#201922';
    ctx.beginPath();
    ctx.arc(rueda, 11, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b6c2be';
    ctx.beginPath();
    ctx.arc(rueda, 11, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f8efe2';
    ctx.lineWidth = 1.5;
    for (let spoke = 0; spoke < 6; spoke++) {
      const angle = spoke * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(rueda, 11);
      ctx.lineTo(rueda + Math.cos(angle) * 7, 11 + Math.sin(angle) * 7);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = '#e8bfaa';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(26, 11);
  ctx.lineTo(17, -23);
  ctx.lineTo(7, -25);
  ctx.moveTo(-26, 11);
  ctx.lineTo(-15, -4);
  ctx.stroke();

  ctx.fillStyle = '#a43353';
  ctx.beginPath();
  ctx.moveTo(-35, -2);
  ctx.quadraticCurveTo(-26, -14, -11, -8);
  ctx.lineTo(-2, 2);
  ctx.lineTo(13, -10);
  ctx.quadraticCurveTo(22, -14, 23, -4);
  ctx.lineTo(6, 11);
  ctx.lineTo(-13, 11);
  ctx.lineTo(-22, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ffafad';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-31, -3);
  ctx.quadraticCurveTo(-21, -9, -13, -5);
  ctx.lineTo(-2, 5);
  ctx.lineTo(16, -7);
  ctx.stroke();

  ctx.fillStyle = '#241b2a';
  ctx.beginPath();
  ctx.roundRect(-30, -15, 26, 7, 4);
  ctx.roundRect(-13, 4, 16, 11, 3);
  ctx.fill();
  ctx.fillStyle = '#ffe6a2';
  ctx.beginPath();
  ctx.roundRect(18, -22, 10, 8, 4);
  ctx.fill();
  ctx.strokeStyle = '#c0415b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(26, 10, 14, Math.PI * 1.09, Math.PI * 1.93);
  ctx.stroke();
  ctx.restore();
}

function prepararMoto() {
  const canvas = screen.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const fuelBar = screen.querySelector('#fuel');
  const coinLabel = screen.querySelector('#coins');
  const result = screen.querySelector('#result');
  const start = screen.querySelector('#start');
  const left = screen.querySelector('#left');
  const right = screen.querySelector('#right');
  const centros = [80, 180, 280];
  const meta = 8;
  const cargasMinimas = 2;
  const naftaInicial = 80;
  const refillLabel = screen.querySelector('#refills');
  let carril = 1, monedas = 0, cargas = 0, nafta = naftaInicial, recorrido = 0, siguiente = 0.6;
  let items = [], turno = 0, raf = 0, anterior = 0, jugando = false;

  function dibujar() {
    ctx.fillStyle = '#607c65';
    ctx.fillRect(0, 0, 360, 300);
    ctx.fillStyle = '#493c53';
    ctx.fillRect(29, 0, 302, 300);
    ctx.strokeStyle = '#f9ddc0';
    ctx.lineWidth = 2;
    for (const x of [130, 230]) {
      for (let y = recorrido * 95 % 43 - 43; y < 300; y += 43) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 21);
        ctx.stroke();
      }
    }
    ctx.textAlign = 'center';
    ctx.font = 'bold 17px system-ui';
    for (const item of items) {
      const x = centros[item.carril];
      ctx.fillStyle = item.nafta ? '#b9e1b6' : '#ffcb63';
      ctx.beginPath();
      if (item.nafta) ctx.roundRect(x - 15, item.y - 12, 30, 24, 5);
      else ctx.arc(x, item.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#33252c';
      ctx.fillText(item.nafta ? '+' : '$', x, item.y + 6);
    }
    const x = centros[carril];
    dibujarZanellita(ctx, x, 244);
  }

  function actualizar() {
    fuelBar.value = nafta;
    refillLabel.textContent = 'Cargas ' + Math.min(cargas, cargasMinimas) + ' / ' + cargasMinimas;
    coinLabel.textContent = 'Monedas ' + monedas + ' / ' + meta;
  }

  function terminar(gano) {
    jugando = false;
    start.textContent = gano ? 'Otra vuelta' : 'Reintentar';
    result.textContent = gano ? '¡Juntaste lo necesario para casarte! 💍' : '¡Se quedó sin nafta! Probá agarrar más bidones.';
  }

  function paso(tiempo) {
    const dt = anterior ? Math.min((tiempo - anterior) / 1000, 0.05) : 0;
    anterior = tiempo;
    recorrido += dt;
    nafta = Math.max(0, nafta - dt * 10);
    if (recorrido >= siguiente) {
      items.push({ carril: (turno * 2 + Math.floor(turno / 3)) % 3, y: -15, nafta: turno % 4 === 2 });
      turno++;
      siguiente += 1.05;
    }
    for (const item of items) {
      item.y += 115 * dt;
      if (item.carril === carril && item.y >= 222 && item.y <= 266 && !item.tomado) {
        item.tomado = true;
        if (item.nafta) {
          cargas++;
          nafta = Math.min(100, nafta + 30);
        }
        else monedas++;
      }
    }
    items = items.filter(item => item.y < 317 && !item.tomado);
    if (monedas >= meta && cargas < cargasMinimas) nafta = 0;
    actualizar();
    dibujar();
    if (monedas >= meta || nafta <= 0) terminar(nafta > 0 && cargas >= cargasMinimas && monedas >= meta);
    else raf = requestAnimationFrame(paso);
  }

  function mover(delta) {
    carril = Math.max(0, Math.min(2, carril + delta));
    dibujar();
  }

  function teclado(event) {
    if (!jugando || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    mover(event.key === 'ArrowLeft' ? -1 : 1);
  }

  left.onclick = () => mover(-1);
  right.onclick = () => mover(1);
  start.onclick = () => {
    if (jugando) {
      jugando = false;
      cancelAnimationFrame(raf);
      start.textContent = 'Continuar';
      result.textContent = 'En pausa.';
      return;
    }
    if (start.textContent !== 'Continuar') {
      carril = 1; monedas = 0; cargas = 0; nafta = naftaInicial; recorrido = 0; siguiente = 0.6;
      turno = 0; items = [];
    }
    anterior = 0;
    jugando = true;
    start.textContent = 'Pausa';
    result.textContent = '';
    actualizar();
    dibujar();
    raf = requestAnimationFrame(paso);
  };
  window.addEventListener('keydown', teclado);
  actualizar();
  dibujar();
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', teclado);
  };
}

mostrar(-1);