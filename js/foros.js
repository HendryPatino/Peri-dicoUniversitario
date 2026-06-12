// ==========================================================================
// MOTOR DE FOROS ULTRA-ESTABLE (foros.js) - SOPORTE MULTIMEDIA (IMAGEN/AUDIO)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    let usuarioLogueado = { nombre: "Estudiante Invitado", tipo: "Estudiante", rol: "user" };
    try {
        const sesionTexto = localStorage.getItem('usuarioSesion');
        if (sesionTexto) usuarioLogueado = JSON.parse(sesionTexto);
    } catch (e) { console.error("Error al leer sesión:", e); }

    const esForoEstudiantes = window.location.pathname.includes('foro-estudiantes.html');
    const llaveForo = esForoEstudiantes ? 'posts_foro_estudiantes' : 'posts_foro_profesores';

    const forumForm = document.getElementById('forum-form');
    const forumContainer = document.getElementById('forum-posts-container') || document.getElementById('forum-posts');

    // --- CARGAR Y RENDERIZAR PUBLICACIONES ---
    function cargarDebates() {
        if (!forumContainer) return;
        forumContainer.innerHTML = "";
        
        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];

        if (debates.length === 0) {
            forumContainer.innerHTML = `<p style="color: #718096; text-align: center; padding: 2rem; font-weight: 500;">No hay publicaciones en este foro todavía. ¡Sé el primero en aportar!</p>`;
            return;
        }

        const debatesOrdenados = [...debates].sort((a, b) => b.id - a.id);

        debatesOrdenados.forEach((debate) => {
            const debateCard = document.createElement('article');
            debateCard.className = "card";
            
            const colorBorde = esForoEstudiantes ? '#3182ce' : 'var(--color-facultad)';
            debateCard.style.cssText = `margin-top: 2rem; padding: 1.5rem; border-left: 4px solid ${colorBorde}; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`;

            const puedeBorrar = usuarioLogueado.rol === 'admin' || usuarioLogueado.nombre === debate.autor;
            const botonBorrar = puedeBorrar ? `<button class="btn-delete" data-id="${debate.id}" style="background:none; border:none; color:#e53e3e; cursor:pointer; font-weight:bold; font-size:0.85rem; transition: 0.2s;">🗑️ Eliminar</button>` : '';

            // DETECTOR INTELIGENTE DE RENDERIZADO DE MULTIMEDIA (Imagen o Audio)
            let bloqueMultimedia = '';
            if (debate.imagen) {
                if (debate.imagen.startsWith('data:audio/') || debate.imagen.includes('audio')) {
                    // Si el archivo guardado es un audio, renderizamos el reproductor HTML5
                    bloqueMultimedia = `<div style="margin: 1.2rem 0; text-align:center;"><audio src="${debate.imagen}" controls style="width: 100%; max-width: 500px;"></audio></div>`;
                } else {
                    // Si es una imagen normal, se muestra la tarjeta gráfica estándar
                    bloqueMultimedia = `<div style="margin: 1.2rem 0; text-align:center;"><img src="${debate.imagen}" style="max-width:100%; max-height:400px; border-radius:8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>`;
                }
            }

            let listaComentariosHtml = "";
            const comentarios = debate.comentarios || [];
            comentarios.forEach(com => {
                listaComentariosHtml += `
                    <div style="background: rgba(128,128,128,0.06); padding: 0.8rem; border-radius: 6px; margin-bottom: 0.6rem; border-left: 3px solid #cbd5e0; font-size: 0.9rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#718096; margin-bottom:0.3rem;">
                            <span>💬 Por: <strong style="color:inherit;">${com.autor}</strong> (${com.rango})</span>
                            <span>${com.fecha}</span>
                        </div>
                        <p style="margin:0; line-height:1.4; white-space:pre-line;">${com.texto}</p>
                    </div>`;
            });

            debateCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        ${debate.categoria ? `<span style="display:inline-block; font-size:0.7rem; background:${colorBorde}; color:white; padding:0.25rem 0.6rem; border-radius:12px; font-weight:bold; margin-bottom:0.6rem; text-transform:uppercase; letter-spacing:0.5px;">${debate.categoria}</span>` : ''}
                        <h4 style="margin: 0.2rem 0; font-size: 1.3rem; font-weight:700; line-height:1.3;">${debate.titulo}</h4>
                        <span style="font-size: 0.75rem; color: #718096;">✍️ Por: <strong>${debate.autor}</strong> (${debate.rango}) — 📅 ${debate.fecha}</span>
                    </div>
                    ${botonBorrar}
                </div>
                <hr style="border:0; border-top:1px solid rgba(128,128,128,0.15); margin: 1rem 0;">
                <p style="white-space: pre-line; line-height: 1.6; font-size:1rem; margin-bottom: 1rem;">${debate.contenido}</p>
                ${bloqueMultimedia}
                
                <div style="margin-top: 1.5rem; background: rgba(128,128,128,0.02); padding: 1.2rem; border-radius: 8px; border-top: 1px dashed rgba(128,128,128,0.25);">
                    <h5 style="margin: 0 0 1rem 0; font-size: 0.95rem; font-weight: bold; color:#718096;">Respuestas (${comentarios.length})</h5>
                    <div class="comments-list">${listaComentariosHtml}</div>
                    
                    <div style="display: flex; gap: 0.6rem; margin-top: 1rem; align-items: center;">
                        <input type="text" placeholder="Escribe una respuesta clara y respetuosa..." class="reply-input" data-id="${debate.id}" style="flex:1; padding:0.6rem; border-radius:6px; border:1px solid #cbd5e0; font-size:0.9rem; background: transparent;">
                        <button class="btn-reply" data-id="${debate.id}" style="background:${colorBorde}; color:white; border:none; padding:0.6rem 1.2rem; border-radius:6px; font-weight:bold; cursor:pointer; font-size:0.9rem; transition:0.2s;">Responder</button>
                    </div>
                </div>
            `;
            forumContainer.appendChild(debateCard);
        });

        asignarEventosInteractivos();

        if (typeof window.procesarFiltradoForoMecanismo === 'function') {
            window.procesarFiltradoForoMecanismo();
        }
    }

    function asignarEventosInteractivos() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.onclick = (e) => {
                if(confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
                    const idBuscar = parseInt(e.target.getAttribute('data-id'));
                    const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];
                    const debatesFiltrados = debates.filter(d => d.id !== idBuscar);
                    localStorage.setItem(llaveForo, JSON.stringify(debatesFiltrados));
                    cargarDebates();
                }
            };
        });

        document.querySelectorAll('.btn-reply').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.getAttribute('data-id');
                const input = document.querySelector(`.reply-input[data-id="${id}"]`);
                ejecutarComentario(parseInt(id), input);
            };
        });

        document.querySelectorAll('.reply-input').forEach(input => {
            input.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    const id = e.target.getAttribute('data-id');
                    ejecutarComentario(parseInt(id), e.target);
                }
            };
        });
    }

    function ejecutarComentario(idBuscar, inputElement) {
        const texto = inputElement.value.trim();
        if (!texto) return;

        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];
        const debateDestino = debates.find(d => d.id === idBuscar);

        if (debateDestino) {
            if (!debateDestino.comentarios) debateDestino.comentarios = [];

            const fechaActual = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

            debateDestino.comentarios.push({
                autor: usuarioLogueado.nombre,
                rango: usuarioLogueado.tipo || 'Estudiante',
                texto: texto,
                fecha: fechaActual
            });

            localStorage.setItem(llaveForo, JSON.stringify(debates));
            inputElement.value = "";
            cargarDebates();
        }
    }

    // --- PROCESADOR MULTIMEDIA INTELIGENTE ---
    function procesarYPublicarArchivo(archivo, titulo, contenido, categoria) {
        const lector = new FileReader();
        lector.readAsDataURL(archivo);
        
        lector.onload = (evento) => {
            // Si es un archivo de audio, saltamos el compresor de imágenes canvas
            if (archivo.type.startsWith('audio/')) {
                finalizarPublicacion(titulo, contenido, categoria, evento.target.result);
                return;
            }

            // Si es una imagen, mantenemos tu lógica original de compresión por canvas
            const img = new Image();
            img.src = evento.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_ANCHO = 800;
                let ancho = img.width;
                let alto = img.height;

                if (ancho > MAX_ANCHO) {
                    alto *= MAX_ANCHO / ancho;
                    ancho = MAX_ANCHO;
                }
                canvas.width = ancho;
                canvas.height = alto;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, ancho, alto);

                const imagenComprimidaBase64 = canvas.toDataURL('image/jpeg', 0.7);
                finalizarPublicacion(titulo, contenido, categoria, imagenComprimidaBase64);
            };
        };
    }

    function finalizarPublicacion(titulo, contenido, categoria, archivoAdjunto = null) {
        const fechaActual = new Date().toLocaleDateString('es-ES', { 
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const nuevaPublicacion = {
            id: Date.now(),
            autor: usuarioLogueado.nombre,
            rango: usuarioLogueado.tipo || 'Estudiante',
            titulo: titulo,
            contenido: contenido,
            categoria: categoria,
            imagen: archivoAdjunto, // Aquí guardamos tanto el string base64 de la imagen como del audio
            comentarios: [],
            fecha: fechaActual
        };

        const debates = JSON.parse(localStorage.getItem(llaveForo)) || [];
        debates.push(nuevaPublicacion);
        localStorage.setItem(llaveForo, JSON.stringify(debates));
        
        if (forumForm) forumForm.reset();
        cargarDebates();
    }

    // --- ESCUCHADOR DEL FORMULARIO PRINCIPAL ---
    if (forumForm) {
        forumForm.onsubmit = (e) => {
            e.preventDefault();
            
            const titulo = document.getElementById('forum-title').value.trim();
            const contenido = document.getElementById('forum-content').value.trim();
            const selectCat = document.getElementById('forum-category');
            
            // Soporta que el input de archivo se llame 'forum-image' o cualquier input file dentro del form
            const inputArchivo = document.getElementById('forum-image') || forumForm.querySelector('input[type="file"]');
            const archivoAdjunto = inputArchivo ? inputArchivo.files[0] : null;
            
            const categoria = selectCat ? selectCat.value : null;

            if (!titulo || !contenido) return;

            if (archivoAdjunto) {
                procesarYPublicarArchivo(archivoAdjunto, titulo, contenido, categoria);
            } else {
                finalizarPublicacion(titulo, contenido, categoria);
            }
        };
    }

    cargarDebates();
});