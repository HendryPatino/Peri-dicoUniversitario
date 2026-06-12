document.addEventListener("DOMContentLoaded", () => {
    // 1. OBTENER USUARIO LOGUEADO
    let usuarioActivo = null;
    try {
        const storedUser = localStorage.getItem("usuario_logeado");
        if (storedUser) {
            usuarioActivo = JSON.parse(storedUser);
        }
    } catch (err) {
        console.error("Error al leer usuario:", err);
    }

    const adminFormContainer = document.getElementById("admin-form-container");
    const globalNewsContainer = document.getElementById("global-news-container");

    // 2. BASE DE DATOS INICIAL
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

    // 3. INYECTAR FORMULARIO CON FUNCIÓN INTEGRADA DIRECTA (ONCLICK)
    if (usuarioActivo && (usuarioActivo.role === "admin" || usuarioActivo.role === "dean" || usuarioActivo.role === "profesor" || usuarioActivo.role === "teacher")) {
        if (adminFormContainer) {
            adminFormContainer.innerHTML = `
                <div class="card" style="margin-bottom: 2rem; border-top: 5px solid var(--color-global); background: var(--white); padding: 1.5rem; border-radius: 8px;">
                    <span class="tag tag-global" style="background-color: var(--color-global); color: white; padding: 0.2rem 0.6rem; font-size: 0.75rem; border-radius: 4px; font-weight: bold;">Modo Editor Autorizado</span>
                    <h3 style="margin-top: 0.5rem; margin-bottom: 1rem; font-weight:800;">✍️ Publicar Noticia en Primera Plana</h3>
                    
                    <div class="news-form">
                        <div style="margin-bottom: 1rem;">
                            <input type="text" id="news-title" placeholder="Título impactante de la noticia" style="width:100%; padding:0.7rem; border-radius:4px; border:1px solid var(--gray); background:transparent; color:inherit;">
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <select id="news-category" class="panel-select" style="padding:0.7rem; width:100%; border:1px solid var(--gray); background:transparent; color:inherit;">
                                <option value="global">🟥 Noticia Global Institucional</option>
                                <option value="facultad">🟦 Novedad de Facultad / Académica</option>
                                <option value="deporte">🟩 Evento Deportivo</option>
                                <option value="cultura">🟪 Agenda Cultural y Social</option>
                            </select>
                        </div>

                        <div style="margin-bottom: 1rem;">
                            <textarea id="news-content" placeholder="Escribe el cuerpo completo de la noticia o comunicado oficial..." rows="4" style="width:100%; padding:0.7rem; border-radius:4px; border:1px solid var(--gray); background:transparent; color:inherit; resize:vertical;"></textarea>
                        </div>

                        <div style="background: var(--light); padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem; border: 1px dashed var(--gray);">
                            <p style="font-size: 0.8rem; font-weight: bold; margin-bottom: 0.4rem; color: var(--dark);">🖼️ Fotografía de Portada (Opcional):</p>
                            <input type="file" id="news-img" accept="image/*" style="width: 100%; font-size: 0.8rem; color:inherit;">
                        </div>

                        <!-- LLAMADA DIRECTA POR FUNCIÓN ONCLICK -->
                        <button type="button" onclick="publicarNoticiaManual(event)" style="width:100%; background: var(--color-global); color:white; padding:0.8rem; font-size:1rem; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">🚀 Lanzar Noticia</button>
                    </div>
                </div>
            `;
        }
    }

    // 4. FUNCIÓN GLOBAL DE PUBLICACIÓN IMPEDIBLE
    window.publicarNoticiaManual = async (e) => {
        if (e) e.preventDefault();
        
        const txtTitulo = document.getElementById("news-title");
        const selCategoria = document.getElementById("news-category");
        const txtContenido = document.getElementById("news-content");
        const fileImg = document.getElementById("news-img");

        if (!txtTitulo.value.trim() || !txtContenido.value.trim()) {
            alert("Por favor, completa el título y el contenido de la noticia.");
            return;
        }

        let fotoBase64 = "";
        if (fileImg && fileImg.files && fileImg.files[0]) {
            try {
                fotoBase64 = await conversionBase64(fileImg.files[0]);
            } catch (err) {
                console.error("Error al procesar la foto:", err);
            }
        }

        let firmaRol = "Administrador";
        if (usuarioActivo && usuarioActivo.role === "dean") firmaRol = "Decano";
        if (usuarioActivo && (usuarioActivo.role === "profesor" || usuarioActivo.role === "teacher")) firmaRol = "Docente";

        const postNuevo = {
            id: Date.now(),
            titulo: txtTitulo.value,
            meta: `Por: ${(usuarioActivo && usuarioActivo.name) || 'Directivo'} (${firmaRol}) | Ahora mismo`,
            extracto: txtContenido.value,
            categoria: selCategoria.value,
            multimedia: fotoBase64
        };

        window.noticiasGlobales.unshift(postNuevo);
        localStorage.setItem("noticias_globales", JSON.stringify(window.noticiasGlobales));

        // Limpiar inputs
        txtTitulo.value = "";
        txtContenido.value = "";
        if (fileImg) fileImg.value = "";

        // Redibujar
        window.dibujarNoticias();
    };

    // 5. FUNCIÓN DE RENDERIZADO
    window.dibujarNoticias = () => {
        if (!globalNewsContainer) return;
        globalNewsContainer.innerHTML = "";

        window.noticiasGlobales.forEach(noticia => {
            let tagClase = `tag-${noticia.categoria || 'global'}`;
            let bordeColor = `var(--color-${noticia.categoria || 'global'})`;
            let renderImagen = noticia.multimedia ? `<img src="${noticia.multimedia}" style="width:100%; max-height:350px; object-fit:cover; border-radius:6px; margin-top:1rem; display:block;">` : "";

            let botonBorrar = "";
            if (usuarioActivo && (usuarioActivo.role === "admin" || usuarioActivo.role === "dean" || usuarioActivo.role === "profesor" || usuarioActivo.role === "teacher")) {
                botonBorrar = `
                    <button class="btn-delete-post" onclick="eliminarNoticia(${noticia.id})" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-size:0.85rem; font-weight:bold; margin-top:1rem; display:block; padding:0;">
                        🗑️ Retirar de Primera Plana
                    </button>
                `;
            }

            globalNewsContainer.innerHTML += `
                <article class="card" style="border-top: 4px solid ${bordeColor}; margin-bottom: 1.5rem; padding: 1.5rem; border-radius: 8px; background: var(--white);">
                    <span class="tag ${tagClase}" style="display: inline-block; padding: 0.2rem 0.6rem; font-size: 0.75rem; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${noticia.categoria}</span>
                    <h4 class="card-title" style="margin-top:0.5rem; margin-bottom:0.3rem; font-weight:700; font-size:1.3rem;">${noticia.titulo}</h4>
                    <p class="card-meta" style="font-size:0.8rem; color:#718096; margin-bottom: 0.8rem;">${noticia.meta}</p>
                    <p class="card-excerpt" style="white-space: pre-wrap; font-size:0.95rem; line-height:1.5;">${noticia.extracto}</p>
                    ${renderImagen}
                    ${botonBorrar}
                </article>
            `;
        });
    };

    function conversionBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    window.eliminarNoticia = (id) => {
        if (confirm("¿Deseas retirar esta noticia del periódico principal?")) {
            window.noticiasGlobales = window.noticiasGlobales.filter(n => n.id !== id);
            localStorage.setItem("noticias_globales", JSON.stringify(window.noticiasGlobales));
            window.dibujarNoticias();
        }
    };

    // Lanzar dibujado inicial
    window.dibujarNoticias();
});