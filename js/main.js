// ==========================================================================
// LOGIC CENTRAL DE NAVEGACIÓN UNIVERSAL (main.js) - CONTROL INTEGRAL DE ROLES
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

    // Sincronización del formulario de la Portada (index.html)
    const adminFormContainer = document.getElementById("admin-form-container");

    // 3. SI NO HAY SESIÓN: OCULTAMOS LOS FOROS Y EL FORMULARIO DE EDICIÓN EN LA PORTADA
    if (!sesionTexto) {
        if (foroEstudiantesBtn) foroEstudiantesBtn.style.display = "none";
        if (foroProfesoresBtn) foroProfesoresBtn.style.display = "none";
        if (adminFormContainer) adminFormContainer.innerHTML = ""; // Se limpia para usuarios anónimos
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

    // 5. CONTROL DE VISIBILIDAD DE FOROS EN CUALQUIER PÁGINA Y FILTRO DE FORMULARIO DE PORTADA
    if (usuario.rol === "admin") {
        if (foroEstudiantesBtn) { foroEstudiantesBtn.style.display = "block"; foroEstudiantesBtn.textContent = "Foro Estudiantes"; }
        if (foroProfesoresBtn) { foroProfesoresBtn.style.display = "block"; foroProfesoresBtn.textContent = "Foro Profesores"; }
        // Nota: Si es admin, el script interno de index.html ya se encarga de pintar el formulario.
    }
    else {
        // Si NO es Administrador (Estudiantes, Profesores, etc.), se le deniega el acceso a los botones restringidos
        if (usuario.tipo === "Profesor") {
            if (foroEstudiantesBtn) foroEstudiantesBtn.style.display = "none";
            if (foroProfesoresBtn) { foroProfesoresBtn.style.display = "block"; foroProfesoresBtn.textContent = "Foro Profesores"; }
        } else {
            if (foroEstudiantesBtn) { foroEstudiantesBtn.style.display = "block"; foroEstudiantesBtn.textContent = "Foro Estudiantes"; }
            if (foroProfesoresBtn) foroProfesoresBtn.style.display = "none";
        }

        // 🔥 PROTECCIÓN CRÍTICA DE LA PORTADA: Remueve el formulario inmediatamente si no es administrador
        if (adminFormContainer) {
            adminFormContainer.innerHTML = ""; 
        }
    }

    // INTERCEPTOR AUTOMÁTICO DE INSTALACIÓN PARA BUSCADORES DE FORO
    const enForoEstudiantes = window.location.pathname.includes('foro-estudiantes.html');
    const enForoProfesores = window.location.pathname.includes('foro-profesores.html');
    
    if (enForoEstudiantes || enForoProfesores) {
        inicializarBuscadorEspecializadoForo(enForoEstudiantes ? 'estudiantes' : 'profesores');
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

// ==========================================================================
// EXTENSIÓN INTEGRADA DE BÚSQUEDA DINÁMICA ESTILO YOUTUBE (SOLUCIÓN TOTAL)
// ==========================================================================
function inicializarBuscadorEspecializadoForo(tipoDelForo) {
    const contenedorPublicaciones = document.getElementById('forum-posts-container') || document.getElementById('forum-posts');
    if (!contenedorPublicaciones) return;

    const colorAcento = tipoDelForo === 'profesores' ? 'var(--color-facultad)' : '#3182ce';

    const cajaFiltro = document.createElement('div');
    cajaFiltro.style.cssText = `margin-top: 1.5rem; margin-bottom: 0.5rem; padding: 1.2rem; border-left: 5px solid ${colorAcento}; background: var(--white); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); width: 100%; box-sizing: border-box; display: block;`;
    cajaFiltro.innerHTML = `
        <div style="display: flex; gap: 0.8rem; align-items: center;">
            <span style="font-size: 1.3rem;">🔍</span>
            <input type="text" id="forum-search-input" placeholder="Buscar aportes, temas o autores en este foro..." style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--gray); background: transparent; color: inherit; font-size: 1rem; outline: none;">
            <button type="button" id="forum-search-btn" style="background: ${colorAcento}; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: bold; cursor: pointer;">Buscar</button>
        </div>
        <p id="forum-search-feedback" style="font-size: 0.85rem; color: ${colorAcento}; font-weight: bold; margin-top: 0.6rem; margin-left: 1.9rem; display: none;"></p>
    `;
    
    contenedorPublicaciones.parentNode.insertBefore(cajaFiltro, contenedorPublicaciones);

    const inputBusqueda = document.getElementById('forum-search-input');
    const botonBusqueda = document.getElementById('forum-search-btn');
    const feedbackText = document.getElementById('forum-search-feedback');

    window.procesarFiltradoForoMecanismo = () => {
        const query = inputBusqueda.value.toLowerCase().trim();
        const elementosPost = contenedorPublicaciones.querySelectorAll('article');
        let contadorVisual = 0;

        elementosPost.forEach(post => {
            const textoContenido = post.innerText.toLowerCase();

            if (query === "") {
                post.style.display = ""; 
            } else if (textoContenido.includes(query)) {
                post.style.display = ""; 
                contadorVisual++;
            } else {
                post.style.display = "none"; 
            }
        });

        if (query === "") {
            feedbackText.style.display = "none";
        } else {
            feedbackText.style.display = "block";
            feedbackText.textContent = `👁️ Mostrando ${contadorVisual} aportes en la búsqueda actual.`;
        }
    };

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', window.procesarFiltradoForoMecanismo);
        inputBusqueda.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.procesarFiltradoForoMecanismo();
            }
        });
    }
    if (botonBusqueda) {
        botonBusqueda.addEventListener('click', window.procesarFiltradoForoMecanismo);
    }
}