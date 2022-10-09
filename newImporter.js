const replicateForm = document.getElementById("replicateForm");
const replaceWithDiv = document.getElementById("replaceWithDiv");
const replaceWithTemplate = document.getElementById("replaceWithTemplate");
const makeCopies = document.getElementById("makeCopies");
const replicaSelector = document.getElementById("replicaSelector");
const addToTableBtn = document.getElementById("tableBtn");
const addTableBody = document.getElementById("tableBody");
const addToCsv = document.getElementById("downloadBtn");
const imgUpload = document.getElementById("imgUpload");
const replaceLogic = {
  "&quot;": "'",
  "[0]": "at(0)",
};

let store, currentDataOutput;
replicateForm.onsubmit = function (evt) {
  evt.preventDefault();
  const cities = [];
  const images = [];
  const replaceWithTextareas = replaceWithDiv.querySelectorAll(
    ".replaceWithTextarea"
  );
  if (replaceWithTextareas.length === 0) return;
  Array.from(replaceWithTextareas).forEach((textarea) => {
    if (textarea.value) cities.push(textarea.value);
  });
  const data = new FormData(this);
  data.append("cities", JSON.stringify(cities));

  store = data;

  populateCities();
};

makeCopies.onclick = function () {
  const numberOfCopies = replicateForm["numberOfCopies"].value;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < numberOfCopies; i++) {
    const template = replaceWithTemplate.content.cloneNode(true);
    fragment.appendChild(template);
  }
  replaceWithDiv.appendChild(fragment);
};

function populateCities() {
  replicaSelector.innerHTML = "";
  let cities = store.get("cities");
  cities = JSON.parse(cities);
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.innerText = city;
    replicaSelector.appendChild(option);
  });

  replicaSelector.onchange();
}

replicaSelector.onchange = function () {
  const data = generateData(this.value);
  replaceAllValues(data);
};

function generateData(val) {
  let resBody = store.get("resBody");
  let resEditBody = store.get("resEditBody");
  let pathName = store.get("pathName");
  let companyName = store.get("companyName");
  let metaKw = store.get("metaKw");
  let metaDesc = store.get("metaD");

  resBody = implementReplaceLogicObj(resBody);
  resEditBody = implementReplaceLogicObj(resEditBody);

  resBody = replaceElementLogic(resBody, store.get("targetText"), val);
  resEditBody = replaceElementLogic(resEditBody, store.get("targetText"), val);

  resBody = replaceImages(resBody, val);
  resEditBody = replaceImages(resEditBody, val);

  const data = {
    name: `${val} ${pathName.replaceAll("-", " ")}`,
    path: `/${val}-${pathName.replaceAll(" ", "-").toLowerCase()}/`,
    htmlTitle: `Your #1 place for ${pathName.replaceAll(
      "-",
      " "
    )} in ${val} from ${companyName}`,
    metaKeyWords: metaKw,
    metaDescription: `${metaDesc} in ${val}`,
    responsiveContent: resBody,
    responsiveEditContent: resEditBody,
  };

  return data;
}

function replaceImages(str, name) {
  let replacement = str;
  const files = imgUpload.files;
  const fileNames = str.match(/([^/]+).(jpg|jpeg|png)/gi);

  let count = 0;
  let fileNamesLength = fileNames.length;
  for (let i = 0; i < files.length; i++) {
    ++count;
    if (count > fileNamesLength) break;
    replacement = replacement.replaceAll(
      fileNames[i],
      `${name}${files[i].name}`
    );
  }

  return replacement;
}

function replaceElementLogic(str, key, val) {
  const replacement = str.replaceAll(key, val);
  return replacement;
}

function implementReplaceLogicObj(str) {
  let replacement = str;
  for (const [key, val] of Object.entries(replaceLogic)) {
    replacement = replaceElementLogic(replacement, key, val);
  }

  return replacement;
}

function replaceAllValues(data) {
  document.getElementById("importEdit").value = "";
  document.getElementById("tableName").value = data.name;
  document.getElementById("tablePath").value = data.path;
  document.getElementById("aliasEdit").value = "";
  document.getElementById("tableContent").value = "";
  document.getElementById("tempTable").value = "Yes";
  document.getElementById("tableTitle").value = data.htmlTitle;
  document.getElementById("tableKw").value = data.metaKeyWords;
  document.getElementById("tableDesc").value = data.metaDescription;
  document.getElementById("resContent").value = data.responsiveContent;
  document.getElementById("resEditContent").value = data.responsiveEditContent;
  document.getElementById("versionEdit").value = "";
  document.getElementById("rotationEdit").value = "";
  document.getElementById("goalEdit").value = "";
  document.getElementById("navEdit").value = "default";
  document.getElementById("pageEdit").value = "Regular";

  document.getElementById("dataFields").classList.remove("d-none");
  document.getElementById("replicaSetup").classList.add("d-none");
}

addToTableBtn.onclick = function () {
  let cities = store.get("cities");
  cities = JSON.parse(cities);

  cities.forEach((city, index) => {
    const data = generateData(city);
    addTableBody.innerHTML += `<tr id="tableRow">
        <td class=""></td>
        <td class="nameField">${data.name}</td>
        <td class="path">${data.path}</td>
        <td class=""></td>
        <td class="responsivePageMode">Responsive</td>
        <td class="content"></td>
        <td class="useTemplate">Yes</td>
        <td class="htmlTitle">${data.htmlTitle}</td>
        <td class="metaKw">${data.metaKeyWords}</td>
        <td class="metaDescription">${data.metaDescription}</td>
        <td class="resContent" id="resContent-${index}" contenteditable="true">${data.responsiveContent}</td>
        <td class="resEditContent" id="resEditContent-${index}" contenteditable="true">${data.responsiveEditContent}</td>
        <td class=""></td>
        <td class=""></td>
        <td class=""></td>
        <td class="navType">default</td>
        <td class="pageType">Regular</td>
    </tr>`;
  });

  document.getElementById("exportTable").classList.remove("d-none");
  document.getElementById("dataFields").classList.add("d-none");
};

//filesaver
addToCsv.onclick = function () {
  var html = document.querySelector("#txtTable").outerHTML;
  download_table_as_csv("txtTable");
};

function download_table_as_csv(table_id, separator = "\t") {
  let rows = document.querySelectorAll("table#" + table_id + " tr");
  let csv = [];
  for (let i = 0; i < rows.length; i++) {
    let row = [],
      cols = rows[i].querySelectorAll("td, th");
    for (let j = 0; j < cols.length; j++) {
      let data = cols[j].innerHTML
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/(\s\s)/gm, " ");

      data = data.replace(/"/g, '""');
      row.push(data);
    }
    csv.push(row.join(separator));
  }
  let csv_string = csv.join("\n");
  // Download it
  let filename = "web_pages" + new Date().toLocaleDateString() + ".csv";
  let link = document.createElement("a");
  link.style.display = "none";
  link.setAttribute("target", "_blank");
  link.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(csv_string)
  );
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
