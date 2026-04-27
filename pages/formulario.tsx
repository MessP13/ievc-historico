// pages/formulario.tsx
import { useState } from 'react'
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

// Hardcoded PT section info as fallback
const SECTION_INFO: Record<string, { title: string; subtitle: string }> = {
  identification:    { title: 'Os seus dados',         subtitle: 'Diga-nos quem é' },
  local_church:      { title: 'A sua igreja local',    subtitle: 'Como começou tudo aqui' },
  missionary_memory: { title: 'Os missionários',       subtitle: 'Os que vieram e plantaram' },
  development:       { title: 'Crescimento',           subtitle: 'Como a igreja cresceu' },
  structure:         { title: 'Estrutura da IEVC',     subtitle: 'A organização que conhecemos' },
  leadership:        { title: 'Liderança',             subtitle: 'Quem pastoreou este rebanho' },
  testimonies:       { title: 'Testemunhos',           subtitle: 'O que Deus fez aqui' },
  materials:         { title: 'Fotos e documentos',    subtitle: 'Preservar a memória visual' },
  timeline:          { title: 'Datas importantes',     subtitle: 'A história em números' },
  final_notes:       { title: 'Observações finais',    subtitle: 'Qualquer coisa que não disse ainda' },
}

export default function FormularioPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const {
    currentSection, setSection,
    answers, formId,
    isSubmitted, setSubmitted,
  } = useFormStore()

  useAutoSave()

  const [direction, setDirection] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [declared, setDeclared] = useState(false)

  const section = getSectionByNumber(currentSection)
  if (!section) return null

  const sectionId = section.id
  const info = SECTION_INFO[sectionId] ?? { title: sectionId, subtitle: '' }

  const goNext = () => {
    if (currentSection === TOTAL_SECTIONS) { setShowConfirm(true); return }
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
    if (!declared) { toast.error('Por favor confirme a declaração'); return }
    setSubmitting(true)
    try {
      // If no formId, save locally and redirect
      if (!formId) {
        setSubmitted(true)
        router.push('/obrigado')
        return
      }
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error()
      setSubmitted(true)
      router.push('/obrigado')
    } catch {
      toast.error('Erro ao enviar. Verifique a sua ligação.')
    } finally {
      setSubmitting(false)
      setShowConfirm(false)
    }
  }

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  }

  return (
    <>
      <Head>
        <title>IEVC — Memória Histórica</title>
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
                <h1 className="font-display text-3xl text-earth-900">{info.title}</h1>
                <p className="text-earth-500 text-lg mt-1">{info.subtitle}</p>
              </div>

              {/* Location selector in section 1 */}
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
                <ChevronLeft size={22} /> Voltar
              </button>
            )}
            <button onClick={goNext} className="btn-primary">
              {currentSection === TOTAL_SECTIONS
                ? <><Send size={20} /> Enviar respostas</>
                : <>Continuar <ChevronRight size={22} /></>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-earth-950/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card max-w-md w-full space-y-4"
          >
            <h2 className="font-display text-2xl text-earth-900">Confirmar envio</h2>
            <p className="text-earth-600 text-lg leading-relaxed">
              Depois de enviar, as suas respostas ficam guardadas e serão revistas pelo pastor responsável.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-brand-600"
                checked={declared}
                onChange={e => setDeclared(e.target.checked)}
              />
              <span className="text-base text-earth-600 italic">
                Declaro que as informações prestadas são verdadeiras conforme o meu conhecimento.
              </span>
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">
                Voltar a rever
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !declared}
                className="btn-primary"
              >
                {submitting ? 'A enviar...' : <><Send size={18} /> Sim, enviar</>}
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
