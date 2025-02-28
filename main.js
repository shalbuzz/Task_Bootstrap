let base_url = " https://api.tvmaze.com/shows";


document.addEventListener("DOMContentLoaded", () => {

  const page = window.location.pathname.split("/").pop();

  if (page === "index.html" && document.querySelector(".card-container")) {
    loadMainPage();
  } else if (page === "detail.html" && document.querySelector(".container")) {
    loadDetailPage();
  }
});


function loadMainPage() {
  let cardContainer = document.querySelector(".card-container");
 
  let cachedData = localStorage.getItem("showsList");


  if (cachedData) {
    renderShows(JSON.parse(cachedData), cardContainer);
  } else {

    fetch(base_url)
      .then(response => response.json())
      .then(datas => {
        localStorage.setItem("showsList", JSON.stringify(datas));
        renderShows(datas, cardContainer);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        cardContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
      });
  }

  let searchForm = document.querySelector(".d-flex");  
  let inputSearch = document.querySelector("#searchInput"); 
  
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();  
  
    let searchTerm = inputSearch.value.trim();  
  
    if (searchTerm) {
      let urlSearch = `https://api.tvmaze.com/search/shows?q=${searchTerm}`;  
     
      fetch(urlSearch)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {  
            let showData = data[0].show
            cardContainer.innerHTML = `
              <div class="card" style="width: 270px; height: 630px; margin: 0px;">
                <img src="${showData.image.medium}" style = "height : 341px;  " class="card-img-top" alt="${showData.name}">
                <div class="card-body">
                  <h5 class="card-title">${showData.name}</h5>
                  <p class="card-text">Premiere: ${showData.premiered}</p>
                </div>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">IMDB Rating: ${showData.rating.average}</li>
                  <li class="list-group-item">Genre: ${showData.genres}</li>
                  <li class="list-group-item">Language: ${showData.language}</li>
                </ul>
                <div class="card-body">
                  <button type="button" class="btn btn-primary"   onclick="window.open('${showData.officialSite}', '_blank')"">Go to website</button>
                  <button type="button" data-id ="${showData.id}" class="btn btn-success">Go to detail</button>
                </div>
              </div>
            `;

let detailBtns  = document.querySelectorAll(".btn-success");
  detailBtns.forEach(btn=>{
  btn.addEventListener("click", (e)=>{
const id = e.target.getAttribute("data-id");
  if (id) {
   
      // localStorage.setItem("pagemode", "detail.html");
          window.location.href = `./assets/detail.html?id=${id}`;
}
})
})
    } else {
      cardContainer.innerHTML = '<p>No shows found</p>';
    }

      inputSearch.value = ''
    })
    
    .catch(error => {
      console.error('Error fetching data:', error);
      cardContainer.innerHTML = '<p>Error fetching data. Please try again later.</p>';
    });
} else {
  cardContainer.innerHTML = '<p>Please enter a search term.</p>';
}
});

    
    }
    

function renderShows(shows, container) {
  container.innerHTML = ''; 
  shows.forEach(show => {
    container.innerHTML += `
      <div class="card" style="width: 270px;">
        <img src="${show.image.medium}" class="card-img-top" alt="${show.name}">
        <div class="card-body">
          <h5 class="card-title">${show.name}</h5>
          <p class="card-text">Premiere: ${show.premiered}</p>
        </div>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">IMDB Rating: ${show.rating.average}</li>
          <li class="list-group-item">Genre: ${show.genres.join(", ")}</li>
          <li class="list-group-item">Language: ${show.language}</li>
        </ul>
        <div class="card-body">
          <button type="button" data-url="${show.officialSite}" class="btn btn-primary">Go to website</button>
          <button type="button" data-id="${show.id}" class="btn btn-success">Go to detail</button>
        </div>
      </div>
    `;
  });


  let websiteBtns = document.querySelectorAll(".btn-primary");
  websiteBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const url = e.target.getAttribute("data-url");
      if (url) {
        window.open(url, '_blank');
      }
    });
  });

  
  let detailBtns = document.querySelectorAll(".btn-success");
  detailBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      if (id) {
       
        // localStorage.setItem("pagemode", "detail.html");
        localStorage.setItem("showId", id);
        window.location.href = `./assets/detail.html?id=${id}`;
      }
    });
  });
}


function loadDetailPage() {
  let detailContainer = document.querySelector('.container');
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get("id") || localStorage.getItem("showId");

  if (!id) {
    console.error("ID not found in URL!");
    detailContainer.innerHTML = '<p>Show ID not found. Redirecting to the main page...</p>';
    window.location.href = "../index.html";
    return;
  }

  let cachedShow = localStorage.getItem(`show_${id}`);

  if (cachedShow) {
    renderDetailPage(JSON.parse(cachedShow));
  } else {
    let url_id = `https://api.tvmaze.com/shows/${id}`;
    fetch(url_id)
      .then(response => response.json())
      .then(data => {
        localStorage.setItem(`show_${id}`, JSON.stringify(data));
        renderDetailPage(data);
      })
      .catch(error => {
        console.error("Error fetching show data:", error);
        detailContainer.innerHTML = '<p>Error loading show details.</p>';
      });
  }

  function renderDetailPage(data) {
    detailContainer.innerHTML = `
      <div class="card-detail">
        <img src="${data.image.original}" alt="${data.name}">
        <div class="details">
          <h1>${data.name}</h1>
          <p>${data.summary}</p>
          <ul>
            <li><span>IMDB Point: </span>${data.rating.average}</li>
            <li><span>Language:</span> ${data.language}</li>
            <li><span>Genre:</span> ${data.genres.join(", ")}</li>
            <li><span>Premiered: </span>${data.premiered}</li>
            <li><span>Ended: </span> ${data.ended}</li>
          </ul>
          <button type="button" data-url="${data.url}" class="btn btn-primary">Go to website</button>
          <button type="button" class="btn btn-success">Go Back</button>
        </div>
      </div>
    `;

    let websiteBtn = document.querySelectorAll(".btn-primary");
    websiteBtn.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const url = e.target.getAttribute("data-url");
        if (url) {
          window.open(url, '_blank');
        }
      });
    });

    let detailBtn = document.querySelectorAll(".btn-success");
    detailBtn.forEach(btn => {
      btn.addEventListener("click", () => {
       
        // localStorage.setItem("pagemode", "index.html");
        localStorage.removeItem("showId");
        window.location.href = "../index.html";
       
      });
    });
  }
}



// fetch(url_id)
//      .then(response=>response.json())
//      .then(data=>{
//     cardContainer.innerHTML = `<div class="card" style="width: 270px; ;">
//         <img src="${data.image.medium}" class="card-img-top" alt="${data.name}">
//         <div class="card-body">
//           <h5 class="card-title">${data.name}</h5>
//           <p class="card-text">Premiere: ${data.premiered}</p>
//         </div>
//         <ul class="list-group list-group-flush">
//           <li class="list-group-item">IMDB Rating: ${data.rating.average}</li>
//           <li class="list-group-item">Genre: ${data.genres}</li>
//           <li class="list-group-item">Language: ${data.language}</li>
//         </ul>
//         <div class="card-body">
//           <button type="button" class="btn btn-primary">Go to website</button>
//           <button type="button" class="btn btn-success">Go to detail</button>
//         </div>
//       </div>
//   `
//      })




