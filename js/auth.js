// ==========================================================================
// 1. BASE DE DATOS LOCAL UNIFICADA (Inmutable y protegida de caídas)
// ==========================================================================
const usuariosPredefinidos = {
    "admin@u.com": { clave: "admin123", rol: "admin", nombre: "Rector / Administrador" },
    "profe@u.com": { clave: "profe123", rol: "profe", nombre: "Profesor Docente" },
    "estudiante@u.com": { clave: "estudiante123", rol: "redactor", nombre: "Estudiante Representante" }
};

// ==========================================================================
// 2. MOTOR DE AUTENTICACIÓN Y VALIDACIÓN (ESCUCHADOR ATÓMICO)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(evento) {
            evento.preventDefault(); 
            const emailInput = document.getElementById('email').value.trim();
            const passwordInput = document.getElementById('password').value.trim();
            const errorMessage = document.getElementById('error-message');

            if (usuariosPredefinidos[emailInput] && usuariosPredefinidos[emailInput].clave === passwordInput) {
                const usuarioValido = usuariosPredefinidos[emailInput];
                
                // Guardar llaves sueltas originales para compatibilidad
                localStorage.setItem('userEmail', emailInput);
                localStorage.setItem('userRole', usuarioValido.rol);
                localStorage.setItem('userName', usuarioValido.nombre);
                
                // ✨ OPTIMIZACIÓN Y CORRECCIÓN: Se crea el objeto unificado que tus foros e inicio necesitan
                const sesionEstructurada = {
                    nombre: usuarioValido.nombre,
                    tipo: (usuarioValido.rol === 'admin' || usuarioValido.rol === 'profe') ? 'Docente' : 'Estudiante',
                    rol: usuarioValido.rol
                };
                localStorage.setItem('usuarioSesion', JSON.stringify(sesionEstructurada));
                
                alert(`¡Autenticación exitosa!\nBienvenido, ${usuarioValido.nombre}.`);
                window.location.href = '../index.html';
            } else {
                if (errorMessage) {
                    errorMessage.textContent = "❌ Correo institucional o contraseña incorrectos.";
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});

// ==========================================================================
// 3. GUARDIÁN DE SEGURIDAD (BLOQUEO CRUZADO ESTUDIANTES / MAESTROS)
// ==========================================================================
function verificarAccesoForo(tipoForo) {
    const rolActivo = localStorage.getItem('userRole');
    
    if (!rolActivo) {
        alert("⚠️ Acceso denegado. Debes iniciar sesión.");
        window.location.href = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
        return false;
    }

    if (tipoForo === 'profesores' && rolActivo === 'redactor') {
        alert("🛑 Error: Los estudiantes no tienen autorización para acceder al Foro de Profesores.");
        window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        return false;
    }

    if (tipoForo === 'estudiantes' && rolActivo === 'profe') {
        alert("🛑 Error: Los docentes no tienen autorización para acceder al Foro de Estudiantes.");
        window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        return false;
    }

    redireccionarA(tipoForo);
    return true;
}

// ==========================================================================
// 4. DIRECCIONADOR DE RUTAS QUIRÚRGICO
// ==========================================================================
function redireccionarA(destino) {
    const yaEnPages = window.location.pathname.includes('/pages/');
    const objetivo = String(destino).trim().toLowerCase();

    if (objetivo === 'profesores' || objetivo === 'profe') {
        window.location.href = yaEnPages ? 'foro-profesores.html' : 'pages/foro-profesores.html';
        return; 
    } 
    if (objetivo === 'estudiantes' || objetivo === 'redactor' || objetivo === 'estudiante') {
        window.location.href = yaEnPages ? 'foro-estudiantes.html' : 'pages/foro-estudiantes.html';
        return; 
    }
}

// ==========================================================================
// 5. CONTROL DE PERMISOS, CATEGORÍAS Y MULTIMEDIA (PORTADA Y FOROS)
// ==========================================================================
function inicializarCajaPublicacion() {
    const rolActivo = localStorage.getItem('userRole');
    
    // Mantenemos intacto tu sistema de simulación de publicaciones con adjuntos
    const cajaForo = document.getElementById('box-nueva-publicacion');
    if (cajaForo) {
        const urlActual = window.location.pathname.toLowerCase();
        const esForoEstudiantes = urlActual.includes('estudiante');
        const esForoProfesores = urlActual.includes('profe');

        if (rolActivo === 'admin' || (rolActivo === 'redactor' && esForoEstudiantes) || (rolActivo === 'profe' && esForoProfesores)) {
            cajaForo.style.display = 'block';
        } else {
            cajaForo.style.display = 'none';
        }
        
        const formPublicar = document.getElementById('form-publicar');
        if (formPublicar) {
            formPublicar.addEventListener('submit', (e) => {
                e.preventDefault();
                const titulo = document.getElementById('post-titulo').value;
                const categoria = document.getElementById('post-categoria').value;
                const archivoInput = document.getElementById('post-archivo');
                
                let infoArchivo = "Ninguno";
                if (archivoInput && archivoInput.files.length > 0) {
                    infoArchivo = `\n   • Nombre: ${archivoInput.files[0].name}`;
                }
                alert(`🚀 ¡Publicación Exitosa!\n\n📌 Título: ${titulo}\n📂 Sección: ${categoria.toUpperCase()}\n📎 Adjunto: ${infoArchivo}`);
                formPublicar.reset();
            });
        }
    }

    const cajaInicio = document.getElementById('box-publicacion-inicio');
    if (cajaInicio) {
        if (rolActivo === 'admin') {
            cajaInicio.style.display = 'block';
        } else {
            cajaInicio.style.display = 'none';
        }

        const formInicio = document.getElementById('form-publicar-inicio');
        if (formInicio) {
            formInicio.addEventListener('submit', (e) => {
                e.preventDefault();
                const titulo = document.getElementById('inicio-titulo').value;
                alert(`📰 ¡Noticia publicada!\n\n"${titulo}" se ha subido a la portada principal.`);
                formInicio.reset();
            });
        }
    }
}

// ==========================================================================
// 6. FILTRO VISUAL AUTOMÁTICO (DESAPARECE LOS ENLACES DE LA NAV)
// ==========================================================================
function aplicarFiltroNavegacion() {
    const rolActivo = localStorage.getItem('userRole');
    const urlActual = window.location.pathname.toLowerCase();
    const enlacesNav = document.querySelectorAll('.nav-link');
    
    enlacesNav.forEach(enlace => {
        // ✨ CORRECCIÓN: Se limpian los puntos suspensivos que rompían la lectura del texto
        const textoHtml = enlace.textContent.toLowerCase();
        
        if (rolActivo === 'redactor' && textoHtml.includes('profe')) {
            enlace.style.display = 'none';
        }
        if (rolActivo === 'profe' && textoHtml.includes('estudiante')) {
            enlace.style.display = 'none';
        }
    });

    if (urlActual.includes('profesores') && rolActivo === 'redactor') {
        window.location.href = '../index.html';
    }
    if (urlActual.includes('estudiantes') && rolActivo === 'profe') {
        window.location.href = '../index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarCajaPublicacion();
    aplicarFiltroNavegacion();
});