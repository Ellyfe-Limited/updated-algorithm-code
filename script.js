document.getElementById("hydrationForm").addEventListener("submit", function (e) {
  e.preventDefault();
  // Hide previous results or errors
  document.getElementById("result").classList.add("d-none");
  document.getElementById("error").classList.add("d-none");

  try {
    // Retrieve and trim input values
    const age = parseFloat(document.getElementById("age").value.trim());
    const height = parseFloat(document.getElementById("height").value.trim());
    const weight = parseFloat(document.getElementById("weight").value.trim());
    const gender = document.getElementById("gender").value.trim().toUpperCase();
    const ffm = parseFloat(document.getElementById("ffm").value.trim());
    const muscleMass = parseFloat(document.getElementById("muscleMass").value.trim());
    const measuredTBW = parseFloat(document.getElementById("measuredTBW").value.trim());

    // Validate inputs
    if (isNaN(age) || age < 18 || age > 150) {
      throw new Error("Age must be between 18 and 150 years.");
    }
    if (isNaN(height) || height <= 0) {
      throw new Error("Height must be a positive number.");
    }
    if (isNaN(weight) || weight <= 0) {
      throw new Error("Weight must be a positive number.");
    }
    if (gender !== "M" && gender !== "F") {
      throw new Error("Gender must be 'M' or 'F'.");
    }
    if (isNaN(ffm) || ffm <= 0 || ffm > weight) {
      throw new Error("Fat-Free Mass must be positive and no more than total weight.");
    }
    if (isNaN(muscleMass) || muscleMass < 0 || muscleMass > ffm) {
      throw new Error("Muscle Mass must be non-negative and cannot exceed Fat-Free Mass.");
    }
    if (isNaN(measuredTBW) || measuredTBW <= 0) {
      throw new Error("Measured TBW must be a positive number.");
    }

    // Calculate piecewise age-based decrement
    let decrement = 0;
    if (age <= 30) {
      decrement = 0;
    } else if (age <= 70) {
      decrement = 0.001 * (age - 30);
    } else {
      // For ages above 70, first apply decrement from 30 to 70, then a steeper rate
      decrement = 0.001 * 40 + 0.002 * (age - 70);
    }

    // Calculate adjusted water fractions:
    const baseMuscleFraction = 0.75;
    const baseNonMuscleFraction = 0.67;
    const adjustedMuscleFraction = baseMuscleFraction - decrement;
    const adjustedNonMuscleFraction = baseNonMuscleFraction - decrement;

    if (adjustedMuscleFraction <= 0 || adjustedNonMuscleFraction <= 0) {
      throw new Error("The age adjustment resulted in an invalid water fraction. Please check your input age.");
    }

    // Calculate predicted TBW using the robust algorithm:
    const predictedTBW = (muscleMass * adjustedMuscleFraction) +
                         ((ffm - muscleMass) * adjustedNonMuscleFraction);

    if (predictedTBW <= 0) {
      throw new Error("Predicted TBW is non-positive; cannot compute hydration percentage.");
    }

    // Calculate hydration percentage:
    const hydrationPercentage = (measuredTBW / predictedTBW) * 100;

    // Format results
    const resultText = `
      <strong>Age:</strong> ${age} years<br>
      <strong>Adjusted Muscle Water Fraction:</strong> ${adjustedMuscleFraction.toFixed(3)}<br>
      <strong>Adjusted Non-Muscle Water Fraction:</strong> ${adjustedNonMuscleFraction.toFixed(3)}<br>
      <strong>Predicted TBW:</strong> ${predictedTBW.toFixed(2)} L<br>
      <strong>Measured TBW:</strong> ${measuredTBW.toFixed(2)} L<br>
      <strong>Hydration Percentage:</strong> ${hydrationPercentage.toFixed(2)}%
    `;
    const resultDiv = document.getElementById("result");
    document.getElementById("resultText").innerHTML = resultText;
    resultDiv.classList.remove("d-none");
    resultDiv.classList.add("fade-in");

  } catch (error) {
    const errorDiv = document.getElementById("error");
    document.getElementById("errorText").textContent = error.message;
    errorDiv.classList.remove("d-none");
    errorDiv.classList.add("fade-in");
  }
});
