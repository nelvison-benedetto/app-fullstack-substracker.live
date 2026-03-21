export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
    //API JavaScript integrata per formattare numeri, primo param è 'en-US', secondo param formatta come valuta EUR, poi applica la formattazione.
}
