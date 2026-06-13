// ==========================================================================
// MOTOR DE PERIÓDICO DIGITAL E INICIO (inicio.js) - VERSIÓN ULTRA-ESTABLE
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. OBTENER USUARIO LOGUEADO DESDE LA LLAVE UNIFICADA O VARIABLES SUELTAS
    let usuarioActivo = null;
    try {
        const storedUser = localStorage.getItem("usuarioSesion");
        if (storedUser) {
            usuarioActivo = JSON.parse(storedUser);
        } else {
            // Plan B de compatibilidad por si existen las variables sueltas tradicionales
            const nombreSuelto = localStorage.getItem('userName');
            const rolSuelto = localStorage.getItem('userRole');
            if (nombreSuelto) {
                usuarioActivo = {
                    nombre: nombreSuelto,
                    tipo: (rolSuelto === 'admin' || rolSuelto === 'profe') ? 'Docente' : 'Estudiante',
                    rol: rolSuelto
                };
            }
        }
    } catch (err) {
        console.error("Error al leer usuario en inicio:", err);
    }

    const adminFormContainer = document.getElementById("admin-form-container");
    const globalNewsContainer = document.getElementById("global-news-container");

    // 2. BASE DE DATOS INICIAL DE NOTICIAS DE LA PORTADA
    const noticiasPorDefecto = [
        {
            id: 1,
            titulo: "U-Social estrena su nueva plataforma de comunicación interna",
            meta: "Por: Oficina de Prensa | Hace 1 hora",
            extracto: "Hoy se dio luz verde al ecosistema digital que unifica los foros estudiantiles, docentes y herramientas de accesibilidad premium.",
            categoria: "global",
            multimedia: ""
        }
    ];

    window.noticiasGlobales = JSON.parse(localStorage.getItem("noticias_globales")) || noticiasPorDefecto;
    if (!localStorage.getItem("noticias_globales")) {
        localStorage.setItem("noticias_globales", JSON.stringify(window.noticiasGlobales));
    }

    // 3. MOSTRAR U OCULTAR PANEL DE PUBLICACIÓN DE PRENSA (ADMINS O REDACTORES)
    if (adminFormContainer) {
        if (usuarioActivo && (usuarioActivo.rol === "admin" || usuarioActivo.rol === "redactor" || localStorage.getItem('userRole') === 'admin')) {
            adminFormContainer.style.display = "block";
            adminFormContainer.innerHTML = `
                <div class="new-post-box" style="background:#fff; padding:1.5rem; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.05); margin-bottom:2rem;">
                    <h3 style="margin-bottom:1rem; color:#1a365d; font-weight:700;">📰 Publicar Noticia Institucional</h3>
                    <form id="news-form">
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label style="display:block; margin-bottom:0.3rem; font-weight:600;">Título de la Noticia</label>
                            <input type="text" id="news-title" class="form-control" placeholder="Ej: Suspensión de actividades por mantenimiento..." required style="width:100%; padding:0.5rem; border:1px solid #cbd5e0; border-radius:4px;">
                        </div>
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label style="display:block; margin-bottom:0.3rem; font-weight:600;">Categoría</label>
                            <select id="news-category" class="form-control" style="width:100%; padding:0.5rem; border:1px solid #cbd5e0; border-radius:4px;">
                                <option value="global">Aviso Global</option>
                                <option value="facultad">Académico</option>
                                <option value="deporte">Deportes</option>
                                <option value="cultura">Cultura</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:1rem;">
                            <label style="display:block; margin-bottom:0.3rem; font-weight:600;">Cuerpo de la Noticia</label>
                            <textarea id="news-content" class="form-control" rows="3" placeholder="Escribe el desarrollo completo del boletín de prensa..." required style="width:100%; padding:0.5rem; border:1px solid #cbd5e0; border-radius:4px; font-family:inherit;"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom:1.2rem;">
                            <label style="display:block; margin-bottom:0.3rem; font-weight:600;">Adjuntar Imagen Ilustrativa (Opcional)</label>
                            <input type="file" id="news-file" accept="image/*" style="font-size:0.9rem;">
                        </div>
                        <button type="button" onclick="publicarNoticiaManual()" class="btn btn-primary" style="background:#1a365d; color:#fff; padding:0.5rem 1.5rem; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">Lanzar Comunicado</button>
                    </form>
                </div>
            `;
        } else {
            adminFormContainer.style.display = "none";
        }
    }

    // 4. RENDERIZADO ATÓMICO DE NOTICIAS CON CLASES CSS ORIGINALES
    window.renderNoticias = () => {
        if (!globalNewsContainer) return;
        globalNewsContainer.innerHTML = "";

        if (window.noticiasGlobales.length === 0) {
            globalNewsContainer.innerHTML = `
                <div class="post-card" style="text-align:center; opacity:0.6; padding:2rem; background:#fff; border-radius:8px;">
                    <p>📰 No hay comunicados de prensa emitidos el día de hoy.</p>
                </div>`;
            return;
        }

        [...window.noticiasGlobales].reverse().forEach((noticia) => {
            const tagClase = noticia.categoria || "global";
            
            // Validar de forma segura permisos de eliminación mediante el objeto unificado
            const esAdmin = usuarioActivo && (usuarioActivo.rol === "admin" || localStorage.getItem('userRole') === 'admin');
            const botonBorrar = esAdmin 
                ? `<button class="btn-delete" onclick="eliminarNoticia(${noticia.id})" style="background:none; border:none; color:#e53e3e; font-weight:600; cursor:pointer; margin-top:1rem; font-size:0.9rem; display:block;"><i class="fas fa-trash"></i> Retirar del Periódico</button>` 
                : "";

            const renderImagen = noticia.multimedia 
                ? `<div style="margin-top:1rem; max-height:300px; overflow:hidden; border-radius:6px;"><img src="${noticia.multimedia}" style="width:100%; height:auto; object-fit:cover;" alt="Prensa"></div>` 
                : "";

            globalNewsContainer.innerHTML += `
                <article class="post-card ${tagClase}" id="noticia-${noticia.id}" style="background:#fff; border-radius:8px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    <span class="tag ${tagClase}" style="display: inline-block; padding: 0.2rem 0.6rem; font-size: 0.75rem; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${tagClase}</span>
                    <h4 class="card-title" style="margin-top:0.5rem; margin-bottom:0.3rem; font-weight:700; font-size:1.3rem; color:#1a365d;">${noticia.titulo}</h4>
                    <p class="card-meta" style="font-size:0.8rem; color:#718096; margin-bottom: 0.8rem;">${noticia.meta}</p>
                    <p class="card-excerpt" style="white-space: pre-wrap; font-size:0.95rem; line-height:1.5; color:#4a5568;">${noticia.extracto}</p>
                    ${renderImagen}
                    ${botonBorrar}
                </article>
            `;
        });
    };

    // 5. MANEJADOR ASÍNCRONO DE PUBLICACIÓN MANUAL
    window.publicarNoticiaManual = async () => {
        const titleInput = document.getElementById("news-title");
        const contentInput = document.getElementById("news-content");
        const catSelect = document.getElementById("news-category");
        const fileInput = document.getElementById("news-file");

        const titulo = titleInput ? titleInput.value.trim() : "";
        const contenido = contentInput ? contentInput.value.trim() : "";
        const categoria = catSelect ? catSelect.value : "global";
        const inputArchivo = (fileInput && fileInput.files.length > 0) ? fileInput.files[0] : null;

        if (!titulo || !contenido) {
            alert("Por favor completa los campos de título y contenido del boletín.");
            return;
        }

        let imagenB64 = "";
        if (inputArchivo) {
            try { 
                imagenB64 = await conversionBase64(inputArchivo); 
            } catch (e) {
                console.error("Error al convertir la imagen:", e);
            }
        }

        // Usar los datos sincronizados del adaptador de sesión
        const firmaAutor = usuarioActivo ? usuarioActivo.nombre : (localStorage.getItem('userName') || "Oficina de Prensa");
        const rangoAutor = usuarioActivo ? usuarioActivo.tipo : "Moderador";

        const nuevoComunicado = {
            id: Date.now(),
            titulo: titulo,
            meta: `Por: ${firmaAutor} (${rangoAutor}) | Hace unos instantes`,
            extracto: contenido,
            categoria: categoria,
            multimedia: imagenB64
        };

        window.noticiasGlobales.push(nuevoComunicado);
        localStorage.setItem("noticias_globales", JSON.stringify(window.noticiasGlobales));
        
        const formularioHtml = document.getElementById("news-form");
        if (formularioHtml) formularioHtml.reset();
        
        window.renderNoticias();
        alert("✨ ¡Circular oficial publicada en la portada de U-Social!");
    };

    // Auxiliar para la lectura de multimedia
    function conversionBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // 6. ELIMINAR NOTICIA DE LA PORTADA
    window.eliminarNoticia = (id) => {
        const esAdmin = usuarioActivo && (usuarioActivo.rol === "admin" || localStorage.getItem('userRole') === 'admin');
        if (!esAdmin) {
            alert("Acción no autorizada.");
            return;
        }

        if (confirm("¿Deseas retirar esta noticia del periódico principal?")) {
            window.noticiasGlobales = window.noticiasGlobales.filter(n => n.id !== id);
            localStorage.setItem("noticias_globales", JSON.stringify(window.noticiasGlobales));
            window.renderNoticias();
        }
    };

    // Renderizado inicial al cargar la página
    window.renderNoticias();
});