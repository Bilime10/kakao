import axios from "axios";

// form fields
const form = document.querySelector(".form-data");
const regionOne = document.querySelector(".region-nameOne");
const regionTwo = document.querySelector(".region-nameTwo");
const regionThree = document.querySelector(".region-nameThree");
const apiKey = document.querySelector(".api-key");

// results
const errors = document.querySelector(".errors");
const loading = document.querySelector(".loading");
const results = document.querySelector(".result-container");
const usageOne = document.querySelector(".carbon-usageOne");
const usageTwo = document.querySelector(".carbon-usageTwo");
const usageThree = document.querySelector(".carbon-usageThree");
const fossilfuelOne = document.querySelector(".fossil-fuelOne");
const fossilfuelTwo = document.querySelector(".fossil-fuelTwo");
const fossilfuelThree = document.querySelector(".fossil-fuelThree");
const myregionOne = document.querySelector(".my-regionOne");
const myregionTwo = document.querySelector(".my-regionTwo");
const myregionThree = document.querySelector(".my-regionThree");

const clearBtn = document.querySelector(".clear-btn");

const calculateColor = (value) => {
  const co2Scale = [0, 150, 600, 750, 800];
  const colors = ["#2AA364", "#F5EB4D", "#9E4229", "#381D02", "#381D02"];
  const closestNum = co2Scale.sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0];
  const scaleIndex = co2Scale.findIndex((element) => element > closestNum);
  const closestColor = colors[scaleIndex];
  chrome.runtime.sendMessage({
    action: "updateIcon",
    value: { color: closestColor },
  });
};

const displayCarbonUsage = async (apiKey, region, component1, component2, component3) => {
  try {
    const response = await axios.get("https://api.co2signal.com/v1/latest", {
      params: { countryCode: region },
      headers: { "auth-token": apiKey },
    });

    const CO2 = Math.floor(response.data.data.carbonIntensity);
    calculateColor(CO2);

    component3.textContent = region;
    component1.textContent = `${CO2} grams (grams CO₂ emitted per kilowatt hour)`;
    component2.textContent = `${response.data.data.fossilFuelPercentage.toFixed(2)}% (percentage of fossil fuels used to generate electricity)`;
    
  } catch (error) {
    console.log(error);
    loading.style.display = "none";
    results.style.display = "none";
    errors.textContent = "Sorry, we have no data for the region you have requested.";
  }
};

const setUpUser = (apiKey, regionOne, regionTwo, regionThree) => {
  localStorage.setItem("apiKey", apiKey);
  localStorage.setItem("regionNameOne", regionOne);
  localStorage.setItem("regionNameTwo", regionTwo);
  localStorage.setItem("regionNameThree", regionThree);

  loading.style.display = "block";
  errors.textContent = "";
  clearBtn.style.display = "block";
};

const handleSubmit = (e) => {
  e.preventDefault();
  setUpUser(apiKey.value, regionOne.value, regionTwo.value, regionThree.value);
  init();
};

const reset = (e) => {
  e.preventDefault();
  localStorage.clear();
  init();
};

const init = () => {
  const storedApiKey = localStorage.getItem("apiKey");
  const storedRegionOne = localStorage.getItem("regionNameOne");
  const storedRegionTwo = localStorage.getItem("regionNameTwo");
  const storedRegionThree = localStorage.getItem("regionNameThree");

  chrome.runtime.sendMessage({
    action: "updateIcon",
    value: { color: "green" },
  });

  if (!storedApiKey || !storedRegionOne || !storedRegionTwo || !storedRegionThree) {
    form.style.display = "block";
    results.style.display = "none";
    loading.style.display = "none";
    clearBtn.style.display = "none";
    errors.textContent = "";
  } else {
    form.style.display = "none";
    loading.style.display = "none";
    displayCarbonUsage(storedApiKey, storedRegionOne, usageOne, fossilfuelOne, myregionOne);
    displayCarbonUsage(storedApiKey, storedRegionTwo, usageTwo, fossilfuelTwo, myregionTwo);
    displayCarbonUsage(storedApiKey, storedRegionThree, usageThree, fossilfuelThree, myregionThree);
    results.style.display = "block";
    clearBtn.style.display = "block";
  }
};

// Event Listeners
form.addEventListener("submit", handleSubmit);
clearBtn.addEventListener("click", reset);

// Initialize app
init();