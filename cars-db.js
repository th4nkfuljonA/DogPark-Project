/* ============================================================
   CERTIFIEDCITYWHIPS — CARS DATABASE
   Single source of truth for all vehicle data
   ============================================================ */

const CARS_DB = [
    {
        id: 1,
        name: "Porsche 911 Turbo S",
        year: 2024,
        category: "exotic",
        categoryLabel: "Exotic — Sports",
        price: 349,
        seats: 2,
        mpg: 20,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "AWD",
        hp: "650 HP",
        accel: "2.7 sec",
        topSpeed: "205 mph",
        description: "The pinnacle of sports car engineering. Raw, unadulterated performance wrapped in iconic Porsche design. Every drive is a masterclass in precision.",
        features: ["Sport Chrono", "PASM", "Bose Sound", "Night Vision", "Apple CarPlay", "Heated Seats"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/2021_Porsche_911_992_Turbo_S.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(120,8,23,0.5), rgba(60,0,10,0.7))"
    },
    {
        id: 2,
        name: "Range Rover Autobiography",
        year: 2024,
        category: "suv",
        categoryLabel: "SUV — Luxury",
        price: 319,
        seats: 5,
        mpg: 22,
        transmission: "Auto",
        fuel: "Hybrid",
        drivetrain: "AWD",
        hp: "530 HP",
        accel: "5.1 sec",
        topSpeed: "155 mph",
        description: "The ultimate luxury SUV. Commanding presence meets extraordinary refinement. Perfect for executives and families who refuse to compromise.",
        features: ["Meridian Sound", "Massage Seats", "Air Suspension", "Panoramic Roof", "4×4", "Night Vision"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/2022_Range_Rover_Autobiography_Auto.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(26,42,94,0.4), rgba(13,21,47,0.6))"
    },
    {
        id: 3,
        name: "Mercedes S-Class AMG",
        year: 2024,
        category: "sedan",
        categoryLabel: "Sedan — Luxury",
        price: 289,
        seats: 5,
        mpg: 25,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "RWD",
        hp: "503 HP",
        accel: "4.4 sec",
        topSpeed: "155 mph",
        description: "The benchmark of automotive luxury. Effortless power meets supreme comfort. The S-Class AMG sets the standard that all others aspire to reach.",
        features: ["Burmester 4D", "Rear Executive Seats", "MBUX", "E-Active Body", "AR Navigation", "Massage Seats"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/76/2021_Mercedes-Benz_S-Class_%28W223%29_AMG_Line_sedan%2C_front_8.15.21.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(20,10,40,0.5), rgba(10,5,20,0.7))"
    },
    {
        id: 4,
        name: "Lamborghini Huracán",
        year: 2023,
        category: "exotic",
        categoryLabel: "Exotic — Supercar",
        price: 599,
        seats: 2,
        mpg: 15,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "AWD",
        hp: "631 HP",
        accel: "2.9 sec",
        topSpeed: "202 mph",
        description: "A visceral supercar experience. Every drive is an event you'll never forget. The Huracán's naturally aspirated V10 is a symphony of pure aggression.",
        features: ["Carbon Fiber", "Lifting System", "Alcantara Interior", "Sport Exhaust", "Rear Camera", "Launch Control"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Lamborghini_Huracan_%2824246143269%29.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(160,10,28,0.5), rgba(80,0,14,0.7))"
    },
    {
        id: 5,
        name: "BMW M4 Competition",
        year: 2024,
        category: "sedan",
        categoryLabel: "Sedan — Sport",
        price: 219,
        seats: 4,
        mpg: 24,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "RWD",
        hp: "503 HP",
        accel: "3.4 sec",
        topSpeed: "180 mph",
        description: "The perfect blend of track performance and daily usability. Pure driving pleasure in every corner — the M4 Competition is a driver's dream.",
        features: ["M Sport Seats", "Harman Kardon", "M Drive Pro", "Adaptive M Suspension", "HUD", "Wireless CarPlay"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/17/2021_BMW_M4_Competition_Automatic_3.0_Front.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(20,40,20,0.5), rgba(10,20,10,0.7))"
    },
    {
        id: 6,
        name: "Bentley Continental GT",
        year: 2024,
        category: "exotic",
        categoryLabel: "Exotic — Grand Tourer",
        price: 499,
        seats: 4,
        mpg: 22,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "AWD",
        hp: "659 HP",
        accel: "3.6 sec",
        topSpeed: "207 mph",
        description: "Handcrafted British excellence. The grand tourer that defines the genre — effortless power, unmatched luxury, and a presence that commands every room.",
        features: ["Naim Audio", "Rotating Display", "Handcrafted Interior", "Air Suspension", "Night Vision", "Massage Seats"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Bentley_Continental_GT_V8_S_%28front%29.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(20,15,35,0.5), rgba(10,8,18,0.7))"
    },
    {
        id: 7,
        name: "Cadillac Escalade ESV",
        year: 2024,
        category: "suv",
        categoryLabel: "SUV — Full Size",
        price: 249,
        seats: 8,
        mpg: 17,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "AWD",
        hp: "420 HP",
        accel: "5.9 sec",
        topSpeed: "130 mph",
        description: "American luxury at its finest. Commanding, spacious, and impossibly comfortable. The Escalade ESV is the gold standard of full-size SUVs.",
        features: ["AKG Sound", "Curved OLED", "Super Cruise", "Air Ride", "Panoramic Sunroof", "Rear Entertainment"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/2021_Cadillac_Escalade_ESV%2C_front_6.2.21.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(40,20,60,0.4), rgba(20,10,30,0.6))"
    },
    {
        id: 8,
        name: "Audi A3 Premium",
        year: 2024,
        category: "sedan",
        categoryLabel: "Sedan — Premium",
        price: 89,
        seats: 5,
        mpg: 32,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "FWD",
        hp: "201 HP",
        accel: "6.6 sec",
        topSpeed: "130 mph",
        description: "Premium quality without the premium price. Smart, efficient, and refined — the Audi A3 is the perfect city companion for every occasion.",
        features: ["Virtual Cockpit", "MMI Navigation", "Wireless Charging", "LED Headlights", "Parking Assist", "Apple CarPlay"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/2021_Audi_A3_Sedan_S-Line_%28facelift%29%2C_front_11.2.21.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(15,25,55,0.4), rgba(8,12,28,0.6))"
    },
    {
        id: 9,
        name: "BMW X7 M60i",
        year: 2024,
        category: "suv",
        categoryLabel: "SUV — Sport",
        price: 199,
        seats: 7,
        mpg: 21,
        transmission: "Auto",
        fuel: "Petrol",
        drivetrain: "xDrive AWD",
        hp: "523 HP",
        accel: "4.7 sec",
        topSpeed: "155 mph",
        description: "Where sport meets luxury. The BMW X7 M60i delivers exhilarating performance without sacrificing an ounce of comfort or practicality.",
        features: ["Bowers & Wilkins", "Curved Display", "Sky Lounge Roof", "Massage Seats", "Driving Assistant Pro", "Wireless CarPlay"],
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/2019_BMW_X7_xDrive30d_M_Sport_3.0_Front.jpg",
        fallbackGradient: "linear-gradient(135deg, rgba(10,30,60,0.5), rgba(5,15,35,0.6))"
    }
];

/* ── Helper Functions ──────────────────────────────────────── */

function getCarById(id) {
    return CARS_DB.find(c => c.id === parseInt(id));
}

function getCarsByCategory(category) {
    if (!category || category === 'all') return CARS_DB;
    return CARS_DB.filter(c => c.category === category);
}

function searchCars(query) {
    if (!query) return [];
    const q = query.toLowerCase().trim();
    return CARS_DB.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.features.some(f => f.toLowerCase().includes(q))
    );
}

function getRelatedCars(carId, limit = 3) {
    const car = getCarById(carId);
    if (!car) return [];
    return CARS_DB
        .filter(c => c.id !== car.id && (c.category === car.category || Math.abs(c.price - car.price) < 150))
        .slice(0, limit);
}
