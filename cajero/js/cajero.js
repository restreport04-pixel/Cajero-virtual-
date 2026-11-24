// =========================================================
// 1. VERIFICAR SESIÓN ACTIVA EN LOCALSTORAGE
// =========================================================
const usuarioActivoUsername = localStorage.getItem('usuarioActivo');

if (!usuarioActivoUsername) {
    window.location.href = "login.html";
}

// =========================================================
// 2. CARGAR BASE DE DATOS DE USUARIOS
// =========================================================
let usuarios = JSON.parse(localStorage.getItem('usuarios_cajero')) || [];
let usuarioActual = usuarios.find(function (user) {
    return user.username === usuarioActivoUsername;
});

if (!usuarioActual) {
    localStorage.removeItem('usuarioActivo');
    window.location.href = "login.html";
}

// Inicializar propiedades si no existen en el usuario
if (!usuarioActual.movimientos) {
    usuarioActual.movimientos = [];
}

if (!usuarioActual.metas) {
    usuarioActual.metas = [
        { id: 1, nombre: "Ahorro Base", actual: 0, objetivo: 100000 }
    ];
}

// =========================================================
// 3. CAPTURA DE ELEMENTOS DEL DOM
// =========================================================
const nombreUsuarioDisplay = document.getElementById('nombre-usuario-display');
const cardHolderName = document.getElementById('card-holder-name');
const saldoDisplay = document.getElementById('saldo-display');
const btnToggleSaldo = document.getElementById('btn-toggle-saldo');
const listaMovimientos = document.getElementById('lista-movimientos');

// Elementos de la gráfica propia
const textoIngresos = document.getElementById('texto-ingresos');
const barraIngresos = document.getElementById('barra-ingresos');
const textoEgresos = document.getElementById('texto-egresos');
const barraEgresos = document.getElementById('barra-egresos');
const mensajeFinanciero = document.getElementById('mensaje-financiero');

// Operaciones
const inputConsignar = document.getElementById('input-consignar');
const btnConsignar = document.getElementById('btn-consignar');

const inputRetirar = document.getElementById('input-retirar');
const btnRetirar = document.getElementById('btn-retirar');

const inputDestinatario = document.getElementById('input-destinatario');
const inputMontoTransferir = document.getElementById('input-monto-transferir');
const btnTransferir = document.getElementById('btn-transferir');

// Metas de ahorro
const inputMetaNombre = document.getElementById('input-meta-nombre');
const inputMetaObjetivo = document.getElementById('input-meta-objetivo');
const btnCrearMeta = document.getElementById('btn-crear-meta');
const contenedorMetas = document.getElementById('contenedor-metas');

const btnLogout = document.getElementById('btn-logout');

let saldoOculto = false;

// =========================================================
// 4. FUNCIONES AUXILIARES
// =========================================================
function guardarEnLocalStorage() {
    localStorage.setItem('usuarios_cajero', JSON.stringify(usuarios));
}

function mostrarNotificacion(mensaje, tipo) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (tipo === 'error') {
        toast.classList.add('error');
    }
    toast.textContent = mensaje;
    container.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 3000);
}

function renderizarSaldo() {
    if (saldoOculto) {
        saldoDisplay.textContent = "$ ••••••••";
        btnToggleSaldo.textContent = "Mostrar";
    } else {
        saldoDisplay.textContent = "$ " + usuarioActual.saldo.toLocaleString('es-CO');
        btnToggleSaldo.textContent = "Ocultar";
    }
}

// Calcular y dibujar la gráfica hecha a mano con porcentajes
function actualizarGraficaPropia() {
    let totalIngresos = 200000; // Capital inicial con el que se crea la cuenta
    let totalEgresos = 0;

    // Recorremos el arreglo de movimientos para sumar entradas y salidas
    for (let i = 0; i < usuarioActual.movimientos.length; i++) {
        const mov = usuarioActual.movimientos[i];

        // Extraemos el número limpio del texto del movimiento
        const partes = mov.split('$');
        if (partes.length > 1) {
            const numeroLimpio = partes[1].replace(/\./g, '').replace(/,/g, '');
            const valor = parseFloat(numeroLimpio);

            if (!isNaN(valor)) {
                if (mov.includes('+$')) {
                    totalIngresos += valor;
                } else if (mov.includes('-$')) {
                    totalEgresos += valor;
                }
            }
        }
    }

    const sumaTotal = totalIngresos + totalEgresos;
    const porcentajeIngresos = Math.round((totalIngresos / sumaTotal) * 100);
    const porcentajeEgresos = Math.round((totalEgresos / sumaTotal) * 100);

    // Actualizamos textos y anchos de las barras CSS
    textoIngresos.textContent = "$ " + totalIngresos.toLocaleString('es-CO') + " (" + porcentajeIngresos + "%)";
    barraIngresos.style.width = porcentajeIngresos + "%";

    textoEgresos.textContent = "$ " + totalEgresos.toLocaleString('es-CO') + " (" + porcentajeEgresos + "%)";
    barraEgresos.style.width = porcentajeEgresos + "%";

    // Mensaje dinámico según el comportamiento del usuario
    if (totalEgresos === 0) {
        mensajeFinanciero.textContent = "Aún no has realizado gastos ni retiros.";
    } else if (porcentajeEgresos > 60) {
        mensajeFinanciero.textContent = "Atención: Tus salidas superan el 60% de tus ingresos.";
    } else {
        mensajeFinanciero.textContent = "Buen manejo: Mantienes tus gastos bajo control.";
    }
}

