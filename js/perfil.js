// ==========================================================================
// LÓGICA DE RED SOCIAL: VISUALIZACIÓN DE PERFILES PÚBLICOS (perfil.js) - FIXED
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. REVISAR QUIÉN ESTÁ LOGUEADO Y A QUIÉN QUEREMOS VER
    const sesionTexto = localStorage.getItem('usuarioSesion');
    if (!sesionTexto) {
        alert("Debes iniciar sesión para ver perfiles.");
        window.location.href = "login.html";
        return;
    }
    const miUsuarioLogueado = JSON.parse(sesionTexto);

    // Truco mágico: Leemos qué correo viene en la URL (?user=correo@u.com)
    const parametrosURL = new URLSearchParams(window.location.search);
    const correoAVer = parametrosURL.get('user') || miUsuarioLogueado.email; 

    // Buscamos los datos de la persona dueña del perfil utilizando la lista global de auth.js
    // Si no está la lista global, usamos un respaldo seguro.
    const listaUsuarios = typeof usuariosRegistrados !== 'undefined' ? usuariosRegistrados : [
        { email: "rector@u.com", nombre: "Dr. Alejandro Magna", tipo: "Decano", bio: "Rector de la institución. Construyendo el futuro universitario.", colorPerfil: "#1a365d" },
        { email: "profe@u.com", nombre: "Dra. Maria Curie", tipo: "Profesor", bio: "Docente de la Facultad de Ciencias. Investigadora en física cuántica.", colorPerfil: "#38a169" },
        { email: "representante@u.com", nombre: "Santiago Paz", tipo: "Representante Estudiantil", bio: "Vocero del Consejo Superior. Defendiendo los derechos estudiantiles.", colorPerfil: "#d69e2e" },
        { email: "estudiante@u.com", nombre: "Kevin Silva", tipo: "Estudiante", bio: "Estudiante de Ingeniería de Sistemas. Amante del código de noche.", colorPerfil: "#805ad5" }
    ];

    const dueñoDelPerfil = listaUsuarios.find(u => u.email === correoAVer) || miUsuarioLogueado;

    // ¿Es mi propio perfil o estoy viendo el de otra persona?
    const esMiPropioPerfil = (miUsuarioLogueado.email === dueñoDelPerfil.email);

    // 2. PINTAR LOS DATOS DE LA PERSONA EN LA PÁGINA
    document.getElementById('profile-name').textContent = dueñoDelPerfil.nombre;
    document.getElementById('profile-role').textContent = dueñoDelPerfil.tipo;
    document.getElementById('profile-bio').textContent = dueñoDelPerfil.bio;
    
    const headerPerfil = document.getElementById('profile-header-card');
    if (headerPerfil) headerPerfil.style.borderTop = `5px solid ${dueñoDelPerfil.colorPerfil}`;

    const iniciales = dueñoDelPerfil.nombre.split(' ').map(n => n[0]).join('').substring(0, 2);
    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
        avatar.textContent = iniciales.toUpperCase();
        avatar.style.backgroundColor = dueñoDelPerfil.colorPerfil;
    }

    const badge = document.getElementById('profile-role');
    if (badge) {
        if (dueñoDelPerfil.tipo === "Estudiante") badge.className = "user-badge badge-student";
        if (dueñoDelPerfil.tipo === "Profesor") badge.className = "user-badge badge-teacher";
        if (dueñoDelPerfil.tipo === "Representante Estudiantil") badge.className = "user-badge badge-rep";
        if (dueñoDelPerfil.tipo === "Decano") badge.className = "user-badge badge-dean";
    }

    // 3. SEGURIDAD DE INTERFAZ: SI NO ES MI PERFIL, NO PUEDO PUBLICAR
    const cajaPublicar = document.getElementById('post-form')?.parentElement; 
    if (!esMiPropioPerfil && cajaPublicar) {
        cajaPublicar.style.display = "none"; 
        const blockTitle = document.querySelector('.block-title');
        if (blockTitle) blockTitle.textContent = `🗂️ Publicaciones de ${dueñoDelPerfil.nombre}`;
    }

    // ==========================================================================
    // 4. CARGAR Y RENDERIZAR LAS PUBLICACIONES CON ID INMUTABLE
    // ==========================================================================
    const postForm = document.getElementById('post-form');
    const postsContainer = document.getElementById('user-posts');
    const llavePosts = `posts_${dueñoDelPerfil.email}`;

    function cargarPosts() {
        if (!postsContainer) return;
        postsContainer.innerHTML = "";
        const postsGuardados = JSON.parse(localStorage.getItem(llavePosts)) || [];

        if (postsGuardados.length === 0) {
            postsContainer.innerHTML = `<p style="color: #718096; text-align: center; padding: 2rem;">Este usuario no ha publicado nada en su muro.</p>`;
            return;
        }

        // Ordenamos los posts del más nuevo al más antiguo usando el ID único numérico
        const postsOrdenados = [...postsGuardados].sort((a, b) => b.id - a.id);

        postsOrdenados.forEach((post) => {
            const postCard = document.createElement('article');
            postCard.className = "card";
            postCard.style.borderLeft = `3px solid ${dueñoDelPerfil.colorPerfil}`;
            postCard.style.marginBottom = "1.5rem";
            postCard.style.padding = "1.5rem";
            
            // Usamos post.id (inmutable) en vez del index del array
            const botonBorrarHtml = esMiPropioPerfil 
                ? `<button class="btn-delete-post" data-id="${post.id}" style="background: none; border: none; color: #e53e3e; cursor: pointer; font-size: 0.9rem; font-weight: bold;">🗑️ Borrar</button>`
                : '';

            // Construir bloques multimedia persistentes (Base64)
            let htmlMultimedia = "";
            if (post.imagen) {
                htmlMultimedia += `<img src="${post.imagen}" style="max-width: 100%; max-height: 350px; border-radius: 6px; margin-top: 1rem; display: block; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">`;
            }
            if (post.video) {
                htmlMultimedia += `<video src="${post.video}" controls style="width: 100%; max-height: 350px; border-radius: 6px; margin-top: 1rem; background: #000;"></video>`;
            }
            if (post.audio) {
                htmlMultimedia += `<audio src="${post.audio}" controls style="width: 100%; margin-top: 1rem;"></audio>`;
            }

            postCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h4 style="color: var(--primary); margin-bottom: 0.3rem; font-size: 1.2rem; font-weight: bold;">${post.titulo}</h4>
                        <p class="card-meta" style="font-size: 0.8rem; color: #718096;">Publicado el: ${post.fecha}</p>
                    </div>
                    ${botonBorrarHtml}
                </div>
                <p class="card-excerpt" style="margin-top: 0.8rem; white-space: pre-line; line-height: 1.5;">${post.contenido}</p>
                ${htmlMultimedia}
            `;
            postsContainer.appendChild(postCard);
        });

        // Evento borrar seguro por ID exacto
        if (esMiPropioPerfil) {
            document.querySelectorAll('.btn-delete-post').forEach(boton => {
                boton.onclick = (e) => {
                    if (confirm("¿Estás seguro de que deseas eliminar esta publicación de tu muro?")) {
                        const idBuscar = parseInt(e.target.getAttribute('data-id'));
                        const postsActuales = JSON.parse(localStorage.getItem(llavePosts)) || [];
                        const postsFiltrados = postsActuales.filter(p => p.id !== idBuscar);
                        localStorage.setItem(llavePosts, JSON.stringify(postsFiltrados));
                        cargarPosts();
                    }
                };
            });
        }
    }

    // 5. GUARDAR PUBLICACIÓN CON CONVERSIÓN ASÍNCRONA A BASE64
    if (postForm && esMiPropioPerfil) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('post-title').value.trim();
            const contenido = document.getElementById('post-content').value.trim();
            const fechaActual = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            if (!titulo || !contenido) return;

            const fileImg = document.getElementById('post-img')?.files[0];
            const fileVid = document.getElementById('post-vid')?.files[0];
            const fileAud = document.getElementById('post-aud')?.files[0];

            // Función ayudante para convertir archivos a Base64 y guardarlos permanentemente
            const transformarBase64 = (archivo) => {
                if (!archivo) return null;
                return new Promise((resolve) => {
                    const lector = new FileReader();
                    lector.readAsDataURL(archivo);
                    lector.onload = (evento) => resolve(evento.target.result);
                });
            };

            // Convertimos los archivos de forma segura antes de guardar
            const imagenB64 = fileImg ? await transformarBase64(fileImg) : null;
            const videoB64 = fileVid ? await transformarBase64(fileVid) : null;
            const audioB64 = fileAud ? await transformarBase64(fileAud) : null;

            const nuevoPost = { 
                id: Date.now(), // 🔥 ID inmutable marca de tiempo
                titulo, 
                contenido, 
                fecha: fechaActual,
                imagen: imagenB64,
                video: videoB64,
                audio: audioB64
            };

            const postsActuales = JSON.parse(localStorage.getItem(llavePosts)) || [];
            postsActuales.push(nuevoPost);

            localStorage.setItem(llavePosts, JSON.stringify(postsActuales));
            postForm.reset();
            cargarPosts();
        });
    }

    cargarPosts(); 
});