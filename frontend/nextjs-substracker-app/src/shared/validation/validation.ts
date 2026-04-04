import { z } from 'zod'
import { categories, types } from '@/shared/constants/consts'

//VALIDAZIONE W ZOD plugin

export const transactionSchema = z.object({  //creo e definisco uno schema di validazione x una 'transaction'
  type: z.enum(types),  //accept only values within types (e.g.Expense, Income)
  category: z.preprocess( 
    val => (val as string)?.length ? val : undefined, z.string().optional()), //se la str è vuota "" la trasforma in undefined. qui category è opzionale (.optional())
  amount: z.coerce.number().min(1, {
    message: 'Amount must be at least 1'
  }),  //converte auto in number (deve essere >1) (e.g.'20'->20), se non puo essere convertita allora mex
  description: z.string().optional(),  //str opzionale
  created_at: z.string().refine(  //deve essere una str, poi viene validata con .refine()(se la str non è una date allora mex)
    val => !isNaN(Date.parse(val)),
    {
      message: 'Date needs to contain a valid date'
    }
  )
}).refine((data) => {  //business logic
  if (data.type === 'Expense') {  //se type = Expanse, allora category deve esistere e deve essere dentro categories
    return data.category !== undefined && (categories as readonly string[]).includes(data.category)
  }
  return true
}, {  //l'errore viene assegnato al campo category, mex per l'utente
  path: ['category'],
  message: 'Category is required for Expense'
})
