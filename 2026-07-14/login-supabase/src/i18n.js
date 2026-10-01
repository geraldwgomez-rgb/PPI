import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const es = {
  cargando: 'Cargando...',
  nav: {
    introduccion: 'Introducción',
    problema: 'El Problema',
    objetivos: 'Objetivos',
    fundadores: 'Fundadores',
    manuales: 'Manuales',
    login: 'Iniciar sesión',
  },
  badge: { activo: '● SISTEMA ACTIVO' },
  hero: {
    eyebrow: 'SISTEMA SMC // GESTIÓN CONTABLE INTELIGENTE',
    titulo: 'INTRODUCCIÓN',
    p1: 'La aplicación busca resolver problemas en cuanto a la <b>administración contable</b> de las empresas, mediante un sistema el cual realizará el seguimiento a los ingresos y gastos teniendo en cuenta los gastos fijos, variables, impuestos e inversiones.',
    p2: 'Nuestro objetivo es brindar una oportunidad para que los comercios en Colombia tengan un mejor futuro, logrando expandirse y crecer monetariamente a través de operaciones estadísticas precisas.',
  },
  kpi: {
    modulos: 'Módulos activos',
    stack: 'Stack tecnológico',
    equipo: 'Equipo',
    base: 'Base',
  },
  problema: {
    eyebrow: 'DIAGNÓSTICO',
    titulo: 'EL PROBLEMA',
    cita: 'Muchos microempresarios en Colombia no conocen la importancia de un orden financiero, lo que provoca pérdidas de dinero y cierres prematuros.',
    texto: 'Nuestra aplicación soluciona esta brecha informativa, proporcionando un sistema de seguimiento robusto que informa y previene la insolvencia.',
  },
  objetivos: {
    titulo: 'OBJETIVOS',
    generalTitulo: 'Objetivo General',
    generalTexto: 'Diseñar y crear una aplicación web que permita registrar, controlar y analizar los ingresos y gastos de los usuarios.',
    especificosTitulo: 'Objetivos Específicos',
    lista: [
      'Identificar los diferentes tipos de aplicaciones contables e identificar el funcionamiento y las variables',
      'Crear y diseñar el modelo de datos para la aplicación contable',
      'Diseñar y crear el sistema contable',
      'Realizar pruebas al sistema contable',
      'Documentar el desarrollo del sistema y elaborar manuales de usuario',
    ],
  },
  fundadores: {
    titulo: 'FUNDADORES',
    yulian: 'Residente en Carpinelo, Medellín. Especialista en HTML y CSS con visión en lógica de Backend. Su enfoque es la funcionalidad robusta y la profesionalización tecnológica.',
    sarai: 'Residente de Santo Domingo, Medellín. Especialista en diseño visual. Se enfoca en crear experiencias impactantes, creativas y fáciles de usar para el usuario final.',
    daniel: 'Daniel Gómez Ortiz, residente en Santo Domingo, Medellín. Se especializa en diseño visual y calidad. Busca que su trabajo sea detallado y del agrado de los clientes.',
    gerald: 'Desarrollador Backend Jr. en Medellín. Especialista en administración de bases de datos y Node.js. Enfocado en crear sistemas escalables y eficientes.',
    juanjose: 'Residente del Carpinelo, Medellín, Colombia. Desarrollador Backend Jr. especialista en Node.js y bases de datos. Enfocado en construir sistemas robustos y eficientes.',
  },
  manuales: {
    titulo: 'MANUALES',
    ver: 'Ver',
    cerrar: 'Cerrar',
    descargar: 'Descargar',
    manualA: 'Manual A',
    manualB: 'Manual B',
    error: 'No se pudo cargar el manual',
  },
  entrar: 'Entrar al Sistema →',
}

const en = {
  cargando: 'Loading...',
  nav: {
    introduccion: 'Introduction',
    problema: 'The Problem',
    objetivos: 'Objectives',
    fundadores: 'Founders',
    manuales: 'Manuals',
    login: 'Log in',
  },
  badge: { activo: '● SYSTEM ACTIVE' },
  hero: {
    eyebrow: 'SMC SYSTEM // SMART ACCOUNTING MANAGEMENT',
    titulo: 'INTRODUCTION',
    p1: 'The application aims to solve problems in the <b>accounting management</b> of businesses, through a system that tracks income and expenses, taking into account fixed and variable costs, taxes and investments.',
    p2: 'Our goal is to give businesses in Colombia the opportunity to have a better future, expanding and growing financially through precise statistical operations.',
  },
  kpi: {
    modulos: 'Active modules',
    stack: 'Tech stack',
    equipo: 'Team',
    base: 'Based in',
  },
  problema: {
    eyebrow: 'DIAGNOSIS',
    titulo: 'THE PROBLEM',
    cita: 'Many small business owners in Colombia do not understand the importance of financial order, which leads to money losses and premature closures.',
    texto: 'Our application closes this information gap by providing a robust tracking system that informs and helps prevent insolvency.',
  },
  objetivos: {
    titulo: 'OBJECTIVES',
    generalTitulo: 'General Objective',
    generalTexto: 'Design and build a web application that allows users to record, control and analyze their income and expenses.',
    especificosTitulo: 'Specific Objectives',
    lista: [
      'Identify the different types of accounting applications and understand how they work and their variables',
      'Create and design the data model for the accounting application',
      'Design and build the accounting system',
      'Run tests on the accounting system',
      'Document the development of the system and write user manuals',
    ],
  },
  fundadores: {
    titulo: 'FOUNDERS',
    yulian: 'Lives in Carpinelo, Medellín. Specialist in HTML and CSS with a focus on Backend logic. His approach is robust functionality and technological professionalization.',
    sarai: 'Lives in Santo Domingo, Medellín. Visual design specialist. She focuses on creating striking, creative and user-friendly experiences for the end user.',
    daniel: 'Daniel Gómez Ortiz, lives in Santo Domingo, Medellín. Specializes in visual design and quality. He aims for detailed work that clients will love.',
    gerald: 'Junior Backend Developer in Medellín. Specialist in database administration and Node.js. Focused on building scalable and efficient systems.',
    juanjose: 'Lives in Carpinelo, Medellín, Colombia. Junior Backend Developer specialized in Node.js and databases. Focused on building robust and efficient systems.',
  },
  manuales: {
    titulo: 'MANUALS',
    ver: 'View',
    cerrar: 'Close',
    descargar: 'Download',
    manualA: 'Manual A',
    manualB: 'Manual B',
    error: 'Could not load the manual',
  },
  entrar: 'Enter the System →',
}

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: localStorage.getItem('lang') || 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

export default i18n