// ==========================================================================
// MOTOR DE PERSONALIZACIÓN UNIVERSAL (custom.js) - VERSIÓN CORREGIDA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Limpieza de seguridad para evitar duplicados en el DOM
    document.querySelectorAll('.accessibility-toggle, #acc-toggle').forEach((el, i) => { if(i > 0) el.remove(); });
    document.querySelectorAll('.accessibility-panel, #acc-panel').forEach((el, i) => { if(i > 0) el.remove(); });

    // 2. Inyectar Botón Flotante Original (Engranaje) si no existe
    if (!document.getElementById('acc-toggle')) {
        const toggle = document.createElement('div');
        toggle.className = 'accessibility-toggle';
        toggle.id = 'acc-toggle';
        toggle.textContent = '⚙️';
        document.body.appendChild(toggle);
    }

    // 3. Inyectar Estructura del Panel de Accesibilidad de GitHub
    if (!document.getElementById('acc-panel')) {
        const panel = document.createElement('div');
        panel.className = 'accessibility-panel';
        panel.id = 'acc-panel';
        panel.innerHTML = `
            <span class="panel-close" id="acc-close">✕</span>
            <h3 style="margin-bottom: 0.8rem; font-size: 1rem; font-weight: bold; color: #3182ce;">🎨 Personalizar Vista</h3>
            
            <div class="panel-section">
                <h4 style="margin-bottom: 0.3rem; color: #3182ce; font-size: 0.85rem; font-weight: bold;">🌓 Esquema de Color</h4>
                <select id="select-theme" class="panel-select" style="width: 100%; padding: 0.4rem; border-radius: 4px; border: 1px solid #cbd5e0;">
                    <option value="default">Clásico Universitario</option>
                    <option value="theme-dark">Modo Oscuro 🌙</option>
                    <option value="theme-warm">Tono Cálido ☀️</option>
                </select>
            </div>

            <div class="panel-section">
                <h4 style="margin-bottom: 0.3rem; color: #3182ce; font-size: 0.85rem; font-weight: bold;">🔤 Tipo de Letra</h4>
                <select id="select-font" class="panel-select" style="width: 100%; padding: 0.4rem; border-radius: 4px; border: 1px solid #cbd5e0;">
                    <option value="default">Por Defecto</option>
                    <option value="font-arial">Arial</option>
                    <option value="font-comic">Comic Sans</option>
                    <option value="font-times">Times New Roman</option>
                </select>
            </div>

            <div class="panel-section">
                <h4 style="margin-bottom: 0.3rem; color: #3182ce; font-size: 0.85rem; font-weight: bold;">📏 Tamaño de Letra</h4>
                <select id="select-size" class="panel-select" style="width: 100%; padding: 0.4rem; border-radius: 4px; border: 1px solid #cbd5e0;">
                    <option value="default">Normal</option>
                    <option value="size-small">Pequeño</option>
                    <option value="size-large">Grande</option>
                </select>
            </div>

            <div class="panel-section" style="margin-top: 0.5rem;">
                <button id="btn-dyslexic" class="switch-btn" style="width: 100%; padding: 0.4rem; border-radius: 4px; border: 1px solid #cbd5e0; cursor: pointer; font-weight: bold;">👁️ Modo Dislexia: No</button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    // Capturar elementos
    const toggleBtn = document.getElementById('acc-toggle');
    const panelDom = document.getElementById('acc-panel');
    const closeBtn = document.getElementById('acc-close');
    const selTheme = document.getElementById('select-theme');
    const selFont = document.getElementById('select-font');
    const selSize = document.getElementById('select-size');
    const btnDys = document.getElementById('btn-dyslexic');

    // Manejo de clicks para mostrar/ocultar el panel
    if (toggleBtn && panelDom) {
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            panelDom.style.display = 'block';
            toggleBtn.style.display = 'none';
        };
    }

    if (closeBtn && panelDom) {
        closeBtn.onclick = () => {
            panelDom.style.display = 'none';
            toggleBtn.style.display = 'flex';
        };
    }

    document.addEventListener('click', (e) => {
        if (panelDom && panelDom.style.display === 'block' && !panelDom.contains(e.target) && e.target !== toggleBtn) {
            panelDom.style.display = 'none';
            toggleBtn.style.display = 'flex';
        }
    });

    // ==========================================================================
    // MOTOR CENTRAL: Sincronizado con las llaves exactas de main.js
    // ==========================================================================
    const aplicarConfiguracion = () => {
        const tema = localStorage.getItem('tema') || 'default';
        const fuente = localStorage.getItem('fuente') || 'default';
        const tamano = localStorage.getItem('tamano') || 'default';
        const dislexia = localStorage.getItem('dislexia') === 'true';

        // Sincronizar visualmente los elementos select
        if (selTheme) selTheme.value = tema;
        if (selSize) selSize.value = tamano;

        // Limpiar clases de accesibilidad previas de forma segura
        document.body.classList.remove(
            'theme-dark', 'theme-warm', 
            'font-arial', 'font-comic', 'font-times', 
            'size-small', 'size-large', 'dyslexic-mode'
        );

        // Añadir las clases activas según almacenamiento
        if (tema !== 'default') document.body.classList.add(tema);
        if (tamano !== 'default') document.body.classList.add(tamano);

        if (dislexia) {
            document.body.classList.add('dyslexic-mode');
            if (btnDys) btnDys.textContent = "👁️ Modo Dislexia: SÍ";
            if (selFont) { selFont.disabled = true; selFont.value = 'default'; }
        } else {
            if (btnDys) btnDys.textContent = "👁️ Modo Dislexia: No";
            if (selFont) {
                selFont.disabled = false;
                selFont.value = fuente;
                if (fuente !== 'default') document.body.classList.add(fuente);
            }
        }

        // --- PROTECCIÓN Y AJUSTE DE CONTRASTES DINÁMICOS ---
        const elementosConColor = document.querySelectorAll('[style*="color"]');
        elementosConColor.forEach(el => {
            // ✨ CORRECCIÓN DE SEGURIDAD: Validar que panelDom exista antes de invocar .contains()
            if (panelDom && panelDom.contains(el)) return;

            if (!el.dataset.originalColor) {
                el.dataset.originalColor = el.style.color || window.getComputedStyle(el).color;
            }

            if (tema === 'theme-dark') {
                el.style.setProperty('color', '#edf2f7', 'important');
            } else if (tema === 'theme-warm') {
                el.style.setProperty('color', '#4a2c11', 'important');
            } else {
                el.style.removeProperty('color');
                if (el.dataset.originalColor) el.style.color = el.dataset.originalColor;
            }
        });
    };

    // Escuchadores de eventos para guardar cambios al instante
    if (selTheme) selTheme.onchange = (e) => { localStorage.setItem('tema', e.target.value); aplicarConfiguracion(); };
    if (selFont) selFont.onchange = (e) => { localStorage.setItem('fuente', e.target.value); aplicarConfiguracion(); };
    if (selSize) selSize.onchange = (e) => { localStorage.setItem('tamano', e.target.value); aplicarConfiguracion(); };
    
    if (btnDys) {
        btnDys.onclick = () => {
            const actual = localStorage.getItem('dislexia') === 'true';
            localStorage.setItem('dislexia', !actual);
            aplicarConfiguracion();
        };
    }

    // Arrancar el motor en caliente
    aplicarConfiguracion();
});