import { Habit } from "../models/habit.model.js";
import { User } from "../models/user.model.js";
import { HabitProgress } from "../models/habitprogress.model.js";

export const createHabit = async (req, res) => {
    try {
      const { habits } = req.body;  
      const userId = req.user._id;
  
      if (!habits || !Array.isArray(habits) || habits.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid habit data" });
      }
  
      const newHabits = habits.map(habit => ({
        user: userId,
        name: habit.name,
        description: habit.description || "",
        frequency: habit.frequency,
        reminders: habit.reminders || [],
        streak: 0,
        progress: [],
        lastCompleted: null,
      }));
  
      const createdHabits = await Habit.insertMany(newHabits);
  
      const habitIds = createdHabits.map(habit => habit._id);
  
      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { habits: { $each: habitIds } } },
        { new: true }
      );
  
      res.status(201).json({
        success: true,
        message: `${createdHabits.length} habit(s) created successfully!`,
        habits: createdHabits,
        user: {
          _id: user._id,
          habits: user.habits
        }
      });
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
export const getUserHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).populate("progress");

    res.status(200).json({ success: true, habits });
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { name, description, frequency, reminders } = req.body;

    let habit = await Habit.findOne({ _id: habitId, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    habit.name = name || habit.name;
    habit.description = description || habit.description;
    habit.frequency = frequency || habit.frequency;
    habit.reminders = reminders || habit.reminders;

    await habit.save();

    res.status(200).json({ success: true, message: "Habit updated successfully", habit });
  } catch (error) {
    console.error("Error updating habit:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const completeHabit = async (req, res) => {
    try {
        const { habitId } = req.body;
        const userId = req.user._id;  

        const habit = await Habit.findOne({ _id: habitId, user: userId });

        if (!habit) {
            return res.status(404).json({ success: false, message: "Habit not found" });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1); 
        yesterday.setHours(0, 0, 0, 0);

        if (habit.lastCompleted) {
            const lastCompletedDate = new Date(habit.lastCompleted);
            lastCompletedDate.setHours(0, 0, 0, 0);

            if (lastCompletedDate.getTime() === yesterday.getTime()) {
                habit.streak += 1;  
            } else if (lastCompletedDate.getTime() < yesterday.getTime()) {
                habit.streak = 1;  
            }
        } else {
            habit.streak = 1;  
        }

        // ✅ Save progress in HabitProgress model
        const habitProgress = await HabitProgress.create({
            habit: habit._id,
            user: userId,
            date: today
        });

        habit.progress.push(habitProgress._id);
        habit.lastCompleted = today;
        await habit.save();

        // ✅ Update User's streak based on all habits
        const user = await User.findById(userId);
        
        const userHabits = await Habit.find({ user: userId });
        user.streak = Math.max(...userHabits.map(h => h.streak), 0);  

        if (user.streak > user.longestStreak) {
            user.longestStreak = user.streak;  
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Habit completed successfully!",
            habitStreak: habit.streak,
            userStreak: user.streak,
            longestStreak: user.longestStreak,
        });
    } catch (error) {
        console.error("Error completing habit:", error);
        res.status(500).json({ success: false, message: "Server error, please try again" });
    }
};
// 5. Delete Habit
export const deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findOneAndDelete({ _id: habitId, user: req.user._id });

    if (!habit) {
      return res.status(404).json({ success: false, message: "Habit not found" });
    }

    res.status(200).json({ success: true, message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
