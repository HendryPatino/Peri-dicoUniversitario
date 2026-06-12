// ==========================================================================
// 1. "BASE DE DATOS" SIMULADA DE USUARIOS (Con los roles de tus especificaciones)
// ==========================================================================
const usuariosRegistrados = [
    { 
        email: "rector@u.com", 
        pass: "123", 
        rol: "admin", 
        nombre: "Dr. Alejandro Magna",
        tipo: "Decano",
        bio: "Rector de la institución. Construyendo el futuro universitario.",
        colorPerfil: "#1a365d" // Azul oscuro
    },
    { 
        email: "profe@u.com", 
        pass: "123", 
        rol: "lector", 
        nombre: "Dra. Maria Curie",
        tipo: "Profesor",
        bio: "Docente de la Facultad de Ciencias. Investigadora en física cuántica.",
        colorPerfil: "#38a169" // Verde
    },
    { 
        email: "representante@u.com", 
        pass: "123", 
        rol: "redactor", 
        nombre: "Santiago Paz",
        tipo: "Representante Estudiantil",
        bio: "Vocero del Consejo Superior. Defendiendo los derechos estudiantiles.",
        colorPerfil: "#d69e2e" // Dorado/Naranja
    },
    { 

        email: "estudiante@u.com", 
        pass: "123", 
        rol: "lector", 
        nombre: "Kevin Silva",
        tipo: "Estudiante",
        bio: "Estudiante de Ingeniería de Sistemas. Amante del código de noche.",
        colorPerfil: "#805ad5" // Morado
    }
];

// ==========================================================================
// 2. LÓGICA DEL FORMULARIO DE LOGIN
// ==========================================================================
// Esperamos a que el HTML cargue por completo antes de buscar los elementos
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorBox = document.getElementById('error-box');

    // Si el formulario existe en la página actual (login.html)
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que la página se recargue e interrumpa el JS
            
            // Capturar datos y limpiar espacios en blanco
            const emailIngresado = document.getElementById('email').value.trim();
            const passIngresado = document.getElementById('password').value;

            // Buscar si algún usuario coincide con las credenciales
            const usuarioEncontrado = usuariosRegistrados.find(user => 
                user.email === emailIngresado && user.pass === passIngresado
            );

            if (usuarioEncontrado) {
                // ¡ÉXITO! Guardamos el objeto entero del usuario en LocalStorage convirtiéndolo a texto (JSON)
                localStorage.setItem('usuarioSesion', JSON.stringify(usuarioEncontrado));
                
                // Redirigir a la portada del periódico (está una carpeta hacia afuera)
                window.location.href = "../index.html";
            } else {
                // ERROR: Si no coincide, mostramos el recuadro rojo de alerta
                if (errorBox) {
                    errorBox.style.display = "block";
                }
            }
        });
    }
});

// ==========================================================================
// 3. FUNCIÓN GLOBAL DE CIERRE DE SESIÓN (LOGOUT)
// ==========================================================================
function cerrarSesion() {
    localStorage.removeItem('usuarioSesion'); // Borra los datos de la libreta del navegador
    window.location.href = "../index.html";   // Redirige al inicio
}

// ==========================================================================
// 4. CONTROL DE ACCESO SEGURO A LOS FOROS (verificarAccesoForo)
// ==========================================================================
function verificarAccesoForo(tipoForo) {
    const sesionTexto = localStorage.getItem('usuarioSesion');
    
    // Si no hay nadie logueado, rebota al login
    if (!sesionTexto) {
        alert("🔒 Acceso denegado. Debes iniciar sesión para ingresar a los foros comunitarios.");
        // Evaluamos si estamos en la raíz o dentro de una carpeta para no romper la ruta
        const rutaLogin = window.location.pathname.includes('pages/') ? 'login.html' : 'pages/login.html';
        window.location.href = rutaLogin;
        return;
    }

    const usuario = JSON.parse(sesionTexto);

    if (tipoForo === 'profesores') {
        // Solo entran Profesores (tipo Profesor) y el Rector (admin)
        if (usuario.tipo === 'Profesor' || usuario.rol === 'admin') {
            window.location.href = window.location.pathname.includes('pages/') ? 'foro-profesores.html' : 'pages/foro-profesores.html';
        } else {
            alert("⚠️ Este foro es exclusivo para el cuerpo docente y administrativo. Tu cuenta de " + usuario.tipo + " no tiene permisos.");
        }
    } 
    
    if (tipoForo === 'estudiantes') {
        // Al foro de estudiantes entra cualquiera que esté registrado (Alumnos, Profesores, Representantes, Rector)
        window.location.href = window.location.pathname.includes('pages/') ? 'foro-estudiantes.html' : 'pages/foro-estudiantes.html';
    }
}