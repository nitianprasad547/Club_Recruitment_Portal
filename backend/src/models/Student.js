
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    branch: {
      type: String,
      required: [true, "Branch is required"],
      enum: [
        "Computer Science and Engineering",
        "Electronics and Communication Engineering",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
        "Metallurgical and Materials Engineering",
        "Biotechnology and Medical Engineering",
      ],
    },

    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be between 1 and 4"],
      max: [4, "Year must be between 1 and 4"],
    },

    team: {
        type: String,
        required: [true, "Team is required"],
        enum: [
            "Web Dev",
            "AI/ML",
        ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    reason: {
        type: String,
        required: [true, "Reason for applying is required"],
        trim: true,
        minlength: [20, "Reason must be at least 20 characters"],
        maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
