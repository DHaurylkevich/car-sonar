class otomotoParser {
    url = "https://www.otomoto.pl/osobowe?search%5Border%5D=created_at_first%3Adesc";
    lastUrl = null;
    adMarker = "article[data-id]";

    getLinkFromHtml(card) {
        return card.find("h2 a").attr("href");
    };

    getCarAttributes($) {
        let brand = $("[data-testid='make'] p").text().split("pojazdu")[1];
        let model = $("[data-testid='model'] p").text().split("pojazdu")[1];
        return {
            photo: $("img[data-testid='gallery-image-1']").attr("srcset")?.split(" ")[0] ?? null,
            name: brand + " " + model,
            brand: brand,
            model: model,
            generation: $("[data-testid='body_type'] p").text().split("nadwozia")[1],
            fuelTypes: $("[data-testid='fuel_type'] p").text().split("paliwa")[1],
            year: Number($("[data-testid='year'] p").text().replace(/\D/g, "")),
            mileage: Number($("[data-testid='mileage'] p").text().replace(/\D/g, "")),
            price: Number($(".offer-price__number").text().replace(/\D/g, ""))
        };
    }
}

export default otomotoParser;