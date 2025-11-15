// API link
const apiUrl = "https://690f62e645e65ab24ac39d81.mockapi.io/phonebook";

// declare values
const contactList = document.getElementById("contactList");
const addContactForm = document.getElementById("addContactForm");
const noItems = document.getElementById("noItems");
const noSearch = document.getElementById("noSearch");
const modalLabel = document.getElementById("addContactModalLabel");

// get add contact button by id
const addBtn = document.querySelector("[data-bs-target='#addContactModal']");

let editingId = null;

// when clicking add button set title back and reset form
addBtn.addEventListener("click", () => {
  editingId = null;
  modalLabel.innerText = "Add New Contact";
  addContactForm.reset();
});

// fetch contacts from api
const fetchContact = async () => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    displayList(data);
  } catch (error) {
    console.error(error);
  }
};

// Add search functionality

fetchContact();

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
});

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", () => {
  
  const search = searchInput.value.trim().toLowerCase();
  let found = false;
  document.querySelectorAll(".contact-item").forEach((item) => {
    const name = item.querySelector(".contact-name").textContent.toLowerCase();
    const phone = item
      .querySelector(".contact-phone")
      .textContent.toLowerCase();
    const email =
      item.querySelector(".contact-email").textContent.toLowerCase() || "";
    if (
      name.includes(search) ||
      phone.includes(search) ||
      email.includes(search)
    ) {
      item.style.display = "flex";
      found = true;
    } else {
      item.style.display = "none";
    }
  });

  if (!found) {
    noSearch.classList.remove("d-none");
  } else {
    noSearch.classList.add("d-none");
  }
});

// show toast message

function showToast(message) {
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  const toastEl = new bootstrap.Toast(document.getElementById("successToast"));
  toastEl.show();
}



// show contacts in the list
const displayList = (contacts) => {
  contactList.innerHTML = "";

  if (contacts.length === 0) {
    noItems.classList.remove("d-none");
    contactList.appendChild(noItems);
    return;
  }

  noItems.classList.add("d-none");

  contacts.forEach((contact) => {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "bg-transparent",
      "border-0",
      "contact-item"
    );

    li.innerHTML = `
       <div class="d-flex justify-content-between align-items-center text-white w-100">

    <div>
      <h6 class="mb-0 fw-semibold contact-name">${contact.name}</h6>
      <small class="text-primary fw-semibold contact-phone">${contact.phone}</small>
    </div>

    <div class="ms-3">
      <p class="email contact-email mb-0">${contact.email}</p>
    </div>

    <div class="d-flex gap-3">
      <button class="btn btn-sm btn-outline-info edit-btn">
        <i class="bi bi-pencil-square"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger delete-btn">
        <i class="bi bi-trash"></i>
      </button>
    </div>

  </div>
    `;

    li.dataset.id = contact.id;

    // delete contact
    li.querySelector(".delete-btn").addEventListener("click", async () => {
      const sure = confirm("Delete this contact?");
      if (!sure) return;

      await fetch(`${apiUrl}/${contact.id}`, { method: "DELETE" });
      fetchContact();
      showToast('Contact deleted successfully');
    });

    // edit contact
    li.querySelector(".edit-btn").addEventListener("click", () => {
      editingId = contact.id;

      // change modal title to edit
      modalLabel.innerText = "Edit Contact";

      // fill form with contact data
      document.getElementById("contactName").value = contact.name;
      document.getElementById("contactPhone").value = contact.phone;
      document.getElementById("contactEmail").value = contact.email;

      // open modal
      const modal = new bootstrap.Modal(
        document.getElementById("addContactModal")
      );
      modal.show();
    });

    contactList.appendChild(li);
    
  });
};

fetchContact();

// add or update contact
addContactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // get form values
  const newContact = {
    name: document.getElementById("contactName").value.trim(),
    phone: document.getElementById("contactPhone").value.trim(),
    email: document.getElementById("contactEmail").value.trim(),
  };

  try {
    let response;

    // add contact
    if (editingId === null) {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });
    }

    // update contact
    else {
      response = await fetch(`${apiUrl}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });

      editingId = null;
    }

    // close modal and refresh list
    if (response.ok) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addContactModal")
      );
      modal.hide();

      showToast(editingId ? "Contact updated successfully" : "Contact added successfully");      addContactForm.reset();
      fetchContact();
    }
  } catch (error) {
    console.error("Error saving contact:", error);
  }
});
