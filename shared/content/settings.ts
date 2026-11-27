import { z } from 'zod'
import { requiredText } from './fields'

export const CompanySchema = z.object({
  phone: requiredText,
  email: z.string().trim().email(),
  address: requiredText,
})

export type Company = z.infer<typeof CompanySchema>

export const DealerSchema = z.object({
  name: requiredText,
  region: requiredText,
  address: requiredText,
  phone: requiredText,
  hours: requiredText,
  dealer: z.boolean().default(true),
  service: z.boolean().default(false),
  /** Shows a "details are being confirmed" note next to the dealer. */
  placeholder: z.boolean().default(false),
  /** Pin position on the Kazakhstan SVG map (viewBox coordinates). */
  cx: z.number().finite(),
  cy: z.number().finite(),
  /** Positive value pushes the pin label below the pin. */
  labelOffsetY: z.number().finite().optional(),
})

export const DealersSchema = z.object({ dealers: z.array(DealerSchema) })

export type Dealer = z.infer<typeof DealerSchema>
export type Dealers = z.infer<typeof DealersSchema>
