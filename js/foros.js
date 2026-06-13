// ==========================================================================
// MOTOR DE FOROS MULTIMEDIA ULTRA-ESTABLE (foros.js) - COMPLETO Y RESTAURADO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    let usuarioLogueado = { nombre: "Estudiante Invitado", tipo: "Estudiante", rol: "user" };
    try {
        const sesionTexto = localStorage.getItem('usuarioSesion');
        if (sesionTexto) {
            usuarioLogueado = JSON.parse(sesionTexto);
        } else {
            const nombreSuelto = localStorage.getItem('userName');
            const rolSuelto = localStorage.getItem('userRole');
            if (nombreSuelto) {
                usuarioLogueado = { 
                    nombre: nombreSuelto, 
                    tipo: (rolSuelto === 'admin' || rolSuelto === 'profesor') ? 'Docente' : 'Estudiante',
                    rol: rolSuelto || 'user'
                };
            }
        }
    } catch (e) { console.error("Error al leer sesión:", e); }

    const esForoEstudiantes = window.location.pathname.includes('foro-estudiantes.html');
    const llaveForo = esForoEstudiantes ? 'posts_foro_estudiantes' : 'posts_foro_profesores';

    const forumForm = document.getElementById('forum-form') || document.getElementById('form-publicar-foro') || document.getElementById('form-publicar-profesores');
    const forumContainer = document.getElementById('forum-posts') || document.getElementById('debates-container') || document.getElementById('debates-profesores-container');

    function cargarDebates() {
        if (!forumContainer) return;
        forumContainer.innerHTML = "";
        
        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];

        if (debates.length === 0) {
            forumContainer.innerHTML = `<p style="color: #718096; text-align: center; padding: 2rem; font-weight: 500;">No hay publicaciones en este foro todavía. ¡Sé el primero en aportar!</p>`;
            return;
        }

        [...debates].reverse().forEach((post) => {
            const yaDioLike = (post.usuariosLike || []).includes(usuarioLogueado.nombre);
            const totalLikes = post.likes || 0;
            const claseCorazon = yaDioLike ? 'fas fa-heart' : 'far fa-heart';
            const estiloCorazon = yaDioLike ? 'color: #e53e3e;' : 'color: #718096;';

            let elementoAdjuntoHTML = '';
            if (post.fileData && post.fileType) {
                if (post.fileType.startsWith('image/')) {
                    elementoAdjuntoHTML = `<div style="margin-top:12px; max-height:380px; overflow:hidden; border-radius:6px;"><img src="${post.fileData}" style="width:100%; height:auto; object-fit:cover; border:1px solid rgba(255,255,255,0.1);" alt="Adjunto"></div>`;
                } else if (post.fileType.startsWith('video/')) {
                    elementoAdjuntoHTML = `<div style="margin-top:12px;"><video src="${post.fileData}" controls style="width:100%; max-height:350px; border-radius:6px; background:#000;"></video></div>`;
                } else if (post.fileType.startsWith('audio/')) {
                    elementoAdjuntoHTML = `<div style="margin-top:12px; width:100%;"><audio src="${post.fileData}" controls style="width:100% "></audio></div>`;
                } else if (post.fileType === 'application/pdf') {
                    elementoAdjuntoHTML = `<div style="margin-top:12px;"><a href="${post.fileData}" download="${post.nombreArchivo || 'documento.pdf'}" class="btn-auth" style="display:inline-flex; width:auto; font-size:0.85rem; padding:0.4rem 1rem; background:#3b82f6; border-color:#3b82f6; color:#fff; text-decoration:none; border-radius:4px;">📄 Descargar PDF: ${post.nombreArchivo}</a></div>`;
                }
            } else if (post.imagen) { 
                elementoAdjuntoHTML = `<div style="margin-top:12px;"><img src="${post.imagen}" style="width:100%; height:auto; border-radius:6px;" alt="Adjunto"></div>`;
            }

            let categoriaPost = post.categoria || 'general';

            let postHtml = `
                <article class="card ${categoriaPost}" id="post-${post.id}" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary-color, #10b981); padding: 1.5rem;">
                    <div class="post-header" style="display:flex; justify-content:between; align-items:center; width:100%;">
                        <div class="author-info" style="flex:1;">
                            <h4 style="font-weight: 700; margin: 0;">${post.autor}</h4>
                            <span style="font-size: 0.75rem; opacity:0.6;">${post.rango} • ${post.fecha || 'Reciente'}</span>
                        </div>
                        <span class="tag ${categoriaPost}">${categoriaPost.toUpperCase()}</span>
                    </div>

                    <h3 style="margin-top: 1rem; font-weight: 700; color: var(--primary-color, #10b981); font-size: 1.25rem;">${post.titulo}</h3>
                    <p style="margin-top: 0.5rem; white-space: pre-wrap; line-height: 1.6; opacity:0.9;">${post.contenido}</p>
                    
                    ${elementoAdjuntoHTML}

                    <div class="post-actions" style="display: flex; gap: 1.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
                        <button class="action-btn btn-like" onclick="interactuarLike(${post.id})" style="background:none; border:none; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:0.4rem; color:inherit;">
                            <i class="${claseCorazon}" style="${estiloCorazon}"></i> <span>${totalLikes}</span>
                        </button>
                        <span style="opacity:0.7; font-weight: 600; font-size: 0.9rem; display:flex; align-items:center; gap:0.4rem;">
                            <i class="far fa-comment"></i> ${post.comentarios ? post.comentarios.length : 0} comentarios
                        </span>
                    </div>

                    <div class="comments-section" style="margin-top: 1.5rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                        <div class="comments-list" id="list-comments-${post.id}">`;

            if (post.comentarios && post.comentarios.length > 0) {
                post.comentarios.forEach(com => {
                    postHtml += `
                        <div style="padding: 0.6rem 0; border-bottom: 1px dashed rgba(255,255,255,0.1);">
                            <strong style="font-size:0.9rem;">${com.autor}</strong> 
                            <span style="font-size:0.7rem; opacity:0.5;">(${com.rango})</span>
                            <p style="margin-top:0.2rem; font-size:0.9rem; opacity:0.85;">${com.texto}</p>
                        </div>`;
                });
            }

            postHtml += `
                        </div>
                        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                            <input type="text" id="input-comment-${post.id}" placeholder="Escribe un comentario respetuoso..." style="flex:1; padding:0.5rem; border:1px solid rgba(255,255,255,0.15); border-radius:4px; font-size:0.9rem; background:rgba(0,0,0,0.2); color:inherit;">
                            <button onclick="agregarComentario(${post.id})" style="background:var(--primary-color, #10b981); color:#fff; border:none; padding:0.4rem 1rem; border-radius:4px; font-weight:600; cursor:pointer;">Enviar</button>
                        </div>
                    </div>
                </article>
            `;
            forumContainer.innerHTML += postHtml;
        });
    }

    window.interactuarLike = (postId) => {
        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];
        const post = debates.find(d => d.id === postId);
        if (!post) return;
        if (!post.usuariosLike) post.usuariosLike = [];

        const indice = post.usuariosLike.indexOf(usuarioLogueado.nombre);
        if (indice > -1) {
            post.usuariosLike.splice(indice, 1);
            post.likes = Math.max(0, (post.likes || 1) - 1);
        } else {
            post.usuariosLike.push(usuarioLogueado.nombre);
            post.likes = (post.likes || 0) + 1;
        }
        localStorage.setItem(llaveForo, JSON.stringify(debates));
        cargarDebates();
    };

    window.agregarComentario = (postId) => {
        const input = document.getElementById(`input-comment-${postId}`);
        if (!input) return;
        const texto = input.value.trim();
        if (!texto) return;

        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];
        const post = debates.find(d => d.id === postId);
        if (!post) return;
        if (!post.comentarios) post.comentarios = [];

        post.comentarios.push({
            autor: usuarioLogueado.nombre,
            rango: usuarioLogueado.tipo || 'Estudiante',
            texto: texto
        });
        localStorage.setItem(llaveForo, JSON.stringify(debates));
        cargarDebates();
    };

    function procesarYPublicarConArchivo(archivo, titulo, contenido, categoria) {
        const lector = new FileReader();
        lector.readAsDataURL(archivo);
        lector.onload = () => {
            finalizarPublicacionMultimedia(titulo, contenido, categoria, lector.result, archivo.type, archivo.name);
        };
    }

    function finalizarPublicacionMultimedia(titulo, contenido, categoria, fileData = null, fileType = null, fileName = null) {
        const fechaActual = new Date().toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let rangoMostrado = usuarioLogueado.tipo || 'Estudiante';
        if (usuarioLogueado.rol === 'admin') { rangoMostrado = 'Administrador'; }

        const nuevaPublicacion = {
            id: Date.now(),
            autor: usuarioLogueado.nombre,
            rango: rangoMostrado,
            titulo: titulo,
            contenido: contenido,
            categoria: categoria || 'general',
            fileData: fileData,  
            fileType: fileType,  
            nombreArchivo: fileName,
            likes: 0,
            usuariosLike: [],
            comentarios: [],
            fecha: fechaActual
        };

        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];
        debates.push(nuevaPublicacion);
        localStorage.setItem(llaveForo, JSON.stringify(debates));
        if (forumForm) forumForm.reset();
        cargarDebates();
    }

    if (forumForm) {
        forumForm.onsubmit = (e) => {
            e.preventDefault();
            const inputTitulo = document.getElementById('forum-title') || document.getElementById('foro-titulo') || document.getElementById('post-titulo');
            const inputContenido = document.getElementById('forum-content') || document.getElementById('foro-contenido') || document.getElementById('post-contenido');
            const selectCat = document.getElementById('forum-category') || document.getElementById('post-categoria');
            const inputArchivo = document.getElementById('forum-image') || document.getElementById('foro-archivo') || document.getElementById('post-archivo');

            const titulo = inputTitulo ? inputTitulo.value.trim() : "";
            const contenido = inputContenido ? inputContenido.value.trim() : "";
            const categoria = selectCat ? selectCat.value : 'general';
            const archivoAdjunto = (inputArchivo && inputArchivo.files.length > 0) ? inputArchivo.files[0] : null;

            if (!titulo || !contenido) return;

            if (archivoAdjunto) {
                procesarYPublicarConArchivo(archivoAdjunto, titulo, contenido, categoria);
            } else {
                finalizarPublicacionMultimedia(titulo, contenido, categoria);
            }
        };
    }

    cargarDebates();
});