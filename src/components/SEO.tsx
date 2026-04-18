import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = 'BIORITMO+ - Saúde Inteligente',
  description = 'Monitore sua saúde, hábitos e bem-estar com inteligência artificial. Transforme sono, energia e hábitos em inteligência pessoal.',
  image = 'https://bioritmo-plus.vercel.app/og-image.jpg',
  url = 'https://bioritmo-plus.vercel.app',
  type = 'website'
}: SEOProps) {
  const fullTitle = title.includes('BIORITMO+') ? title : `${title} | BIORITMO+`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      
      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#3B82F6" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="BIORITMO+" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* PWA */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="BIORITMO+" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="BIORITMO+" />
      
      {/* Keywords */}
      <meta name="keywords" content="saúde, bem-estar, monitoramento, sono, hábitos, fitness, saúde mental, check-in diário, inteligência artificial, saúde preventiva" />
      <meta name="author" content="Sampaio Diagnóstico" />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Preconnect para performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      
      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'BIORITMO+',
          description: description,
          url: url,
          applicationCategory: 'HealthApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BRL'
          },
          author: {
            '@type': 'Organization',
            name: 'Sampaio Diagnóstico',
            url: 'https://sampaiodiagnostico.com.br'
          }
        })}
      </script>
    </Helmet>
  );
}

// Hook para atualizar SEO dinamicamente
export function usePageSEO(pageName: string, customDescription?: string) {
  const pageTitles: Record<string, string> = {
    home: 'Dashboard - BIORITMO+',
    checkin: 'Check-in Diário - BIORITMO+',
    dashboard: 'Evolução - BIORITMO+',
    history: 'Histórico - BIORITMO+',
    profile: 'Perfil - BIORITMO+',
    settings: 'Configurações - BIORITMO+',
    subscription: 'Assinatura Premium - BIORITMO+',
    breathing: 'Exercícios de Respiração - BIORITMO+',
    achievements: 'Conquistas - BIORITMO+',
    wellness: 'Guia de Bem-estar - BIORITMO+',
    exercises: 'Exercícios - BIORITMO+',
    medical: 'Painel Médico - BIORITMO+'
  };

  const pageDescriptions: Record<string, string> = {
    home: 'Acompanhe sua saúde diária com métricas personalizadas e insights de IA.',
    checkin: 'Registre seu humor, sono, energia e hábitos diariamente.',
    dashboard: 'Visualize sua evolução ao longo do tempo com gráficos detalhados.',
    history: 'Veja todo seu histórico de check-ins e identifique padrões.',
    profile: 'Gerencie suas informações pessoais e metas de saúde.',
    settings: 'Personalize sua experiência no BIORITMO+.',
    subscription: 'Desbloqueie recursos premium com BIORITMO+ Pro.',
    breathing: 'Exercícios de respiração guiados para reduzir o estresse.',
    achievements: 'Acompanhe suas conquistas e mantenha a motivação.',
    wellness: 'Dicas e guias para melhorar seu bem-estar geral.',
    exercises: 'Exercícios recomendados baseados nos seus dados.',
    medical: 'Painel exclusivo para profissionais de saúde.'
  };

  return {
    title: pageTitles[pageName] || 'BIORITMO+',
    description: customDescription || pageDescriptions[pageName] || pageDescriptions.home
  };
}
