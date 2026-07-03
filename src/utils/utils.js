// export async function currencyEUR() {
//     const api = 'https://api.nbp.pl/api/exchangerates/rates/a/eur/';
//     const controller = new AbortController();
//     const timeout = setTimeout(() => controller.abort(), 5000);

//     try {
//         const response = await fetch(api, { signal: controller.signal });
//         if (!response.ok) {
//             throw new Error(`HTTP ${response.status}`);
//         }
//         const data = await response.json();
//         const rate = data.rates[0].mid;
//         logger.debug(`EUR rate fetched: ${rate}`);
//         return rate;
//     } catch (error) {
//         logger.error('Error fetching EUR currency:', error);
//         return null; // Return null instead of undefined
//     } finally {
//         clearTimeout(timeout);
//     }
// };

export function dataFormatting(request) {
    return {
        id: request.id,
        brands: request.brandId ?? null,
        fuelTypes: request.fuelId ?? null,
        generations: request.generationId ?? null,
        yearFrom: request.yearFrom ?? null,
        yearTo: request.yearTo ?? null,
        priceFrom: request.priceFrom ?? null,
        priceTo: request.priceTo ?? null,
        mileageFrom: request.mileageFrom ?? null,
        mileageTo: request.mileageTo ?? null,
    }
};

export function isInRange(value, min, max) {
    return (
        (min === null || value >= min) &&
        (max === null || value <= max)
    );
};
