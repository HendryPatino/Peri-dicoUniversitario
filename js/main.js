// ==========================================================================
// LOGIC CENTRAL DE NAVEGACIÓN UNIVERSAL (main.js) - SIN CANDADOS & FIXED LOGIN
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    const sesionTexto = localStorage.getItem('usuarioSesion');
    const authBtn = document.getElementById('auth-btn');
    const nav = document.querySelector('.nav');

    // Detectamos si el usuario está dentro de la carpeta 'pages' revisando la URL
    const esPaginaInterna = window.location.pathname.includes('/pages/');
    const prefijoRuta = esPaginaInterna ? "" : "pages/";
    const prefijoInicio = esPaginaInterna ? "../" : "";

    // 1. AJUSTAR ENLACES BÁSICOS DE LA BARRA SEGÚN LA UBICACIÓN
    const inicioBtn = document.querySelector("a[href='index.html']");
    if (inicioBtn && esPaginaInterna) {
        inicioBtn.href = "../index.html";
    }

    // 2. ENLACES DE LA BARRA LATERAL (Solo si existen en la página actual, ej: portada)
    const tarjetasSidebar = document.querySelectorAll('.profile-preview-card');
    if (tarjetasSidebar.length >= 2) {
        tarjetasSidebar[0].style.cursor = "pointer";
        tarjetasSidebar[0].addEventListener('click', () => {
            window.location.href = `${prefijoRuta}perfil.html?user=representante@u.com`;
        });
        tarjetasSidebar[1].style.cursor = "pointer";
        tarjetasSidebar[1].addEventListener('click', () => {
            window.location.href = `${prefijoRuta}perfil.html?user=rector@u.com`;
        });
    }

    // Capturamos los botones de los foros
    const foroEstudiantesBtn = document.querySelector("a[onclick*='estudiantes']");
    const foroProfesoresBtn = document.querySelector("a[onclick*='profesores']");

    // 3. SI NO HAY SESIÓN: OCULTAMOS LOS FOROS EN CUALQUIER PÁGINA
    if (!sesionTexto) {
        if (foroEstudiantesBtn) foroEstudiantesBtn.style.display = "none";
        if (foroProfesoresBtn) foroProfesoresBtn.style.display = "none";
        return; 
    }

    // 4. SI HAY SESIÓN: CONFIGURAMOS BOTÓN DE USUARIO DINÁMICO
    const usuario = JSON.parse(sesionTexto);
    
    if (authBtn) {
        authBtn.textContent = `👤 ${usuario.nombre}`;
        authBtn.href = `${prefijoRuta}perfil.html?user=${usuario.email}`;
        authBtn.className = "nav-link"; 
        authBtn.style.fontWeight = "bold";
        authBtn.style.color = "var(--accent)";
        
        // Crear botón de cerrar sesión universal
        const logoutBtn = document.createElement('a');
        logoutBtn.href = "#";
        logoutBtn.textContent = "🚪 Salir";
        logoutBtn.className = "btn-auth";
        logoutBtn.style.backgroundColor = "#e53e3e"; 
        logoutBtn.style.color = "white";
        logoutBtn.style.marginLeft = "10px";
        
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioSesion');
            window.location.href = `${prefijoInicio}index.html`; 
        });
        
        nav.appendChild(logoutBtn);
    }

    // 5. CONTROL DE VISIBILIDAD DE FOROS EN CUALQUIER PÁGINA
    if (usuario.rol === "admin") {
        if (foroEstudiantesBtn) { foroEstudiantesBtn.style.display = "block"; foroEstudiantesBtn.textContent = "Foro Estudiantes"; }
        if (foroProfesoresBtn) { foroProfesoresBtn.style.display = "block"; foroProfesoresBtn.textContent = "Foro Profesores"; }
    }
    else if (usuario.tipo === "Estudiante" || usuario.tipo === "Representante Estudiantil") {
        if (foroEstudiantesBtn) { foroEstudiantesBtn.style.display = "block"; foroEstudiantesBtn.textContent = "Foro Estudiantes"; }
        if (foroProfesoresBtn) foroProfesoresBtn.style.display = "none";
    }
    else if (usuario.tipo === "Profesor") {
        if (foroEstudiantesBtn) { foroEstudiantesBtn.style.display = "none"; }
        if (foroProfesoresBtn) { foroProfesoresBtn.style.display = "block"; foroProfesoresBtn.textContent = "Foro Profesores"; }
    }
});

// 6. FUNCIÓN DE ACCESO CON RUTAS CORREGIDAS
function verificarAccesoForo(tipoForo) {
    const sesionTexto = localStorage.getItem('usuarioSesion');
    if (!sesionTexto) return;
    const usuario = JSON.parse(sesionTexto);
    
    const esPaginaInterna = window.location.pathname.includes('/pages/');
    const carpeta = esPaginaInterna ? "" : "pages/";
    
    if (usuario.rol === "admin") {
        window.location.href = `${carpeta}foro-${tipoForo}.html`;
        return;
    }
    
    if (tipoForo === 'estudiantes' && (usuario.tipo === "Estudiante" || usuario.tipo === "Representante Estudiantil")) {
        window.location.href = `${carpeta}foro-estudiantes.html`;
    } else if (tipoForo === 'profesores' && usuario.tipo === "Profesor") {
        window.location.href = `${carpeta}foro-profesores.html`;
    }
}