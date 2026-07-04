import { getAllRequestsWithUser } from "../../db/services/requestsService.js";
import { logger } from "../../utils/logger.js";
import { isInRange } from "../../utils/utils.js";

export const getRequestsForSending = async (newSavedCars) => {
    logger.info("Stage of processing requests for sending messages");
    if (!newSavedCars || !newSavedCars.length) {
        logger.warn("No cars found for processing requests");
        return [];
    }

    try {
        let allRequests = await getAllRequestsWithUser();

        if (allRequests.length === 0) {
            logger.info("No matching requests found")
            return []
        };

        return getMatchingRequestsAndCars(allRequests, newSavedCars);
    } catch (err) {
        throw err;
    }
};

export function getMatchingRequestsAndCars(requests, cars) {
    let matchingRequestsAndCars = [];

    for (const car of cars) {
        const matchedRequests = requests.filter(request => {
            return (
                (car.brandId === request.brandId || request.brandId === null) &&
                (car.fuelId === request.fuelId || request.fuelId === null) &&
                (car.generationId === request.generationId || request.generationId === null) &&
                (
                    isInRange(car.year, request.yearFrom, request.yearTo) &&
                    isInRange(car.mileage, request.mileageFrom, request.mileageTo) &&
                    isInRange(car.price, request.priceFrom, request.priceTo)
                )
            )
        });

        if (matchedRequests.length) {
            const telegramIds = matchedRequests.map(r => r.users.telegram_id);
            matchingRequestsAndCars.push({ car, telegramIds });
        }
    }

    return matchingRequestsAndCars;
};