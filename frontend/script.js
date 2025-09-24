document.addEventListener("DOMContentLoaded", function () {
  // Handle Contact Form Submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const message = contactForm.message.value.trim();

      if (!name || !email || !message) {
        document.getElementById("responseMsg").textContent = "Please fill all fields.";
        return;
      }

      fetch("http://localhost:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("responseMsg").textContent = data.message || "Message sent!";
          contactForm.reset();
        })
        .catch((err) => {
          document.getElementById("responseMsg").textContent = "Something went wrong. Try again later.";
          console.error(err);
        });
    });
  }

  // Populate Pet Dropdown for Adoption Form
  const petSelect = document.getElementById("petId");
  if (petSelect) {
    fetch("http://localhost:5000/api/pets")
      .then((res) => res.json())
      .then((pets) => {
        petSelect.innerHTML = '<option value="">Select Pet</option>';
        pets.forEach((pet) => {
          const option = document.createElement("option");
          option.value = pet.Pet_ID;
          option.textContent = `${pet.Name} (${pet.Breed})`;
          petSelect.appendChild(option);
        });
      })
      .catch((err) => {
        console.error("Failed to load pets:", err);
        petSelect.innerHTML = '<option value="">Failed to load pets</option>';
      });
  }

  // Handle Adoption Form Submission
  const adoptForm = document.getElementById("adoptForm");
  if (adoptForm) {
    adoptForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const Adoption_ID = this.adoptionId.value.trim();
      const Adopter_ID = this.adopterId.value.trim();
      const Pet_ID = this.petId.value;
      const Adoption_Date = this.adoptionDate.value;
      const Adoption_Fees = this.adoptionFees.value.trim();

      if (!Adoption_ID || !Adopter_ID || !Pet_ID || !Adoption_Date || !Adoption_Fees) {
        document.getElementById("responseMessage").textContent = "Please fill all fields.";
        return;
      }

      fetch("http://localhost:5000/api/adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Adoption_ID, Adopter_ID, Pet_ID, Adoption_Date, Adoption_Fees }),
      })
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("responseMessage").textContent = data.message || "Adoption recorded successfully!";
          adoptForm.reset();
        })
        .catch((err) => {
          document.getElementById("responseMessage").textContent = "Error submitting adoption. Please try again.";
          console.error(err);
        });
    });
  }
});