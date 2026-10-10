/* Harper's Space Adventure: game content.
   Facts checked against NASA, ESA and Wikipedia, October 2026.
   Plain script: sets window.GAME_DATA. */
window.GAME_DATA = {
  places: {

    /* ================= THE SUN ================= */
    sun: {
      name: "The Sun",
      kind: "Star · Our very own",
      facts: [
        "The Sun is a star, the closest star to Earth!",
        "About 1.3 million Earths could fit inside the Sun.",
        "Sunlight takes about 8 minutes to reach Earth."
      ],
      more: [
        "The Sun is about 4.6 billion years old. Scientists think it is roughly halfway through its life.",
        "The Sun's surface is about 5,500 °C. Its centre, the core, is about 15 million °C!",
        "The Sun holds about 99.8% of all the stuff in our solar system. Everything else is crumbs!",
        "In December 2024 the Parker Solar Probe zoomed within about 6 million km of the Sun's surface, closer than any spacecraft ever."
      ],
      quiz: [
        { q: "How long does sunlight take to reach Earth?", a: ["About 8 minutes", "About 8 seconds", "About 8 days"], why: "Light is super fast, but the Sun is about 150 million km away, so it takes about 8 minutes." },
        { q: "What is the Sun?", a: ["A star", "A planet", "A giant light bulb"], why: "The Sun is a star, just like the twinkly ones at night, only much closer." },
        { q: "About how many Earths could fit inside the Sun?", a: ["About 1.3 million", "About 10", "Exactly 7"], why: "The Sun is enormous: about 1.3 million Earths would fit inside it." }
      ],
      react: [
        ["dad", "Sunglasses on, crew!"],
        ["harper", "It's a star! Our star!"],
        ["oda", "Is it hot? It looks hot."],
        ["maggie", "*pant pant*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Sun",
      land: { gas: true, note: "The Sun is a giant ball of glowing hot gas, so there is nothing solid to stand on!" }
    },

    /* ================= ROCKY PLANETS ================= */
    mercury: {
      name: "Mercury",
      kind: "Planet · Smallest and closest",
      facts: [
        "Mercury is the smallest planet and the closest to the Sun.",
        "A year on Mercury lasts only 88 Earth days.",
        "Mercury has no moons at all."
      ],
      more: [
        "Mercury has almost no air to hold in heat. Days reach about 430 °C, but nights drop to about -180 °C!",
        "From sunrise to sunrise on Mercury takes about 176 Earth days. That's two whole Mercury years!",
        "Even though it is so close to the Sun, scientists think there is ice hiding in deep craters near Mercury's poles, where sunlight never reaches.",
        "Mercury is slowly shrinking as its insides cool down, which made long wrinkly cliffs across its surface."
      ],
      quiz: [
        { q: "Which planet is closest to the Sun?", a: ["Mercury", "Neptune", "Earth"], why: "Mercury is the closest planet to the Sun, and the smallest too." },
        { q: "How long is a year on Mercury?", a: ["88 Earth days", "88 Earth years", "88 minutes"], why: "Mercury zips around the Sun in just 88 Earth days." },
        { q: "How many moons does Mercury have?", a: ["None", "Two", "Fifty"], why: "Mercury and Venus are the only planets with no moons." }
      ],
      react: [
        ["oda", "It looks like our Moon!"],
        ["harper", "Smallest planet, here we are!"],
        ["dad", "Mercury's having a hot day!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Mercury_(planet)",
      land: { g: 0.38, temp: "about 430 °C by day, -180 °C at night", sky: "#000000", ground: "#8f8a84", ground2: "#68635e", note: "The sky is black even in the daytime, because Mercury has almost no air!", inSky: null }
    },

    venus: {
      name: "Venus",
      kind: "Planet · Hottest of all",
      facts: [
        "Venus is the hottest planet, about 465 °C. Hot enough to melt lead!",
        "Venus spins backwards, so the Sun rises in the west.",
        "A day on Venus is longer than its whole year!"
      ],
      more: [
        "Venus is covered in thick clouds of sulfuric acid. They trap heat like a giant blanket, which is why it is even hotter than Mercury.",
        "The air on Venus pushes down about 90 times harder than on Earth. That's like being about 900 metres under the sea!",
        "Venus takes 243 Earth days to spin once, but only 225 Earth days to go around the Sun.",
        "In 1970 the Soviet Venera 7 probe became the first spacecraft to land on another planet. Later Venera landers sent back photos but lasted only a couple of hours."
      ],
      quiz: [
        { q: "Which is the hottest planet?", a: ["Venus", "Mercury", "Neptune"], why: "Venus's thick clouds trap heat, so it is even hotter than Mercury." },
        { q: "Which way does the Sun rise on Venus?", a: ["In the west", "In the east", "It pops up from the middle"], why: "Venus spins backwards compared to Earth, so the Sun rises in the west." },
        { q: "What are Venus's clouds made of?", a: ["Sulfuric acid", "Candyfloss", "Snow"], why: "Venus has thick clouds of sulfuric acid, so it's not a nice place for a picnic." }
      ],
      react: [
        ["mum", "Phew, it's roasting!"],
        ["maggie", "*pant pant pant*"],
        ["oda", "Can we open a window?"],
        ["dad", "Who turned the heating up?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Venus",
      land: { g: 0.90, temp: "about 465 °C, day and night", sky: "#d9a35a", ground: "#7a5c3e", ground2: "#5a4430", note: "Real astronauts couldn't survive Venus's heat and squashing air, but your game spacesuit is magic!", inSky: null }
    },

    earth: {
      name: "Earth",
      kind: "Planet · Home!",
      facts: [
        "Earth is the only planet we know of with life, including Joules and Maggie!",
        "About 71% of Earth is covered in water.",
        "Earth is the only planet not named after a god or goddess."
      ],
      more: [
        "Earth's air is mostly nitrogen, with about one fifth oxygen. That oxygen is what we breathe!",
        "Earth zooms around the Sun at about 107,000 km per hour. You are flying through space right now!",
        "Earth is the densest planet in the solar system, because it has a heavy iron and nickel core.",
        "The highest place on Earth is the top of Mount Everest, about 8,849 metres above sea level."
      ],
      quiz: [
        { q: "About how much of Earth is covered in water?", a: ["About 7 out of 10 parts", "About 1 out of 10 parts", "All of it"], why: "About 71% of Earth's surface is ocean, lakes and rivers." },
        { q: "What gas in Earth's air do we breathe to live?", a: ["Oxygen", "Helium", "Bubblegum gas"], why: "We breathe oxygen, which is about one fifth of Earth's air." },
        { q: "How many moons does Earth have?", a: ["One", "None", "A hundred"], why: "Earth has one big Moon, which we can see in the sky." }
      ],
      react: [
        ["oda", "I can see our house!"],
        ["joules", "Woof!"],
        ["mum", "Home sweet home."],
        ["maggie", "Arf arf!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Earth",
      land: { g: 1, temp: "about 15 °C on average", sky: "#87ceeb", ground: "#4f8a3c", ground2: "#c2b280", note: "This is home! You don't even need a spacesuit here.", inSky: "moon" }
    },

    moon: {
      name: "The Moon",
      kind: "Earth's moon",
      facts: [
        "The Moon is about 384,000 km away. Light gets there in just over 1 second.",
        "12 astronauts have walked on the Moon.",
        "The same side of the Moon always faces Earth."
      ],
      more: [
        "The 12 Moon walkers visited between 1969 and 1972 on NASA's Apollo missions. Neil Armstrong was the first.",
        "The Moon has no wind or rain, so astronauts' footprints could stay there for a very, very long time.",
        "The Moon is slowly drifting away from Earth, about 3.8 cm every year. That's about as fast as your fingernails grow!",
        "In April 2026, the four Artemis II astronauts flew all the way around the Moon and splashed down safely back on Earth."
      ],
      quiz: [
        { q: "How many people have walked on the Moon?", a: ["12", "2", "1,000"], why: "Twelve astronauts walked on the Moon between 1969 and 1972." },
        { q: "Why do astronaut footprints stay on the Moon?", a: ["There's no wind or rain", "The Moon glues them down", "Moon rabbits guard them"], why: "With no wind or rain to wipe them away, the footprints just stay." },
        { q: "Who was the first person to walk on the Moon?", a: ["Neil Armstrong", "Buzz Lightyear", "Isaac Newton"], why: "Neil Armstrong stepped onto the Moon in July 1969." }
      ],
      react: [
        ["oda", "Can we bounce on it?"],
        ["dad", "One small step for Dad…"],
        ["harper", "We can see Earth from here!"],
        ["joules", "Awoo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Moon",
      land: { g: 0.165, temp: "about 120 °C by day, -170 °C at night", sky: "#000000", ground: "#9a9a9a", ground2: "#6f6f6f", note: "You weigh about one sixth as much here, so every step is a big bouncy hop!", inSky: "earth" }
    },

    mars: {
      name: "Mars",
      kind: "Planet · The Red Planet",
      facts: [
        "Mars is red because its dust is full of rusty iron.",
        "Mars has the biggest volcano in the solar system, Olympus Mons.",
        "Mars has two small moons called Phobos and Deimos."
      ],
      more: [
        "Olympus Mons is about 22 km tall, roughly two and a half times as tall as Mount Everest.",
        "On Mars the daytime sky looks a pinky-butterscotch colour, but sunsets look blue! It's the dust that does it.",
        "Robot rovers like Curiosity and Perseverance explore Mars for us. In 2021 the little Ingenuity helicopter made the first powered flight on another planet.",
        "A day on Mars is about 24 hours and 37 minutes, very close to an Earth day. Scientists call a Mars day a 'sol'."
      ],
      quiz: [
        { q: "Why is Mars red?", a: ["Rusty dust", "It's very hot", "Red paint"], why: "Mars's dust has lots of iron in it that has gone rusty." },
        { q: "What colour are sunsets on Mars?", a: ["Blue", "Green", "Spotty"], why: "Martian dust scatters light in a way that makes sunsets look blue." },
        { q: "What was Ingenuity?", a: ["A little helicopter on Mars", "A Martian dog", "A volcano"], why: "Ingenuity was a small helicopter that flew on Mars, the first powered flight on another planet." }
      ],
      react: [
        ["joules", "WOOF! WOOF!"],
        ["maggie", "Woof woof woof!"],
        ["harper", "They think it's a giant ball!"],
        ["oda", "Where are the Martians?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Mars",
      land: { g: 0.38, temp: "about -60 °C", sky: "#c9a27a", ground: "#b5582e", ground2: "#8a3f22", note: "You'd need a spacesuit to breathe here, but you could jump almost three times higher than on Earth!", inSky: null }
    },

    belt: {
      name: "Asteroid belt",
      kind: "Rocks between Mars and Jupiter · Ceres",
      facts: [
        "The asteroid belt is a ring of rocky chunks between Mars and Jupiter.",
        "The biggest one, Ceres (in front of you), is a dwarf planet, like Pluto!",
        "The asteroids are so spread out that spacecraft fly through without bumping!"
      ],
      more: [
        "Ceres is about 940 km across. It was discovered in 1801 by an Italian astronomer called Giuseppe Piazzi.",
        "NASA's Dawn spacecraft orbited Ceres from 2015 to 2018. It found mysterious bright spots, which turned out to be salty crust.",
        "If you squashed every asteroid in the belt together, it would still be much smaller than our Moon.",
        "Scientists think the asteroids are leftover building bits from when the planets formed, about 4.6 billion years ago."
      ],
      quiz: [
        { q: "What is Ceres?", a: ["A dwarf planet", "A star", "A moon of Mars"], why: "Ceres is the biggest object in the asteroid belt and counts as a dwarf planet." },
        { q: "Where is the asteroid belt?", a: ["Between Mars and Jupiter", "Inside the Sun", "Around Oda's bedroom"], why: "The asteroid belt sits between the orbits of Mars and Jupiter." },
        { q: "What were Ceres's bright spots made of?", a: ["Salty crust", "Torches", "Diamonds"], why: "Dawn found the bright spots were salts left behind by salty water." }
      ],
      react: [
        ["dad", "Mind the rocks, Captain!"],
        ["oda", "Rocks! Can I keep one?"],
        ["harper", "Ceres is a dwarf planet too!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Ceres_(dwarf_planet)",
      land: { g: 0.029, temp: "about -105 °C", sky: "#000000", ground: "#5a5650", ground2: "#d8d4cc", note: "You're standing on Ceres! The gravity is so weak, one big jump could send you flying a long way.", inSky: null }
    },

    ceres: {
      name: "Ceres",
      kind: "Dwarf planet · Queen of the asteroid belt",
      facts: [
        "Ceres is the biggest thing in the asteroid belt, about 940 km wide!",
        "It's the only dwarf planet in the inner solar system.",
        "Ceres is named after the Roman goddess of farming. That's where the word 'cereal' comes from!"
      ],
      more: [
        "Giuseppe Piazzi spotted Ceres on 1 January 1801. For about 50 years people called it a planet!",
        "In 2006 Ceres became a dwarf planet, on the very same day as Pluto. Harper's favourite has a friend!",
        "NASA's Dawn spacecraft orbited Ceres from 2015 to 2018. It found shiny salty patches and a lonely ice mountain called Ahuna Mons.",
        "Scientists think there is salty water, called brine, hiding deep under Ceres's surface."
      ],
      quiz: [
        { q: "Which breakfast word comes from Ceres?", a: ["Cereal", "Toast", "Jam"], why: "Ceres was the Roman goddess of farming and grain, and that gave us the word cereal." },
        { q: "Where does Ceres live?", a: ["In the asteroid belt", "Inside Jupiter", "In Dad's sock drawer"], why: "Ceres orbits the Sun in the asteroid belt, between Mars and Jupiter." },
        { q: "Which spacecraft orbited Ceres?", a: ["Dawn", "Dusk", "Teatime"], why: "NASA's Dawn spacecraft orbited Ceres from 2015 to 2018." }
      ],
      react: [
        ["harper", "A dwarf planet, just like Pluto!"],
        ["oda", "Can I have cereal on Ceres?"],
        ["dad", "Snap, crackle and pop!"],
        ["joules", "Woof! *sniffs for crumbs*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Ceres_(dwarf_planet)",
      land: { g: 0.029, temp: "about -105 °C", sky: "#000000", ground: "#5a5650", ground2: "#d8d4cc", note: "Look out for shiny salty patches! Gravity is so weak that a jump sends you sailing.", inSky: null }
    },

    phobos: {
      name: "Phobos",
      kind: "Moon of Mars · The speedy potato",
      facts: [
        "Phobos is a lumpy moon shaped a bit like a potato!",
        "It whizzes round Mars about three times a day.",
        "Phobos is slowly spiralling down towards Mars."
      ],
      more: [
        "Phobos is only about 22 km across. That's less than half as wide as London! A giant crater called Stickney covers a big chunk of it.",
        "It orbits about 6,000 km above Mars, closer to its planet than any other known moon. Seen from Mars, it rises in the west and sets in the east!",
        "Scientists think that in about 30 to 50 million years Phobos will break up into a ring round Mars, or crash into it.",
        "Asaph Hall discovered Phobos in 1877. Phobos means 'fear' in Greek. Japan's MMX mission aims to bring bits of Phobos back to Earth."
      ],
      quiz: [
        { q: "What shape is Phobos?", a: ["Lumpy, like a potato", "A perfect cube", "A doughnut"], why: "Phobos is too small for gravity to pull it round, so it's a lumpy potato shape." },
        { q: "How often does Phobos go round Mars?", a: ["About three times a day", "Once every 100 years", "Never, it's stuck"], why: "Phobos zooms round Mars in about 7 and a half hours." },
        { q: "What will happen to Phobos one day?", a: ["Break up or crash into Mars", "Turn into a star", "Fly to Pluto"], why: "Scientists think Mars's gravity will pull Phobos apart in tens of millions of years." }
      ],
      react: [
        ["oda", "A space potato!"],
        ["dad", "Mash, chips or roast?"],
        ["harper", "Mars looks huge from here!"],
        ["maggie", "Arf? *sniff*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Phobos_(moon)",
      land: { g: 0.0006, temp: "about -40 °C", sky: "#000000", ground: "#5e5650", ground2: "#3f3a35", note: "Phobos's gravity is tiny, so tiptoe! Mars fills a giant patch of the sky.", inSky: "mars" }
    },

    deimos: {
      name: "Deimos",
      kind: "Moon of Mars · Little and smooth",
      facts: [
        "Deimos is Mars's smaller moon, only about 12 km across.",
        "From Mars, Deimos just looks like a bright star.",
        "It's covered in a thick blanket of fine dust."
      ],
      more: [
        "Deimos goes round Mars about once every 30 hours, a bit slower than Mars spins.",
        "Deimos means 'dread' in Greek. It and Phobos are named after the sons of Ares, the Greek god of war.",
        "Asaph Hall discovered Deimos in August 1877, just six days before he found Phobos.",
        "Scientists aren't sure where Mars's moons came from. They might be captured asteroids, or bits thrown out when something huge hit Mars."
      ],
      quiz: [
        { q: "What does Deimos look like from Mars?", a: ["A bright star", "A giant face", "A rainbow"], why: "Deimos is so small and far that from Mars it looks like a star." },
        { q: "How many moons does Mars have?", a: ["Two", "Two hundred", "None at all"], why: "Mars has two small moons, Phobos and Deimos." },
        { q: "Who discovered Deimos?", a: ["Asaph Hall", "Maggie the dog", "Robin Hood"], why: "The American astronomer Asaph Hall found both moons of Mars in 1877." }
      ],
      react: [
        ["harper", "It's so tiny!"],
        ["mum", "So smooth and dusty."],
        ["oda", "Can Deimos be my pet moon?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Deimos_(moon)",
      land: { g: 0.0003, temp: "about -40 °C", sky: "#000000", ground: "#9a8b7a", ground2: "#6e6256", note: "Super gentle steps! A big jump here could launch you right off Deimos.", inSky: "mars" }
    },

    /* ================= JUPITER SYSTEM ================= */
    jupiter: {
      name: "Jupiter",
      kind: "Planet · Gas giant",
      facts: [
        "Jupiter is the biggest planet. More than 1,300 Earths could fit inside!",
        "The Great Red Spot is a storm bigger than Earth.",
        "A day on Jupiter is under 10 hours, the shortest of any planet."
      ],
      more: [
        "Jupiter has more than 110 known moons, and astronomers keep finding more.",
        "Jupiter is more than twice as heavy as all the other planets put together!",
        "The Great Red Spot has been swirling for well over 150 years. It is shrinking, but it is still wider than Earth.",
        "NASA's Juno spacecraft has been orbiting Jupiter since 2016. Jupiter has faint, dusty rings too, but they are very hard to see."
      ],
      quiz: [
        { q: "What is Jupiter's Great Red Spot?", a: ["A giant storm", "A volcano", "A red ocean"], why: "The Great Red Spot is a huge storm, wider than our whole planet." },
        { q: "Which is the biggest planet?", a: ["Jupiter", "Earth", "Mercury"], why: "Jupiter is the biggest planet: more than 1,300 Earths could fit inside." },
        { q: "How long is a day on Jupiter?", a: ["Under 10 hours", "A whole year", "5 minutes"], why: "Jupiter spins super fast, once in just under 10 hours." }
      ],
      react: [
        ["mum", "That storm is bigger than Earth!"],
        ["oda", "It's stripy! Like a sweet!"],
        ["leo", "Welcome to the king of planets."],
        ["joules", "Woof?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Jupiter",
      land: { gas: true, note: "Jupiter is made mostly of gas, so there's no ground; you'd just sink into thicker and thicker clouds!" }
    },

    io: {
      name: "Io",
      kind: "Moon of Jupiter · Volcano world",
      facts: [
        "Io is the most volcanic place in the solar system.",
        "Io has hundreds of active volcanoes.",
        "Io is a little bit bigger than our Moon."
      ],
      more: [
        "Some of Io's volcanoes shoot plumes of material hundreds of kilometres high.",
        "Jupiter's strong gravity squeezes and stretches Io, which heats up its insides. That heat powers the volcanoes.",
        "Io's yellow, orange and white colours come from sulfur and frozen sulfur gases.",
        "Io was one of four big moons Galileo Galilei spotted with his telescope in 1610."
      ],
      quiz: [
        { q: "What is Io famous for?", a: ["Volcanoes", "Rainbows", "Trees"], why: "Io has hundreds of active volcanoes, more than anywhere else we know." },
        { q: "What heats Io's insides?", a: ["Jupiter squeezing it", "A giant oven", "Lots of jumpers"], why: "Jupiter's gravity squeezes and stretches Io, making it hot inside." },
        { q: "Who spotted Io in 1610?", a: ["Galileo", "Captain Hook", "Isaac Newton"], why: "Galileo Galilei found Io and three other big moons with his telescope." }
      ],
      react: [
        ["oda", "Volcanoes! Big ones!"],
        ["dad", "Io is having a hot-tempered day!"],
        ["maggie", "*sniff sniff* Eggy!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Io_(moon)",
      land: { g: 0.183, temp: "about -160 °C (but the lava is super hot!)", sky: "#000000", ground: "#e8d36a", ground2: "#c0602a", note: "Watch out for lava! Io is freezing cold except near its bubbling volcanoes.", inSky: "jupiter" }
    },

    europa: {
      name: "Europa",
      kind: "Moon of Jupiter · Ice and ocean",
      facts: [
        "Scientists think Europa has a huge salty ocean under its icy shell.",
        "Europa's ice is criss-crossed with long cracks and stripes.",
        "Europa is a little smaller than our Moon."
      ],
      more: [
        "Scientists think Europa's ocean might hold about twice as much water as all of Earth's oceans.",
        "Because it may have liquid water, Europa is one of the best places to look for life beyond Earth.",
        "NASA's Europa Clipper spacecraft launched in October 2024. It is due to reach Jupiter in 2030.",
        "Europa's icy surface is one of the smoothest in the solar system, with very few big craters."
      ],
      quiz: [
        { q: "What do scientists think is under Europa's ice?", a: ["A salty ocean", "A city", "Nothing at all"], why: "Scientists think a deep salty ocean hides under Europa's ice." },
        { q: "Which spacecraft is on its way to Europa?", a: ["Europa Clipper", "The Millennium Falcon", "A paper aeroplane"], why: "Europa Clipper launched in 2024 and should arrive in 2030." },
        { q: "What are Europa's long stripes?", a: ["Cracks in the ice", "Painted lines", "Roads"], why: "The stripes are cracks and ridges in Europa's icy shell." }
      ],
      react: [
        ["harper", "An ocean under the ice!"],
        ["oda", "Are there space fish?"],
        ["leo", "Nobody knows yet. Good question!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Europa_(moon)",
      land: { g: 0.134, temp: "about -160 °C", sky: "#000000", ground: "#e8e0d0", ground2: "#a8673e", note: "You're standing on ice, and scientists think a deep ocean is hiding far beneath your boots!", inSky: "jupiter" }
    },

    ganymede: {
      name: "Ganymede",
      kind: "Moon of Jupiter · Biggest moon",
      facts: [
        "Ganymede is the biggest moon in the solar system.",
        "It is even bigger than the planet Mercury!",
        "Ganymede is the only moon known to have its own magnetic field."
      ],
      more: [
        "Ganymede is about 5,270 km across, bigger than Mercury, though Mercury is much heavier.",
        "Ganymede's magnetic field makes glowing aurora lights, a bit like Earth's Northern Lights.",
        "Scientists think Ganymede has a salty ocean deep under its ice too.",
        "ESA's JUICE spacecraft launched in 2023. It is planned to reach Jupiter in 2031 and later orbit Ganymede."
      ],
      quiz: [
        { q: "What is special about Ganymede?", a: ["Biggest moon in the solar system", "Smallest moon there is", "It's made of cheese"], why: "Ganymede is the largest moon of all, even bigger than Mercury." },
        { q: "Which planet is smaller than Ganymede?", a: ["Mercury", "Jupiter", "Earth"], why: "Ganymede is wider than the planet Mercury." },
        { q: "What does Ganymede have that no other moon has?", a: ["Its own magnetic field", "A swimming pool", "A pet dog"], why: "Ganymede is the only moon known to make its own magnetic field." }
      ],
      react: [
        ["dad", "What a whopper!"],
        ["harper", "Bigger than a planet!"],
        ["joules", "Arf!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Ganymede_(moon)",
      land: { g: 0.146, temp: "about -160 °C", sky: "#000000", ground: "#8c8378", ground2: "#c9c2b8", note: "You're on the biggest moon in the solar system, and Jupiter fills the sky!", inSky: "jupiter" }
    },

    callisto: {
      name: "Callisto",
      kind: "Moon of Jupiter · Crater world",
      facts: [
        "Callisto is one of the most cratered places we know.",
        "Its surface is very old, about 4 billion years.",
        "Callisto is the third biggest moon in the solar system."
      ],
      more: [
        "Callisto is almost as wide as Mercury. Only Ganymede and Titan are bigger moons.",
        "A giant crash long ago made Valhalla, a huge target-shaped crater with rings thousands of kilometres across.",
        "Callisto's surface has hardly changed for billions of years, so it's like a history book of space crashes.",
        "Scientists think Callisto might have a salty ocean hidden deep inside, but they aren't sure yet."
      ],
      quiz: [
        { q: "What covers Callisto?", a: ["Craters", "Grass", "Clouds of fire"], why: "Callisto is covered in craters from billions of years of space rocks." },
        { q: "How old is Callisto's surface?", a: ["About 4 billion years", "About 4 weeks", "Brand new"], why: "Callisto's surface has barely changed in about 4 billion years." },
        { q: "What is Valhalla on Callisto?", a: ["A giant crater", "A theme park", "A volcano"], why: "Valhalla is a huge ringed crater made by a giant crash long ago." }
      ],
      react: [
        ["oda", "So many holes!"],
        ["dad", "Someone's been playing space darts."],
        ["maggie", "*sniff sniff*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Callisto_(moon)",
      land: { g: 0.126, temp: "about -140 °C", sky: "#000000", ground: "#5d544a", ground2: "#cfc8bd", note: "Craters everywhere! Look up and you'll see Jupiter hanging in the black sky.", inSky: "jupiter" }
    },

    /* ================= SATURN SYSTEM ================= */
    saturn: {
      name: "Saturn",
      kind: "Planet · Ringed giant",
      facts: [
        "Saturn's rings are made of billions of pieces of ice and rock.",
        "Saturn is so light for its size that it would float in a giant bathtub!",
        "Saturn has more known moons than any other planet, over 290!"
      ],
      more: [
        "Saturn's main rings stretch hundreds of thousands of kilometres, but most of them are only about 10 metres thick.",
        "Ring pieces range from tiny grains to chunks as big as a house.",
        "Saturn has a giant six-sided cloud pattern, a hexagon, swirling around its north pole.",
        "NASA's Cassini spacecraft studied Saturn for 13 years. In 2017 it finished its mission by diving into Saturn."
      ],
      quiz: [
        { q: "What are Saturn's rings made of?", a: ["Ice and rock", "Gold", "Clouds"], why: "The rings are billions of bits of ice and rock, all orbiting Saturn." },
        { q: "What would Saturn do in a giant bathtub?", a: ["Float", "Sink", "Sing"], why: "Saturn is less dense than water, so it would float." },
        { q: "What shape is the storm at Saturn's north pole?", a: ["A hexagon", "A circle", "A banana"], why: "Saturn's north pole has a six-sided cloud pattern called the hexagon." }
      ],
      react: [
        ["mum", "Ooooh, the rings!"],
        ["harper", "So beautiful!"],
        ["maggie", "Woof?"],
        ["oda", "Can I have a ring?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Saturn",
      land: { gas: true, note: "Saturn is a giant ball of gas with no solid ground, so you'd sink right in!" }
    },

    titan: {
      name: "Titan",
      kind: "Moon of Saturn · Orange haze",
      facts: [
        "Titan has rivers and lakes, but they're full of liquid methane, not water.",
        "Titan is bigger than the planet Mercury.",
        "Titan is the only moon with thick air."
      ],
      more: [
        "Titan's air is thicker than Earth's. With its weak gravity, scientists say a person could fly by flapping wings strapped to their arms!",
        "In 2005 the Huygens probe landed on Titan. It's still the farthest landing ever made.",
        "Titan is so cold, about -180 °C, that methane, a gas on Earth, falls as rain and fills lakes.",
        "NASA's Dragonfly is a flying robot drone planned to launch in 2028 and explore Titan in the 2030s."
      ],
      quiz: [
        { q: "What fills Titan's lakes?", a: ["Liquid methane", "Lemonade", "Water like ours"], why: "Titan is so cold that methane is liquid and fills its lakes." },
        { q: "What makes Titan special among moons?", a: ["It has thick air", "It's square", "It's made of glass"], why: "Titan is the only moon with a thick atmosphere." },
        { q: "Which probe landed on Titan in 2005?", a: ["Huygens", "Peppa", "Apollo 11"], why: "The Huygens probe parachuted down to Titan's surface in 2005." }
      ],
      react: [
        ["oda", "It's orange!"],
        ["dad", "Methane rain? Pack a brolly."],
        ["harper", "Lakes on another world!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Titan_(moon)",
      land: { g: 0.138, temp: "about -180 °C", sky: "#c8873a", ground: "#6b4a2a", ground2: "#3a2a1a", note: "Real haze would hide Saturn, but in our game it peeks through the orange sky!", inSky: "saturn" }
    },

    enceladus: {
      name: "Enceladus",
      kind: "Moon of Saturn · Ice fountains",
      facts: [
        "Enceladus shoots fountains of icy water into space!",
        "It is one of the shiniest, whitest objects in the solar system.",
        "Enceladus is only about 500 km across."
      ],
      more: [
        "The fountains spray out of long cracks near the south pole, nicknamed 'tiger stripes'.",
        "Scientists think a salty ocean lies under Enceladus's ice, and the fountains come from it.",
        "The Cassini spacecraft flew right through the spray. It found salt and other ingredients that living things use.",
        "Ice from Enceladus's fountains helps make one of Saturn's rings, the wide, faint E ring."
      ],
      quiz: [
        { q: "What shoots out of Enceladus?", a: ["Fountains of icy water", "Fireworks", "Hot chocolate"], why: "Enceladus sprays icy water from cracks near its south pole." },
        { q: "What are the 'tiger stripes'?", a: ["Long cracks near the south pole", "Real tigers", "Painted lines"], why: "The tiger stripes are cracks where the icy fountains come out." },
        { q: "Which spacecraft flew through the fountains?", a: ["Cassini", "A hot-air balloon", "Santa's sleigh"], why: "Cassini flew through the spray and tasted what was in it." }
      ],
      react: [
        ["harper", "Space fountains!"],
        ["oda", "It's like a snowball!"],
        ["joules", "Woof woof!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Enceladus",
      land: { g: 0.0115, temp: "about -200 °C", sky: "#000000", ground: "#f2f6fa", ground2: "#bcd4e6", note: "Gravity is super weak here, so hop gently or you might float off into space!", inSky: "saturn" }
    },

    mimas: {
      name: "Mimas",
      kind: "Moon of Saturn · The Death Star moon",
      facts: [
        "Mimas has one enormous crater that makes it look like the Death Star!",
        "The crater, Herschel, is about 139 km wide, roughly a third of Mimas's whole width.",
        "Scientists think a young, hidden ocean may lie under its ice!"
      ],
      more: [
        "William Herschel discovered Mimas in 1789. Its giant crater is named after him.",
        "Mimas is about 400 km across. Scientists think it's one of the smallest worlds that gravity has pulled into a round shape.",
        "Mimas's gravity helps keep open a big gap in Saturn's rings, called the Cassini Division.",
        "In 2024 scientists said its wobbles hint at an ocean under the ice. They think the ocean formed less than 25 million years ago, which is very young for a moon! The Cassini spacecraft also found a warm-and-cold pattern shaped like Pac-Man!"
      ],
      quiz: [
        { q: "What does Mimas look like?", a: ["The Death Star", "A banana", "A teddy bear"], why: "Its giant crater Herschel makes Mimas look just like the Death Star from Star Wars." },
        { q: "What might be hiding under Mimas's ice?", a: ["An ocean", "A swimming pool full of custard", "A sleeping dragon"], why: "In 2024 scientists said Mimas may have a young ocean deep under its icy shell." },
        { q: "Which planet does Mimas go round?", a: ["Saturn", "Earth", "The Sun's handbag"], why: "Mimas is a small icy moon of Saturn." }
      ],
      react: [
        ["dad", "That's no moon… oh wait, it is."],
        ["harper", "Look at that giant crater!"],
        ["oda", "It's got one big eye!"],
        ["joules", "Woof? *tilts head*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Mimas_(moon)",
      land: { g: 0.0065, temp: "about -200 °C", sky: "#000000", ground: "#d8d8d4", ground2: "#9c9c98", note: "You're on the Death Star moon! Saturn and its rings fill the black sky.", inSky: "saturn" }
    },

    /* ================= ICE GIANTS ================= */
    uranus: {
      name: "Uranus",
      kind: "Planet · Ice giant",
      facts: [
        "Uranus spins on its side, like a ball rolling around the Sun.",
        "Methane gas makes Uranus look blue-green.",
        "One year on Uranus lasts 84 Earth years."
      ],
      more: [
        "Because Uranus is tipped over, each pole gets about 42 years of sunshine, then about 42 years of darkness!",
        "William Herschel discovered Uranus in 1781 from his garden in Bath, England. It was the first planet found with a telescope.",
        "Uranus has 29 known moons. Many are named after characters from Shakespeare's plays.",
        "Only one spacecraft has ever visited Uranus: Voyager 2 flew past in 1986."
      ],
      quiz: [
        { q: "What's funny about how Uranus spins?", a: ["It spins on its side", "It doesn't spin at all", "It spins only on Tuesdays"], why: "Uranus is tipped right over, so it rolls around the Sun on its side." },
        { q: "Where was Uranus discovered?", a: ["In a garden in Bath, England", "On the Moon", "Under a sofa"], why: "William Herschel found Uranus from his home in Bath in 1781." },
        { q: "What makes Uranus blue-green?", a: ["Methane gas", "Blue paint", "Seaweed"], why: "Methane in Uranus's air soaks up red light, so it looks blue-green." }
      ],
      react: [
        ["harper", "It's rolling on its side!"],
        ["dad", "Uranus needs a lie-down too."],
        ["oda", "It's minty coloured!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Uranus",
      land: { gas: true, note: "Uranus has no solid surface to stand on, just thick, freezing gas and slushy ices deep inside." }
    },

    miranda: {
      name: "Miranda",
      kind: "Moon of Uranus · The patchwork moon",
      facts: [
        "Miranda looks like it was stitched together from different pieces!",
        "It has Verona Rupes, the tallest known cliff in the solar system.",
        "Only one spacecraft has ever visited: Voyager 2, in 1986."
      ],
      more: [
        "Miranda is about 470 km across. Gerard Kuiper discovered it in 1948.",
        "Scientists think Verona Rupes could be up to 20 km tall, more than twice the height of Mount Everest. A dropped rock might take about 12 minutes to fall to the bottom!",
        "Nobody knows for sure why Miranda looks so jumbled. Scientists think it was squeezed and stretched by Uranus's pull, or smashed and put back together.",
        "Many of Uranus's moons are named after characters from Shakespeare. Miranda is the heroine of his play The Tempest."
      ],
      quiz: [
        { q: "What is special about Verona Rupes?", a: ["It's the tallest known cliff", "It's made of chocolate", "It sings"], why: "Verona Rupes on Miranda is the tallest known cliff in the solar system." },
        { q: "Which spacecraft visited Miranda?", a: ["Voyager 2", "A hot air balloon", "Santa's sleigh"], why: "Voyager 2 flew past Uranus and Miranda in January 1986." },
        { q: "Who is Miranda named after?", a: ["A character in a Shakespeare play", "A famous cow", "A type of pasta"], why: "Miranda is the heroine of Shakespeare's play The Tempest." }
      ],
      react: [
        ["mum", "It looks like a patchwork quilt!"],
        ["harper", "Look at that enormous cliff!"],
        ["oda", "Don't fall off, Daddy!"],
        ["dad", "I'll stay well back, thank you."]
      ],
      photo: "https://en.wikipedia.org/wiki/Miranda_(moon)",
      land: { g: 0.008, temp: "about -200 °C", sky: "#000000", ground: "#a8a6a2", ground2: "#6e6a66", note: "Watch out for giant cliffs! Uranus hangs in the sky, tipped on its side.", inSky: "uranus" }
    },

    neptune: {
      name: "Neptune",
      kind: "Planet · Ice giant",
      facts: [
        "Neptune has the fastest winds in the solar system, over 2,000 km/h.",
        "One year on Neptune lasts 165 Earth years.",
        "Neptune was found using maths before anyone saw it in a telescope!"
      ],
      more: [
        "In 1846 astronomers worked out where Neptune should be from how it tugged on Uranus. Then they looked and found it!",
        "Neptune is the farthest planet from the Sun, about 30 times farther than Earth.",
        "Neptune has 16 known moons. The biggest by far is Triton.",
        "Voyager 2 is the only spacecraft to visit Neptune. It flew past in 1989 and spotted a giant dark storm."
      ],
      quiz: [
        { q: "How was Neptune first found?", a: ["Using maths", "A dog sniffed it out", "It fell on a farm"], why: "Astronomers used maths to predict where Neptune was, then found it there." },
        { q: "Which planet has the fastest winds?", a: ["Neptune", "Earth", "Mercury"], why: "Neptune's winds blow at over 2,000 km/h." },
        { q: "How long is a year on Neptune?", a: ["165 Earth years", "165 days", "1 week"], why: "Neptune is so far out it takes 165 Earth years to go round the Sun." }
      ],
      react: [
        ["mum", "So blue and windy!"],
        ["dad", "Hold on to your hats!"],
        ["maggie", "Awoo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Neptune",
      land: { gas: true, note: "Neptune is a giant ball of gas and slushy ice, with no ground to land on." }
    },

    triton: {
      name: "Triton",
      kind: "Moon of Neptune · Backwards moon",
      facts: [
        "Triton orbits Neptune backwards, the opposite way to Neptune's spin.",
        "Triton is one of the coldest places ever measured.",
        "Triton has geysers that puff out dark plumes!"
      ],
      more: [
        "Scientists think Triton was once a dwarf planet from the Kuiper belt that Neptune captured.",
        "Triton's surface is about -235 °C. Its frozen nitrogen ground is pinkish in places.",
        "When Voyager 2 flew past in 1989, it saw geysers shooting dark plumes about 8 km high.",
        "Some of Triton's land looks lumpy, like the skin of a melon. Scientists call it 'cantaloupe terrain'."
      ],
      quiz: [
        { q: "What's odd about Triton's orbit?", a: ["It goes backwards", "It's square", "It stops for lunch"], why: "Triton orbits the opposite way to Neptune's spin, which is very unusual for a big moon." },
        { q: "Where do scientists think Triton came from?", a: ["The Kuiper belt", "Mars", "A cereal box"], why: "Scientists think Neptune captured Triton from the Kuiper belt." },
        { q: "Which spacecraft saw Triton's geysers?", a: ["Voyager 2", "A submarine", "Hubble's cousin Bob"], why: "Voyager 2 spotted the geysers when it flew past in 1989." }
      ],
      react: [
        ["oda", "Brrrr! My nose is cold!"],
        ["harper", "A moon going backwards!"],
        ["dad", "Triton's reversing. Beep beep beep!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Triton_(moon)",
      land: { g: 0.079, temp: "about -235 °C", sky: "#000000", ground: "#d9c3b5", ground2: "#a88c80", note: "It's one of the coldest places we know, so it's a good job your game spacesuit is super toasty!", inSky: "neptune" }
    },

    /* ================= PLUTO & BEYOND ================= */
    pluto: {
      name: "Pluto",
      kind: "Dwarf planet · Harper's favourite!",
      facts: [
        "Pluto has a giant heart shape called Tombaugh Regio!",
        "Pluto was named by an 11-year-old girl from England!",
        "A year on Pluto lasts 248 Earth years."
      ],
      more: [
        "In 1930, 11-year-old Venetia Burney from Oxford suggested the name Pluto. Her grandad passed it to the astronomers, and they loved it!",
        "Clyde Tombaugh discovered Pluto in 1930. Some of his ashes are flying on the New Horizons spacecraft.",
        "In 2006 astronomers decided Pluto is a dwarf planet, because it shares its path round the Sun with lots of other icy objects.",
        "New Horizons flew past in 2015. It found icy mountains, nitrogen glaciers and a blue hazy sky. Pluto has 5 moons."
      ],
      quiz: [
        { q: "What shape is on Pluto?", a: ["A heart", "A star", "A smiley face"], why: "Pluto has a big heart-shaped region called Tombaugh Regio." },
        { q: "Who suggested the name Pluto?", a: ["An 11-year-old girl", "A cat", "The King"], why: "Venetia Burney, aged 11, from Oxford, suggested the name in 1930." },
        { q: "Which spacecraft visited Pluto in 2015?", a: ["New Horizons", "The Titanic", "Thomas the Tank Engine"], why: "New Horizons flew past Pluto in 2015 and took the first close-up photos." }
      ],
      react: [
        ["harper", "Pluto! It has a heart!"],
        ["all", "Hooray for Pluto!"],
        ["mum", "Harper's favourite place!"],
        ["joules", "Woof woof woof!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Pluto",
      land: { g: 0.063, temp: "about -230 °C", sky: "#000000", ground: "#e8dccb", ground2: "#a8603a", note: "You're standing on Pluto's icy heart! Charon hangs in the sky and never moves.", inSky: "charon" }
    },

    charon: {
      name: "Charon",
      kind: "Moon of Pluto · Dance partner",
      facts: [
        "Charon is about half as wide as Pluto.",
        "Pluto and Charon spin around each other like dance partners.",
        "Charon has a reddish cap nicknamed Mordor."
      ],
      more: [
        "Pluto and Charon always show the same face to each other. From one side of Pluto, Charon just hangs still in the sky.",
        "Charon was discovered in 1978 by the astronomer James Christy.",
        "Scientists think Charon's red cap is made from gas that escapes from Pluto, freezes on Charon's pole and is slowly changed into reddish stuff.",
        "Because Charon is so big, Pluto and Charon both circle a point in the empty space between them."
      ],
      quiz: [
        { q: "How do Pluto and Charon move?", a: ["They spin around each other", "Charon stays still", "They bounce"], why: "Pluto and Charon both circle a point between them, like dancers holding hands." },
        { q: "What is Charon's red cap nicknamed?", a: ["Mordor", "Ketchup", "The Strawberry"], why: "Scientists nicknamed it Mordor, after the dark land in The Lord of the Rings." },
        { q: "How big is Charon compared to Pluto?", a: ["About half as wide", "Ten times bigger", "Exactly the same"], why: "Charon is about half Pluto's width, very big for a moon." }
      ],
      react: [
        ["dad", "Pluto's dance partner!"],
        ["harper", "We can see Pluto's heart!"],
        ["oda", "Can Pluto and Charon dance with me?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Charon_(moon)",
      land: { g: 0.029, temp: "about -220 °C", sky: "#000000", ground: "#9c958e", ground2: "#7a3a28", note: "Look up! Pluto hangs in Charon's sky and never moves.", inSky: "pluto" }
    },

    kuiper: {
      name: "Kuiper belt",
      kind: "Icy worlds beyond Neptune · Arrokoth",
      facts: [
        "The Kuiper belt is a giant ring of icy worlds beyond Neptune.",
        "Pluto lives in the Kuiper belt!",
        "In 2019 New Horizons visited Arrokoth, the snowman-shaped object in front of you."
      ],
      more: [
        "Arrokoth is about 35 km long and made of two lumps stuck gently together, like a squashed snowman.",
        "Arrokoth is the farthest object any spacecraft has ever explored up close. New Horizons zoomed past on 1 January 2019.",
        "The name Arrokoth means 'sky' in the Powhatan language of Native American people.",
        "Other dwarf planets live out here too, like Eris, Haumea and Makemake. Scientists think there are many more to find."
      ],
      quiz: [
        { q: "What lives in the Kuiper belt?", a: ["Icy worlds like Pluto", "Hot lava planets", "Nothing at all"], why: "The Kuiper belt is full of icy objects, including Pluto." },
        { q: "What shape is Arrokoth?", a: ["Like a snowman", "Like a cube", "Like a teapot"], why: "Arrokoth is two lumps stuck together, like a flattened snowman." },
        { q: "What does Arrokoth mean?", a: ["Sky", "Potato", "Biscuit"], why: "Arrokoth means 'sky' in the Powhatan language." }
      ],
      react: [
        ["oda", "A space snowman!"],
        ["dad", "Do you want to build a snowman?"],
        ["harper", "Pluto's neighbourhood!"]
      ],
      photo: "https://en.wikipedia.org/wiki/486958_Arrokoth",
      land: { g: 0.0001, temp: "about -230 °C", sky: "#000000", ground: "#a0583c", ground2: "#7c4430", note: "Arrokoth's gravity is so tiny that a little jump could launch you into space. Hold on tight!", inSky: null }
    },

    haumea: {
      name: "Haumea",
      kind: "Dwarf planet · The spinning rugby ball",
      facts: [
        "Haumea spins so fast it's squashed into a rugby-ball shape!",
        "A day on Haumea lasts only about 4 hours.",
        "Haumea has its own ring, a bit like Saturn!"
      ],
      more: [
        "Haumea is more than 2,000 km long at its longest, but much thinner the other way. Scientists think a giant crash long ago set it spinning.",
        "Astronomers found Haumea's ring in 2017, when it passed in front of a star and the starlight blinked.",
        "Haumea has two small moons, Hiʻiaka and Namaka. They're named after the daughters of Haumea, a Hawaiian goddess.",
        "Haumea lives in the Kuiper belt with Pluto. One trip round the Sun takes about 285 Earth years."
      ],
      quiz: [
        { q: "What shape is Haumea?", a: ["Like a rugby ball", "Like a pancake", "Like a teapot"], why: "Haumea spins so fast that it has stretched into a long, egg-like shape." },
        { q: "How long is a day on Haumea?", a: ["About 4 hours", "About 4 years", "About 4 seconds"], why: "Haumea spins round once in just under 4 hours." },
        { q: "What does Haumea have, like Saturn?", a: ["A ring", "A moustache", "A bobble hat"], why: "In 2017 astronomers discovered a thin ring around Haumea." }
      ],
      react: [
        ["oda", "It's spinning like me!"],
        ["dad", "Try a conversion, Harper!"],
        ["harper", "Another of Pluto's neighbours!"],
        ["maggie", "Arf! *chases it*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Haumea",
      land: { g: 0.04, temp: "about -240 °C", sky: "#000000", ground: "#eef0f2", ground2: "#8a4a3a", note: "The ground is sparkly water ice! Look up and watch the stars whizz round as Haumea spins.", inSky: null }
    },

    makemake: {
      name: "Makemake",
      kind: "Dwarf planet · Pluto's cousin",
      facts: [
        "Makemake is one of Pluto's icy cousins in the Kuiper belt!",
        "It was found just after Easter, so its finders nicknamed it 'Easterbunny'.",
        "A year on Makemake lasts about 305 Earth years."
      ],
      more: [
        "Makemake is about 1,430 km wide, a bit more than half as wide as Pluto. After Pluto, it's one of the brightest things in the Kuiper belt.",
        "Mike Brown's team spotted it in 2005. It's named after Makemake, the creator god of the people of Easter Island.",
        "Its surface is reddish-brown and covered in frozen methane, the same kind of ice found on Pluto.",
        "In 2016 Hubble found a small, dark moon going round Makemake. It doesn't have an official name yet, so it's called MK2."
      ],
      quiz: [
        { q: "What was Makemake's nickname?", a: ["Easterbunny", "Christmas Pudding", "Mr Sparkles"], why: "It was found just after Easter 2005, so the team called it Easterbunny." },
        { q: "Where does Makemake live?", a: ["In the Kuiper belt, like Pluto", "Inside the Sun", "On Oda's pillow"], why: "Makemake is a dwarf planet in the Kuiper belt, out beyond Neptune." },
        { q: "What colour is Makemake?", a: ["Reddish-brown", "Bright green", "Tartan"], why: "Makemake's icy surface is reddish-brown, a bit like parts of Pluto." }
      ],
      react: [
        ["harper", "Pluto's cousin! Hello, Makemake!"],
        ["oda", "Where are the Easter eggs?"],
        ["mum", "What a lovely name."],
        ["joules", "Woof woof! *hunts for eggs*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Makemake",
      land: { g: 0.041, temp: "about -240 °C", sky: "#000000", ground: "#c99a7a", ground2: "#8a5a42", note: "Crunch, crunch! You're walking on reddish methane ice, just like on Pluto.", inSky: null }
    },

    eris: {
      name: "Eris",
      kind: "Dwarf planet · Pluto's heavy cousin",
      facts: [
        "Eris is almost exactly as wide as Pluto, but heavier!",
        "Finding Eris is what made scientists decide Pluto is a dwarf planet.",
        "A year on Eris lasts about 559 Earth years!"
      ],
      more: [
        "Eris was discovered in 2005 by Mike Brown, Chad Trujillo and David Rabinowitz. Its first nickname was Xena, after a TV warrior princess!",
        "Eris is about 2,330 km wide, just a little smaller than Pluto, but it's about a quarter heavier.",
        "Eris is named after the Greek goddess of arguments. That's a good name, because astronomers argued a lot about planets after finding it! Its moon is called Dysnomia.",
        "Eris is about three times farther from the Sun than Pluto is right now. Its icy surface is very white and shiny."
      ],
      quiz: [
        { q: "How big is Eris compared to Pluto?", a: ["About the same width, but heavier", "Bigger than Jupiter", "The size of a pea"], why: "Eris is nearly as wide as Pluto, but about 27% heavier." },
        { q: "What did finding Eris change?", a: ["Pluto became a dwarf planet", "The Sun turned blue", "Mondays were cancelled"], why: "Eris led astronomers to make the 'dwarf planet' group in 2006, and Pluto joined it." },
        { q: "What was Eris's first nickname?", a: ["Xena", "Wobbly Bob", "Snowball McSnowface"], why: "The discoverers called it Xena, after a warrior princess on TV." }
      ],
      react: [
        ["harper", "So you're the one who changed Pluto!"],
        ["dad", "No arguing in the spaceship, please."],
        ["oda", "Is Eris Pluto's big sister?"],
        ["maggie", "Awooo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Eris_(dwarf_planet)",
      land: { g: 0.084, temp: "about -240 °C", sky: "#000000", ground: "#f2f2ee", ground2: "#c8c4bc", note: "The ground is bright white frost! The Sun looks like a tiny, very bright star from out here.", inSky: null }
    },

    halley: {
      name: "Halley's Comet",
      kind: "Comet · Comes back every 76 years",
      facts: [
        "Halley's Comet swings past Earth about every 76 years.",
        "It last visited in 1986 and will be back in 2061. Harper will be about 45!",
        "It's even stitched into the Bayeux Tapestry from 1066!"
      ],
      more: [
        "Edmond Halley worked out in 1705 that the same comet keeps coming back. He predicted it would return in 1758, and it did!",
        "The solid middle, the nucleus, is about 15 km long. It's made of ice and dust and is darker than coal.",
        "In 1986 the European spacecraft Giotto flew close and took the first ever close-up photos of a comet's nucleus.",
        "Dust left behind by Halley makes two meteor showers: the Eta Aquariids in May and the Orionids in October. Look for shooting stars, Harper!"
      ],
      quiz: [
        { q: "How often does Halley's Comet come back?", a: ["About every 76 years", "Every Tuesday", "Never"], why: "Halley's Comet goes round the Sun about every 76 years." },
        { q: "When is it coming back?", a: ["2061", "Tomorrow", "Year one million"], why: "Halley's Comet will next be closest to the Sun in 2061." },
        { q: "Which meteor shower comes from Halley's dust?", a: ["The Orionids", "The Biscuitids", "The Puddle Shower"], why: "Earth flies through Halley's dust each October, making the Orionid shooting stars." }
      ],
      react: [
        ["harper", "I'll see you in 2061!"],
        ["mum", "I hope I see it too!"],
        ["dad", "It's a dirty snowball. Bit like Joules after a walk."],
        ["joules", "Woof!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Halley%27s_Comet",
      land: { g: 0.00005, temp: "about -220 °C (far from the Sun right now)", sky: "#000000", ground: "#2e2b28", ground2: "#4a4642", note: "You're on a comet! Its gravity is so weak that one hop could send you off into space for ever. Hold on!", inSky: null }
    },

    /* ================= SPACECRAFT ================= */
    iss: {
      name: "International Space Station",
      kind: "Spacecraft · A home in orbit",
      km: 400,
      facts: [
        "The ISS goes all the way round Earth about every 90 minutes!",
        "Astronauts have lived on board non-stop since November 2000.",
        "You can sometimes see it from your garden as a bright, moving dot."
      ],
      more: [
        "The ISS flies about 400 km up at about 28,000 km/h. The crew see about 16 sunrises and sunsets every day!",
        "The station is about as big as a football pitch. It was built in space from many pieces.",
        "Astronauts float because they are falling around Earth all the time, together with the station.",
        "Many countries work together on the ISS. The plan is to bring it down safely around 2030."
      ],
      quiz: [
        { q: "How long does the ISS take to go round Earth?", a: ["About 90 minutes", "About a year", "About 5 seconds"], why: "The ISS zooms so fast it circles Earth about every 90 minutes." },
        { q: "How many sunrises do ISS astronauts see each day?", a: ["About 16", "Just 1", "None"], why: "Going round Earth every 90 minutes means about 16 sunrises a day." },
        { q: "Why do astronauts float on the ISS?", a: ["They're falling around Earth", "They ate too many balloons", "There are fans underneath"], why: "The station and crew are always falling around Earth together, so they float." }
      ],
      react: [
        ["harper", "People live up here!"],
        ["leo", "My old home! Hello, crew!"],
        ["oda", "How do they go to the toilet?"]
      ],
      photo: "https://en.wikipedia.org/wiki/International_Space_Station",
      land: null
    },

    hubble: {
      name: "Hubble Space Telescope",
      kind: "Spacecraft · Space telescope",
      km: 470,
      facts: [
        "Hubble was launched in 1990 by the Space Shuttle Discovery.",
        "It orbits Earth about every 95 minutes, high above the clouds.",
        "Hubble's main mirror is 2.4 metres across."
      ],
      more: [
        "Being above Earth's wobbly air lets Hubble take super sharp pictures of space.",
        "After launch, Hubble's mirror turned out to be the wrong shape. In 1993 astronauts flew up and fitted fixes, like glasses!",
        "Astronauts visited Hubble five times to fix and upgrade it. The last visit was in 2009.",
        "Hubble helped scientists work out that the universe is about 13.8 billion years old."
      ],
      quiz: [
        { q: "When was Hubble launched?", a: ["1990", "1066", "Last Tuesday"], why: "Space Shuttle Discovery carried Hubble into space in April 1990." },
        { q: "How did astronauts fix Hubble's blurry mirror?", a: ["They fitted it 'glasses'", "They gave it a wash", "They shouted at it"], why: "In 1993 astronauts added parts that corrected the mirror, like glasses." },
        { q: "Why is Hubble in space?", a: ["To see above Earth's wobbly air", "It got lost", "For the view of the sea"], why: "Earth's air blurs starlight, so from space Hubble sees much more clearly." }
      ],
      react: [
        ["mum", "The famous Hubble!"],
        ["dad", "Say cheese, Hubble!"],
        ["harper", "It took so many amazing pictures!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Hubble_Space_Telescope",
      land: null
    },

    jwst: {
      name: "James Webb Space Telescope",
      kind: "Spacecraft · Golden space telescope",
      km: 1500000,
      facts: [
        "Webb launched on Christmas Day 2021!",
        "Its giant golden mirror is 6.5 metres across, made of 18 pieces.",
        "Webb sits about 1.5 million km from Earth."
      ],
      more: [
        "Webb sees infrared light, which is like heat. That lets it see through dust and spot very faraway galaxies.",
        "Its sunshield is about as big as a tennis court. It keeps the telescope colder than -200 °C.",
        "Webb's mirror and sunshield were folded up like origami to fit in the rocket, then unfolded in space.",
        "Webb orbits a special spot called L2, where it can stay lined up with Earth as they both go round the Sun."
      ],
      quiz: [
        { q: "When did Webb launch?", a: ["Christmas Day 2021", "Halloween 1990", "Pancake Day 1066"], why: "Webb blasted off on 25 December 2021." },
        { q: "What kind of light does Webb mostly see?", a: ["Infrared", "Only pink", "Torchlight"], why: "Webb sees infrared light, a bit like heat, which shines through dust." },
        { q: "How big is Webb's sunshield?", a: ["About a tennis court", "About a postage stamp", "About a sock"], why: "Webb's five-layer sunshield is about the size of a tennis court." }
      ],
      react: [
        ["harper", "The golden mirror!"],
        ["oda", "It's like a giant flower!"],
        ["dad", "Bit chilly here. Fetch my scarf."]
      ],
      photo: "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope",
      land: null
    },

    voyager1: {
      name: "Voyager 1",
      kind: "Spacecraft · Farthest from home",
      km: 25700000000,
      facts: [
        "Voyager 1 is the farthest spacecraft from Earth ever.",
        "It launched in 1977 and is still sending messages home!",
        "It carries a golden record of sounds and music from Earth."
      ],
      more: [
        "In October 2026 Voyager 1 is about 25.7 billion km away. Around 18 November 2026 it will be one light-day from Earth!",
        "Its radio messages take almost a whole day to reach us, travelling at the speed of light.",
        "Voyager 1 flew past Jupiter in 1979 and Saturn in 1980. In 2012 it became the first spacecraft in interstellar space.",
        "In 1990 it turned around and took the 'Pale Blue Dot' photo, showing Earth as a tiny speck in a sunbeam."
      ],
      quiz: [
        { q: "When did Voyager 1 launch?", a: ["1977", "2025", "1066"], why: "Voyager 1 launched in September 1977 and is still going." },
        { q: "What does Voyager 1 carry?", a: ["A golden record", "A packed lunch", "A spare dog"], why: "It carries a golden record of Earth sounds, music and greetings." },
        { q: "What was the 'Pale Blue Dot'?", a: ["A photo of tiny faraway Earth", "A blue sweet", "A new planet"], why: "In 1990 Voyager 1 photographed Earth as a tiny dot from far away." }
      ],
      react: [
        ["harper", "Hello, Voyager! You're so far!"],
        ["mum", "Still going after all these years."],
        ["oda", "Is it lonely?"],
        ["maggie", "Awooo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Voyager_1",
      land: null
    },

    newhorizons: {
      name: "New Horizons",
      kind: "Spacecraft · Pluto explorer!",
      km: 9900000000,
      facts: [
        "New Horizons flew past Pluto in 2015, Harper's favourite!",
        "In 2019 it visited Arrokoth, the space snowman.",
        "It left Earth faster than any spacecraft before it!"
      ],
      more: [
        "New Horizons launched in January 2006 and zoomed past the Moon's orbit in about 9 hours. It still took nine and a half years to reach Pluto!",
        "On 14 July 2015 it whizzed about 12,500 km above Pluto and took the first close-up photos, including Pluto's giant heart.",
        "It's about the size of a grand piano. Its messages travel so far that sending all the Pluto pictures home took over a year.",
        "In October 2026 it's about 10 billion km from home, travelling deeper into the Kuiper belt. Its radio messages take about 9 hours to reach us."
      ],
      quiz: [
        { q: "When did New Horizons fly past Pluto?", a: ["2015", "1066", "Next Friday"], why: "New Horizons flew past Pluto on 14 July 2015." },
        { q: "What did New Horizons visit in 2019?", a: ["Arrokoth, the space snowman", "A space chippy", "The Sun's back garden"], why: "On 1 January 2019 it flew past Arrokoth in the Kuiper belt." },
        { q: "About how big is New Horizons?", a: ["Like a grand piano", "Like a football stadium", "Like a ladybird"], why: "New Horizons is about the size of a grand piano." }
      ],
      react: [
        ["harper", "The spacecraft that saw Pluto's heart!"],
        ["leo", "One of the greatest journeys ever made."],
        ["oda", "Thank you for the Pluto photos!"],
        ["joules", "Woof woof!"]
      ],
      photo: "https://en.wikipedia.org/wiki/New_Horizons",
      land: null
    },

    voyager2: {
      name: "Voyager 2",
      kind: "Spacecraft · Visited all four giants",
      km: 21600000000,
      facts: [
        "Voyager 2 is the only spacecraft to visit Uranus and Neptune!",
        "It launched in 1977, about two weeks before Voyager 1.",
        "It carries a golden record of sounds and music from Earth."
      ],
      more: [
        "Voyager 2 flew past Jupiter in 1979, Saturn in 1981, Uranus in 1986 and Neptune in 1989. That's all four giant planets!",
        "In 2018 it became the second spacecraft ever to reach interstellar space, the space between the stars.",
        "In October 2026 it's about 21.6 billion km away. Its radio messages take about 20 hours to reach us.",
        "Its power is slowly running out, so engineers switch off instruments one by one to keep it talking to Earth for as long as possible."
      ],
      quiz: [
        { q: "Which planets did only Voyager 2 visit?", a: ["Uranus and Neptune", "Earth and the Moon", "Planet Biscuit"], why: "Voyager 2 is the only spacecraft ever to fly past Uranus and Neptune." },
        { q: "Which launched first?", a: ["Voyager 2", "Voyager 1", "Voyager 3 and a half"], why: "Voyager 2 launched on 20 August 1977, about two weeks before Voyager 1." },
        { q: "What is Voyager 2 carrying?", a: ["A golden record", "A golden retriever", "A golden syrup sponge"], why: "Like Voyager 1, it carries a golden record of Earth sounds, music and greetings." }
      ],
      react: [
        ["harper", "You visited all the giant planets!"],
        ["mum", "What a brave little explorer."],
        ["dad", "Still phoning home after nearly 50 years!"],
        ["maggie", "Awooo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Voyager_2",
      land: null
    },

    parker: {
      name: "Parker Solar Probe",
      kind: "Spacecraft · Touching the Sun",
      km: 6100000,
      facts: [
        "Parker Solar Probe flies closer to the Sun than any spacecraft ever!",
        "It's the fastest object people have ever made.",
        "In 2021 it became the first spacecraft to fly through the Sun's outer air, the corona."
      ],
      more: [
        "On 24 December 2024 it swooped just 6.1 million km from the Sun's surface, at about 690,000 km/h. That speed would get you from London to New York in about 30 seconds!",
        "Its thick heat shield faces temperatures of more than 1,300 °C, but the instruments behind it stay at about room temperature.",
        "It launched in 2018 and uses flybys of Venus to swing closer and closer to the Sun.",
        "It's named after the scientist Eugene Parker. He was the first living person to have a spacecraft named after him, and he watched it launch!"
      ],
      quiz: [
        { q: "What does Parker Solar Probe study?", a: ["The Sun", "Oda's bedroom", "The bottom of the sea"], why: "Parker flies close to the Sun to learn about its corona and the solar wind." },
        { q: "What keeps Parker from melting?", a: ["A thick heat shield", "Lots of ice lollies", "A tiny umbrella"], why: "A heat shield made mostly of carbon foam keeps the instruments cool." },
        { q: "Which planet helps Parker swing closer to the Sun?", a: ["Venus", "Pluto", "Planet Trampoline"], why: "Parker uses flybys of Venus to bend its path closer to the Sun." }
      ],
      react: [
        ["dad", "Factor one million sun cream, please!"],
        ["oda", "Is it hot? Is it really hot?"],
        ["harper", "It touched the Sun!"],
        ["joules", "*pant pant* Woof!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Parker_Solar_Probe",
      land: null
    },

    /* ================= STARS ================= */
    proxima: {
      name: "Proxima Centauri",
      kind: "Star · Closest to the Sun",
      ly: 4.25, ra: 217.429, dec: -62.680, type: "star",
      facts: [
        "Proxima Centauri is the closest star to our Sun.",
        "It is a small red dwarf, too faint to see without a telescope.",
        "It has a planet called Proxima b!"
      ],
      more: [
        "Proxima b was discovered in 2016. It goes round its star in just 11 days and is at least as heavy as Earth.",
        "Proxima b is in the zone where water could be liquid. But its star shoots out big flares, so nobody knows if life could survive there.",
        "Proxima Centauri is part of a family of three stars with Alpha Centauri A and B.",
        "Even this closest star is far. Voyager 1 would take more than 70,000 years to get there!"
      ],
      quiz: [
        { q: "Which star is closest to our Sun?", a: ["Proxima Centauri", "Sirius", "The Moon"], why: "Proxima Centauri is about 4.2 light-years away, the nearest star to the Sun." },
        { q: "What kind of star is Proxima Centauri?", a: ["A red dwarf", "A giant blue star", "A starfish"], why: "Proxima is a small, cool red dwarf star." },
        { q: "Does Proxima b have life?", a: ["Nobody knows yet", "Yes, unicorns", "Yes, lots of dogs"], why: "Scientists don't know if Proxima b could support life; its star's flares might make it hard." }
      ],
      react: [
        ["harper", "Our nearest star neighbour!"],
        ["leo", "Over four years at light speed!"],
        ["oda", "Can we visit Proxima b?"],
        ["joules", "*sniff sniff*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Proxima_Centauri",
      land: null
    },

    sirius: {
      name: "Sirius",
      kind: "Star · Brightest in the night sky",
      ly: 8.6, ra: 101.287, dec: -16.716, type: "star",
      facts: [
        "Sirius is the brightest star in the night sky.",
        "Sirius is nicknamed the Dog Star! Joules and Maggie approve.",
        "It is about 8.6 light-years away."
      ],
      more: [
        "Sirius is in the constellation Canis Major, which means 'Big Dog'.",
        "Sirius shines about 25 times brighter than our Sun, and it is about twice as heavy.",
        "Sirius has a tiny partner star, Sirius B. It's a white dwarf, about the size of Earth but as heavy as the Sun!",
        "From the UK you can see Sirius in winter, sparkling low in the south below Orion."
      ],
      quiz: [
        { q: "What is Sirius's nickname?", a: ["The Dog Star", "The Cat Star", "The Sausage Star"], why: "Sirius is in Canis Major, the Big Dog, so it's called the Dog Star." },
        { q: "What makes Sirius special?", a: ["Brightest star in the night sky", "It's made of cheese", "It's square"], why: "Sirius is the brightest star we can see at night." },
        { q: "What is Sirius B?", a: ["A tiny white dwarf star", "A planet", "A spaceship"], why: "Sirius B is a white dwarf, a small, very heavy leftover star." }
      ],
      react: [
        ["joules", "Woof! Woof!"],
        ["maggie", "Arf arf arf!"],
        ["dad", "The Dog Star! Paws for applause."],
        ["harper", "So bright!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Sirius",
      land: null
    },

    vega: {
      name: "Vega",
      kind: "Star · Bright and blue-white",
      ly: 25, ra: 279.235, dec: 38.784, type: "star",
      facts: [
        "Vega is one of the brightest stars in the night sky.",
        "Vega spins so fast it bulges in the middle!",
        "Vega is about 25 light-years away."
      ],
      more: [
        "About 14,000 years ago, Vega was the North Star. Earth's axis slowly wobbles, so in about 12,000 years it will be again!",
        "In 1850 Vega became the first star, other than the Sun, ever photographed.",
        "Vega spins round about once every 12 or 13 hours. Our Sun takes almost a month!",
        "Vega is part of the Summer Triangle, three bright stars you can see high up on summer evenings in the UK."
      ],
      quiz: [
        { q: "What happens because Vega spins so fast?", a: ["It bulges in the middle", "It goes dizzy", "It falls over"], why: "Vega spins so fast that it is fatter around its middle." },
        { q: "What was Vega long ago?", a: ["The North Star", "A planet", "A comet"], why: "Earth's slow wobble means Vega was the North Star about 14,000 years ago." },
        { q: "What was Vega the first star to have?", a: ["A photo taken of it", "A birthday party", "A name badge"], why: "In 1850 Vega was the first star after the Sun to be photographed." }
      ],
      react: [
        ["mum", "Look how it sparkles!"],
        ["harper", "I've seen Vega from home!"],
        ["oda", "It's spinning like me!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Vega",
      land: null
    },

    polaris: {
      name: "Polaris",
      kind: "Star · The North Star",
      ly: 447, ra: 37.955, dec: 89.264, type: "star",
      facts: [
        "Polaris is the North Star. It sits almost exactly above the North Pole.",
        "While other stars wheel round, Polaris barely moves all night.",
        "It isn't the brightest star, but it's one of the most useful!"
      ],
      more: [
        "Sailors and explorers used Polaris to find north for hundreds of years.",
        "You can find it using the two end stars of the Plough's 'pan', which point up to Polaris.",
        "Polaris is really a family of three stars. The main one is a supergiant over a thousand times brighter than the Sun.",
        "Polaris is about 450 light-years away, so the light you see left it hundreds of years ago."
      ],
      quiz: [
        { q: "What is Polaris's nickname?", a: ["The North Star", "The Lunch Star", "The Wobbly Star"], why: "Polaris sits almost directly above Earth's North Pole." },
        { q: "Which star pattern helps you find Polaris?", a: ["The Plough", "The Teapot Lid", "The Bicycle"], why: "Two stars of the Plough point straight towards Polaris." },
        { q: "Is Polaris the brightest star in the sky?", a: ["No, but it's very useful", "Yes, by miles", "It's invisible"], why: "Polaris isn't the brightest, but it shows which way is north." }
      ],
      react: [
        ["harper", "The North Star! I can find it!"],
        ["dad", "Which way's north? This way!"],
        ["maggie", "*sniff sniff* North!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Polaris",
      land: null
    },

    betelgeuse: {
      name: "Betelgeuse",
      kind: "Star · Red supergiant",
      ly: 550, ra: 88.793, dec: 7.407, type: "star",
      facts: [
        "Betelgeuse is a giant red star in Orion's shoulder.",
        "If it replaced our Sun, it would swallow Mercury, Venus, Earth and Mars!",
        "One day it will explode as a supernova."
      ],
      more: [
        "Scientists aren't sure exactly how far away it is. Good guesses say about 550 light-years.",
        "Betelgeuse will explode some time in the next 100,000 years or so. It could be very bright, even in daytime!",
        "In 2019 and 2020 Betelgeuse got much dimmer. Scientists think a big cloud of dust it puffed out blocked some light.",
        "In 2025 astronomers spotted a small companion star very close to Betelgeuse. It was named Siwarha."
      ],
      quiz: [
        { q: "What colour is Betelgeuse?", a: ["Red", "Green", "Tartan"], why: "Betelgeuse is a red supergiant, a huge, cool, red star." },
        { q: "What will Betelgeuse do one day?", a: ["Explode as a supernova", "Turn into a planet", "Do a dance"], why: "Giant stars like Betelgeuse end their lives in huge explosions." },
        { q: "Why did Betelgeuse dim in 2019?", a: ["Scientists think dust blocked it", "Someone turned it off", "It was sleeping"], why: "Scientists think a dust cloud from the star hid some of its light." }
      ],
      react: [
        ["oda", "It's so big and red!"],
        ["mum", "Like a giant glowing ember!"],
        ["dad", "Don't explode yet, please!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Betelgeuse",
      land: null
    },

    alphacen: {
      name: "Alpha Centauri A and B",
      kind: "Stars · Our nearest twin suns",
      ly: 4.37, ra: 219.902, dec: -60.834, type: "star",
      facts: [
        "Alpha Centauri is two Sun-like stars going round each other!",
        "They're about 4.37 light-years away, the closest stars you can see with just your eyes.",
        "Together they make the third brightest star in the night sky."
      ],
      more: [
        "Alpha Centauri A is a little bigger than our Sun, and B is a little smaller. They go round each other about every 80 years.",
        "Little Proxima Centauri belongs to the same family. It circles far out from A and B, a bit closer to us.",
        "In 2025 the Webb telescope spotted what might be a giant planet around Alpha Centauri A. Scientists are still checking!",
        "It's too far south to see from the UK. From Australia it shines near the Southern Cross."
      ],
      quiz: [
        { q: "How many stars make Alpha Centauri's bright dot?", a: ["Two", "Two thousand", "None, it's a torch"], why: "Alpha Centauri A and B are so close together they look like one bright star." },
        { q: "How far away is Alpha Centauri?", a: ["About 4.37 light-years", "About 4 metres", "Next door to the chippy"], why: "Their light takes about 4.37 years to reach us." },
        { q: "Which small star is in the same family?", a: ["Proxima Centauri", "The Moon", "Twinkle Twinkle"], why: "Proxima Centauri orbits far out from A and B, making a family of three stars." }
      ],
      react: [
        ["harper", "Two suns! Like in Star Wars!"],
        ["leo", "Our nearest Sun-like stars, Captain."],
        ["oda", "Do you get two sunsets?"],
        ["joules", "Woof! Woof!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Alpha_Centauri",
      land: null
    },

    trappist1: {
      name: "TRAPPIST-1",
      kind: "Star · Seven planets!",
      ly: 40.7, ra: 346.622, dec: -5.041, type: "star",
      facts: [
        "TRAPPIST-1 is a tiny red star with seven rocky planets!",
        "The star is only a bit wider than Jupiter.",
        "It's about 40 light-years away."
      ],
      more: [
        "All seven planets are about the size of Earth. Astronomers announced them in 2016 and 2017.",
        "The planets huddle so close to their star that all seven orbits would fit inside Mercury's. A year on the closest one lasts only 1.5 days!",
        "From one planet, the others would look bigger than our Moon in the sky. Some sit in the zone where water could be liquid.",
        "Webb has been checking the planets for air. Scientists think the two closest probably don't have thick air, and they're still studying the others."
      ],
      quiz: [
        { q: "How many planets does TRAPPIST-1 have?", a: ["Seven", "None", "Seven hundred"], why: "Astronomers have found seven rocky, Earth-sized planets around TRAPPIST-1." },
        { q: "How long is a year on the closest planet?", a: ["About 1.5 days", "About 100 years", "Forever"], why: "The closest planet goes round its star in about a day and a half." },
        { q: "What kind of star is TRAPPIST-1?", a: ["A small, cool red star", "A giant blue star", "A starfish"], why: "TRAPPIST-1 is an ultra-cool red dwarf, much smaller than the Sun." }
      ],
      react: [
        ["harper", "Seven planets! Can we visit them all?"],
        ["oda", "One for each of us, and two for the dogs!"],
        ["mum", "Planets as big as Earth!"],
        ["maggie", "Arf arf!"]
      ],
      photo: "https://en.wikipedia.org/wiki/TRAPPIST-1",
      land: null
    },

    rigel: {
      name: "Rigel",
      kind: "Star · Orion's blue-white foot",
      ly: 860, ra: 78.634, dec: -8.202, type: "star",
      facts: [
        "Rigel is the bright blue-white star in Orion's foot.",
        "It's a supergiant, many tens of times wider than the Sun!",
        "It's about 860 light-years away."
      ],
      more: [
        "Rigel shines about 100,000 times brighter than our Sun. Scientists aren't sure exactly, because it's hard to measure.",
        "Its surface is about 12,000 °C, twice as hot as the Sun's. Hot stars look blue-white, cooler stars look orange or red.",
        "Look at Orion: red Betelgeuse is at one shoulder, and blue-white Rigel is at the opposite foot.",
        "Rigel is one of the brightest stars in our sky. You can see it from the UK on winter evenings."
      ],
      quiz: [
        { q: "What colour is Rigel?", a: ["Blue-white", "Pink with spots", "Brown"], why: "Rigel is a very hot star, so it shines blue-white." },
        { q: "Where is Rigel in Orion?", a: ["In his foot", "In his nose", "In his pocket"], why: "Rigel marks one of Orion's feet, opposite red Betelgeuse at his shoulder." },
        { q: "Which kind of star is hotter?", a: ["Blue-white", "Red", "Star-shaped biscuits"], why: "Blue-white stars like Rigel are much hotter than red stars like Betelgeuse." }
      ],
      react: [
        ["harper", "I've seen you from our garden!"],
        ["mum", "Such a beautiful blue."],
        ["dad", "Orion's got a shiny shoe."],
        ["oda", "Sparkly!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Rigel",
      land: null
    },

    /* ================= CLUSTERS & NEBULAE ================= */
    pleiades: {
      name: "The Pleiades",
      kind: "Star cluster · The Seven Sisters",
      ly: 444, ra: 56.75, dec: 24.117, type: "cluster",
      facts: [
        "The Pleiades is a family of young blue stars called the Seven Sisters.",
        "You can see about six of them with just your eyes.",
        "There are really more than a thousand stars in the cluster!"
      ],
      more: [
        "The Pleiades are about 444 light-years away, and about 100 million years old. Young for stars!",
        "The blue haze around them is dust they are drifting through, lit up by their light.",
        "People all over the world have told stories about these stars for thousands of years.",
        "In the UK you can see the Pleiades on autumn and winter evenings, near Orion and Taurus."
      ],
      quiz: [
        { q: "What is the Pleiades' nickname?", a: ["The Seven Sisters", "The Three Brothers", "The Twelve Cousins"], why: "The Pleiades are often called the Seven Sisters." },
        { q: "How many stars are really in the Pleiades?", a: ["More than a thousand", "Exactly seven", "Two"], why: "Telescopes show over a thousand stars in the cluster." },
        { q: "What makes the blue haze around them?", a: ["Dust lit up by starlight", "Blue paint", "Space fog machines"], why: "The stars are passing through dust, and their light makes it glow blue." }
      ],
      react: [
        ["harper", "The Seven Sisters!"],
        ["oda", "Like me and Harper, but more!"],
        ["mum", "What a sparkly family!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Pleiades",
      land: null
    },

    orion: {
      name: "Orion Nebula",
      kind: "Nebula · A star nursery",
      ly: 1344, ra: 83.822, dec: -5.391, type: "nebula",
      facts: [
        "The Orion Nebula is a giant cloud where new stars are being born.",
        "You can see it from home as a fuzzy patch in Orion's sword.",
        "It is about 1,300 light-years away."
      ],
      more: [
        "It's the closest big star nursery to Earth, so astronomers study it lots.",
        "In the middle are four bright young stars called the Trapezium. Their light makes the cloud glow.",
        "Hubble found discs of dust round young stars here. Scientists think planets may form in them.",
        "The nebula is about 24 light-years across. That's so big light takes 24 years to cross it!"
      ],
      quiz: [
        { q: "What happens in the Orion Nebula?", a: ["New stars are born", "Stars go to sleep", "Aliens bake cakes"], why: "The Orion Nebula is a cloud of gas and dust where stars are forming." },
        { q: "Where can you see it from Earth?", a: ["In Orion's sword", "Inside the Moon", "Under your bed"], why: "It looks like a fuzzy star in the sword hanging from Orion's belt." },
        { q: "What is the Trapezium?", a: ["Four bright young stars", "A trampoline", "A dinosaur"], why: "The Trapezium is a group of hot young stars that light up the nebula." }
      ],
      react: [
        ["mum", "Baby stars! How amazing!"],
        ["harper", "It's a star nursery!"],
        ["oda", "Do baby stars cry?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Orion_Nebula",
      land: null
    },

    ring: {
      name: "Ring Nebula",
      kind: "Nebula · A dying star's bubble",
      ly: 2570, ra: 283.396, dec: 33.029, type: "nebula",
      facts: [
        "The Ring Nebula is a glowing bubble from a dying star.",
        "There is a tiny white dwarf star right in the middle.",
        "It is about 2,500 light-years away, near Vega."
      ],
      more: [
        "When a star like our Sun runs out of fuel, it puffs off its outer layers. They make a glowing shell like this.",
        "Scientists think our Sun will make a cloud like this in about 5 billion years.",
        "The Ring Nebula is about 1 light-year across. Webb took amazing pictures of it in 2023.",
        "Charles Messier added it to his list in 1779. It's also called M57."
      ],
      quiz: [
        { q: "What made the Ring Nebula?", a: ["A dying star", "A space doughnut", "A giant hula hoop"], why: "A dying star puffed off its outer layers, making this glowing ring." },
        { q: "What is in the middle of it?", a: ["A white dwarf star", "A black hole", "A sweet shop"], why: "The leftover core of the star, a white dwarf, sits in the middle." },
        { q: "Will our Sun ever do this?", a: ["Scientists think so", "Never ever", "Yes, next week"], why: "Scientists think the Sun will make a similar cloud in about 5 billion years." }
      ],
      react: [
        ["oda", "A space doughnut!"],
        ["dad", "I'd like sprinkles on mine."],
        ["harper", "It's like a cosmic eye!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Ring_Nebula",
      land: null
    },

    crab: {
      name: "Crab Nebula",
      kind: "Nebula · Supernova leftovers",
      ly: 6500, ra: 83.633, dec: 22.015, type: "nebula",
      facts: [
        "The Crab Nebula is what's left of a star that exploded.",
        "People saw the explosion from Earth in the year 1054!",
        "A tiny star in the middle spins about 30 times every second!"
      ],
      more: [
        "Astronomers in China wrote about the new star in 1054. It was bright enough to see in daytime for weeks.",
        "The spinning star in the middle is a pulsar. It's only about as wide as a city but heavier than the Sun.",
        "The Crab is about 6,500 light-years away and about 11 light-years across. It is still spreading out.",
        "It is number 1 on Charles Messier's famous list, so it is also called M1."
      ],
      quiz: [
        { q: "When did people see the Crab's star explode?", a: ["In 1054", "In 2024", "At teatime"], why: "Astronomers in China recorded the bright new star in 1054." },
        { q: "What spins in the middle of the Crab?", a: ["A pulsar", "A washing machine", "A crab"], why: "A pulsar, a tiny super-heavy star, spins about 30 times a second." },
        { q: "What is the Crab Nebula?", a: ["Leftovers from an exploded star", "A real space crab", "A seaside"], why: "It's the glowing cloud left behind after a supernova." }
      ],
      react: [
        ["oda", "Where's the crab? Snip snip!"],
        ["harper", "A star blew up here!"],
        ["joules", "Woof! *sniff sniff*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Crab_Nebula",
      land: null
    },

    eagle: {
      name: "Eagle Nebula",
      kind: "Nebula · Pillars of Creation",
      ly: 5700, ra: 274.688, dec: -13.787, type: "nebula",
      facts: [
        "The Eagle Nebula holds the famous Pillars of Creation.",
        "New stars are being born inside those dusty pillars.",
        "It is about 5,700 light-years away."
      ],
      more: [
        "The tallest pillar is about 4 light-years long. Light takes four years to go from bottom to top!",
        "Hubble took a famous photo of the Pillars in 1995. Webb took a new one in 2022.",
        "Bright young stars nearby are slowly blowing the pillars away with their light and wind.",
        "The pillars are made of cold gas and dust. Scientists think new stars and planets are forming inside."
      ],
      quiz: [
        { q: "What are the famous shapes in the Eagle Nebula called?", a: ["The Pillars of Creation", "The Towers of Toast", "The Space Ladders"], why: "The tall dusty clouds are called the Pillars of Creation." },
        { q: "What is happening inside the pillars?", a: ["New stars are forming", "Eagles are nesting", "A party"], why: "Gas and dust in the pillars are clumping together to make new stars." },
        { q: "Which telescope took the famous 1995 photo?", a: ["Hubble", "A phone camera", "Grandad's binoculars"], why: "Hubble's 1995 picture made the Pillars famous." }
      ],
      react: [
        ["mum", "The Pillars of Creation! Wow."],
        ["harper", "I've seen this picture!"],
        ["oda", "They look like fingers!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Pillars_of_Creation",
      land: null
    },

    horsehead: {
      name: "Horsehead Nebula",
      kind: "Nebula · A horse made of dust",
      ly: 1375, ra: 85.246, dec: -2.458, type: "nebula",
      facts: [
        "The Horsehead Nebula is a dark cloud shaped like a horse's head!",
        "It looks dark because thick dust blocks the glowing red gas behind it.",
        "It's about 1,375 light-years away, in Orion."
      ],
      more: [
        "It sits just below Alnitak, the left-hand star of Orion's belt.",
        "Williamina Fleming discovered it in 1888, while studying photographs of the sky at Harvard.",
        "The horse's head is about 3.5 light-years tall. Light would take three and a half years to go from its chin to its ears!",
        "Starlight is slowly wearing the dust away. Scientists think the horse's head will fade in about 5 million years."
      ],
      quiz: [
        { q: "What shape is the Horsehead Nebula?", a: ["A horse's head", "A cat's tail", "A wellington boot"], why: "Its dark dust cloud looks just like the head of a horse." },
        { q: "Why does it look dark?", a: ["Thick dust blocks the light behind it", "Someone switched it off", "It's wearing sunglasses"], why: "The dusty cloud blocks the glowing red gas behind it, so we see a dark shape." },
        { q: "Who discovered it?", a: ["Williamina Fleming", "A real horse", "The Tooth Fairy"], why: "Williamina Fleming spotted it on a photograph of the sky in 1888." }
      ],
      react: [
        ["oda", "A space horsey! Neigh!"],
        ["harper", "It really looks like a horse!"],
        ["dad", "Why the long face?"],
        ["maggie", "Woof? *sniffs for horses*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Horsehead_Nebula",
      land: null
    },

    helix: {
      name: "Helix Nebula",
      kind: "Nebula · The Eye in the sky",
      ly: 650, ra: 337.411, dec: -20.837, type: "nebula",
      facts: [
        "The Helix Nebula looks like a giant glowing eye in space!",
        "It's made by a dying star puffing off its outer layers.",
        "It's about 650 light-years away, one of the closest of its kind."
      ],
      more: [
        "In the middle is a tiny, very hot white dwarf. That's what's left of the star's core.",
        "Scientists think our Sun will make a glowing cloud like this, in about 5 billion years.",
        "The Helix has thousands of tadpole-shaped blobs called cometary knots. Each one is about as big as our whole solar system!",
        "In our sky it looks nearly as wide as the full Moon, but it's so faint you need a telescope. It's in the constellation Aquarius."
      ],
      quiz: [
        { q: "What does the Helix Nebula look like?", a: ["A giant eye", "A sausage roll", "A dancing penguin"], why: "Its glowing rings make it look like an enormous eye in space." },
        { q: "What is in the middle of the Helix?", a: ["A tiny white dwarf star", "A big gold coin", "A space hamster"], why: "A small, hot white dwarf, the leftover core of the star, sits in the middle." },
        { q: "What will our Sun do in about 5 billion years?", a: ["Make a glowing cloud like this", "Turn into a cheese", "Go on holiday"], why: "Scientists think the Sun will puff off its outer layers and make a nebula like this." }
      ],
      react: [
        ["oda", "It's looking at me!"],
        ["mum", "It's like a giant eye in space."],
        ["harper", "So our Sun will look like this one day!"],
        ["joules", "Woof! *stares back*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Helix_Nebula",
      land: null
    },

    omegacen: {
      name: "Omega Centauri",
      kind: "Star cluster · Millions of stars",
      ly: 17000, ra: 201.697, dec: -47.480, type: "cluster",
      facts: [
        "Omega Centauri is a giant ball of about 10 million stars!",
        "It's the biggest star cluster of its kind in our galaxy.",
        "It's about 17,000 light-years away."
      ],
      more: [
        "Its stars are very old, about 12 billion years. They were shining long before the Sun was born.",
        "Edmond Halley, the comet man, noticed in 1677 that it isn't a single star. Ptolemy had listed it as a star nearly 2,000 years ago!",
        "Scientists think it might be the leftover middle of a small galaxy that our Milky Way swallowed long ago.",
        "In 2024 scientists found fast-moving stars at its centre. They think a medium-sized black hole is hiding there."
      ],
      quiz: [
        { q: "About how many stars are in Omega Centauri?", a: ["About 10 million", "About 10", "Just Oda"], why: "Omega Centauri is packed with roughly 10 million stars." },
        { q: "Who noticed it isn't a single star?", a: ["Edmond Halley", "A goldfish", "The man who invented crisps"], why: "Edmond Halley, who the comet is named after, saw it was a cluster in 1677." },
        { q: "What might Omega Centauri once have been?", a: ["The middle of a small galaxy", "A giant pancake", "A broken lighthouse"], why: "Scientists think it might be the core of a small galaxy the Milky Way swallowed." }
      ],
      react: [
        ["harper", "So many stars!"],
        ["oda", "Can I count them? One, two, three…"],
        ["dad", "That'll take a while, Oda."],
        ["leo", "A glittering ball of ancient stars."]
      ],
      photo: "https://en.wikipedia.org/wiki/Omega_Centauri",
      land: null
    },

    /* ================= GALAXY ================= */
    galcenter: {
      name: "Centre of the Milky Way",
      kind: "Black hole · Sagittarius A*",
      ly: 27000, ra: 266.417, dec: -29.008, type: "blackhole",
      facts: [
        "A supermassive black hole lives at the centre of our galaxy.",
        "It's called Sagittarius A*, said 'Sadge-ih-TAIR-ee-us A-star'.",
        "It's about 4 million times heavier than the Sun!"
      ],
      more: [
        "In 2022 the Event Horizon Telescope team shared the first picture of it: a glowing ring around a dark middle.",
        "A black hole's gravity is so strong that not even light can escape once it gets too close.",
        "Stars near the centre whizz round the black hole. One called S2 goes round every 16 years.",
        "The centre is about 27,000 light-years away. Thick dust hides it from our eyes, but telescopes see through it."
      ],
      quiz: [
        { q: "What is at the centre of the Milky Way?", a: ["A supermassive black hole", "A giant sun lolly", "Nothing"], why: "Sagittarius A*, a supermassive black hole, sits at the centre." },
        { q: "About how heavy is Sagittarius A*?", a: ["About 4 million Suns", "About 4 elephants", "About 4 Earths"], why: "Scientists measured it at about 4 million times the Sun's mass." },
        { q: "When was the first picture of it shared?", a: ["2022", "1066", "Never"], why: "The Event Horizon Telescope team shared the image in 2022." }
      ],
      react: [
        ["leo", "Careful, Captain. Don't get too close."],
        ["oda", "Will it eat us?"],
        ["dad", "Hold on to your biscuits!"],
        ["maggie", "Awooo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Sagittarius_A*",
      land: null
    },

    cygnusx1: {
      name: "Cygnus X-1",
      kind: "Black hole · The first one found",
      ly: 7200, ra: 299.590, dec: 35.202, type: "blackhole",
      facts: [
        "Cygnus X-1 was the first black hole most scientists agreed was real!",
        "It's about 21 times heavier than our Sun.",
        "It's about 7,200 light-years away, in the Swan."
      ],
      more: [
        "It was found in 1964 because it gives off powerful X-rays. That's where the X in its name comes from.",
        "The black hole has a giant blue partner star. They go round each other every 5.6 days.",
        "The black hole pulls gas off its partner. The gas swirls round in a disc and gets millions of degrees hot, glowing with X-rays.",
        "Stephen Hawking bet a friend it wasn't a black hole. In 1990 he admitted he'd lost the bet!"
      ],
      quiz: [
        { q: "What is Cygnus X-1?", a: ["A black hole", "A swan-shaped spaceship", "A type of crisp"], why: "Cygnus X-1 is a black hole with a big blue partner star." },
        { q: "How was it found?", a: ["By its X-rays", "By its smell", "Someone tripped over it"], why: "Hot gas swirling round the black hole gives off X-rays, which detectors picked up in 1964." },
        { q: "What did Stephen Hawking do?", a: ["Lost a bet that it wasn't a black hole", "Ate it", "Painted it pink"], why: "Hawking bet it wasn't a black hole, then admitted he'd lost in 1990." }
      ],
      react: [
        ["leo", "Keep a safe distance, Captain."],
        ["oda", "It's eating the star!"],
        ["dad", "Messy eater. Like Joules."],
        ["joules", "Woof?"]
      ],
      photo: "https://en.wikipedia.org/wiki/Cygnus_X-1",
      land: null
    },

    milkyway: {
      name: "The Milky Way",
      kind: "Galaxy · Our home galaxy, from above",
      /* Pretend viewpoint high above the galaxy's disc: direction of the
         north galactic pole; ly is a game distance, not a real place. */
      ly: 100000, ra: 192.859, dec: 27.128, type: "galaxy",
      facts: [
        "This is our home galaxy, the Milky Way, seen from far above!",
        "It holds hundreds of billions of stars, and the Sun is just one.",
        "Nobody has really seen it from outside. This is a pretend view!"
      ],
      more: [
        "The Milky Way is a spiral galaxy, more than 100,000 light-years across, with a bar of stars in the middle.",
        "Our Sun is about 27,000 light-years from the centre, in a small arm called the Orion Spur.",
        "The Sun takes about 230 million years to go once round the galaxy. Last time round, the first dinosaurs were only just appearing!",
        "Every picture of the whole Milky Way is a map or a painting. Scientists made them from measuring stars."
      ],
      quiz: [
        { q: "What shape is the Milky Way?", a: ["A spiral", "A cube", "A banana"], why: "The Milky Way is a spiral galaxy with a bar in the middle." },
        { q: "How long does the Sun take to go round the galaxy?", a: ["About 230 million years", "About a week", "One day"], why: "The Sun's trip round the galaxy takes about 230 million years." },
        { q: "Has anyone photographed the Milky Way from outside?", a: ["No, it's too big to leave", "Yes, Dad did", "Yes, on holiday"], why: "No spacecraft has gone anywhere near far enough, so pictures are maps." }
      ],
      react: [
        ["all", "Wooooow!"],
        ["harper", "Our whole galaxy!"],
        ["oda", "Which one is our house?"],
        ["mum", "It's breathtaking."]
      ],
      photo: "https://en.wikipedia.org/wiki/Milky_Way",
      land: null
    },

    lmc: {
      name: "Large Magellanic Cloud",
      kind: "Galaxy · Our neighbour",
      ly: 160000, ra: 80.894, dec: -69.756, type: "galaxy",
      facts: [
        "The Large Magellanic Cloud is a small galaxy that orbits our Milky Way.",
        "It's about 160,000 light-years away.",
        "You can only see it from the southern half of Earth."
      ],
      more: [
        "In the LMC is the Tarantula Nebula, one of the busiest star-making places we know.",
        "In 1987 a star in the LMC exploded. It was the brightest supernova seen from Earth in nearly 400 years.",
        "It's named after the explorer Ferdinand Magellan, but people in the southern half of the world knew it long before.",
        "It looks like a fuzzy cloud in the sky, but it's really billions of stars."
      ],
      quiz: [
        { q: "What does the Large Magellanic Cloud orbit?", a: ["The Milky Way", "The Moon", "A lamp post"], why: "The LMC is a small galaxy going round our much bigger Milky Way." },
        { q: "Where on Earth can you see it from?", a: ["The southern half", "Only London", "Only Mars"], why: "The LMC is far south in the sky, so you need to be in the southern half of Earth." },
        { q: "What spooky-named nebula is inside it?", a: ["The Tarantula Nebula", "The Ghost Toast Nebula", "The Spider Biscuit"], why: "The Tarantula Nebula is a huge star-forming cloud in the LMC." }
      ],
      react: [
        ["harper", "Another galaxy! A little one!"],
        ["oda", "It's a cloud of stars!"],
        ["leo", "Our galaxy's little neighbour."]
      ],
      photo: "https://en.wikipedia.org/wiki/Large_Magellanic_Cloud",
      land: null
    },

    andromeda: {
      name: "Andromeda Galaxy",
      kind: "Galaxy · Our big neighbour",
      ly: 2500000, ra: 10.685, dec: 41.269, type: "galaxy",
      facts: [
        "Andromeda is the nearest big galaxy to us.",
        "Its light takes about 2.5 million years to reach us!",
        "You can see it as a fuzzy smudge without a telescope."
      ],
      more: [
        "Scientists think Andromeda has around a trillion stars, more than our Milky Way.",
        "In the 1920s Edwin Hubble showed Andromeda is a separate galaxy, not a cloud inside ours.",
        "Andromeda is moving towards us. Newer studies say there's about a 50-50 chance it merges with us in the next 10 billion years.",
        "On a dark autumn night in the UK you can spot it with your eyes. It's one of the farthest things you can see!"
      ],
      quiz: [
        { q: "How long does Andromeda's light take to reach us?", a: ["About 2.5 million years", "About 2.5 seconds", "About 2.5 hours"], why: "Andromeda is about 2.5 million light-years away." },
        { q: "Can you see Andromeda without a telescope?", a: ["Yes, as a fuzzy smudge", "No, never", "Only with sunglasses"], why: "On a dark night it looks like a faint fuzzy patch." },
        { q: "Who showed it is a separate galaxy?", a: ["Edwin Hubble", "Oda", "Father Christmas"], why: "In the 1920s Edwin Hubble showed Andromeda is far outside our galaxy." }
      ],
      react: [
        ["mum", "A whole other galaxy!"],
        ["harper", "Hello, Andromeda!"],
        ["dad", "Long way from the chippy."],
        ["joules", "Awoo!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Andromeda_Galaxy",
      land: null
    },

    whirlpool: {
      name: "Whirlpool Galaxy",
      kind: "Galaxy · Spiral with a friend",
      ly: 31000000, ra: 202.470, dec: 47.195, type: "galaxy",
      facts: [
        "The Whirlpool Galaxy has beautiful swirly spiral arms.",
        "A smaller galaxy is tugging on the end of one arm!",
        "Scientists think it's around 23 to 31 million light-years away."
      ],
      more: [
        "The small companion galaxy is called NGC 5195. Its gravity helps stir up the Whirlpool's spiral arms.",
        "In 1845 Lord Rosse saw its spiral shape through his giant telescope in Ireland. It was the first spiral ever seen.",
        "Charles Messier found it in 1773. It's also called M51.",
        "You can find it near the end of the Plough's handle, with a small telescope."
      ],
      quiz: [
        { q: "What is tugging on the Whirlpool's arm?", a: ["A smaller galaxy", "A giant octopus", "A rope"], why: "A small galaxy called NGC 5195 is pulling on one spiral arm." },
        { q: "What shape is the Whirlpool Galaxy?", a: ["A spiral", "A square", "A star"], why: "It's a spiral galaxy with big swirling arms." },
        { q: "Who first saw its spiral shape?", a: ["Lord Rosse", "Joules the dog", "A pirate"], why: "Lord Rosse saw the spiral in 1845 with his big telescope in Ireland." }
      ],
      react: [
        ["oda", "It's swirly like a lollipop!"],
        ["mum", "Like a whirlpool in the bath!"],
        ["harper", "Two galaxies holding hands!"]
      ],
      photo: "https://en.wikipedia.org/wiki/Whirlpool_Galaxy",
      land: null
    },

    triangulum: {
      name: "Triangulum Galaxy",
      kind: "Galaxy · Andromeda's little neighbour",
      ly: 2730000, ra: 23.462, dec: 30.660, type: "galaxy",
      facts: [
        "The Triangulum Galaxy is a spiral galaxy near Andromeda.",
        "It's about 2.73 million light-years away!",
        "It's the third biggest galaxy in our Local Group."
      ],
      more: [
        "Our Local Group of galaxies is led by Andromeda and the Milky Way. Triangulum comes third, with about 40 billion stars.",
        "Under very dark skies some people can just see it without a telescope. It's one of the farthest things human eyes can see!",
        "It has a huge star nursery called NGC 604. It's much, much bigger than the Orion Nebula.",
        "It's also called M33. Scientists used to think it orbits Andromeda, but some newer studies say it might just be passing by."
      ],
      quiz: [
        { q: "How far away is the Triangulum Galaxy?", a: ["About 2.73 million light-years", "About 3 km", "Behind the sofa"], why: "Its light takes about 2.73 million years to reach us." },
        { q: "Which big galaxy is its neighbour?", a: ["Andromeda", "The Milky Bar", "Galaxy chocolate"], why: "Triangulum sits fairly close to the big Andromeda Galaxy in our sky and in space." },
        { q: "What is NGC 604?", a: ["A giant star nursery", "A bus route", "A robot's name"], why: "NGC 604 is an enormous cloud where new stars are being born." }
      ],
      react: [
        ["harper", "A triangle galaxy? It's a spiral!"],
        ["mum", "Another whole galaxy. Wow."],
        ["oda", "Where's the triangle?"],
        ["leo", "It's named after its constellation, Oda."]
      ],
      photo: "https://en.wikipedia.org/wiki/Triangulum_Galaxy",
      land: null
    },

    sombrero: {
      name: "Sombrero Galaxy",
      kind: "Galaxy · The space hat",
      ly: 31000000, ra: 189.998, dec: -11.623, type: "galaxy",
      facts: [
        "The Sombrero Galaxy looks like a giant Mexican hat!",
        "A dark band of dust goes all the way round its glowing middle.",
        "It's about 31 million light-years away."
      ],
      more: [
        "We see it almost edge-on, which is why it looks like a wide-brimmed hat.",
        "Scientists think a supermassive black hole about a billion times heavier than the Sun sits at its centre.",
        "It has around 2,000 globular clusters, big balls of old stars. Our Milky Way only has about 150.",
        "Pierre Méchain discovered it in 1781. It's also called M104, and you can find it in the constellation Virgo with a small telescope."
      ],
      quiz: [
        { q: "What does the Sombrero Galaxy look like?", a: ["A hat", "A shoe", "A trifle"], why: "With its bright middle and dark dusty rim, it looks like a sombrero hat." },
        { q: "Why does it look like a hat?", a: ["We see it almost edge-on", "It's wearing one", "Someone sat on it"], why: "We view it from almost side-on, so the dusty disc looks like a hat brim." },
        { q: "How far away is the Sombrero Galaxy?", a: ["About 31 million light-years", "About 31 steps", "In Mum's handbag"], why: "Its light takes about 31 million years to reach us." }
      ],
      react: [
        ["dad", "Hats off to that galaxy!"],
        ["oda", "Can I wear it?"],
        ["harper", "It really looks like a hat!"],
        ["maggie", "Arf! *wants to chase it*"]
      ],
      photo: "https://en.wikipedia.org/wiki/Sombrero_Galaxy",
      land: null
    }
  },

  /* ================= TRIP CHATTER ================= */
  tripChatter: [
    [["oda", "Are we there yet?"], ["dad", "Nearly. Only a few million km."]],
    [["oda", "Are we there yet?"], ["harper", "Oda, we only just left!"], ["maggie", "Arf!"]],
    [["harper", "Leo, how fast is light?"], ["leo", "About 300,000 km every second."], ["oda", "That's faster than Daddy's car!"]],
    [["dad", "Why did the astronaut break up?"], ["dad", "He needed space!"], ["mum", "Oh, Johnny."]],
    [["dad", "How do you organise a space party?"], ["dad", "You planet!"], ["harper", "Daaad!"]],
    [["dad", "What's an astronaut's favourite key?"], ["dad", "The space bar!"], ["oda", "I don't get it."]],
    [["oda", "Why is space dark?"], ["leo", "There's no air to spread the sunlight around."]],
    [["oda", "Can I have a snack?"], ["mum", "Space biscuits coming up."], ["joules", "Woof! Woof!"]],
    [["harper", "Is space really silent?"], ["leo", "Yes. Sound needs air to travel."], ["dad", "So nobody can hear my singing!"]],
    [["oda", "What's a light-year?"], ["leo", "How far light goes in a year."], ["harper", "About 9.5 trillion km!"]],
    [["mum", "Look at all those stars."], ["harper", "Every one is a sun!"]],
    [["oda", "Do stars have names?"], ["leo", "Lots of the bright ones do!"], ["harper", "Like Vega and Sirius."]],
    [["maggie", "*sniff sniff*"], ["joules", "*sniff sniff*"], ["dad", "Who brought the sandwiches?"]],
    [["oda", "Can I drive?"], ["harper", "I'm the captain!"], ["mum", "Maybe when you're six, Oda."]],
    [["harper", "Leo, why do planets go round?"], ["leo", "The Sun's gravity keeps pulling them in a curve."]],
    [["dad", "Where do astronauts leave their spaceship?"], ["dad", "At a parking meteor!"], ["mum", "Groan!"]],
    [["oda", "Is the Moon made of cheese?"], ["leo", "No, it's rock and dust. Sorry!"], ["oda", "Awww."]],
    [["joules", "Woof?"], ["maggie", "Woof woof!"], ["harper", "They're chatting about space squirrels."]],
    [["harper", "Leo, what's a comet?"], ["leo", "A dirty snowball that grows a tail near the Sun."]],
    [["oda", "Where do we wee in space?"], ["leo", "Special space toilets that suck it away!"], ["oda", "Eww!"]],
    [["mum", "Everyone buckled in?"], ["all", "Yes!"], ["joules", "Arf!"]],
    { when: "long", lines: [["oda", "This is taking ages."], ["leo", "Space is very, very big, Oda."]] },
    { when: "long", lines: [["harper", "Even light takes hours out here!"], ["leo", "Real rockets would take years."]] },
    { when: "long", lines: [["dad", "I spy with my little eye…"], ["oda", "Something black?"], ["dad", "How did you guess?"]] },
    { when: "long", lines: [["maggie", "Zzzz…"], ["mum", "The dogs are fast asleep."], ["oda", "I'm not sleepy!"]] },
    { when: "long", lines: [["harper", "How long would a real rocket take?"], ["leo", "New Horizons took over 9 years to reach Pluto."]] },
    { when: "deep", lines: [["oda", "We're out of the solar system!"], ["harper", "Into deep space!"], ["joules", "Awoo!"]] },
    { when: "deep", lines: [["harper", "Leo, is starlight old?"], ["leo", "Yes! You see light from long ago."]] },
    { when: "deep", lines: [["mum", "The Sun's just a tiny dot now."], ["oda", "Bye bye, Sun!"]] },
    { when: "deep", lines: [["harper", "How many galaxies are there?"], ["leo", "Scientists think hundreds of billions, maybe more!"]] },
    { when: "deep", lines: [["dad", "Did anyone pack a light-year of sandwiches?"], ["mum", "Just the one, love."]] },
    { when: "deep", lines: [["oda", "Are there aliens out here?"], ["leo", "Nobody knows yet. Scientists are looking!"]] },
    { when: "any", lines: [["dad", "How does the Moon cut his hair?"], ["dad", "Eclipse it!"], ["harper", "That's actually good."]] },
    { when: "any", lines: [["leo", "Fun fact: astronauts grow a bit taller in space."], ["oda", "I want to be taller!"]] },
    { when: "any", lines: [["harper", "Leo, what's a shooting star?"], ["leo", "A tiny space rock burning up in our air."]] }
,
    { when: "any", lines: [["harper", "Leo, can we watch the Orionids this month?"], ["leo", "Yes! They're crumbs from Halley's Comet."], ["oda", "Comet crumbs!"]] },
    { when: "long", lines: [["harper", "New Horizons went this way to Pluto!"], ["leo", "And it's still flying, out past Arrokoth."]] },
    { when: "long", lines: [["oda", "How many dwarf planets are there?"], ["leo", "Five official ones: Pluto, Eris, Haumea, Makemake and Ceres."], ["harper", "Pluto's the best!"]] },
    { when: "deep", lines: [["harper", "Leo, do other stars have planets?"], ["leo", "Thousands found so far! TRAPPIST-1 has seven."]] }
  ],

  /* ================= QUIZ ================= */
  quizCheers: {
    right: [
      ["leo", "Spot on, Captain!"],
      ["mum", "Brilliant, Harper!"],
      ["dad", "Out of this world!"],
      ["oda", "Yay! Harper's so clever!"],
      ["joules", "Woof woof!"],
      ["maggie", "Arf arf arf!"],
      ["all", "Hooray!"],
      ["leo", "Exactly right. Great thinking!"],
      ["dad", "That answer was stellar!"],
      ["mum", "You really know your space!"]
    ],
    wrong: [
      ["leo", "Good try! Now you know."],
      ["mum", "Not quite, but great guess!"],
      ["dad", "Even astronauts get it wrong sometimes."],
      ["oda", "I didn't know either!"],
      ["joules", "*nuzzle* Woof."],
      ["maggie", "*wag wag*"],
      ["leo", "That's how scientists learn: by trying!"],
      ["mum", "Ooh, so close!"],
      ["dad", "Ah well, back to the launch pad!"],
      ["leo", "Tricky one! Have another go next time."]
    ]
  },

  /* ================= LANDING ================= */
  landLines: {
    rocky: [
      ["harper", "Touchdown! Captain Harper has landed!"],
      ["oda", "Can I get out? Can I?"],
      ["dad", "Mind the step, it's a big one."],
      ["joules", "*sniff sniff sniff*"],
      ["leo", "Helmets on, everybody. Let's explore!"],
      ["mum", "Look at that view!"]
    ],
    lowGravity: [
      ["oda", "I'm bouncing! Boing boing!"],
      ["harper", "I can jump so high!"],
      ["maggie", "Arf?! *floats*"],
      ["dad", "Look, I'm a kangaroo!"],
      ["leo", "Less gravity means you weigh less here."],
      ["joules", "Woof! *boing*"]
    ],
    gas: [
      ["leo", "No ground here, Captain. We'll stay aboard."],
      ["harper", "We'd sink right into the clouds!"],
      ["oda", "Where's the floor gone?"],
      ["dad", "No parking here, I'm afraid."]
    ]
  },

  leoGreetings: [
    "Leo to Captain Harper, come in! Ready for adventure?",
    "Good morning, Captain! Your spaceship is ready. Where shall we go?",
    "Hello, Harper! Hello, crew! The whole universe is waiting.",
    "Leo here! Engines warm, dogs aboard. Ready when you are, Captain.",
    "Welcome back, Captain Harper! Pick a place and let's fly!"
  ],

  askSuggestions: [
    "How did the Sun start?",
    "Why is Pluto not a planet any more?",
    "What is a black hole?",
    "How do astronauts sleep in space?",
    "Why does the Moon change shape?",
    "Could people live on Mars?",
    "What is a shooting star?",
    "How big is the universe?",
    "Why do stars twinkle?",
    "Is there life on other planets?",
    "What happens when a star dies?",
    "How do rockets work?",
    "Why is the sky blue on Earth?",
    "Could my dogs go to space?"
  ],

  idleChatter: [
    ["harper", "I could look at this forever."],
    ["oda", "I need a wee."],
    ["dad", "This view is out of this world."],
    ["mum", "Isn't it peaceful out here?"],
    ["joules", "*sniff sniff*"],
    ["maggie", "*yawn*"],
    ["leo", "Take your time, Captain. Look around."],
    ["oda", "What's that sparkly thing?"],
    ["harper", "Where shall we go next?"],
    ["dad", "Anyone want a space sandwich?"],
    ["joules", "Woof!"],
    ["mum", "I'm so glad we came."],
    ["leo", "Tap a place to learn more about it."],
    ["oda", "Can we go to Pluto again?"],
    ["maggie", "Arf arf!"],
    ["harper", "I wonder what Pluto's cousins are doing."],
    ["oda", "I want to see a comet!"]
  ]
};
