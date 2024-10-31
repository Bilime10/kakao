let plantIndex = 0;
let offsetX = 0;
let offsetY = 0;

const plants = document.getElementsByClassName("plant-holder");
const page = document.getElementById("page");

for (const plant of plants) {
  plant.setAttribute("draggable", true);
  plant.addEventListener("dblclick", bringToFront);
  plant.addEventListener("dragstart", dragHandler);
}

page.addEventListener("dragover", dragoverHandler);
page.addEventListener("drop", dropHandler);

function bringToFront(event) {
  event.target.parentElement.style.zIndex = ++plantIndex;
}

function dragHandler(event) {
  event.dataTransfer.setData("text", event.target.id);

  offsetX = event.clientX - event.target.offsetLeft;
  offsetY = event.clientY - event.target.offsetTop;
}

function dragoverHandler(event) {
  event.preventDefault();
}

function dropHandler(event) {
  event.preventDefault();
  const plantId = event.dataTransfer.getData("text");
  const plant = document.getElementById(plantId);

  const Left = event.clientX - offsetX;
  const Top = event.clientY - offsetY;

  plant.style.left = `${Left}px`;
  plant.style.top = `${Top}px`;
}
