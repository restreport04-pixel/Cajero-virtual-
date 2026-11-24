// Selección de elementos del DOM para el formulario de registro
const formRegister = document.getElementById('form-register');
const regName = document.getElementById('reg-name');
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');

// Manejo del evento de envío (submit) del formulario de registro
formRegister.addEventListener('submit', function (e) {

    // Previene la recarga automática de la página por el comportamiento por defecto del formulario
    e.preventDefault();

    // Captura y limpieza de espacios en blanco en los campos de entrada
    const nombre = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();

    // Obtención de los usuarios almacenados en localStorage (o inicialización de un arreglo vacío)
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_cajero')) || [];
    
    // Verificación de existencia previa del usuario en la base de datos local
    const usuarioExiste = usuariosGuardados.some(user => user.username === email);

    if (usuarioExiste) {
        alert("¡Error! Ya existe un usuario registrado con este correo.");
        return; // Interrumpe la ejecución si el usuario ya está registrado
    }

    // Creación de la estructura del nuevo objeto de usuario con el saldo inicial por defecto
    const nuevoUsuario = {
        nombre: nombre,
        username: email,
        password: password,
        saldo: 200000,
        movimientos: []
    };

    // Adición del nuevo registro al arreglo general
    usuariosGuardados.push(nuevoUsuario);

    // Persistencia de los datos actualizados en localStorage en formato JSON
    localStorage.setItem('usuarios_cajero', JSON.stringify(usuariosGuardados));

    alert("¡Registro exitoso! Ya puedes iniciar sesión.");
    formRegister.reset(); // Restablecimiento de las cajas de texto del formulario
});

// Selección de elementos del DOM para el formulario de inicio de sesión
const formLogin = document.getElementById('form-login');
const loginUser = document.getElementById('login-user');
const loginPassword = document.getElementById('login-password');

// Manejo del evento de envío (submit) del formulario de inicio de sesión
formLogin.addEventListener('submit', function (e) {

    // Previene la recarga automática de la página
    e.preventDefault();

    // Captura de credenciales ingresadas sin espacios innecesarios
    const userIngresado = loginUser.value.trim();
    const passIngresada = loginPassword.value.trim();

    // Carga de la lista de usuarios desde localStorage
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_cajero')) || [];

    // Búsqueda de coincidencia entre credenciales ingresadas y los registros almacenados
    const usuarioEncontrado = usuariosGuardados.find(user => (user.username === userIngresado || user.nombre === userIngresado) && user.password === passIngresada);

    // Validación de autenticación
    if (!usuarioEncontrado) {
        alert("Usuario o contraseña incorrectos.");
        return; // Interrumpe la ejecución si las credenciales son inválidas
    }

    // Registro de la clave de sesión del usuario activo en localStorage
    localStorage.setItem('usuarioActivo', usuarioEncontrado.username);

    // Redirección hacia la pantalla principal del cajero
    window.location.href = "index.html";
});