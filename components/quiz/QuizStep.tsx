'use client'

import type { ChangeEvent } from 'react'
import type { StepId } from '@/lib/client/quiz-flow/steps'
import type { TextScreen } from '@/lib/shared/types/content.types'
import type {
  Depth,
  DiscriminatorSignal,
  Lane,
  Qualifier,
  SexAtBirth,
  SleepHours,
  StressLevel,
} from '@/lib/shared/types/quiz.types'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import {
  nextStep,
  pathFor,
  previousStep,
  redirectTarget,
  isComplete,
} from '@/lib/client/quiz-flow/steps'
import { useQuizStore } from '@/lib/client/stores/quiz.store'
import { BRANCHES, resolveRecognition } from '@/lib/shared/content/branches.content'
import {
  DEPTH_RECOGNITION_LINE,
  DEPTH_SCREEN,
  EMAIL_SCREEN,
  NAME_SCREEN,
  NINETY_DAY_SCREEN,
  PRIMARY_GOAL_SCREEN,
  SECONDARY_GOALS_SCREEN,
  SEX_AT_BIRTH_SCREEN,
  SLEEP_SCREEN,
  STRESS_SCREEN,
  WELCOME_INTERSTITIAL_SCREEN,
  WELCOME_SCREEN,
  secondaryGoalOptions,
} from '@/lib/shared/content/screens.content'

import { EducationSheet } from './EducationSheet'
import { InterstitialScreen } from './InterstitialScreen'
import { WelcomeScreen } from './WelcomeScreen'
import { LANE_ICONS } from './icons/LaneIcons'
import { OptionGroup } from './OptionGroup'
import { PrimaryButton } from './PrimaryButton'
import { ProgressHeader } from './ProgressHeader'
import { RecognitionLine } from './RecognitionLine'
import { ScreenShell } from './ScreenShell'
import { TextField } from './TextField'

/** Option descriptions keyed by value, for the lists that carry a second line. */
const descriptionsOf = <V extends string>(options: { value: V; description?: string }[]) =>
  Object.fromEntries(
    options.filter((o) => o.description).map((o) => [o.value, o.description as string]),
  )

const withName = (text: string, name: string | undefined) =>
  text.replace('[name]', name?.trim() || 'there')

/**
 * The field's label, and whether it is drawn.
 *
 * S2 and S9 show one; S8C shows none, so it falls back to the heading and is hidden —
 * still present for screen readers, because a placeholder is not a label.
 */
const fieldLabel = (screen: TextScreen) => ({
  label: screen.fieldLabel ?? screen.heading,
  hideLabel: !screen.fieldLabel,
})

/**
 * One screen of the quiz, chosen by the URL.
 *
 * Deliberately unstyled beyond what legibility needs — Phase 4 applies the Figma design
 * to these same components. What matters here is that the structure is right: real
 * radio and checkbox groups, real labels, a working guard, and Next disabled until the
 * screen is actually answered.
 */
