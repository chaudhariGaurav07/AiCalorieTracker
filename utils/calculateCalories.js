export const calculateCalories = ({
  gender,
  age,
  height,
  weight,
  activityLevel,
  goalType,
}) => {
  let bmr = 0;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very active": 1.9,
  };

  let tdee = bmr * activityMultiplier[activityLevel];

  if (goalType === "gain") tdee += 300;
  else if (goalType === "loss") tdee -= 300;

  const targetCalories = Math.round(tdee);

  const proteinGoal = Math.round(weight * 2); // 2g per kg
  const fatGoal = Math.round((0.25 * targetCalories) / 9);
  const carbGoal = Math.round(
    (targetCalories - proteinGoal * 4 - fatGoal * 9) / 4
  );

  return { targetCalories, proteinGoal, fatGoal, carbGoal };
};
