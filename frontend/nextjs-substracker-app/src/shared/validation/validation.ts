import { z } from 'zod'
import { categories, types } from '@/shared/constants/consts'

export const transactionSchema = z.object({  //creo e definisco uno schema di validazione x una 'transaction'
  type: z.enum(types),
  category: z.preprocess( 
    val => (val as string)?.length ? val : undefined, z.string().optional()), //se la str è vuota "" la trasforma in undefined. qui category è opzionale (.optional())
  amount: z.coerce.number().min(1, {
    message: 'Amount must be at least 1'
  }),  //converte auto in number (deve essere >1), se non puo essere convertita allora mex
  description: z.string().optional(),  //str opzionale
  created_at: z.string().refine(
    val => !isNaN(Date.parse(val)),
    {
      message: 'Date needs to contain a valid date'
    }
  ) //deve essere una str, poi viene validata con .refine()(se la str non è una date allora mex)
}).refine((data) => {
  if (data.type === 'Expense') {
    return data.category !== undefined && (categories as readonly string[]).includes(data.category)
  } //category deve esistere e deve essere dentro categories
  return true
}, {  //l'errore viene assegnato al campo category, mex per l'utente
  path: ['category'],
  message: 'Category is required for Expense'
})
