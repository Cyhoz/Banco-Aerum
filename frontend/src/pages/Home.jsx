import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Lock,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: 'var(--aerum-navy)' }}>
      {/* Navbar */}
      <nav style={{ 
        position: 'fixed', top: 0, width: '100%', zHeight: 1000, 
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--aerum-border)', padding: '15px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="var(--aerum-gold)" size={28} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
              BANCO<span style={{ color: 'var(--aerum-gold)' }}>AERUM</span>
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#blog" style={{ textDecoration: 'none', color: 'var(--aerum-navy)', fontWeight: '700', fontSize: '0.9rem' }}>CONOCIMIENTO</a>
            <a href="#mobile" style={{ textDecoration: 'none', color: 'var(--aerum-navy)', fontWeight: '700', fontSize: '0.9rem' }}>APP MÓVIL</a>
            <Link to="/auth" className="gold-button" style={{ textDecoration: 'none', padding: '10px 24px', fontSize: '0.85rem' }}>
              ACCESO CLIENTES
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        paddingTop: '120px', paddingBottom: '80px', 
        background: 'linear-gradient(rgba(0, 45, 82, 0.03), rgba(255, 255, 255, 1))'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '60px' }}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ flex: 1 }}
          >
            <span style={{ background: 'rgba(225, 161, 26, 0.1)', color: 'var(--aerum-gold)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em' }}>
              EXCELENCIA FINANCIERA
            </span>
            <h1 style={{ fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', margin: '20px 0', color: 'var(--aerum-navy)' }}>
              Tu futuro, <br />
              <span style={{ color: 'var(--aerum-gold)' }}>nuestra maestría.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--aerum-gray-medium)', marginBottom: '40px', maxWidth: '500px', fontWeight: '500' }}>
              Gestiona tu patrimonio con la sofisticación y seguridad que solo Banco Aerum puede ofrecer. Tecnología de vanguardia para clientes exigentes.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/auth" className="gold-button" style={{ padding: '18px 36px', fontSize: '1rem', textDecoration: 'none' }}>
                ABRE TU CUENTA
              </Link>
              <button style={{ background: 'none', border: 'none', color: 'var(--aerum-navy)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                NUESTROS SERVICIOS <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1.2, position: 'relative' }}
          >
            <img 
              src="/hero.png" 
              alt="Aerum Finance" 
              style={{ width: '100%', borderRadius: '30px', boxShadow: '0 20px 80px rgba(0,0,0,0.1)' }}
            />
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'var(--aerum-gold)', padding: '10px', borderRadius: '12px' }}>
                <TrendingUp color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--aerum-gray-medium)', fontWeight: '700' }}>CRECIMIENTO ANUAL</p>
                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>+12.5% APY</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" style={{ padding: '100px 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--aerum-navy)' }}>Visión Aerum</h2>
              <p style={{ color: 'var(--aerum-gray-medium)', fontWeight: '500', maxWidth: '400px' }}>Análisis y estrategias para potenciar tu salud financiera.</p>
            </div>
            <button style={{ color: 'var(--aerum-gold)', fontWeight: '800', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
              VER TODO EL BLOG <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
            <div className="luxury-card" style={{ padding: 0, overflow: 'hidden' }}>
              <img src="/blog.png" alt="Blog" style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
              <div style={{ padding: '40px' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--aerum-gold)' }}>ESTRATEGIA</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: '500', color: 'var(--aerum-gray-medium)' }}>5 MIN DE LECTURA</span>
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '15px' }}>Inversiones Inteligentes: Guía para el 2026</h3>
                <p style={{ color: 'var(--aerum-gray-medium)', marginBottom: '25px', lineHeight: '1.6' }}>
                  Descubre cómo diversificar tu portafolio en la nueva era digital con el respaldo y la experiencia de nuestros consultores senior.
                </p>
                <button style={{ border: 'none', background: 'none', padding: 0, color: 'var(--aerum-navy)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  LEER ARTÍCULO <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {[
                { title: "El futuro de las divisas digitales", category: "MERCADOS", date: "22 Abr" },
                { title: "Planificación sucesoria premium", category: "PATRIMONIO", date: "20 Abr" },
                { title: "Ciberseguridad en banca privada", category: "SEGURIDAD", date: "18 Abr" }
              ].map((post, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px', borderBottom: '1px solid var(--aerum-border)' }}>
                   <div style={{ width: '80px', height: '80px', background: 'var(--aerum-gray-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={24} color="var(--aerum-border)" />
                   </div>
                   <div>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--aerum-gold)' }}>{post.category}</span>
                      <h4 style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: '700' }}>{post.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--aerum-gray-medium)' }}>{post.date} • Por Equipo Aerum</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section - Luxury Branding */}
      <section id="mobile" style={{ 
        padding: '100px 0', 
        background: '#0A0A0A', 
        color: 'white',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '80px' }}>
          <div style={{ flex: 1 }}>
            <img src="/mobile.png" alt="Mobile App" style={{ width: '110%', transform: 'rotate(-5deg)', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.8))' }} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ color: '#D4AF37', fontWeight: '800', letterSpacing: '0.2em', fontSize: '0.8rem' }}>AUREUM LUXURY MOBILE</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '20px 0', lineHeight: '1.1' }}>
              El banco en tu mano, <br />
              <span style={{ color: '#D4AF37' }}>con estilo Obsidian.</span>
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '40px', lineHeight: '1.7' }}>
              Lleva la exclusividad de nuestra interfaz "Obsidian & Gold" a todas partes. Diseñada para ofrecer la máxima fluidez y seguridad en cada transacción.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Lock color="#D4AF37" />
                <div>
                  <p style={{ margin: 0, fontWeight: '700' }}>Biometría 2.0</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Acceso ultra seguro.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Globe color="#D4AF37" />
                <div>
                  <p style={{ margin: 0, fontWeight: '700' }}>Global Concierge</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Soporte 24/7 en el mundo.</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <button style={{ 
                background: '#D4AF37', color: 'black', padding: '15px 30px', borderRadius: '10px', 
                fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' 
              }}>
                <Smartphone size={20} /> APP STORE
              </button>
              <button style={{ 
                background: 'rgba(255,255,255,0.05)', color: 'white', padding: '15px 30px', borderRadius: '10px', 
                fontWeight: '800', border: '1px solid #333'
              }}>
                PLAY STORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '80px 0 40px', background: '#F9FAFB', borderTop: '1px solid var(--aerum-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '60px', marginBottom: '60px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <ShieldCheck color="var(--aerum-gold)" size={28} />
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                  BANCO<span style={{ color: 'var(--aerum-gold)' }}>AERUM</span>
                </h1>
              </div>
              <p style={{ color: 'var(--aerum-gray-medium)', lineHeight: '1.6', fontSize: '0.9rem' }}>
                Institución financiera líder comprometida con la excelencia y la seguridad de nuestros clientes. Miembro del Fondo de Garantía de Depósitos.
              </p>
            </div>
            <div>
              <h5 style={{ fontWeight: '800', marginBottom: '20px' }}>BANCO</h5>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--aerum-gray-medium)', lineHeight: '2' }}>
                <li>Nosotros</li>
                <li>Carreras</li>
                <li>Inversionistas</li>
                <li>Sostenibilidad</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontWeight: '800', marginBottom: '20px' }}>SOPORTE</h5>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--aerum-gray-medium)', lineHeight: '2' }}>
                <li>Centro de Ayuda</li>
                <li>Seguridad</li>
                <li>Tasas y Tarifas</li>
                <li>Contactos</li>
              </ul>
            </div>
            <div>
              <h5 style={{ fontWeight: '800', marginBottom: '20px' }}>LEGAL</h5>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--aerum-gray-medium)', lineHeight: '2' }}>
                <li>Privacidad</li>
                <li>Términos</li>
                <li>Cookies</li>
                <li>Regulaciones</li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--aerum-border)', paddingTop: '40px', textAlign: 'center', color: 'var(--aerum-gray-medium)', fontSize: '0.8rem' }}>
            © 2026 Banco Aerum. Todos los derechos reservados. Excelencia Financiera Certificada.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
