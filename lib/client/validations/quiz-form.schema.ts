import { z } from 'zod'

/**
 * Form-level validation for the four free-text inputs.
 *
 * Kept separate from `lib/server/validations/quiz.schema.ts` — that one validates a whole
 * completed submission at the API boundary, these validate one field at a time as the
 * customer types. The messages here are customer-facing, so they follow the copy layer's
 * direct register: say what is wrong and what to do, no apology.
 */
export const nameFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'We need something to call you')
    .max(60, "That's longer than we can store"),
})

export const selfDescribeFormSchema = z.object({
  sexSelfDescribe: z.string().trim().min(1, 'Tell us how you describe yourself').max(60),
})

export const ninetyDayFormSchema = z.object({
  ninetyDayGoalText: z
    .string()
    .trim()
    .min(1, 'Your clinician reads this back at day 90 — even a few words help')
    .max(500, 'Keep it under 500 characters'),
})

export const emailFormSchema = z.object({
  email: z.email('Enter a valid email address'),
})

export type NameFormData = z.infer<typeof nameFormSchema>
export type SelfDescribeFormData = z.infer<typeof selfDescribeFormSchema>
export type NinetyDayFormData = z.infer<typeof ninetyDayFormSchema>
export type EmailFormData = z.infer<typeof emailFormSchema>
