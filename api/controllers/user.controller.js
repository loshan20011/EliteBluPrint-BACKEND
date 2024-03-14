import User from "../models/user.model.js";

export const getArchitects = async (req, res, next) => {
  try {
    const architects = await User.find({ 
        role: "architect" 
    }).select("name email");

    res.status(200).json({
      architects, // Include the architects' data in the response
      message: "Architects retrieved successfully"
    });
  } catch (error) {
    console.error(error.message);

    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("name");

    res.status(200).json({
      users, // Include the users' data in the response
      message: "Users retrieved successfully"
    });
  } catch (error) {
    console.error(error.message);

    next(error);
  }
}