// Dibujar las tarjetas de metas de ahorro
function renderizarMetas() {
    contenedorMetas.innerHTML = '';

    if (usuarioActual.metas.length === 0) {
        const aviso = document.createElement('p');
        aviso.style.color = '#94a3b8';
        aviso.style.fontSize = '0.88rem';
        aviso.textContent = 'No tienes metas activas. Crea una arriba para empezar a ahorrar.';
        contenedorMetas.appendChild(aviso);
        return;
    }

    usuarioActual.metas.forEach(function (meta, index) {
        let porcentaje = Math.round((meta.actual / meta.objetivo) * 100);
        if (porcentaje > 100) {
            porcentaje = 100;
        }

        const card = document.createElement('div');
        card.className = 'goal-item';

        // Parte superior (Título y porcentaje)
        const top = document.createElement('div');
        top.className = 'goal-item-top';
        top.innerHTML = '<span class="goal-title">' + meta.nombre + '</span>' +
                        '<span class="goal-percent">' + porcentaje + '%</span>';

        // Montos
        const amounts = document.createElement('div');
        amounts.className = 'goal-amounts';
        amounts.textContent = "$" + meta.actual.toLocaleString('es-CO') + " / $" + meta.objetivo.toLocaleString('es-CO');

        // Barra de progreso
        const track = document.createElement('div');
        track.className = 'progress-track';
        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.width = porcentaje + '%';
        track.appendChild(fill);

        // Botones de acción con addEventListener
        const actions = document.createElement('div');
        actions.className = 'goal-actions';

        const btnAbonar = document.createElement('button');
        btnAbonar.type = 'button';
        btnAbonar.className = 'btn-goal-action';
        btnAbonar.textContent = '+ $10.000';
        btnAbonar.addEventListener('click', function () {
            abonarAMeta(index, 10000);
        });

        const btnLiberar = document.createElement('button');
        btnLiberar.type = 'button';
        btnLiberar.className = 'btn-goal-action btn-goal-withdraw';
        btnLiberar.textContent = 'Liberar';
        btnLiberar.addEventListener('click', function () {
            liberarMeta(index);
        });

        actions.appendChild(btnAbonar);
        actions.appendChild(btnLiberar);

        card.appendChild(top);
        card.appendChild(amounts);
        card.appendChild(track);
        card.appendChild(actions);

        contenedorMetas.appendChild(card);
    });
}

function actualizarInterfaz() {
    const nombreMostrar = usuarioActual.nombre || usuarioActual.username;
    nombreUsuarioDisplay.textContent = nombreMostrar;
    cardHolderName.textContent = nombreMostrar;

    renderizarSaldo();

    // Renderizar lista de movimientos
    listaMovimientos.innerHTML = '';
    if (usuarioActual.movimientos.length === 0) {
        listaMovimientos.innerHTML = '<li>No hay movimientos registrados.</li>';
    } else {
        const movimientosInvertidos = usuarioActual.movimientos.slice().reverse();
        movimientosInvertidos.forEach(function (mov) {
            const li = document.createElement('li');
            li.textContent = mov;
            listaMovimientos.appendChild(li);
        });
    }

    renderizarMetas();
    actualizarGraficaPropia();
}

// =========================================================
// 5. LÓGICA DE METAS Y PRIVACIDAD
// =========================================================
btnToggleSaldo.addEventListener('click', function () {
    saldoOculto = !saldoOculto;
    renderizarSaldo();
});

btnCrearMeta.addEventListener('click', function () {
    const nombre = inputMetaNombre.value.trim();
    const objetivo = parseFloat(inputMetaObjetivo.value);

    if (!nombre || isNaN(objetivo) || objetivo <= 0) {
        mostrarNotificacion("Ingresa un nombre y un monto objetivo válido.", "error");
        return;
    }

    const nuevaMeta = {
        id: Date.now(),
        nombre: nombre,
        actual: 0,
        objetivo: objetivo
    };

    usuarioActual.metas.push(nuevaMeta);
    inputMetaNombre.value = '';
    inputMetaObjetivo.value = '';

    guardarEnLocalStorage();
    actualizarInterfaz();
    mostrarNotificacion('Meta "' + nombre + '" creada correctamente.');
});

