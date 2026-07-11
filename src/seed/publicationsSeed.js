require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const Publication = require("../models/Publication");
const User = require("../models/User");

const demoUserData = {
  username: "demo",
  password: "123456",
  profile: {
    fantasyName: "Vinoteca Los Andes",
    address: "Av. Siempre Viva 123",
    phone: "+54 261 555-1234",
    contactEmail: "contacto@losandes.com",
  },
};

const demoPublications = [
  {
    title: "Nuevo Malbec Reserva 2023",
    productName: "Altura Malbec Reserva",
    description:
      "Malbec intenso con notas de ciruela, vainilla y roble suave. Ideal para carnes y pastas con salsas profundas.",
    imageUrl:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3",
    type: "Tinto",
    category: "Recomendación",
    price: 12500,
    publicationDate: new Date("2026-06-10T12:00:00.000Z"),
    isActive: true,
  },
  {
    title: "Blend de autor para temporada de invierno",
    productName: "Blend Cordillera",
    description:
      "Corte equilibrado de Malbec y Cabernet con final especiado. Pensado para degustaciones y regalos premium.",
    imageUrl:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb",
    type: "Tinto",
    category: "Evento",
    price: 15800,
    publicationDate: new Date("2026-06-18T12:00:00.000Z"),
    isActive: true,
  },
  {
    title: "Espumante brut nature edicion limitada",
    productName: "Brut Nature Andes",
    description:
      "Espumante fresco, seco y elegante, con burbuja fina y notas citricas. Una opcion liviana para celebraciones.",
    imageUrl:
      "https://images.unsplash.com/photo-1547595628-c61a29f496f0",
    type: "Espumante",
    category: "Compra/Venta",
    price: 9800,
    publicationDate: new Date("2026-06-25T12:00:00.000Z"),
    isActive: true,
  },
];

const getOrCreateDemoUser = async () => {
  const existingUser = await User.findOne({ username: demoUserData.username });

  if (existingUser) {
    existingUser.profile = demoUserData.profile;
    await existingUser.save();
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash(demoUserData.password, 10);

  return User.create({
    username: demoUserData.username,
    password: hashedPassword,
    profile: demoUserData.profile,
  });
};

const seedPublications = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Falta configurar MONGODB_URI en el archivo .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const demoUser = await getOrCreateDemoUser();
  const profile = demoUser.profile;

  for (const demoPublication of demoPublications) {
    const publicationData = {
      ...demoPublication,
      user: demoUser._id,
      businessName: profile.fantasyName,
      wineryName: profile.fantasyName,
      contactEmail: profile.contactEmail,
      address: profile.address,
      phone: profile.phone,
    };

    const publication = await Publication.findOne({
      title: demoPublication.title,
    });

    if (publication) {
      Object.assign(publication, publicationData);
      await publication.save();
      console.log(`Actualizada: ${demoPublication.title}`);
    } else {
      await Publication.create(publicationData);
      console.log(`Creada: ${demoPublication.title}`);
    }
  }

  console.log("Seed de publicaciones finalizado");
};

seedPublications()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Error cargando publicaciones demo:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
