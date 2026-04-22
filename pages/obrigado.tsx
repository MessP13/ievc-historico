// pages/obrigado.tsx
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion } from 'framer-motion'
import { Heart, Home } from 'lucide-react'

export default function ObrigadoPage() {
  const { t } = useTranslation('common')

  return (
    <>
      <Head><title>Obrigado — IEVC</title></Head>
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
            <Heart size={36} className="text-brand-600" fill="currentColor" />
          </div>
          <h1 className="font-display text-4xl text-earth-900">{t('submit.success_title')}</h1>
          <p className="text-earth-600 text-xl leading-relaxed">{t('submit.success_body')}</p>
          <Link href="/" className="btn-secondary inline-flex max-w-xs mx-auto">
            <Home size={20} /> Voltar ao início
          </Link>
        </motion.div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'pt', ['common'])) },
})
