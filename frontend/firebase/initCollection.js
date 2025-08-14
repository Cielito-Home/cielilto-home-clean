// Este archivo ayuda a inicializar las colecciones con documentos de ejemplo
// Ejecutar una sola vez para crear la estructura

// NOTA: Ejecutar desde la consola de Firebase o desde el admin panel

// 1. Crear plantillas predeterminadas
const defaultTemplates = [
  {
    name: "Plantilla de Ofertas",
    subject: "Ofertas especiales - Cielito Home Clean",
    content: `
      <h2 style="color: #2d5a3d;">¡Ofertas Especiales!</h2>
      <div style="background: linear-gradient(135deg, #e8f5e8, #f0f8f0); border: 2px solid #2d5a3d; border-radius: 10px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
        <h3 style="color: #2d5a3d; margin-top: 0;">🎉 Oferta del Mes</h3>
        <p><strong>¡Descuento especial!</strong></p>
      </div>
    `,
    category: "ofertas",
    createdAt: new Date(),
    createdBy: "system",
    isActive: true,
    usageCount: 0
  },
  {
    name: "Plantilla de Tips",
    subject: "Tips de limpieza profesional",
    content: `
      <h2 style="color: #2d5a3d;">💡 Tips Profesionales</h2>
      <div style="background: linear-gradient(135deg, #fff8e1, #fffbf0); border-left: 4px solid #c9a876; border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0;">
        <h3 style="color: #2d5a3d; margin-top: 0;">Tip de la semana</h3>
        <p>Consejos profesionales de limpieza...</p>
      </div>
    `,
    category: "tips",
    createdAt: new Date(),
    createdBy: "system", 
    isActive: true,
    usageCount: 0
  }
];

// 2. Crear documento de configuración del newsletter
const newsletterConfig = {
  settings: {
    maxEmailsPerHour: 100,
    defaultFrequency: "weekly",
    allowUnsubscribe: true,
    trackOpens: true,
    trackClicks: true
  },
  stats: {
    totalSent: 0,
    totalBounces: 0,
    totalUnsubscribes: 0,
    lastCampaignDate: null
  },
  updatedAt: new Date()
};

console.log('📊 Estructura de colecciones definida');
console.log('🔧 Para crear en Firebase:');
console.log('1. newsletter_templates ->', defaultTemplates);
console.log('2. newsletter_history -> (se crea automáticamente al enviar)');
console.log('3. newsletter_unsubscribed -> (se crea al darse de baja)');
console.log('4. newsletter_config ->', newsletterConfig);