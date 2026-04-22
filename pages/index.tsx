// pages/index.tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { BookOpen, Clock, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const { t } = useTranslation('common')

  return (
    <>
      <Head>
        <title>{t('app.name')}</title>
        <meta name="description" content="Formulário de levantamento histórico da IEVC — 30 anos" />
        <meta name="theme-color" content="#de6014" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {/* Hero */}
        <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-16 text-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-100/60" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-earth-200/50" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-lg"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Heart size={14} fill="currentColor" />
              30 Anos de Fé e Missão
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl text-earth-900 leading-tight mb-4">
              Ajude-nos a preservar a nossa{' '}
              <span className="text-brand-600">história</span>
            </h1>

            <p className="text-earth-600 text-xl leading-relaxed mb-10">
              A IEVC está a recolher memórias, testemunhos e documentos históricos para celebrar
              os seus 30 anos. A sua história é parte desta história.
            </p>

            {/* CTA */}
            <Link href="/formulario" className="btn-primary max-w-sm mx-auto text-xl py-5">
              <BookOpen size={22} />
              Preencher o formulário
            </Link>

            <p className="text-earth-400 text-base mt-4">
              Demora aproximadamente 15–30 minutos
            </p>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white border-t border-earth-100 px-6 py-10"
        >
          <div className="max-w-2xl mx-auto grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Clock size={24} />, title: 'Guarda automaticamente', desc: 'As respostas são guardadas ao escrever. Pode parar e continuar depois.' },
              { icon: <BookOpen size={24} />, title: '10 secções', desc: 'Do início da igreja até hoje. Responda ao que souber.' },
              { icon: <Heart size={24} />, title: 'Confidencial', desc: 'As respostas são revistas pelo pastor responsável antes de serem usadas.' },
            ].map((f, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mx-auto">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-earth-800">{f.title}</h3>
                <p className="text-earth-500 text-base leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
  },
})
