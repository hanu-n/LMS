import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./models/Student.js";

dotenv.config();

const students = [
  { name: "Mikiyas Bekele", studentId: "STU001", gradeLevel: "Grade 1", section: "A", gender: "Male" },
  { name: "Lidya Tsegaye", studentId: "STU002", gradeLevel: "Grade 1", section: "A", gender: "Female" },
  { name: "Nahom Dereje", studentId: "STU003", gradeLevel: "Grade 1", section: "A", gender: "Male" },
  { name: "Helina Tesfaw", studentId: "STU004", gradeLevel: "Grade 1", section: "A", gender: "Female" },
  { name: "Yonatan Haile", studentId: "STU005", gradeLevel: "Grade 1", section: "A", gender: "Male" },
  { name: "Marta Worku", studentId: "STU006", gradeLevel: "Grade 1", section: "A", gender: "Female" },
  { name: "Biruk Solomon", studentId: "STU007", gradeLevel: "Grade 2", section: "B", gender: "Male" },
  { name: "Sofiya Endale", studentId: "STU008", gradeLevel: "Grade 2", section: "B", gender: "Female" },
  { name: "Henok Molla", studentId: "STU009", gradeLevel: "Grade 3", section: "A", gender: "Male" },
  { name: "Ruth Amare", studentId: "STU010", gradeLevel: "Grade 3", section: "A", gender: "Female" },

  { name: "Abel Girma", studentId: "STU011", gradeLevel: "Grade 3", section: "B", gender: "Male" },
  { name: "Sena Daniel", studentId: "STU012", gradeLevel: "Grade 3", section: "B", gender: "Female" },
  { name: "Nathaniel Fikre", studentId: "STU013", gradeLevel: "Grade 4", section: "A", gender: "Male" },
  { name: "Rahel Mesele", studentId: "STU014", gradeLevel: "Grade 4", section: "A", gender: "Female" },
  { name: "Ethan Samuel", studentId: "STU015", gradeLevel: "Grade 4", section: "B", gender: "Male" },
  { name: "Bilen Getachew", studentId: "STU016", gradeLevel: "Grade 4", section: "B", gender: "Female" },
  { name: "Abraham Yared", studentId: "STU017", gradeLevel: "Grade 5", section: "A", gender: "Male" },
  { name: "Selamawit Desta", studentId: "STU018", gradeLevel: "Grade 5", section: "A", gender: "Female" },
  { name: "Mulugeta Abate", studentId: "STU019", gradeLevel: "Grade 5", section: "B", gender: "Male" },
  { name: "Feven Kiros", studentId: "STU020", gradeLevel: "Grade 5", section: "B", gender: "Female" },

  { name: "Henok Kassa", studentId: "STU021", gradeLevel: "Grade 6", section: "A", gender: "Male" },
  { name: "Lily Mekonen", studentId: "STU022", gradeLevel: "Grade 6", section: "A", gender: "Female" },
  { name: "Samuel Kassaye", studentId: "STU023", gradeLevel: "Grade 6", section: "B", gender: "Male" },
  { name: "Hanna Fisseha", studentId: "STU024", gradeLevel: "Grade 6", section: "B", gender: "Female" },
  { name: "Natnael Birhanu", studentId: "STU025", gradeLevel: "Grade 7", section: "A", gender: "Male" },
  { name: "Meron Tadele", studentId: "STU026", gradeLevel: "Grade 7", section: "A", gender: "Female" },
  { name: "Daniel Tsegaw", studentId: "STU027", gradeLevel: "Grade 7", section: "B", gender: "Male" },
  { name: "Biftu Mohammed", studentId: "STU028", gradeLevel: "Grade 7", section: "B", gender: "Female" },
  { name: "Ibrahim Jemal", studentId: "STU029", gradeLevel: "Grade 8", section: "A", gender: "Male" },
  { name: "Eden Teklu", studentId: "STU030", gradeLevel: "Grade 8", section: "A", gender: "Female" },

  { name: "Kidus Alemu", studentId: "STU031", gradeLevel: "Grade 8", section: "B", gender: "Male" },
  { name: "Mahiya Eshetu", studentId: "STU032", gradeLevel: "Grade 8", section: "B", gender: "Female" },
  { name: "Yonathan Kibret", studentId: "STU033", gradeLevel: "Grade 1", section: "C", gender: "Male" },
  { name: "Sara Birru", studentId: "STU034", gradeLevel: "Grade 1", section: "C", gender: "Female" },
  { name: "Dawit Hagos", studentId: "STU035", gradeLevel: "Grade 2", section: "C", gender: "Male" },
  { name: "Tsion Mesfin", studentId: "STU036", gradeLevel: "Grade 2", section: "C", gender: "Female" },
  { name: "Nahom Fitsum", studentId: "STU037", gradeLevel: "Grade 3", section: "C", gender: "Male" },
  { name: "Rediet Yohannes", studentId: "STU038", gradeLevel: "Grade 3", section: "C", gender: "Female" },
  { name: "Mikiyas Abay", studentId: "STU039", gradeLevel: "Grade 4", section: "C", gender: "Male" },
  { name: "Hawi Lemma", studentId: "STU040", gradeLevel: "Grade 4", section: "C", gender: "Female" },

  { name: "Yeabsira Tesema", studentId: "STU041", gradeLevel: "Grade 5", section: "C", gender: "Female" },
  { name: "Eyob Tadese", studentId: "STU042", gradeLevel: "Grade 5", section: "C", gender: "Male" },
  { name: "Amanuel Tefera", studentId: "STU043", gradeLevel: "Grade 6", section: "C", gender: "Male" },
  { name: "Selam Mulu", studentId: "STU044", gradeLevel: "Grade 6", section: "C", gender: "Female" },
  { name: "Sami Ibrahim", studentId: "STU045", gradeLevel: "Grade 7", section: "C", gender: "Male" },
  { name: "Kalkidan Tura", studentId: "STU046", gradeLevel: "Grade 7", section: "C", gender: "Female" },
  { name: "Adam Gomora", studentId: "STU047", gradeLevel: "Grade 8", section: "C", gender: "Male" },
  { name: "Sosina Reda", studentId: "STU048", gradeLevel: "Grade 8", section: "C", gender: "Female" },
  { name: "Hanania Yosef", studentId: "STU049", gradeLevel: "Grade 5", section: "A", gender: "Female" },
  { name: "Robel Sorsa", studentId: "STU050", gradeLevel: "Grade 2", section: "B", gender: "Male" }
];

const seedStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Student.deleteMany();
    await Student.insertMany(students);
    console.log("✅ Students seeded successfully (clean version)!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding students:", error);
    process.exit(1);
  }
};

seedStudents();
