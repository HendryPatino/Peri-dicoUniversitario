// ==========================================================================
// MOTOR DE GESTIÓN DE PERFIL Y MURO DE ESTADOS (perfil.js) - COHERENCIA TOTAL
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. ASIGNACIÓN DE VARIABLES DE SESIÓN (Priorizando el objeto unificado del sistema)
    let nombreActual = "Miembro de la Comunidad";
    let correoActual = localStorage.getItem('userEmail') || "estudiante@universidad.edu";
    let rolActual = localStorage.getItem('userRole') || "Estudiante";
    let bioActual = localStorage.getItem('userBio') || "Estudiante activo en U-Social. Compartiendo el día a día universitario.";

    try {
        const sesionEstructurada = localStorage.getItem('usuarioSesion');
        if (sesionEstructurada) {
            const usuarioObj = JSON.parse(sesionEstructurada);
            nombreActual = usuarioObj.nombre;
            // Ajuste sutil del rol visual según el tipo mapeado
            rolActual = usuarioObj.tipo || rolActual;
        } else {
            // Plan B de respaldo por si solo existen variables sueltas tradicionales
            nombreActual = localStorage.getItem('userName') || nombreActual;
        }
    } catch (e) {
        console.error("Error al procesar la sesión estructurada en perfil.js:", e);
        nombreActual = localStorage.getItem('userName') || nombreActual;
    }

    // Elementos de la tarjeta de presentación
    const txtName = document.getElementById('profile-name');
    const txtEmail = document.getElementById('profile-email');
    const txtBio = document.getElementById('profile-bio');
    const txtRole = document.getElementById('profile-role');
    const profileCard = document.getElementById('profile-card');

    // Elementos de los formularios interactivos
    const formEditar = document.getElementById('form-editar-perfil');
    const inputName = document.getElementById('edit-name');
    const inputBio = document.getElementById('edit-bio');
    
    const formEstado = document.getElementById('form-publicar-estado');
    const inputEstado = document.getElementById('input-estado');
    const muroContainer = document.getElementById('muro-estados-container');

    // Cargar datos iniciales en la interfaz de usuario
    if (txtName) txtName.textContent = nombreActual;
    if (txtEmail) txtEmail.textContent = `📧 ${correoActual}`;
    if (txtBio) txtBio.textContent = bioActual;
    if (txtRole) txtRole.textContent = `🎖️ Rango: ${rolActual}`;

    // Auto-rellenar los campos de edición con los valores que están actualmente guardados
    if (inputName) inputName.value = nombreActual;
    if (inputBio) inputBio.value = bioActual;

    // ==========================================================================
    // 2. SISTEMA INTERACTIVO DEL MURO DE ESTADOS (MANTENIDO AL 100%)
    // ==========================================================================
    function renderizarEstados() {
        if (!muroContainer) return;
        muroContainer.innerHTML = '';

        const estados = JSON.parse(localStorage.getItem('muro_estados')) || [];
        
        // Filtrar y extraer los estados correspondientes únicamente al usuario logueado en este navegador
        const estadosUsuario = estados.filter(est => est.autor === correoActual);

        if (estadosUsuario.length === 0) {
            muroContainer.innerHTML = `
                <div style="text-align:center; padding:1.5rem; opacity:0.6; font-style:italic;">
                    💭 No has compartido ninguna actualización de estado todavía.
                </div>`;
            return;
        }

        // Renderizado inverso para que los estados más nuevos aparezcan siempre arriba
        [...estadosUsuario].reverse().forEach(estado => {
            const estadoElemento = document.createElement('div');
            estadoElemento.style.background = 'rgba(0,0,0,0.02)';
            estadoElemento.style.padding = '1rem';
            estadoElemento.style.borderRadius = '6px';
            estadoElemento.style.marginBottom = '0.8rem';
            estadoElemento.style.border = '1px solid rgba(0,0,0,0.05)';

            estadoElemento.innerHTML = `
                <p style="margin:0; font-size:1rem; line-height:1.4; white-space:pre-wrap;">${estado.texto}</p>
                <span style="font-size:0.75rem; opacity:0.5; display:block; margin-top:0.4rem;">🕒 Publicado el ${estado.fecha}</span>
            `;
            muroContainer.appendChild(estadoElemento);
        });
    }

    // 3. CAPTURA Y GUARDADO DE NUEVOS ESTADOS EN EL MURO
    if (formEstado) {
        formEstado.addEventListener('submit', (e) => {
            e.preventDefault();
            const textoLimpio = inputEstado.value.trim();

            if (!textoLimpio) return;

            const nuevosEstados = JSON.parse(localStorage.getItem('muro_estados')) || [];
            
            // Creamos el objeto del estado con la fecha y hora actual exacta
            const ahora = new Date();
            const fechaFormateada = ahora.toLocaleDateString() + ' a las ' + ahora.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const nuevoEstadoObj = {
                autor: correoActual,
                texto: textoLimpio,
                fecha: fechaFormateada
            };

            nuevosEstados.push(nuevoEstadoObj);
            localStorage.setItem('muro_estados', JSON.stringify(nuevosEstados));

            // Resetear input y volver a pintar el muro actualizado
            inputEstado.value = '';
            renderizarEstados();
        });
    }

    // ==========================================================================
    // 4. GUARDAR INFORMACIÓN DE EDICIÓN BÁSICA CON ACTUALIZACIÓN CRUZADA
    // ==========================================================================
    if (formEditar) {
        formEditar.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoNombre = inputName.value.trim();
            const nuevaBio = inputBio.value.trim();

            if (nuevoNombre) {
                // Guardar variables sueltas para conservar compatibilidad con el código heredado
                localStorage.setItem('userName', nuevoNombre);
                localStorage.setItem('userBio', nuevaBio);

                // ✨ INTEGRACIÓN CON LA NUEVA LÓGICA: Sincronizar dinámicamente el objeto unificado
                try {
                    const sesionEstructurada = localStorage.getItem('usuarioSesion');
                    if (sesionEstructurada) {
                        const usuarioObj = JSON.parse(sesionEstructurada);
                        usuarioObj.nombre = nuevoNombre; // Actualizamos el nombre en caliente dentro de la sesión activa
                        localStorage.setItem('usuarioSesion', JSON.stringify(usuarioObj));
                    } else {
                        // Si por algún motivo no existía la estructura, la construimos para heredar estabilidad
                        const nuevaSesionEstructurada = {
                            nombre: nuevoNombre,
                            tipo: (localStorage.getItem('userRole') === 'admin' || localStorage.getItem('userRole') === 'profe') ? 'Docente' : 'Estudiante',
                            rol: localStorage.getItem('userRole') || 'user'
                        };
                        localStorage.setItem('usuarioSesion', JSON.stringify(nuevaSesionEstructurada));
                    }
                } catch (err) {
                    console.error("Error al actualizar objeto unificado en perfil:", err);
                }

                // Actualizar inmediatamente los nodos de texto de la interfaz gráfica sin recargar
                if (txtName) txtName.textContent = nuevoNombre;
                if (txtBio) txtBio.textContent = nuevaBio;
                
                alert("¡Información del perfil actualizada de manera global! ✨");
            }
        });
    }

    // Ejecutar renderizado del muro al cargar la página por primera vez
    renderizarEstados();
});