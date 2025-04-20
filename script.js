
// WE MADE THE FUNCTION TO GIVE THE LOCATION OF THE FOUND OBJECT 
function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      document.getElementById("locationDisplay").innerText = "Geolocation is not supported by this browser.";
    }
  }
  
  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    document.getElementById("locationDisplay").innerText = `📍 Latitude ${lat}, Longitude ${lon}`;
  }
  
  function showError(error) {
    let message = "Location access denied or unavailable.";
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "User denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        message = "The request to get user location timed out.";
        break;
    }
    document.getElementById("locationDisplay").innerText = message;
  }
  
  
  //THIS SECTION HANDEL THE SUBMITION FORMS
  const uploadForm = document.getElementById("uploadForm");
  const dashboardItems = document.getElementById("dashboardItems");
  let reportedItems = JSON.parse(localStorage.getItem("reportedItems")) || [];
  let currentItemId = null;
  
  uploadForm?.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const name = document.getElementById("itemName").value;
    const description = document.getElementById("description").value;
    const image = document.getElementById("itemImage").files[0];
    const locationText = document.getElementById("locationDisplay").innerText;
  
    if (!name || !description || !image) {
      alert("Please fill all fields and upload an image.");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = function (event) {
      const newItem = {
        id: Date.now(),
        name,
        description,
        image: event.target.result,
        location: locationText,
        date: new Date().toLocaleDateString(),
        status: "unclaimed"
      };
  
      reportedItems.push(newItem);
      localStorage.setItem("reportedItems", JSON.stringify(reportedItems));
      updateDashboard();
  
      uploadForm.reset();
      document.getElementById("locationDisplay").innerText = "Location: Not tagged yet";
      alert("Item submitted successfully!");
      document.getElementById("dashboardSection")?.scrollIntoView({ behavior: "smooth" });
    };
    reader.readAsDataURL(image);
  });
  
   
  // THIS FUNCTION WILL HANDEL THE VERIFICATION
  const itemsContainer = document.getElementById("itemsContainer") || dashboardItems;
  const verificationPanel = document.getElementById("verificationPanel");
  const closePanelBtn = document.getElementById("closePanel");
  const claimForm = document.getElementById("claimForm");
  const adminVerification = document.getElementById("adminVerification");
  
  const dashboardSearch = document.getElementById("dashboardSearch");
  const statusFilter = document.getElementById("statusFilter");
  
  function updateDashboard() {
    if (!itemsContainer) return;
  
    itemsContainer.innerHTML = "";
    const query = dashboardSearch?.value.toLowerCase() || "";
    const status = statusFilter?.value || "all";
  
    const filteredItems = reportedItems.filter(item => {
      const matchesStatus = status === "all" || item.status === status;
      const matchesSearch = item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  
    if (filteredItems.length === 0) {
      itemsContainer.innerHTML = `<div class="no-items">No matching items found.</div>`;
      return;
    }
  
    filteredItems.forEach(item => {
      const card = document.createElement("div");
      card.className = "dashboard-card";
      card.innerHTML = `
        <div class="item-image"><img src="${item.image}" alt="${item.name}" /></div>
        <div class="item-details">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p>${item.location}</p>
          <p>Reported: ${item.date}</p>
          <p class="item-status ${item.status}">Status: ${item.status}</p>
          ${item.status === "unclaimed" ? `<button class="claim-btn" data-id="${item.id}">Claim Item</button>` : ""}
          ${item.status === "pending" ? `
            <div class="pending-actions">
              <p><strong>Claimed By:</strong> ${item.claimer?.name || "N/A"}</p>
              <p><strong>Reason:</strong> ${item.claimer?.reason || "No reason provided"}</p>
              <button class="approve-btn" data-id="${item.id}">Approve</button>
              <button class="reject-btn" data-id="${item.id}">Reject</button>
            </div>` : ""}
        </div>
      `;
      itemsContainer.appendChild(card);
    });
  
    
    // HERE WE ARE MAKING A FUNCTION FOR VERIFYCATION OF THE CLAIM BY GIVING A ACCEPT OR REJECT BUTTON
    document.querySelectorAll(".claim-btn").forEach(button => {
      button.addEventListener("click", () => {
        currentItemId = Number(button.getAttribute("data-id"));
        openClaimPanel(currentItemId);
      });
    });
  
    document.querySelectorAll(".approve-btn").forEach(button => {
      button.addEventListener("click", () => {
        const itemId = Number(button.getAttribute("data-id"));
        verifyClaim(itemId, true);
      });
    });
  
    document.querySelectorAll(".reject-btn").forEach(button => {
      button.addEventListener("click", () => {
        const itemId = Number(button.getAttribute("data-id"));
        verifyClaim(itemId, false);
      });
    });
  }
  
  

  // Function for Claim Process

  function openClaimPanel(itemId) {
    const item = reportedItems.find(i => i.id === itemId);
    if (!item) return;
  
    document.getElementById("verificationImage").src = item.image;
    document.getElementById("verificationName").textContent = item.name;
    document.getElementById("verificationDescription").textContent = item.description;
    document.getElementById("verificationLocation").textContent = item.location;
    document.getElementById("verificationDate").textContent = item.date;
  
    claimForm.style.display = "block";
    adminVerification.style.display = "none";
    claimForm.reset();
    verificationPanel.style.display = "block";
  }
  
  closePanelBtn?.addEventListener("click", () => {
    verificationPanel.style.display = "none";
    currentItemId = null;
  });
  
  claimForm?.addEventListener("submit", function (e) {
    e.preventDefault();
  
    const name = document.getElementById("claimerName").value;
    const email = document.getElementById("claimerEmail").value;
    const phone = document.getElementById("claimerPhone").value;
    const reason = document.getElementById("claimDescription").value;
  
    const item = reportedItems.find(i => i.id === currentItemId);
    if (!item) return;
  
    item.status = "pending";
    item.claimer = { name, email, phone, reason };
  
    localStorage.setItem("reportedItems", JSON.stringify(reportedItems));
    showVerificationSection(item);
    updateDashboard();
  });
  
  function showVerificationSection(item) {
    claimForm.style.display = "none";
    adminVerification.style.display = "block";
  
    document.getElementById("claimedByName").textContent = item.claimer.name;
    document.getElementById("claimedByContact").textContent = `${item.claimer.email}, ${item.claimer.phone}`;
    document.getElementById("claimedByReason").textContent = item.claimer.reason;
  
    document.getElementById("acceptClaim").onclick = () => verifyClaim(item.id, true);
    document.getElementById("rejectClaim").onclick = () => verifyClaim(item.id, false);
  }
  
  function verifyClaim(itemId, isAccepted) {
    const item = reportedItems.find(i => i.id === itemId);
    if (!item) return;
  
    item.status = isAccepted ? "claimed" : "unclaimed";
    if (!isAccepted) delete item.claimer;
  
    localStorage.setItem("reportedItems", JSON.stringify(reportedItems));
    verificationPanel.style.display = "none";
    currentItemId = null;
    updateDashboard();
  
    alert(isAccepted ? "Claim accepted. Item marked as claimed." : "Claim rejected.");
  }
  
  
  // THESE  ARE THE SEARCH FILTERS
  dashboardSearch?.addEventListener("input", updateDashboard);
  statusFilter?.addEventListener("change", updateDashboard);
  
  
  // THIS IS A NAVIGATION SCROLL
  document.querySelectorAll(".navigationbar ul li a").forEach(link => {
    const text = link.textContent.trim();
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetClass = text === "CONTACT US" ? ".contact-section" : text === "FOUND/LOST" ? ".upload-section" : null;
      if (targetClass) {
        const section = document.querySelector(targetClass);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
  
   
  document.addEventListener("DOMContentLoaded", updateDashboard);
  
  

