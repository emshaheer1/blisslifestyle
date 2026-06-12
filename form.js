document
  .getElementById("submitForm")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    var name = document.getElementById("name").value.trim();
    var dob = document.getElementById("dob").value.trim();
    var gender = document.getElementById("gender").value;
    var address = document.getElementById("address").value.trim();
    var zip = document.getElementById("zip").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var email = document.getElementById("email").value.trim();

    // Validation checks
    if (
      name === "" ||
      dob === "" ||
      gender === "" ||
      address === "" ||
      zip === "" ||
      phone === "" ||
      email === ""
    ) {
      alert("Please fill out all fields.");
      return; // Stop further execution if any field is empty
    }

    // Email validation using regular expression
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return; // Stop further execution if email is invalid
    }

    // Phone number validation using regular expression
    var phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return; // Stop further execution if phone number is invalid
    }

    // Create a data object to send as JSON
    var formData = {
      name: name,
      dob: dob,
      gender: gender,
      address: address,
      zip: zip,
      phone: phone,
      email: email,
    };

    const API_BASE =
      (typeof window !== "undefined" && window.BLISS_API_BASE) ||
      "https://YOUR-APP-NAME.onrender.com";
    const url = API_BASE + "/api/blisLifeData";

    // Use fetch to send data
    fetch(url, {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        alert("Thank you for your message!");
        location.reload();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("There was an error sending your message.");
      });
  });