export function QuizStep({ step }: { step: StepId }) {
  const router = useRouter()
  const answers = useQuizStore((state) => state.answers)
  const hydrated = useQuizStore((state) => state.hydrated)
  const setAnswers = useQuizStore((state) => state.setAnswers)

  /**
   * The guard waits for sessionStorage to rehydrate — before that the store holds
   * defaults, and a refresh mid-quiz would bounce back to the start.
   *
   * The *screen* deliberately does not wait. Gating the render on hydration too meant
   * every step served an empty shell and flashed blank on first paint, which on the
   * welcome screen is the top of the funnel rendering nothing until JS arrives. Server
   * and first client render both use the empty draft, so they match; rehydration then
   * fills the answers in.
   */
  const redirect = hydrated ? redirectTarget(step, answers) : null

  useEffect(() => {
    if (redirect) router.replace(redirect)
  }, [redirect, router])

  const branch = answers.lane ? BRANCHES[answers.lane] : null
  const goNext = () => router.push(pathFor(nextStep(step, answers.lane)))
  const back = previousStep(step, answers.lane)
  const goBack = back ? () => router.push(pathFor(back)) : undefined

  const header = <ProgressHeader step={step} lane={answers.lane} onBack={goBack} />

  const nextButton = (label = 'Continue', disabled = !isComplete(step, answers)) => (
    <PrimaryButton onClick={goNext} disabled={disabled}>
      {label}
    </PrimaryButton>
  )

  const text = (field: 'firstName' | 'ninetyDayGoalText' | 'email' | 'sexSelfDescribe') => ({
    value: (answers[field] as string) ?? '',
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setAnswers({ [field]: event.target.value }),
  })

  switch (step) {
    case 'welcome':
      return <WelcomeScreen copy={WELCOME_SCREEN} onStart={goNext} />

    case 'name':
      return (
        <ScreenShell {...NAME_SCREEN} header={header} footer={nextButton()}>
          {/*
            No autoFocus. The frame draws S2 with the keyboard already up, but iOS Safari
            blocks programmatic focus without a user gesture, so it would not fire on the
            device this is designed for — and it trips the a11y rule for no gain.
          */}
          <TextField {...fieldLabel(NAME_SCREEN)} name="firstName" {...text('firstName')} />
        </ScreenShell>
      )

    case 'interstitial':
      return (
        <InterstitialScreen
          copy={WELCOME_INTERSTITIAL_SCREEN}
          heading={withName(WELCOME_INTERSTITIAL_SCREEN.heading, answers.firstName)}
          onContinue={goNext}
          onBack={goBack}
        />
      )

    case 'sex':
      return (
        <ScreenShell {...SEX_AT_BIRTH_SCREEN} header={header} footer={nextButton()}>
          <OptionGroup<SexAtBirth>
            legend={SEX_AT_BIRTH_SCREEN.heading}
            name="sexAtBirth"
            options={SEX_AT_BIRTH_SCREEN.options}
            value={answers.sexAtBirth}
            onChange={(value) => setAnswers({ sexAtBirth: value })}
          />
          {answers.sexAtBirth === 'self_describe' ? (
            <TextField
              label="How would you describe it?"
              name="sexSelfDescribe"
              {...text('sexSelfDescribe')}
            />
          ) : null}
        </ScreenShell>
      )

    case 'goal':
      return (
        <ScreenShell {...PRIMARY_GOAL_SCREEN} header={header} footer={nextButton()}>
          <OptionGroup<Lane>
            legend={PRIMARY_GOAL_SCREEN.heading}
            name="lane"
            options={PRIMARY_GOAL_SCREEN.options}
            icons={LANE_ICONS}
            descriptions={descriptionsOf(PRIMARY_GOAL_SCREEN.options)}
            value={answers.lane}
            onChange={(value) =>
              // Changing lane invalidates the branch answers — they belong to the old one.
              setAnswers({
                lane: value,
                discriminator: undefined,
                qualifier: undefined,
                secondaryLanes: [],
              })
            }
          />
        </ScreenShell>
      )

    case 'depth':
      return (
        <ScreenShell {...DEPTH_SCREEN} header={header} footer={nextButton()}>
          <OptionGroup<Depth>
            legend={DEPTH_SCREEN.heading}
            name="depth"
            options={DEPTH_SCREEN.options}
            value={answers.depth}
            onChange={(value) => setAnswers({ depth: value })}
          />
          {answers.depth === 'depth_layered' ? (
            <RecognitionLine text={DEPTH_RECOGNITION_LINE} />
          ) : null}
        </ScreenShell>
      )

    case 'secondary':
      return (
        <ScreenShell {...SECONDARY_GOALS_SCREEN} header={header} footer={nextButton()}>
          <OptionGroup<Lane>
            legend={SECONDARY_GOALS_SCREEN.heading}
            name="secondaryLanes"
            multiple
            options={secondaryGoalOptions(answers.lane!)}
            icons={LANE_ICONS}
            descriptions={descriptionsOf(secondaryGoalOptions(answers.lane!))}
            value={answers.secondaryLanes ?? []}
            onChange={(value) => {
              const current = answers.secondaryLanes ?? []

              setAnswers({
                secondaryLanes: current.includes(value)
                  ? current.filter((lane) => lane !== value)
                  : [...current, value],
              })
            }}
          />
        </ScreenShell>
      )

    case 'discriminator': {
      const discriminator = branch?.discriminator

      if (!discriminator) return null

      const recognition = resolveRecognition(answers.lane!, answers.discriminator ?? [])

      return (
        <ScreenShell
          register="direct"
          heading={discriminator.heading}
          headingSize="sm"
          body={discriminator.body ? [discriminator.body] : undefined}
          header={header}
          footer={nextButton()}
        >
          <OptionGroup<DiscriminatorSignal>
            legend={discriminator.heading}
            name="discriminator"
            multiple={discriminator.select === 'multi'}
            options={discriminator.options}
            value={answers.discriminator ?? []}
            onChange={(value) => {
              const current = answers.discriminator ?? []

              if (discriminator.select === 'single') {
                setAnswers({ discriminator: [value] })

                return
              }

              setAnswers({
                discriminator: current.includes(value)
                  ? current.filter((signal) => signal !== value)
                  : [...current, value],
              })
            }}
          />
          {answers.discriminator?.length && recognition ? (
            <RecognitionLine text={recognition.text} />
          ) : null}
        </ScreenShell>
      )
    }

    case 'qualifier': {
      if (!branch) return null

      // PT-141 has no discriminator, so its recognition line belongs on this screen.
      const recognition =
        branch.discriminator === null ? resolveRecognition(answers.lane!, []) : null

      return (
        <ScreenShell
          register="direct"
          heading={branch.qualifier.heading}
          body={branch.qualifier.body ? [branch.qualifier.body] : undefined}
          header={header}
          footer={nextButton()}
        >
          <OptionGroup<Qualifier>
            legend={branch.qualifier.heading}
            name="qualifier"
            options={branch.qualifier.options}
            value={answers.qualifier}
            onChange={(value) => setAnswers({ qualifier: value })}
          />
          {answers.qualifier && recognition ? <RecognitionLine text={recognition.text} /> : null}
        </ScreenShell>
      )
    }

    case 'education': {
      if (!branch) return null

      return (
        <ScreenShell
          register="warm"
          // The frames give this screen no back control — it is a sheet you dismiss
          // forward, and the pill sits centred on its own.
          header={<ProgressHeader step={step} lane={answers.lane} />}
          sheet={
            <EducationSheet
              education={branch.education}
              eyebrow="WHY WE ASKED"
              onContinue={goNext}
            />
          }
        />
      )
    }

    case 'sleep':
      return (
        <ScreenShell {...SLEEP_SCREEN} headingSize="md" header={header} footer={nextButton()}>
          <OptionGroup<SleepHours>
            legend={SLEEP_SCREEN.heading}
            name="sleepHours"
            options={SLEEP_SCREEN.options}
            value={answers.sleepHours}
            onChange={(value) => setAnswers({ sleepHours: value })}
          />
        </ScreenShell>
      )

    case 'stress':
      return (
        <ScreenShell {...STRESS_SCREEN} header={header} footer={nextButton()}>
          <OptionGroup<StressLevel>
            legend={STRESS_SCREEN.heading}
            name="stressLevel"
            options={STRESS_SCREEN.options}
            value={answers.stressLevel}
            onChange={(value) => setAnswers({ stressLevel: value })}
          />
        </ScreenShell>
      )

    case 'goal90':
      return (
        <ScreenShell {...NINETY_DAY_SCREEN} header={header} footer={nextButton()}>
          <TextField
            {...fieldLabel(NINETY_DAY_SCREEN)}
            name="ninetyDayGoalText"
            multiline
            maxLength={500}
            placeholder={NINETY_DAY_SCREEN.placeholder}
            {...text('ninetyDayGoalText')}
            onBlur={() =>
              // The timestamp is part of the handoff — "quoted back at week 8" — so it is
              // stamped when the words are committed, not when the reveal is requested.
              answers.ninetyDayGoalText?.trim() &&
              setAnswers({ ninetyDayGoalAt: new Date().toISOString() })
            }
          />
        </ScreenShell>
      )

    case 'email':
      return (
        <ScreenShell
          {...EMAIL_SCREEN}
          headingSize="md"
          header={header}
          footer={nextButton(EMAIL_SCREEN.cta)}
        >
          <TextField
            {...fieldLabel(EMAIL_SCREEN)}
            name="email"
            type="email"
            placeholder="you@example.com"
            {...text('email')}
          />
        </ScreenShell>
      )
  }
}
