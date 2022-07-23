document.querySelector("#container").style.display = "none";
document
  .querySelector("#menu-hamburger")
  .addEventListener("click", function () {
    if (document.querySelector("#container").style.display === "block") {
      document.querySelector("#container").style.display = "none";
    } else if (document.querySelector("#container").style.display === "none") {
      document.querySelector("#container").style.display = "block";
    }
  });
