export type Lane = 'REPAIR' | 'PERFORM' | 'DEFINE' | 'RESTORE' | 'PT141'

export type SexAtBirth = 'female' | 'male' | 'self_describe'

export type Depth = 'depth_single' | 'depth_layered'

export type RepairSignal =
  'localised_soft_tissue' | 'gut_mucosal' | 'connective_skin' | 'systemic_multisite'

export type RepairQualifier = 'inflammatory_active' | 'inflammatory_intermittent' | 'mechanical'

export type PerformSignal = 'recovery_lag' | 'body_comp_stall' | 'sleep_gh' | 'multidomain_decline'

export type PerformQualifier = 'load_light' | 'load_moderate' | 'load_high' | 'load_elite'

export type DefineSignal = 'subcutaneous' | 'visceral' | 'mixed' | 'metabolic_slowdown'

export type DefineQualifier = 'glp1_naive' | 'glp1_active' | 'glp1_rebound'

export type RestoreSignal = 'skin_visible' | 'circadian' | 'cellular_energy' | 'broad_healthspan'

export type RestoreQualifier = 'rhythm_solid' | 'rhythm_broken' | 'rhythm_shifted' | 'rhythm_fine'

export type Pt141Qualifier = 'desire' | 'arousal' | 'both'

export type DiscriminatorSignal = RepairSignal | PerformSignal | DefineSignal | RestoreSignal

export type Qualifier =
  RepairQualifier | PerformQualifier | DefineQualifier | RestoreQualifier | Pt141Qualifier

export type SleepHours = 'sleep_under_5' | 'sleep_5_6' | 'sleep_6_7' | 'sleep_7_8' | 'sleep_8_plus'

export type StressLevel = 'stress_steady' | 'stress_managing' | 'stress_stretched' | 'stress_empty'

export interface QuizAnswers {
  firstName: string
  sexAtBirth: SexAtBirth
  sexSelfDescribe?: string
  lane: Lane
  depth: Depth
  secondaryLanes: Lane[]
  discriminator: DiscriminatorSignal[]
  qualifier: Qualifier
  sleepHours: SleepHours
  stressLevel: StressLevel
  ninetyDayGoalText: string
  ninetyDayGoalAt: string
  email: string
}

export type QuizAnswersDraft = Partial<QuizAnswers>
