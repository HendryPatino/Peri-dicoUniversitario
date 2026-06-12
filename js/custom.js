// ==========================================================================
// MOTOR DE PERSONALIZACIÓN UNIVERSAL DE ALTA FIABILIDAD (custom.js) - PULIDO
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. INYECTAR EL PANEL DE DISEÑO DE FORMA INMEDIATA Y PRIORITARIA
    const botonEngranaje = document.createElement('div');
    botonEngranaje.className = 'accessibility-toggle';
    botonEngranaje.id = 'acc-toggle';
    botonEngranaje.textContent = '⚙️';
    document.body.appendChild(botonEngranaje);

    const panelHtml = document.createElement('div');
    panelHtml.className = 'accessibility-panel';
    panelHtml.id = 'acc-panel';
    panelHtml.innerHTML = `
        <span class="panel-close" id="acc-close">✕</span>
        <h3 style="margin-bottom: 0.8rem; font-size: 1rem; font-weight: bold; color: #3182ce;">🎨 Personalizar Vista</h3>
        
        <div class="panel-section">
            <h4 style="margin-bottom: 0.3rem; color: #3182ce; font-size: 0.85rem; font-weight: bold;">🌓 Estilo del Sitio</h4>
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
            <h4 style="margin-bottom: 0.3rem; color: #3182ce; font-size: 0.85rem; font-weight: bold;">📏 Tamaño del Texto</h4>
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
    document.body.appendChild(panelHtml);

    // Capturar elementos recién creados
    const toggleBtn = document.getElementById('acc-toggle');
    const panel = document.getElementById('acc-panel');
    const closeBtn = document.getElementById('acc-close');
    const selectTheme = document.getElementById('select-theme');
    const selectFont = document.getElementById('select-font');
    const selectSize = document.getElementById('select-size');
    const btnDyslexic = document.getElementById('btn-dyslexic');

    // Manejo de clicks para abrir y cerrar el panel
    toggleBtn.addEventListener('click', () => { panel.style.display = 'block'; toggleBtn.style.display = 'none'; });
    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; toggleBtn.style.display = 'flex'; });

    // ==========================================================================
    // FUNCIÓN DE RENDERIZADO VISUAL SEGURO
    // ==========================================================================
    const renderizarConfiguracion = () => {
        document.body.classList.remove(
            'theme-dark', 'theme-warm', 
            'font-arial', 'font-comic', 'font-times', 
            'size-small', 'size-large', 'mode-dyslexic'
        );

        const tema = localStorage.getItem('pref-tema') || 'default';
        selectTheme.value = tema;
        if (tema !== 'default') document.body.classList.add(tema);

        const tamaño = localStorage.getItem('pref-tamaño') || 'default';
        selectSize.value = tamaño;
        if (tamaño !== 'default') document.body.classList.add(tamaño);

        const dislexiaActiva = localStorage.getItem('pref-dislexia') === 'true';
        if (dislexiaActiva) {
            document.body.classList.add('mode-dyslexic');
            btnDyslexic.textContent = "👁️ Modo Dislexia: SÍ";
            btnDyslexic.classList.add('active');
            selectFont.disabled = true;
            selectFont.value = 'default';
        } else {
            btnDyslexic.textContent = "👁️ Modo Dislexia: No";
            btnDyslexic.classList.remove('active');
            selectFont.disabled = false;
            
            const fuente = localStorage.getItem('pref-fuente') || 'default';
            selectFont.value = fuente;
            if (fuente !== 'default') document.body.classList.add(fuente);
        }

        // --- CORRECCIÓN INTEGRAL DE CONTRASTE PARA TEXTOS REBELDES (INVISIBILIDAD) ---
        const elementosConEstilo = document.querySelectorAll('[style*="color"]');
        elementosConEstilo.forEach(el => {
            // Guardar el color original de la plantilla si no se ha guardado ya
            if (!el.dataset.originalColor) {
                el.dataset.originalColor = el.style.color || window.getComputedStyle(el).color;
            }

            if (tema === 'theme-dark') {
                // Forzar texto claro en Modo Oscuro
                el.style.setProperty('color', '#edf2f7', 'important');
            } else if (tema === 'theme-warm') {
                // Forzar texto marrón oscuro/legible en Tono Cálido (Sepia)
                el.style.setProperty('color', '#4a2c11', 'important');
            } else {
                // Al regresar al tema clásico, limpiamos las propiedades inyectadas
                el.style.removeProperty('color');
                if (el.dataset.originalColor) {
                    el.style.color = el.dataset.originalColor;
                }
            }
        });
    };

    // --- ESCUCHADORES DE EVENTOS EN TIEMPO REAL ---
    selectTheme.addEventListener('change', (e) => {
        localStorage.setItem('pref-tema', e.target.value);
        renderizarConfiguracion();
    });

    selectFont.addEventListener('change', (e) => {
        localStorage.setItem('pref-fuente', e.target.value);
        renderizarConfiguracion();
    });

    selectSize.addEventListener('change', (e) => {
        localStorage.setItem('pref-tamaño', e.target.value);
        renderizarConfiguracion();
    });

    btnDyslexic.addEventListener('click', () => {
        const estadoActual = localStorage.getItem('pref-dislexia') === 'true';
        localStorage.setItem('pref-dislexia', !estadoActual);
        renderizarConfiguracion();
    });

    // Renderizar configuración al cargar la página
    renderizarConfiguracion();
});