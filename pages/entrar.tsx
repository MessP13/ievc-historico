// pages/entrar.tsx
import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, KeyRound, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useFormStore } from '@/lib/store'
import toast from 'react-hot-toast'

type Step = 'phone' | 'otp' | 'name'

export default function EntrarPage() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const { setUserId } = useFormStore()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    if (!phone.trim()) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.replace(/\s/g, ''),
      })
      if (error) throw error
      setStep('otp')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao enviar código')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) return
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.replace(/\s/g, ''),
        token: otp,
        type: 'sms',
      })
      if (error) throw error

      const userId = data.user?.id
      if (!userId) throw new Error('No user id')
      setUserId(userId)

      // Check if user has a name already
      const res = await fetch(`/api/users/${userId}`)
      if (res.ok) {
        const user = await res.json()
        if (user.fullName) {
          await createFormAndRedirect(userId)
        } else {
          setStep('name')
        }
      } else {
        setStep('name')
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Código inválido')
    } finally {
      setLoading(false)
    }
  }

  const saveName = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error()

      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name.trim(), phone, userId: user.id }),
      })

      await createFormAndRedirect(user.id)
    } catch {
      toast.error('Erro ao guardar nome')
    } finally {
      setLoading(false)
    }
  }

  const createFormAndRedirect = async (userId: string) => {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const form = await res.json()
    useFormStore.getState().setFormId(form.id)
    router.push('/formulario')
  }

  return (
    <>
      <Head><title>{t('auth.title')} — IEVC</title></Head>
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo / Title */}
          <div className="text-center">
            <h1 className="font-display text-3xl text-earth-900">{t('app.name')}</h1>
            <p className="text-earth-500 mt-2">{t('app.tagline')}</p>
          </div>

          <div className="card space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Phone */}
              {step === 'phone' && (
                <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="flex items-center gap-3 text-brand-600">
                    <Phone size={24} />
                    <h2 className="font-display text-2xl text-earth-900">{t('auth.title')}</h2>
                  </div>
                  <div>
                    <label className="field-label">{t('auth.phone_label')}</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t('auth.phone_placeholder')}
                      className="field-input"
                      onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      autoFocus
                    />
                  </div>
                  <button onClick={sendOtp} disabled={loading || !phone.trim()} className="btn-primary">
                    {loading ? t('auth.sending') : <>{t('auth.send_otp')} <ArrowRight size={20} /></>}
                  </button>
                </motion.div>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <KeyRound size={24} className="text-brand-600" />
                    <h2 className="font-display text-2xl text-earth-900">{t('auth.otp_label')}</h2>
                  </div>
                  <p className="text-earth-500">Enviámos um código SMS para <strong>{phone}</strong></p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('auth.otp_placeholder')}
                    className="field-input text-3xl tracking-[0.5em] text-center"
                    onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                    autoFocus
                  />
                  <button onClick={verifyOtp} disabled={loading || otp.length < 6} className="btn-primary">
                    {loading ? 'A verificar...' : <>{t('auth.verify')} <ArrowRight size={20} /></>}
                  </button>
                  <button onClick={() => setStep('phone')} className="w-full text-center text-earth-500 text-base underline">
                    {t('auth.resend')}
                  </button>
                </motion.div>
              )}

              {/* Step 3: Name */}
              {step === 'name' && (
                <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <h2 className="font-display text-2xl text-earth-900">{t('auth.welcome')} 👋</h2>
                  <p className="text-earth-500 text-lg">{t('auth.new_user_prompt')}</p>
                  <div>
                    <label className="field-label">{t('questions.full_name.label')}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('questions.full_name.placeholder')}
                      className="field-input"
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      autoFocus
                    />
                  </div>
                  <button onClick={saveName} disabled={loading || !name.trim()} className="btn-primary">
                    {loading ? 'A guardar...' : <>Começar <ArrowRight size={20} /></>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'pt', ['common'])) },
})
