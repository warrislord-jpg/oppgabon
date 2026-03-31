'use client'
// src/app/auth/register/page.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth.store'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const schema = z.object({
  fullName: z.string().min(2, 'Nom trop court'),
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  confirm:  z.string(),
  role:     z.enum(['CANDIDAT', 'EMPLOYEUR']),
  phone:    z.string().optional(),
  city:     z.string().optional(),
}).refine((d) => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
})

type FormData = z.infer<typeof schema>

const ROLES = [
  {
    value: 'CANDIDAT',
    label: 'Candidat / Locataire',
    desc: "Je cherche un emploi, un stage ou un logement",
    icon: '🎯',
  },
  {
    value: 'EMPLOYEUR',
    label: 'Employeur / Propriétaire',
    desc: "Je publie des offres d'emploi ou des logements",
    icon: '🏢',
  },
]

const CITIES = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Autre']

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore()
  const router = useRouter()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CANDIDAT' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone,
        city: data.city,
      })
      toast.success('Compte créé avec succès !')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl text-brand">
            Opp<span className="text-accent">Gabon</span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">Créez votre compte gratuitement</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Choix du rôle */}
            <div>
              <label className="label">Je suis…</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue('role', role.value as 'CANDIDAT' | 'EMPLOYEUR')}
                    className={clsx(
                      'text-left p-3 rounded-lg border transition-all',
                      selectedRole === role.value
                        ? 'border-brand bg-brand-50 ring-1 ring-brand'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <div className="text-lg mb-1">{role.icon}</div>
                    <div className={clsx(
                      'text-sm font-medium',
                      selectedRole === role.value ? 'text-brand-600' : 'text-gray-700'
                    )}>
                      {role.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">
                      {role.desc}
                    </div>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Nom complet */}
            <div>
              <label className="label">Nom complet <span className="text-accent">*</span></label>
              <input
                {...register('fullName')}
                className="input"
                placeholder="Prénom Nom"
                autoComplete="name"
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email <span className="text-accent">*</span></label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="votre@email.ga"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Téléphone + Ville */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Téléphone</label>
                <input
                  {...register('phone')}
                  className="input"
                  placeholder="+241 06..."
                />
              </div>
              <div>
                <label className="label">Ville</label>
                <select {...register('city')} className="input">
                  <option value="">Sélectionner</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="label">Mot de passe <span className="text-accent">*</span></label>
              <input
                {...register('password')}
                type="password"
                className="input"
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="label">Confirmer le mot de passe <span className="text-accent">*</span></label>
              <input
                {...register('confirm')}
                type="password"
                className="input"
                placeholder="Répéter le mot de passe"
                autoComplete="new-password"
              />
              {errors.confirm && (
                <p className="text-xs text-red-600 mt-1">{errors.confirm.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3"
            >
              {isLoading ? 'Création du compte...' : 'Créer mon compte gratuitement'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              En vous inscrivant, vous acceptez les conditions d'utilisation d'OppGabon.
            </p>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-brand font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
