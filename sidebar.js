function changeImage(element, newSrc) {
    element.querySelector('img').src = newSrc;
}
function restoreImage(element, originalSrc) {
    element.querySelector('img').src = originalSrc;
}
function openNav() {
    document.getElementById("Sidebar").style.width = "15vw";
    document.getElementById("Sidebar").style.minWidth = "220px";

}
function closeNav() {
    document.getElementById("Sidebar").style.width = "0";
    document.getElementById("Sidebar").style.minWidth = "0";
}