// Toggle Dark Mode
document.getElementById("darkModeToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  // Change icon and text based on mode
  const icon = this.querySelector("i");
  if (document.body.classList.contains("dark-mode")) {
    icon.classList.replace("fa-moon", "fa-sun");
    this.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
  } else {
    icon.classList.replace("fa-sun", "fa-moon");
    this.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
  }
});

// Main Calculation Function
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

    // Calculate piecewise age-based decrement for Smart Hydration algorithm
    let decrement = 0;
    if (age <= 30) {
      decrement = 0;
    } else if (age <= 70) {
      decrement = 0.001 * (age - 30);
    } else {
      // For ages above 70: first 40 years from 30 to 70 then steeper rate for each year above 70.
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

    // Smart Hydration Algorithm: Predicted TBW
    const predictedTBW_Smart = (muscleMass * adjustedMuscleFraction) +
                               ((ffm - muscleMass) * adjustedNonMuscleFraction);
    if (predictedTBW_Smart <= 0) {
      throw new Error("Predicted TBW (Smart) is non-positive; cannot compute hydration percentage.");
    }
    const hydrationPercentage = (measuredTBW / predictedTBW_Smart) * 100;

    // Watson Formula TBW Calculation:
    let predictedTBW_Watson = 0;
    if (gender === "M") {
      predictedTBW_Watson = 2.447 - 0.09156 * age + 0.1074 * height + 0.3362 * weight;
    } else {
      predictedTBW_Watson = -2.097 + 0.1069 * height + 0.2466 * weight;
    }

    // Hume–Weyers Formula TBW Calculation:
    let predictedTBW_Hume = 0;
    if (gender === "M") {
      predictedTBW_Hume = 0.32810 * weight + 0.33929 * height - 29.5336;
    } else {
      predictedTBW_Hume = 0.29569 * weight + 0.29796 * height - 14.0129;
    }

    // Format and display results:
    const resultHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>Smart Hydration Prediction:</strong> ${predictedTBW_Smart.toFixed(2)} L</li>
        <li class="list-group-item"><strong>Adjusted Muscle Water Fraction:</strong> ${adjustedMuscleFraction.toFixed(3)}</li>
        <li class="list-group-item"><strong>Adjusted Non-Muscle Water Fraction:</strong> ${adjustedNonMuscleFraction.toFixed(3)}</li>
        <li class="list-group-item"><strong>Hydration Percentage (Smart):</strong> ${hydrationPercentage.toFixed(2)}%</li>
        <li class="list-group-item"><strong>Watson Formula TBW:</strong> ${predictedTBW_Watson.toFixed(2)} L</li>
        <li class="list-group-item"><strong>Hume–Weyers Formula TBW:</strong> ${predictedTBW_Hume.toFixed(2)} L</li>
        <li class="list-group-item"><strong>Measured TBW:</strong> ${measuredTBW.toFixed(2)} L</li>
      </ul>
    `;
    document.getElementById("resultText").innerHTML = resultHTML;
    const resultDiv = document.getElementById("result");
    resultDiv.classList.remove("d-none");
    resultDiv.classList.add("fade-in");

    // Store results for export (as an object)
    window.hydrationResults = {
      Age: age,
      Height_cm: height,
      Weight_kg: weight,
      Gender: gender,
      FatFreeMass_kg: ffm,
      MuscleMass_kg: muscleMass,
      MeasuredTBW_L: measuredTBW,
      PredictedTBW_Smart_L: predictedTBW_Smart.toFixed(2),
      AdjustedMuscleFraction: adjustedMuscleFraction.toFixed(3),
      AdjustedNonMuscleFraction: adjustedNonMuscleFraction.toFixed(3),
      HydrationPercentage: hydrationPercentage.toFixed(2),
      PredictedTBW_Watson_L: predictedTBW_Watson.toFixed(2),
      PredictedTBW_Hume_L: predictedTBW_Hume.toFixed(2)
    };

  } catch (error) {
    const errorDiv = document.getElementById("error");
    document.getElementById("errorText").textContent = error.message;
    errorDiv.classList.remove("d-none");
    errorDiv.classList.add("fade-in");
  }
});

// Export to CSV functionality
document.getElementById("exportBtn").addEventListener("click", function () {
  if (!window.hydrationResults) {
    alert("Please calculate the results first before exporting.");
    return;
  }
  // Create CSV header and data rows
  const headers = [
    "Age", "Height (cm)", "Weight (kg)", "Gender", "Fat-Free Mass (kg)",
    "Muscle Mass (kg)", "Measured TBW (L)", "Predicted TBW (Smart) (L)",
    "Adjusted Muscle Fraction", "Adjusted Non-Muscle Fraction", "Hydration Percentage (%)",
    "Predicted TBW (Watson) (L)", "Predicted TBW (Hume–Weyers) (L)"
  ];
  const data = [
    window.hydrationResults.Age,
    window.hydrationResults.Height_cm,
    window.hydrationResults.Weight_kg,
    window.hydrationResults.Gender,
    window.hydrationResults.FatFreeMass_kg,
    window.hydrationResults.MuscleMass_kg,
    window.hydrationResults.MeasuredTBW_L,
    window.hydrationResults.PredictedTBW_Smart_L,
    window.hydrationResults.AdjustedMuscleFraction,
    window.hydrationResults.AdjustedNonMuscleFraction,
    window.hydrationResults.HydrationPercentage,
    window.hydrationResults.PredictedTBW_Watson_L,
    window.hydrationResults.PredictedTBW_Hume_L
  ];
  
  let csvContent = headers.join(",") + "\n" + data.join(",");
  const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "hydration_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
