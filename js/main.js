// ==========================================================================
// CONTROL DINÁMICO DE LA BARRA DE NAVEGACIÓN (PERFIL DEL USUARIO) - COMPATIBLE
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    
    // 1. OBTENER EL NOMBRE DESDE LA LLAVE SUELTA O EL OBJETO UNIFICADO
    let userName = localStorage.getItem('userName');
    if (!userName) {
        try {
            const sesionEstructurada = localStorage.getItem('usuarioSesion');
            if (sesionEstructurada) {
                userName = JSON.parse(sesionEstructurada).nombre;
            }
        } catch (e) { 
            console.error("Error al verificar estructura de sesión en main.js:", e); 
        }
    }

    // Detectamos si el archivo HTML actual está en la raíz o dentro de la carpeta /pages/
    const yaEnPages = window.location.pathname.includes('/pages/');

    if (authBtn) {
        if (userName) {
            // 🟢 SI HAY UN USUARIO CON SESIÓN ACTIVA EN EL SISTEMA:
            const rutaPerfil = yaEnPages ? 'perfil.html' : 'pages/perfil.html';

            // 1. Cambiamos el texto "Iniciar Sesión" por el Nombre del Usuario
            authBtn.textContent = `👤 ${userName}`;
            
            // 2. Redireccionamos el enlace hacia tu página de perfil de toda la vida
            authBtn.href = rutaPerfil;
            
            // 3. Quitamos los onclick previos de inicio/cierre si venían del HTML básico
            authBtn.removeAttribute('onclick');

            // 4. Estilizado sutil original para que se integre perfectamente con los enlaces del menú
            authBtn.className = 'nav-link'; 
            authBtn.style.background = 'transparent';
            authBtn.style.color = 'var(--primary-color)';
            authBtn.style.fontWeight = 'bold';
        } else {
            // 🔑 CASO CONTRARIO: ENRUTAR EXPLÍCITAMENTE AL LOGIN (FALLBACK SEGURO)
            const rutaLogin = yaEnPages ? 'login.html' : 'pages/login.html';
            
            authBtn.textContent = `🔑 Iniciar Sesión`;
            authBtn.href = rutaLogin;
            
            // Reestablecer estilos neutrales de la navegación si no hay sesión
            authBtn.style.fontWeight = 'normal';
            authBtn.style.color = 'inherit';
        }
    }
});