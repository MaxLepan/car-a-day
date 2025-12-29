import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.car.createMany({
    data: [
      {
        make: "Toyota",
        model: "Corolla",
        generation: "E140",
        originCountry: "Japan",
        bodyType: "Sedan",
        fuelType: "Petrol",
        transmission: "Manual",
        yearStart: 2006,
        yearEnd: 2013,
        powerHp: 132
      },
      {
        make: "Volkswagen",
        model: "Golf",
        generation: "Mk7",
        originCountry: "Germany",
        bodyType: "Hatchback",
        fuelType: "Diesel",
        transmission: "Automatic",
        yearStart: 2012,
        yearEnd: 2020,
        powerHp: 150
      },
      {
        make: "Ford",
        model: "Mustang",
        generation: "S550",
        originCountry: "USA",
        bodyType: "Coupe",
        fuelType: "Petrol",
        transmission: "Manual",
        yearStart: 2015,
        yearEnd: null,
        powerHp: 450
      },
      {
        make: "Tesla",
        model: "Model 3",
        generation: null,
        originCountry: "USA",
        bodyType: "Sedan",
        fuelType: "Electric",
        transmission: "Automatic",
        yearStart: 2017,
        yearEnd: null,
        powerHp: 283
      },
      {
        make: "BMW",
        model: "3 Series",
        generation: "E90",
        originCountry: "Germany",
        bodyType: "Sedan",
        fuelType: "Petrol",
        transmission: "Automatic",
        yearStart: 2005,
        yearEnd: 2013,
        powerHp: 231
      },
      {
        make: "Honda",
        model: "Civic",
        generation: "FK8",
        originCountry: "Japan",
        bodyType: "Hatchback",
        fuelType: "Petrol",
        transmission: "Manual",
        yearStart: 2017,
        yearEnd: 2021,
        powerHp: 306
      },
      {
        make: "Renault",
        model: "Clio",
        generation: "IV",
        originCountry: "France",
        bodyType: "Hatchback",
        fuelType: "Petrol",
        transmission: "Manual",
        yearStart: 2012,
        yearEnd: 2019,
        powerHp: 90
      },
      {
        make: "Audi",
        model: "A4",
        generation: "B9",
        originCountry: "Germany",
        bodyType: "Sedan",
        fuelType: "Diesel",
        transmission: "Automatic",
        yearStart: 2015,
        yearEnd: null,
        powerHp: 190
      }
    ]
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
