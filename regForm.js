document
  .getElementById("submitForm")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default form submission
    // Get form data
    var first_name = document.getElementById("firstName").value.trim();
    var last_name = document.getElementById("lastName").value.trim();
    var gender = document.getElementById("gender").value;
    var phone_no = document.getElementById("phoneNumber").value.trim();
    var dob = document.getElementById("dateOfBirth").value.trim();
    var zip_code = document.getElementById("zipCode").value.trim();
    var address = document.getElementById("address").value.trim();
    var medicationPlan = document.getElementById("medicationPlan").value.trim();
    var email = document.getElementById("email").value.trim();

    var medicalCondition = document
      .getElementById("medicalCondition")
      .value.trim();
    var otherDisease = document.getElementById("otherDisease").value.trim();
    var allergicToMedications = document
      .getElementById("allergicToMedications")
      .value.trim();
    var allergies = document.getElementById("allergies").value.trim();
    var currentWeight = parseFloat(
      document.getElementById("currentWeight").value.trim()
    );
    var idealWeight = parseFloat(
      document.getElementById("idealWeight").value.trim()
    );
    var height = parseFloat(document.getElementById("height").value.trim());
    // var bmi = parseFloat(document.getElementById("bmi").value.trim());
    // Validation checks

    const fields = [
      {
        name: "first_name",
        value: first_name,
        message: "Please enter your first name.",
      },
      {
        name: "last_name",
        value: last_name,
        message: "Please enter your last name.",
      },
      { name: "gender", value: gender, message: "Please select your gender." },
      {
        name: "phone_no",
        value: phone_no,
        message: "Please enter your phone number.",
      },
      { name: "dob", value: dob, message: "Please enter your date of birth." },
      {
        name: "zip_code",
        value: zip_code,
        message: "Please enter your zip code.",
      },
      {
        name: "address",
        value: address,
        message: "Please enter your address.",
      },
      {
        name: "email",
        value: email,
        message: "Please enter your email address.",
      },
      // {
      //   name: "medicationPlan",
      //   value: medicationPlan,
      //   message: "Please enter your medication plan.",
      // },
      // {
      //   name: "medicalCondition",
      //   value: medicalCondition,
      //   message: "Please specify your medical condition.",
      // },
      // {
      //   name: "allergicToMedications",
      //   value: allergicToMedications,
      //   message: "Please mention if you're allergic to any medications.",
      // },
      // {
      //   name: "currentWeight",
      //   value: currentWeight,
      //   message: "Please enter a valid current weight.",
      //   validate: (val) => !isNaN(val),
      // },
      // {
      //   name: "idealWeight",
      //   value: idealWeight,
      //   message: "Please enter a valid ideal weight.",
      //   validate: (val) => !isNaN(val),
      // },
      // {
      //   name: "height",
      //   value: height,
      //   message: "Please enter a valid height.",
      //   validate: (val) => !isNaN(val),
      // },
    ];

    // Iterate over fields and check validation
    for (let field of fields) {
      if (
        field.value === "" ||
        (field.validate && !field.validate(field.value))
      ) {
        alert(field.message);
        return; // Stop further execution if any field is invalid
      }
    }

    // Email validation using regular expression
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return; // Stop further execution if email is invalid
    }

    // Phone number validation using regular expression
    var phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_no)) {
      alert("Please enter a valid 10-digit phone number.");
      return; // Stop further execution if phone number is invalid
    }
    // Get all the checkboxes
    const checkboxes = document.querySelectorAll(
      'input[name="condition"]:checked'
    );
    // Create an array of checked checkbox values
    const selectedDiseases = Array.from(checkboxes).map(
      (checkbox) => checkbox.value
    );
    // Join the values with a comma
    const diseaseString = selectedDiseases.join(", ");

    function calculateBMI(weight, height) {
      console.log('height', height);
      
      if (weight && height) {
        // Split the input into feet and inches
        let [feet, inches] = height.toString().split(".").map(Number);
        // Handle cases where no inches are provided
        inches = inches ? inches : 0;
        // Convert height from feet and inches to total inches, then to meters
        let totalInches = feet * 12 + inches;
        let heightM = totalInches * 0.0254; // Convert inches to meters
        // Convert weight from lbs to kg
        let weightKg = weight * 0.453592;
        // Calculate BMI
        let bmi = weightKg / (heightM * heightM);
        let roundedBMI = Math.round(bmi * 100) / 100;
        // Return BMI rounded to 2 decimal places
        return roundedBMI;
      } else {
        return null;
      }
    }

    // Create a data object to send as JSON
    var formData = {
      first_name: first_name,
      last_name: last_name,
      gender: gender,
      phone_no: phone_no,
      dob: dob,
      zip_code: zip_code,
      address: address,
      medication_plan: medicationPlan,
      email: email,
      medical_condition: medicalCondition,
      other_disease: otherDisease,
      allergic_to_medications: allergicToMedications,
      allergies: allergies,
      current_weight: currentWeight,
      ideal_weight: idealWeight,
      height: height,
      bmi: calculateBMI(currentWeight, height),
      diseases: diseaseString,
    };

    const API_BASE =
      (typeof window !== "undefined" && window.BLISS_API_BASE) ||
      "https://YOUR-APP-NAME.onrender.com";
    const url = API_BASE + "/api/storeBLSRegFormData";

    // Use fetch to send data
    fetch(url, {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        alert("Form has been submitted successfully, thank you!");
        location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("There was an error sending your message.");
      });
  });

