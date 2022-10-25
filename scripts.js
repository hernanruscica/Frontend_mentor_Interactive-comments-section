console.log("from js");

fetch('data.json')
    .then((response) => response.json())
    .then((json) => console.log(json));
