// pages/formulario.tsx
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Send } from 'lucide-react'
import { SECTIONS, getSectionByNumber, TOTAL_SECTIONS } from '@/lib/questions'
import { useFormStore } from '@/lib/store'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import FormProgress from '@/components/FormProgress'
import QuestionField from '@/components/QuestionField'
import LocationSelector from '@/components/LocationSelector'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

export default function FormularioPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const {
    currentSection, setSection,
    answers, formId, userId,
    isSubmitted, setSubmitted,
  } = useFormStore()

  useAutoSave()

  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const section = getSectionByNumber(currentSection)
  if (!section) return null

  const sectionId = section.id
  const sectionTitle = t(`sections.${sectionId}.title`)
  const sectionSubtitle = t(`sections.${sectionId}.subtitle`)

  const goNext = () => {
    if (currentSection === TOTAL_SECTIONS) {
      setShowConfirm(true)
      return
    }
    setDirection(1)
    setSection(currentSection + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (currentSection === 1) return
    setDirection(-1)
    setSection(currentSection - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, userId }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      router.push('/obrigado')
    } catch {
      toast.error(t('errors.save_failed'))
    } finally {
      setSubmitting(false)
      setShowConfirm(false)
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  }

  return (
    <>
      <Head>
        <title>{t('app.name')}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-earth-50">
        <FormProgress currentSection={currentSection} />

        <main className="max-w-2xl mx-auto px-4 pb-32 pt-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSection}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {/* Section header */}
              <div className="section-header">
                <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-1">
                  Secção {currentSection}
                </p>
                <h1 className="font-display text-3xl text-earth-900">{sectionTitle}</h1>
                <p className="text-earth-500 text-lg mt-1">{sectionSubtitle}</p>
              </div>

              {/* Location selector appears in section 1 */}
              {currentSection === 1 && (
                <div className="mb-8">
                  <LocationSelector />
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8">
                {section.questions.map((q) => (
                  <QuestionField key={q.key} question={q} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Fixed bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-earth-100 shadow-xl">
          <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
            {currentSection > 1 && (
              <button onClick={goBack} className="btn-secondary flex-shrink-0 w-auto px-5">
                <ChevronLeft size={22} />
                {t('nav.back')}
              </button>
            )}
            <button onClick={goNext} className="btn-primary">
              {currentSection === TOTAL_SECTIONS
                ? <><Send size={20} /> {t('nav.submit')}</>
                : <>{t('nav.continue')} <ChevronRight size={22} /></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-earth-950/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card max-w-md w-full space-y-4"
          >
            <h2 className="font-display text-2xl text-earth-900">{t('submit.confirm_title')}</h2>

            <p className="text-earth-600 text-lg leading-relaxed">{t('submit.confirm_body')}</p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-brand-600" required />
              <span className="text-base text-earth-600 italic">{t('submit.declaration')}</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary"
              >
                {t('submit.confirm_no')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting
                  ? t('nav.submitting')
                  : <><Send size={18} /> {t('submit.confirm_yes')}</>
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'pt', ['common'])),
  },
})