function abonarAMeta(indiceMeta, monto) {
    if (usuarioActual.saldo < monto) {
        mostrarNotificacion("Saldo insuficiente para abonar a esta meta.", "error");
        return;
    }

    const meta = usuarioActual.metas[indiceMeta];
    usuarioActual.saldo -= monto;
    meta.actual += monto;
    usuarioActual.movimientos.push('Ahorro en meta "' + meta.nombre + '": -$' + monto.toLocaleString('es-CO'));

    guardarEnLocalStorage();
    actualizarInterfaz();
    mostrarNotificacion('Abonaste $' + monto.toLocaleString('es-CO') + ' a ' + meta.nombre);
}

function liberarMeta(indiceMeta) {
    const meta = usuarioActual.metas[indiceMeta];

    if (meta.actual > 0) {
        usuarioActual.saldo += meta.actual;
        usuarioActual.movimientos.push('Meta "' + meta.nombre + '" liberada: +$' + meta.actual.toLocaleString('es-CO'));
    }

    usuarioActual.metas.splice(indiceMeta, 1);

    guardarEnLocalStorage();
    actualizarInterfaz();
    mostrarNotificacion('Fondos de "' + meta.nombre + '" devueltos a tu saldo.');
}

// =========================================================
// 6. OPERACIONES DEL CAJERO (CONSIGNAR, RETIRAR, TRANSFERIR)
// =========================================================
btnConsignar.addEventListener('click', function () {
    const monto = parseFloat(inputConsignar.value);

    if (isNaN(monto) || monto <= 0) {
        mostrarNotificacion("Por favor ingrese un monto válido para consignar.", "error");
        return;
    }

    usuarioActual.saldo += monto;
    usuarioActual.movimientos.push("Consignación realizada: +$" + monto.toLocaleString('es-CO'));

    guardarEnLocalStorage();
    actualizarInterfaz();

    inputConsignar.value = '';
    mostrarNotificacion("Consignación realizada con éxito.");
});

btnRetirar.addEventListener('click', function () {
    const monto = parseFloat(inputRetirar.value);

    if (isNaN(monto) || monto <= 0) {
        mostrarNotificacion("Por favor ingrese un monto válido a retirar.", "error");
        return;
    }

    if (monto > usuarioActual.saldo) {
        mostrarNotificacion("Fondos insuficientes. El monto excede su saldo disponible.", "error");
        return;
    }

    usuarioActual.saldo -= monto;
    usuarioActual.movimientos.push("Retiro realizado: -$" + monto.toLocaleString('es-CO'));

    guardarEnLocalStorage();
    actualizarInterfaz();

    inputRetirar.value = '';
    mostrarNotificacion("Retiro realizado con éxito.");
});

btnTransferir.addEventListener('click', function () {
    const destinatarioUsername = inputDestinatario.value.trim();
    const monto = parseFloat(inputMontoTransferir.value);

    if (!destinatarioUsername) {
        mostrarNotificacion("Debe ingresar el usuario destinatario.", "error");
        return;
    }

    if (isNaN(monto) || monto <= 0) {
        mostrarNotificacion("Por favor ingrese un monto válido a transferir.", "error");
        return;
    }

    if (monto > usuarioActual.saldo) {
        mostrarNotificacion("Transferencia denegada: Saldo insuficiente.", "error");
        return;
    }

    if (destinatarioUsername === usuarioActual.username) {
        mostrarNotificacion("No puede realizar transferencias a su propia cuenta.", "error");
        return;
    }

    const usuarioDestino = usuarios.find(function (u) {
        return u.username.toLowerCase() === destinatarioUsername.toLowerCase() ||
               (u.nombre && u.nombre.toLowerCase() === destinatarioUsername.toLowerCase());
    });

    if (!usuarioDestino) {
        mostrarNotificacion("El usuario destinatario no existe en el sistema.", "error");
        return;
    }

    usuarioActual.saldo -= monto;
    usuarioActual.movimientos.push("Transferencia enviada a " + usuarioDestino.username + ": -$" + monto.toLocaleString('es-CO'));

    usuarioDestino.saldo += monto;
    if (!usuarioDestino.movimientos) {
        usuarioDestino.movimientos = [];
    }
    usuarioDestino.movimientos.push("Transferencia recibida de " + usuarioActual.username + ": +$" + monto.toLocaleString('es-CO'));

    guardarEnLocalStorage();
    actualizarInterfaz();

    inputDestinatario.value = '';
    inputMontoTransferir.value = '';
    mostrarNotificacion("Transferencia realizada con éxito.");
});

// =========================================================
// 7. CERRAR SESIÓN E INICIALIZACIÓN
// =========================================================
btnLogout.addEventListener('click', function () {
    localStorage.removeItem('usuarioActivo');
    window.location.href = "login.html";
});

// Carga inicial
actualizarInterfaz();