class olxParser {
    url = "https://www.olx.pl/motoryzacja/samochody/?search%5Border%5D=created_at:desc";
    lastUrl = null;
    adMarker = 'div[data-testid="l-card"]';

    getLinkFromHtml(card) {
        let link = card.find("a").attr("href");
        if (!link || link.includes("otomoto") || link.includes("promoted")) {
            return;
        }

        if (link.startsWith("http")) return link;
        return "https://www.olx.pl" + link;
    };

    getCarAttributes($) {
        let carData = {
            photo: $("img").attr("srcset")?.split(" ")[0] ?? null,
            name: $("div[data-cy='offer_title'] h4[data-nx-name]").text(),
            price: Number($("div[data-testid='ad-price-container'] h3").text().replace(/\D/g, "")),
            brand: $("li[data-testid='breadcrumb-item'] a").last().text().split("-")[0].trim(),
        };

        $("p[data-nx-name=P3]").each((index, element) => {
            let card = $(element).text();

            if (card.includes("Model")) {
                carData.model = card.split(":")[1].trim();
            } else if (card.includes("Rok produkcji")) {
                carData.year = Number(card.split(":")[1].trim());
            } else if (card.includes("Paliwo")) {
                carData.fuelTypes = card.split(":")[1].trim();
            } else if (card.includes("Typ nadwozia")) {
                carData.generation = card.split(":")[1].trim();
            } else if (card.includes("Przebieg")) {
                carData.mileage = Number(card.split(":")[1].replace(/\D/g, ""));
                return false;
            }
        });

        carData.name = carData.brand + " " + carData.model;
        return carData;
    }
}

export default olxParser;