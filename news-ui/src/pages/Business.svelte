<script>
  import { onMount } from "svelte";

  const apiBaseUrl =
    "http://localhost:8080";
  let businessarticles = [];
  let twarticles = [];
  let editingbarticle = {
    body: "",
    title: "",
    id: null
  };

  onMount(async () => {
    const res = await fetch(apiBaseUrl + "/news/business");
    businessarticles = await res.json();

    // const restwitter = await fetch(apiBaseUrl + "/news/twitter/business");
    // twarticles = await restwitter.json();
  });
  
</script>

<style>
  .responsive {
    width: 100%;
    height: auto;
  }
  .delete-btn {
    color: red !important;
  }
  .card .card-content .card-title {
    margin-bottom: 0;
  }
  .card .card-content p.timestamp {
    color: #999;
    margin-bottom: 10px;
  }

  .card-limit {
    height: 200px;
    width: auto;
  }

  .limit {
    column-gap: 40px;
  }

  .bold {
    font-weight: bold;
  }

</style>

<div class="row">
  <div class="col s6">
    <br>
  </div>
</div>

<div class="row">
  <div class="col s8 m8 ">
  <div class="col-content">
  {#if businessarticles.length === 0}
    <h3>Getting Business Articles...</h3>
  {:else}
    {#each businessarticles as barticle}
      <!-- <div class="row">  -->
        <div class="row" style="margin:5px">
          <!-- Card Content -->
          <div class="card horizontal">
            <div class="card-image waves-effect waves-block waves-light">
              <img class="activator" src={barticle.urlToImage}>
            </div>
            <div class="card-stacked">
              <div class="card-content">
                <span class="card-title activator grey-text text-darken-4">{barticle.title}</span>
                <p class="timestamp">{barticle.publishedAt}</p>
                <!-- <p>{barticle.content}</p> -->
              </div>
              <div class="card-action">
                <a href={barticle.url}>View more</a>
              </div>
            </div>
          </div>
        </div>
    {/each}

  {/if}
  </div>
  </div>

  <div class="col s3 m3">
  <div class="col-content">
  <div class="row">
  <!-- <h5 class="blue-text">Top Tweets</h5> -->
      <div class="card horizontal blue">
        <div class="card-stacked">
            <div class="card-content">
              <h7 class="center white-text bold">Top Tweets</h7>
            </div>
        </div>
      </div>
  </div>
  {#each twarticles as tarticle}
      <!-- <div class="row">  -->
        <div class="row">
          <!-- Card Content -->
          <div class="card horizontal">
            <div class="card-stacked">
              <div class="card-content">
                <!-- <span class="card-title activator grey-text text-darken-2">{tarticle.text}</span> -->
                <p class="bold">{tarticle.user}</p>
                <br/>
                <!-- <p class="timestamp">{tarticle.created_at}</p> -->
                <p class="blue-text" style="font-size: large">{tarticle.text}</p>
              </div>
              <!-- <div class="card-action">
                <a href="#">View more</a>
              </div> -->
            </div>
          </div>
        </div>
    {/each}
  </div>
  
  </div>

  

</div>