function validateInput(input) {
  let value = input.value;
  // Regular expression to match up to 3 digits before and 2 digits after the decimal point
  const regex = /^\d{0,3}(\.\d{0,2})?$/;
  // If input does not match the pattern, remove the last character
  if (!regex.test(value)) {
    input.value = value.slice(0, -1);
  }
}

function validateHeightInput(input) {
  let value = input.value;
  // Regular expression to match up to 3 digits before and 2 digits after the decimal point
  const regex = /^\d{0,1}(\.\d{0,2})?$/;
  // If input does not match the pattern, remove the last character
  if (!regex.test(value)) {
    input.value = value.slice(0, -1);
  }
}

function toggleMedicalConditions() {
  var medicalDropdown = document.getElementById("medicalCondition");
  var conditionsList = document.getElementById("conditions-list");

  if (medicalDropdown.value === "yes") {
    conditionsList.style.display = "block"; // Show the conditions list
  } else {
    conditionsList.style.display = "none"; // Hide the conditions list
  }
}

function toggleAllergicMedication() {
  var allergicConditionDropdown = document.getElementById(
    "allergicToMedications"
  );
  var conditionsList = document.getElementById("allergicToMedicationsList");
  if (allergicConditionDropdown.value === "yes") {
    conditionsList.style.display = "block"; // Show the conditions list
  } else {
    conditionsList.style.display = "none"; // Hide the conditions list
  }
}

function calculateBMI() {
  const heightInput = document.getElementById("height").value; // Example input: "5.11"
  const weight = parseFloat(document.getElementById("currentWeight").value);
  let bmiResult = document.getElementById("bmi-result");

  console.log('height', typeof heightInput);

  if (weight && heightInput) {
    // Split the input into feet and inches
    let [feet, inches] = heightInput.split(".").map(Number);

    // Handle cases where no inches are provided
    inches = inches ? inches : 0;

    // Convert height from feet and inches to total inches, then to meters
    let totalInches = feet * 12 + inches;
    let heightM = totalInches * 0.0254; // Convert inches to meters

    // Convert weight from lbs to kg
    let weightKg = weight * 0.453592;

    // Calculate BMI
    let bmi = weightKg / (heightM * heightM);
    let roundedBMI = Math.round(bmi * 100) / 100;
    bmiResult.value = roundedBMI;

    // Return BMI rounded to 2 decimal places
    return roundedBMI;
  } else {
    bmiResult.value = null;
    return null;
  }
}