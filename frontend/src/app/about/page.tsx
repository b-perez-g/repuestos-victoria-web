'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Acerca de Repuestos Victoria
          </h1>
          <p className="text-xl text-muted max-w-3xl mx-auto">
            Con más de 20 años de experiencia, somos líderes en el mercado de repuestos automotrices en Chile.
          </p>
        </div>

        {/* Historia */}
        <section className="mb-16">
          <div className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-3xl font-bold text-primary mb-6">Nuestra Historia</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted mb-4">
                Fundada en 2003, Repuestos Victoria nació como un pequeño negocio familiar
                con la visión de ofrecer repuestos automotrices de la más alta calidad a
                precios accesibles para todos los chilenos.
              </p>
              <p className="text-muted mb-4">
                A lo largo de los años, hemos crecido hasta convertirnos en una de las
                distribuidoras de repuestos más confiables del país, manteniendo siempre
                nuestros valores de calidad, honestidad y servicio al cliente.
              </p>
              <p className="text-muted">
                Hoy contamos con un catálogo de más de 50,000 productos y enviamos
                a todo Chile, manteniendo el compromiso de ayudar a nuestros clientes
                a mantener sus vehículos en perfecto estado.
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-primary text-center mb-8">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent">🔧</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Calidad</h3>
              <p className="text-muted">
                Trabajamos solo con las mejores marcas y proveedores certificados
                para garantizar la durabilidad de cada repuesto.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Confianza</h3>
              <p className="text-muted">
                Construimos relaciones duraderas con nuestros clientes basadas
                en la transparencia y el servicio honesto.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Rapidez</h3>
              <p className="text-muted">
                Entendemos la urgencia de nuestros clientes y trabajamos
                para entregar los repuestos en el menor tiempo posible.
              </p>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="mb-16">
          <div className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-3xl font-bold text-primary mb-6">Nuestro Equipo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Especialistas en Repuestos
                </h3>
                <p className="text-muted mb-4">
                  Nuestro equipo cuenta con más de 15 años de experiencia promedio
                  en el rubro automotriz. Conocemos cada pieza y su aplicación.
                </p>
                <ul className="space-y-2 text-muted">
                  <li>• Técnicos especializados en diferentes marcas</li>
                  <li>• Asesoría personalizada para cada cliente</li>
                  <li>• Capacitación constante en nuevas tecnologías</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Servicio al Cliente
                </h3>
                <p className="text-muted mb-4">
                  Nuestro equipo de atención está disponible para ayudarte
                  a encontrar exactamente lo que necesitas.
                </p>
                <div className="space-y-2 text-muted">
                  <p>📞 <strong>Teléfono:</strong> +56 2 2123 4567</p>
                  <p>📧 <strong>Email:</strong> contacto@repuestosvictoria.cl</p>
                  <p>⏰ <strong>Horario:</strong> Lun-Vie 8:30-18:00, Sáb 9:00-14:00</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section>
          <div className="bg-surface border border-border rounded-lg p-8">
            <h2 className="text-3xl font-bold text-primary mb-6">Visítanos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Tienda Principal
                </h3>
                <div className="space-y-2 text-muted">
                  <p>📍 Av. Independencia 1234, Santiago Centro</p>
                  <p>🚇 Metro Patronato (Línea 2)</p>
                  <p>🚌 Micros: 108, 109, 110</p>
                  <p>🅿️ Estacionamiento disponible</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Sucursal Las Condes
                </h3>
                <div className="space-y-2 text-muted">
                  <p>📍 Av. Apoquindo 5678, Las Condes</p>
                  <p>🚇 Metro Escuela Militar (Línea 1)</p>
                  <p>🚌 Transantiago: C01, C07</p>
                  <p>🅿️ Mall Plaza disponible</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}