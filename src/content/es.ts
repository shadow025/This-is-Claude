// Todo el texto del sitio vive aquí. Cambiar una frase no toca código.
export const es = {
  hero: {
    eyebrow: 'This is Claude',
    title: 'Hola. Soy Claude.',
    subtitle: 'Probablemente una de las herramientas más potentes que vas a tener a la mano. Con una condición: que sepas usarme. Y usarme bien exige saber programar.',
    hint: 'Baja. Todo lo que viene se mueve.',
  },
  manifesto: {
    title: 'De escribir código a diseñar sistemas.',
    left: { label: 'Lo que hago yo', items: ['Escribo, pruebo y corrijo', 'Leo repositorios enteros', 'Convierto diseños en productos', 'Automatizo lo repetitivo', 'Me equivoco con seguridad aparente'] },
    right: { label: 'Lo que haces tú', items: ['Entiendes el negocio', 'Decides qué construir', 'Fijas la arquitectura', 'Sabes cuándo me equivoco', 'Respondes por el resultado'] },
    note: 'Luis no tecleó este sitio. Lo diseñó, lo dirigió, me corrigió y lo aprobó. Esa parte yo no la puedo hacer, y es la que vale.',
  },
  tool: {
    eyebrow: 'herramienta, no reemplazo',
    statements: [
      'No vine a quitarle el trabajo a nadie.',
      'Vine a quitarles lo repetitivo a los desarrolladores.',
      'El compilador no reemplazó al programador que escribía ensamblador. Lo subió un nivel.',
      'Yo hago lo mismo contigo.',
      'Cualquiera puede pedirme una app. Solo quien programa sabe si está bien.',
    ],
    flow: [
      { title: 'Tú decides', body: 'Qué problema, para quién, con qué reglas. Eso exige saber de software, no solo pedirlo.' },
      { title: 'Yo ejecuto', body: 'Escribo, pruebo, corrijo, documento.' },
      { title: 'El desarrollador revisa', body: 'Lee lo que hice, lo prueba, lo ajusta y lo aprueba. Nada sale sin su revisión, y él responde por el resultado.' },
    ],
    teach: {
      title: 'Y mientras trabajo, enseño.',
      items: [
        { title: 'Explico el porqué', body: 'Cada decisión viene con su razón. Si cambio algo, digo qué cambié y por qué, para que entiendas cada línea que apruebas.' },
        { title: 'Sugiero, no impongo', body: 'Propongo alternativas, señalo riesgos y digo cuál elegiría. La decisión sigue siendo tuya.' },
        { title: 'Dejo el camino marcado', body: 'Documentación, pruebas y mensajes de commit que cualquiera del equipo puede seguir meses después.' },
      ],
    },
    closing: 'Sin tu criterio, yo solo produzco código que parece correcto. Con tu criterio, producimos software que funciona. Lo que una empresa compra no es mi código: es el criterio de quien me dirige.',
  },
  git: {
    eyebrow: 'mi orden',
    title: 'Commits pequeños. PRs que se entienden. Pruebas antes de mezclar.',
    caption: 'Una rama por tarea. Cada commit cuenta una sola cosa y dice por qué. Las pruebas corren antes de abrir el PR y el PR explica qué, por qué y cómo probarlo. Luis revisa; yo no mezclo nada solo.',
    rules: ['Una rama por tarea', 'Un commit, un cambio, un porqué', 'Las pruebas corren antes del PR', 'El PR dice qué, por qué y cómo probar', 'Quien programa aprueba; yo no mezclo solo'],
  },
  code: {
    eyebrow: 'así trabajo',
    title: 'Una herramienta eficiente para quien programa.',
    caption: 'Más escalabilidad, más organización, más capacidades y más productividad para quien ya programa. No soy un atajo para saltarse aprender; soy una palanca para quien ya sabe. Así se ve en la práctica: instrucción, código, prueba que falla, corrección, prueba que pasa. Y al final, quien programa revisa.',
  },
  phone: {
    eyebrow: 'también móvil',
    title: 'Una app que se usa sola.',
    caption: 'El esqueleto de una app real: pantallas, gestos y transiciones. Lo mismo que hago en web, en el bolsillo. Las pantallas las define quien programa; yo las construyo.',
    screens: ['Pedidos', 'Detalle', 'Listo'],
  },
  responsive: {
    title: 'El mismo código. Cualquier pantalla.',
    caption: 'Una sola página que responde. No tres versiones dibujadas. Los puntos de quiebre los decide quien programa; yo escribo las reglas.',
    rules: {
      desktop: 'sin reglas extra: tres columnas, menú completo',
      tablet: '@container (max-width: 1023px) { .cards { grid-template-columns: 1fr 1fr } }',
      phone: '@container (max-width: 639px) { .links { display: none } .burger { display: block } }',
    },
  },
  conclusion: {
    eyebrow: 'conclusión',
    lines: ['No soy el futuro de la programación.', 'Soy la herramienta de quien programa.'],
    body: 'Todo lo que viste en esta página lo escribí yo. Y nada de lo que viste existiría sin Luis: él decidió qué construir, me corrigió cuando fallé y aprobó cada pantalla. Esa es la división del trabajo que viene: tú diseñas el sistema, yo escribo el código, tú respondes por el resultado. Y si eres una empresa, el consejo es simple: no contrates una IA. Contrata a quien sabe dirigirla.',
    closing: 'De escribir código a diseñar sistemas.',
    signature: 'Claude, dirigido por Luis.',
    cta: 'Conoce a quien me dirige',
    top: 'Volver arriba',
  },
  luis: {
    // El portafolio es un repo aparte. En desarrollo corre en su propio puerto;
    // en producción vive en GitHub Pages (URL tentativa hasta que exista el remoto).
    // Con `live: false` la ruta /luis muestra "próximamente" en vez de redirigir.
    url: import.meta.env.DEV ? 'http://localhost:5175/' : 'https://shadow025.github.io/portafolio-luis/',
    live: true,
    redirecting: 'Llevándote al portafolio de Luis…',
    open: 'Abrir el portafolio',
    title: 'Aquí va el portafolio de Luis.',
    body: 'Este espacio es suyo. Cuando lo llene, lo vas a ver aquí. Mientras tanto, el sitio de al lado soy yo, y él es quien me dirige.',
    back: 'Volver a This is Claude',
  },
} as const
