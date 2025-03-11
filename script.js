let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');
window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            });
        };
    });
};

window.addEventListener("load", function () {
    let aboutText = document.querySelector(".aboutText");
    aboutText.style.display = "none"; // Hide temporarily
    setTimeout(() => {
        aboutText.style.display = "block"; // Show after a delay
    }, 200);
});


function openModal(title, description, img, ghURL, demoURL, keyFeaturesStr, technologiesStr) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDescription').innerText = description;
    document.getElementById('modalImg').src = img;
    document.getElementById('ghModal').onclick = function () {
        window.open(ghURL, '_blank');
    };
    document.getElementById('demoModal').onclick = function () {
        window.open(demoURL, '_blank');
    };

    let keyFeatures = keyFeaturesStr.split(",");
    let technologies = technologiesStr.split(",");

    // Populate Key Features list
    let keyFeaturesList = document.getElementById('keyFeaturesList');
    keyFeaturesList.innerHTML = ""; // Clear previous list
    keyFeatures.forEach(feature => {
        let li = document.createElement('li');
        li.textContent = feature.trim(); // Trim to remove unwanted spaces
        keyFeaturesList.appendChild(li);
    });

    // Populate Technologies Used list
    let techList = document.getElementById('techList');
    techList.innerHTML = ""; // Clear previous list
    technologies.forEach(tech => {
        let li = document.createElement('li');
        li.textContent = tech.trim();
        techList.appendChild(li);
    });


    document.getElementById('projectModal').style.display = 'flex';



}
function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

