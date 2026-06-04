module.exports = {
    brand: {
        "audi": "1900",
        "bmw": "3500",
        "mercedes-benz": "17200",
        "volkswagen": "25200",
        "toyota": "24100",
        "ford": "9000",
        "renault": "20700",
        "peugeot": "19300",
        "opel": "19000",
        "hyundai": "11600",
        "kia": "13200",
        "nissan": "18700",
        "honda": "11000",
        "mazda": "16800",
        "fiat": "8800",
        "chevrolet": "5600",
        "skoda": "22900",
        "volvo": "25100",
        "land rover": "14800",
        "jeep": "12600",
        "suzuki": "23600",
        "subaru": "23500",
        "mitsubishi": "17700",
        "tesla": "135",
        "citroën": "5900",
        "seat": "22500",
        "dacia": "6600",
        "mini": "17500",
        "porsche": "20100",
        "alfa romeo": "900",
        "lexus": "15200",
    },
    generation: {
        "Kabriolet": {
            "olx": "cabriolet",
            "otomoto": "seg-cabrio",
            "mobile": "Cabrio",
            "autoscout24": "2"
        },
        "Sedan": {
            "olx": "sedan",
            "otomoto": "seg-sedan",
            "mobile": "Limousine",
            "autoscout24": "6"
        },
        "Сoupe": {
            "olx": "coupe",
            "otomoto": "seg-coupe",
            "mobile": "SportsCar",
            "autoscout24": "3"
        },
        "Pickup/SUV": { //?
            "olx": "coupe",
            "otomoto": "seg-suv",
            "mobile": "OffRoad",
            "autoscout24": "12"
        },
        "Małe/Hatchback": {
            "olx": "hatchback",
            "otomoto": "seg-mini",
            "mobile": "SmallCar",
            "autoscout24": "1"
        },
        // "Miejskie": {
        //     "olx": "hatchback",// либо ОСТАЛЬНЫЕ 
        //     "otomoto": "seg-city-car",
        //     "mobile": "SmallCar",
        //     "autoscout24": "1"
        // },
        "Combi": {
            "olx": "estate-car",
            "otomoto": "seg-combi",
            "mobile": "EstateCar",
            "autoscout24": "5"
        },
        "Minivan": {
            "olx": "mvp",
            "otomoto": "seg-minivan",
            "mobile": "EstateCar",//Не знаю
            "autoscout24": "12"//Не знаю
        },
    },
    fuelType: {
        "Benzyna": {
            "olx": "petrol",
            "otomoto": "petrol",
            "mobile": "PETROL",
            "autoscout24": "B"
        },
        "CNG": {
            "olx": "cng",
            "otomoto": "petrol-cng",
            "mobile": "CNG",
            "autoscout24": "C"
        },
        "LPG": {
            "olx": "lpg",
            "otomoto": "petrol-lpg",
            "mobile": "LPG",
            "autoscout24": "L"
        },
        "Diesel": {
            "olx": "diesel",
            "otomoto": "diesel",
            "mobile": "DIESEL",
            "autoscout24": "D"
        },
        "Electric": {
            "olx": "electric",
            "otomoto": "electric",
            "mobile": "ELECTRICITY",
            "autoscout24": "E"
        },
        "Etanol": {
            "olx": "cabriolet",//нету
            "otomoto": "etanol",
            "mobile": "ETHANOL",
            "autoscout24": "M"
        },
        "Hybrid": {
            "olx": "cng",
            "otomoto": "hybrid",
            "mobile": "HYBRID&ft=HYBRID_DIESEL",
            "autoscout24": "3%2C2"
        },
        "Wodór": {
            "olx": "cabriolet",//нету
            "otomoto": "hidrogen",
            "mobile": "HYDROGENIUM",
            "autoscout24": "H"
        },
    },
    // fixedMileageAutoscout: [
    //     2500, 5000, 10000, 20000, 30000, 40000,
    //     50000, 60000, 70000, 80000, 90000, 1000000,
    //     1250000, 1500000, 1750000, 2000000
    // ],
    // fixedPricesAutoscout: [
    //     500, 1000, 1500, 2000, 2500,
    //     3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000,
    //     12500, 15000, 17500, 20000, 25000, 30000, 40000,
    //     50000, 75000, 100000
    // ],
};
// { name: "City", key: "city", options: ["warszawa"] },//Проверить общие страны;