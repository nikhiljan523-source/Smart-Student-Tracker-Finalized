
document.querySelectorAll(".stars").forEach(starContainer => {
    let stars = starContainer.querySelectorAll("span");

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            stars.forEach((s, i) => {
                s.classList.toggle("selected", i <= index);
            });

            starContainer.setAttribute("data-rating", index + 1);
        });
    });
});


function submitReport() {
    let name = document.getElementById("name").value;
    let course = document.getElementById("course").value;
    let issue = document.getElementById("issue").value;

    let category = document.getElementById("category").value;
    let problemDesc = document.getElementById("problemDesc").value;
    let steps = document.getElementById("steps").value;

    let severity = document.querySelector('.stars[data-category="severity"]').getAttribute("data-rating") || 0;
    let impact = document.querySelector('.stars[data-category="impact"]').getAttribute("data-rating") || 0;
    let urgency = document.querySelector('.stars[data-category="urgency"]').getAttribute("data-rating") || 0;

    if (name === "" || course === "" || issue === "" || problemDesc === "") {
        alert("Please fill all required fields!");
        return;
    }

    alert(
        "Problem Report Submitted!\n\n" +
        "Name: " + name + "\n" +
        "Course: " + course + "\n" +
        "Issue: " + issue + "\n\n" +
        "Category: " + category + "\n\n" +
        "Description:\n" + problemDesc + "\n\n" +
        "Steps:\n" + steps + "\n\n" +
        "Severity: " + severity + " stars\n" +
        "Impact: " + impact + " stars\n" +
        "Urgency: " + urgency + " stars"
    );
}
document.querySelectorAll(".stars").forEach(starContainer => {
    let stars = starContainer.querySelectorAll("span");

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            stars.forEach((s, i) => {
                s.classList.toggle("selected", i <= index);
            });

            starContainer.setAttribute("data-rating", index + 1);
        });
    });
});


function submitReport() {
    let name = document.getElementById("name").value;
    let course = document.getElementById("course").value;
    let issue = document.getElementById("issue").value;

    let category = document.getElementById("category").value;
    let problemDesc = document.getElementById("problemDesc").value;
    let steps = document.getElementById("steps").value;

    let severity = document.querySelector('.stars[data-category="severity"]').getAttribute("data-rating") || 0;
    let impact = document.querySelector('.stars[data-category="impact"]').getAttribute("data-rating") || 0;
    let urgency = document.querySelector('.stars[data-category="urgency"]').getAttribute("data-rating") || 0;

    if (name === "" || course === "" || issue === "" || problemDesc === "") {
        alert("Please fill all required fields!");
        return;
    }

    alert(
        "Problem Report Submitted!\n\n" +
        "Name: " + name + "\n" +
        "Course: " + course + "\n" +
        "Issue: " + issue + "\n\n" +
        "Category: " + category + "\n\n" +
        "Description:\n" + problemDesc + "\n\n" +
        "Steps:\n" + steps + "\n\n" +
        "Severity: " + severity + " stars\n" +
        "Impact: " + impact + " stars\n" +
        "Urgency: " + urgency + " stars"
    );
}
