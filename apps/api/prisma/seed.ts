import { PrismaClient, BodyType, FuelType, Transmission } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.dailyPuzzle.deleteMany();
  await prisma.carVariant.deleteMany();
  await prisma.carModel.deleteMany();

  await prisma.carModel.create({
    data: {
      make: "Toyota",
      model: "Corolla",
      generation: "E140",
      bodyType: BodyType.SEDAN,
      countryOfOrigin: "Japan",
      productionStartYear: 2006,
      productionEndYear: 2013,
      variants: {
        create: [
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 132,
            engineType: "I4",
            displacementCc: 1798,
            maxSpeedKmh: 200,
            zeroToHundredSec: 10.2
          },
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 140,
            engineType: "I4",
            displacementCc: 1798,
            maxSpeedKmh: 205,
            zeroToHundredSec: 9.8
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Volkswagen",
      model: "Golf",
      generation: "Mk7",
      bodyType: BodyType.HATCHBACK,
      countryOfOrigin: "Germany",
      productionStartYear: 2012,
      productionEndYear: 2020,
      variants: {
        create: [
          {
            fuelType: FuelType.DIESEL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 150,
            engineType: "I4",
            displacementCc: 1968,
            maxSpeedKmh: 216,
            zeroToHundredSec: 8.8
          },
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 125,
            engineType: "I4",
            displacementCc: 1395,
            maxSpeedKmh: 204,
            zeroToHundredSec: 9.9
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Ford",
      model: "Mustang",
      generation: "S550",
      bodyType: BodyType.COUPE,
      countryOfOrigin: "USA",
      productionStartYear: 2015,
      productionEndYear: null,
      variants: {
        create: [
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 450,
            engineType: "V8",
            displacementCc: 4951,
            maxSpeedKmh: 250,
            zeroToHundredSec: 4.6
          },
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 310,
            engineType: "I4",
            displacementCc: 2261,
            maxSpeedKmh: 233,
            zeroToHundredSec: 5.6
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Tesla",
      model: "Model 3",
      generation: null,
      bodyType: BodyType.SEDAN,
      countryOfOrigin: "USA",
      productionStartYear: 2017,
      productionEndYear: null,
      variants: {
        create: [
          {
            fuelType: FuelType.ELECTRIC,
            transmission: Transmission.AUTOMATIC,
            powerHp: 283,
            engineType: null,
            displacementCc: null,
            maxSpeedKmh: 225,
            zeroToHundredSec: 5.6
          },
          {
            fuelType: FuelType.ELECTRIC,
            transmission: Transmission.AUTOMATIC,
            powerHp: 498,
            engineType: null,
            displacementCc: null,
            maxSpeedKmh: 261,
            zeroToHundredSec: 3.3
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "BMW",
      model: "3 Series",
      generation: "E90",
      bodyType: BodyType.SEDAN,
      countryOfOrigin: "Germany",
      productionStartYear: 2005,
      productionEndYear: 2013,
      variants: {
        create: [
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 231,
            engineType: "I6",
            displacementCc: 2996,
            maxSpeedKmh: 250,
            zeroToHundredSec: 6.1
          },
          {
            fuelType: FuelType.DIESEL,
            transmission: Transmission.MANUAL,
            powerHp: 177,
            engineType: "I4",
            displacementCc: 1995,
            maxSpeedKmh: 228,
            zeroToHundredSec: 7.9
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Honda",
      model: "Civic",
      generation: "FK8",
      bodyType: BodyType.HATCHBACK,
      countryOfOrigin: "Japan",
      productionStartYear: 2017,
      productionEndYear: 2021,
      variants: {
        create: [
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 306,
            engineType: "I4",
            displacementCc: 1996,
            maxSpeedKmh: 272,
            zeroToHundredSec: 5.7
          },
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 182,
            engineType: "I4",
            displacementCc: 1498,
            maxSpeedKmh: 220,
            zeroToHundredSec: 8.5
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Renault",
      model: "Clio",
      generation: "IV",
      bodyType: BodyType.HATCHBACK,
      countryOfOrigin: "France",
      productionStartYear: 2012,
      productionEndYear: 2019,
      variants: {
        create: [
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 90,
            engineType: "I3",
            displacementCc: 898,
            maxSpeedKmh: 180,
            zeroToHundredSec: 12.2
          },
          {
            fuelType: FuelType.DIESEL,
            transmission: Transmission.MANUAL,
            powerHp: 90,
            engineType: "I4",
            displacementCc: 1461,
            maxSpeedKmh: 178,
            zeroToHundredSec: 11.9
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Audi",
      model: "A4",
      generation: "B9",
      bodyType: BodyType.SEDAN,
      countryOfOrigin: "Germany",
      productionStartYear: 2015,
      productionEndYear: null,
      variants: {
        create: [
          {
            fuelType: FuelType.DIESEL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 190,
            engineType: "I4",
            displacementCc: 1968,
            maxSpeedKmh: 238,
            zeroToHundredSec: 7.7
          },
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 252,
            engineType: "I4",
            displacementCc: 1984,
            maxSpeedKmh: 250,
            zeroToHundredSec: 5.8
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Mazda",
      model: "MX-5",
      generation: "ND",
      bodyType: BodyType.CONVERTIBLE,
      countryOfOrigin: "Japan",
      productionStartYear: 2015,
      productionEndYear: null,
      variants: {
        create: [
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.MANUAL,
            powerHp: 160,
            engineType: "I4",
            displacementCc: 1998,
            maxSpeedKmh: 214,
            zeroToHundredSec: 7.3
          },
          {
            fuelType: FuelType.PETROL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 131,
            engineType: "I4",
            displacementCc: 1496,
            maxSpeedKmh: 204,
            zeroToHundredSec: 8.3
          }
        ]
      }
    }
  });

  await prisma.carModel.create({
    data: {
      make: "Volvo",
      model: "XC60",
      generation: "II",
      bodyType: BodyType.SUV,
      countryOfOrigin: "Sweden",
      productionStartYear: 2017,
      productionEndYear: null,
      variants: {
        create: [
          {
            fuelType: FuelType.DIESEL,
            transmission: Transmission.AUTOMATIC,
            powerHp: 190,
            engineType: "I4",
            displacementCc: 1969,
            maxSpeedKmh: 205,
            zeroToHundredSec: 7.9
          },
          {
            fuelType: FuelType.HYBRID,
            transmission: Transmission.AUTOMATIC,
            powerHp: 390,
            engineType: "I4",
            displacementCc: 1969,
            maxSpeedKmh: 230,
            zeroToHundredSec: 5.3
          }
        ]
      }
    }
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
